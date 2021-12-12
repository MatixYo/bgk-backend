import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import * as faker from 'faker/locale/pl';
import { random } from 'lodash';
import pkdList from './data/pkd';
import * as natural from 'natural';

const lexicon = new natural.Lexicon('EN', 'N');
const ruleSet = new natural.RuleSet('EN');
const tagger = new natural.BrillPOSTagger(lexicon, ruleSet);
const tokenizer = new natural.WordTokenizer();
const nounInflector = new natural.NounInflector();

const IS_NIP = /^\d{10}$/;
const IS_REGON = /^\d{14}$/;
const IS_PKD = /^\d{2}\.\d{2}.[A-Z]$/;

function getRandomPkd(): string {
  const k = Object.keys(pkdList);
  return k[random(0, k.length - 1)];
}

function getRandomPkds(): string[] {
  const pkds = [];
  for (let i = 0; i < random(1, 10); i++) {
    pkds.push(getRandomPkd());
  }
  return pkds;
}

function getRandomCompany(): any {
  const pkds = getRandomPkds();
  return {
    name: faker.company.companyName(),
    nip: faker.datatype.number({ min: 1e9, max: 1e10 - 1 }),
    regon: faker.datatype.number({ min: 1e13, max: 1e14 - 1 }),
    pkds: pkds.map((code) => ({ code, ...pkdList[code] })),
    address: faker.address.streetAddress(),
    city: faker.address.city(),
    zip: faker.address.zipCode(),
    country: 'Poland',
    established: faker.date.past(4),
  };
}

@Injectable()
export class SearchService {
  constructor(private httpService: HttpService) {}

  async find(query: string): Promise<any> {
    const words = query.split(' ');
    let company = null;
    const wordsList = [];
    const pkdList = [];

    for (const word of words) {
      if (IS_NIP.test(word) && !company) {
        company = await this.findByNIP(word);
      } else if (IS_REGON.test(word) && !company) {
        company = await this.findByRegon(word);
      } else if (IS_PKD.test(word)) {
        pkdList.push(word);
      } else {
        wordsList.push(word);
      }
    }

    if (company) {
      pkdList.push(...company.pkds.map((p) => p.code));
    }

    const wordsFromPkd = await this.wordsFromPkds(pkdList);
    wordsList.push(...wordsFromPkd);
    const rows = await this.findByWords(wordsList);

    return {
      company,
      rows,
      wordsList,
    };
  }

  async findByWords(words: string[]): Promise<any[]> {
    const text = words.join(' ');
    return this.findOnEc(text);
  }

  async findOnEc(text: string): Promise<any[]> {
    try {
      if (!text) {
        return [];
      }
      console.log(`Searching ${text}`);
      return lastValueFrom(
        this.httpService
          .post(
            'https://api.tech.ec.europa.eu/search-api/prod/rest/search',
            {},
            {
              params: {
                apiKey: 'SEDIA',
                text: `${text}*`,
                pageSize: 50,
                pageNumber: 1,
              },
            },
          )
          .pipe(map((res) => res.data.results)),
      );
    } catch (e) {
      console.error(e);
    }
    return [];
  }

  async findByNIP(nip: string): Promise<any[]> {
    return {
      ...getRandomCompany(),
      nip,
    };
  }

  async findByRegon(regon: string): Promise<any[]> {
    return {
      ...getRandomCompany(),
      regon,
    };
  }

  async wordsFromPkds(pkds: any[]): Promise<any[]> {
    const words = pkds
      .map((pkd) => pkdList[pkd].desc)
      .map((desc) => tokenizer.tokenize(desc))
      .map((words) => tagger.tag(words).taggedWords)
      .flat()
      .filter((word) => ['NN', 'NNS'].includes(word.tag))
      .map((word) =>
        word.tag === 'NNS' ? nounInflector.singularize(word.token) : word.token,
      )
      .map((word) => word.toLowerCase());
    return words;
  }
}

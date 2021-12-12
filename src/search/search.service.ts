import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import * as faker from 'faker/locale/pl';

const IS_NIP = /^\d{10}$/;
const IS_REGON = /^\d{14}$/;
const IS_PKD = /^\d{2}\.\d{2}.[A-Z]$/;

@Injectable()
export class SearchService {
  constructor(private httpService: HttpService) {}

  async find(query: string): Promise<any> {
    const words = query.split(' ');
    let company = null;
    let rows = [];
    const pkdList = [];

    for (const word of words) {
      if (IS_NIP.test(word)) {
        company = await this.findByNIP(word);
      } else if (IS_REGON.test(word)) {
        company = await this.findByRegon(word);
      } else if (IS_PKD.test(word)) {
        pkdList.push(word);
      } else {
        rows = await this.findByPhrase(word);
      }
    }

    return {
      company,
      rows,
    };
  }

  async findByPhrase(phrase: string): Promise<any[]> {
    return this.findOnEc(phrase);
  }

  async findOnEc(text: string): Promise<any[]> {
    try {
      return lastValueFrom(
        this.httpService
          .post(
            'https://api.tech.ec.europa.eu/search-api/prod/rest/search',
            {},
            {
              params: {
                apiKey: 'SEDIA',
                text,
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
      ...this.randomCompany(),
      nip,
    };
  }

  async findByRegon(regon: string): Promise<any[]> {
    return {
      ...this.randomCompany(),
      regon,
    };
  }

  randomCompany(): any {
    return {
      name: faker.company.companyName(),
      nip: faker.datatype.number({ min: 1e9, max: 1e10 - 1 }),
      regon: faker.datatype.number({ min: 1e13, max: 1e14 - 1 }),
      pkd: '12.12.A',
      address: faker.address.streetAddress(),
      city: faker.address.city(),
      zip: faker.address.zipCode(),
      country: 'Poland',
    };
  }
}

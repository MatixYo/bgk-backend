import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class SearchService {
  constructor(private httpService: HttpService) {}

  async findOnEc(query: string): Promise<any[]> {
    try {
      return lastValueFrom(
        this.httpService
          .post(
            'https://api.tech.ec.europa.eu/search-api/prod/rest/search',
            {},
            {
              params: {
                apiKey: 'SEDIA',
                text: query,
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
}

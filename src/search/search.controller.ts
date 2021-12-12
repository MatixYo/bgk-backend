import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async findAll(@Query('q') q: string): Promise<any[]> {
    const response = await this.searchService.findOnEc(q);
    return response;
  }
}

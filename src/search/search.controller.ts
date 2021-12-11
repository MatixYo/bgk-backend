import { Controller, Get } from '@nestjs/common';

@Controller('search')
export class SearchController {
  @Get()
  findAll(): any[] {
    return ['This action returns all cats'];
  }
}

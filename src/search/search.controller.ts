import { Controller, Post } from '@nestjs/common';

@Controller('search')
export class SearchController {
  @Post()
  findAll(): any[] {
    return ['This action returns all cats'];
  }
}

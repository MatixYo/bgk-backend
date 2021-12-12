import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grant } from './entities/grant.entity';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';

@Module({
  imports: [ConfigModule, HttpModule, TypeOrmModule.forFeature([Grant])],
  providers: [SearchService],
  controllers: [SearchController],
})
export class SearchModule {}

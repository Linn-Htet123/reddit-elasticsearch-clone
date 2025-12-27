import { Controller, Get, Param, Query } from '@nestjs/common';
import { SearchService, SearchOptions } from './search.service';
import { PaginatedSearchResult } from './search-result.interface';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(
    @Query('q') query?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedSearchResult> {
    const options: SearchOptions = {
      query: query || '',
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 25,
    };

    return await this.searchService.searchWithPagination(options);
  }
  @Get('r/:subreddit')
  async searchBySubReddit(
    @Param('subreddit') subreddit: string,
    @Query('q') query?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedSearchResult> {
    const options: SearchOptions = {
      subreddit: subreddit || '',
      query: query || '',
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 25,
    };

    return await this.searchService.searchWithSubRedditPagination(options);
  }

  @Get('suggestions')
  async suggest(@Query('q') query: string): Promise<any> {
    return await this.searchService.suggest(query);
  }
}

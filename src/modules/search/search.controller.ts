import { Controller, Get, Query } from '@nestjs/common';
import { SearchService, SearchOptions } from './search.service';
import { PaginatedSearchResult } from './search-result.interface';

@Controller('')
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

  @Get('suggestions')
  async suggest(@Query('q') query: string): Promise<any> {
    return await this.searchService.suggest(query);
  }
}

import { Controller, Get } from '@nestjs/common';

@Controller('search')
export class SearchController {
  @Get()
  getSearch(): string {
    return 'Search Service is up and running!';
  }
}

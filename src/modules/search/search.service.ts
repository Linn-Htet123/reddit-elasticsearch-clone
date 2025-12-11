import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchPostDto } from './search-result.interface';
import {
  SearchHitSource,
  SearchResponseFactory,
} from './search-response.factory';

@Injectable()
export class SearchService {
  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly searchResponseFactory: SearchResponseFactory,
  ) {}

  // async search(text: string): Promise<SearchPostDto[]> {
  //   if (!text) return [];

  //   const response = await this.elasticsearchService.search({
  //     index: 'posts',
  //     query: {
  //       multi_match: {
  //         query: text,
  //         fields: ['title', 'content'],
  //       },
  //     },
  //   });

  //   return response.hits.hits.map((hit: SearchHit<SearchHitSource>) =>
  //     this.searchResponseFactory.toDto(hit),
  //   );
  // }
  // search.service.ts
  async search(text: string): Promise<SearchPostDto[]> {
    if (!text) return [];

    const response = await this.elasticsearchService.search<SearchHitSource>({
      index: 'posts',
      query: {
        bool: {
          should: [
            // Exact phrase match in title (highest priority)
            {
              match_phrase: {
                title: {
                  query: text,
                  boost: 10,
                },
              },
            },
            // Exact phrase match in content
            {
              match_phrase: {
                content: {
                  query: text,
                  boost: 5,
                },
              },
            },
            // Title word matching with AND operator (prefer all words present)
            {
              match: {
                title: {
                  query: text,
                  boost: 8,
                  operator: 'and',
                  fuzziness: 'AUTO',
                },
              },
            },
            // Title word matching with OR operator (fallback)
            {
              match: {
                title: {
                  query: text,
                  boost: 4,
                  operator: 'or',
                  fuzziness: 'AUTO',
                },
              },
            },
            // Content word matching with AND operator
            {
              match: {
                content: {
                  query: text,
                  boost: 3,
                  operator: 'and',
                  fuzziness: 'AUTO',
                },
              },
            },
            // Content word matching with OR operator
            {
              match: {
                content: {
                  query: text,
                  boost: 1,
                  operator: 'or',
                  fuzziness: 'AUTO',
                },
              },
            },
            // Prefix matching for autocomplete
            {
              multi_match: {
                query: text,
                fields: ['title^3', 'content'],
                type: 'phrase_prefix',
                boost: 2,
              },
            },
          ],
          // Require at least one match
          minimum_should_match: 1,
        },
      },
      // Sort by relevance score (best matches first)
      sort: ['_score'],
      size: 50,
      // Only return results with minimum score to filter weak matches
      min_score: 0.1,
    });

    return response.hits.hits.map((hit) =>
      this.searchResponseFactory.toDto(hit),
    );
  }
}

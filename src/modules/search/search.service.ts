import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import type { QueryDslQueryContainer } from 'node_modules/@elastic/elasticsearch/lib/api/types';
import { SearchResponseFactory } from './search-response.factory';
import {
  PaginatedSearchResult,
  SearchHitSource,
} from './search-result.interface';

export interface SearchOptions {
  subreddit?: string;
  query: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class SearchService {
  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly searchResponseFactory: SearchResponseFactory,
  ) {}

  async searchWithPagination(
    options: SearchOptions,
  ): Promise<PaginatedSearchResult> {
    const { query, page = 1, limit = 25 } = options;

    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(Math.max(1, limit), 100);
    const from = (validatedPage - 1) * validatedLimit;

    const must: QueryDslQueryContainer[] = [];

    if (query && query.trim()) {
      must.push({
        bool: {
          should: [
            {
              match: {
                'title.ngram': {
                  query: query.toLowerCase(),
                  boost: 15,
                },
              },
            },
            {
              match_phrase: {
                title: {
                  query: query,
                  boost: 10,
                },
              },
            },
            {
              match: {
                title: {
                  query: query,
                  boost: 8,
                  operator: 'and',
                  fuzziness: 'AUTO',
                },
              },
            },
            {
              match: {
                title: {
                  query: query,
                  boost: 4,
                  operator: 'or',
                  fuzziness: 'AUTO',
                },
              },
            },
            {
              match: {
                content: {
                  query: query,
                  boost: 3,
                  operator: 'and',
                  fuzziness: 'AUTO',
                },
              },
            },
            {
              multi_match: {
                query: query,
                fields: ['title^3', 'content'],
                type: 'phrase_prefix',
                boost: 2,
              },
            },
          ],
          minimum_should_match: 1,
        },
      });
    } else {
      must.push({ match_all: {} });
    }

    const response = await this.elasticsearchService.search<SearchHitSource>({
      index: 'posts',
      from: from,
      size: validatedLimit,
      _source: [
        'id',
        'title',
        'content',
        'subreddit',
        'subredditId',
        'flair',
        'authorId',
        'authorUsername',
        'createdAt',
        'upvotes',
        'downvotes',
        'commentCount',
      ],

      query: {
        bool: {
          must,
        },
      },
      highlight: {
        pre_tags: [
          '<mark class="bg-yellow-500/30 text-foreground rounded-sm px-1 py-0.5 font-medium">',
        ],
        post_tags: ['</mark>'],
        fields: {
          title: {},

          content: {
            fragment_size: 150,
            number_of_fragments: 1,
          },
        },
      },
      min_score: query ? 0.1 : undefined,
    });

    const total =
      typeof response.hits.total === 'number'
        ? response.hits.total
        : (response.hits.total?.value ?? 0);

    const totalPages = Math.ceil(total / validatedLimit);
    const hasMore = validatedPage < totalPages;

    console.log(response.hits.hits);

    const posts = response.hits.hits.map((hit) =>
      this.searchResponseFactory.toDto(hit),
    );

    return {
      posts,
      total,
      page: validatedPage,
      limit: validatedLimit,
      totalPages,
      hasMore,
    };
  }

  async searchWithSubRedditPagination(
    options: SearchOptions,
  ): Promise<PaginatedSearchResult> {
    const { subreddit, query, page = 1, limit = 25 } = options;

    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(Math.max(1, limit), 100);
    const from = (validatedPage - 1) * validatedLimit;

    const must: QueryDslQueryContainer[] = [];

    must.push({
      term: {
        subreddit: subreddit?.toLowerCase(),
      },
    });

    if (query && query.trim()) {
      must.push({
        bool: {
          should: [
            {
              match: {
                'title.ngram': {
                  query: query.toLowerCase(),
                  boost: 15,
                },
              },
            },
            {
              match_phrase: {
                title: {
                  query: query,
                  boost: 10,
                },
              },
            },
            {
              match: {
                title: {
                  query: query,
                  boost: 8,
                  operator: 'and',
                  fuzziness: 'AUTO',
                },
              },
            },
            {
              match: {
                title: {
                  query: query,
                  boost: 4,
                  operator: 'or',
                  fuzziness: 'AUTO',
                },
              },
            },
            {
              match: {
                content: {
                  query: query,
                  boost: 3,
                  operator: 'and',
                  fuzziness: 'AUTO',
                },
              },
            },
            {
              multi_match: {
                query: query,
                fields: ['title^3', 'content'],
                type: 'phrase_prefix',
                boost: 2,
              },
            },
          ],
          minimum_should_match: 1,
        },
      });
    } else {
      must.push({ match_all: {} });
    }

    const response = await this.elasticsearchService.search<SearchHitSource>({
      index: 'posts',
      from: from,
      size: validatedLimit,
      _source: [
        'id',
        'title',
        'content',
        'subreddit',
        'subredditId',
        'flair',
        'authorId',
        'authorUsername',
        'createdAt',
        'upvotes',
        'downvotes',
        'commentCount',
      ],

      query: {
        bool: {
          must,
        },
      },
      highlight: {
        pre_tags: [
          '<mark class="bg-yellow-500/30 text-foreground rounded-sm px-1 py-0.5 font-medium">',
        ],
        post_tags: ['</mark>'],
        fields: {
          title: {},

          content: {
            fragment_size: 150,
            number_of_fragments: 1,
          },
        },
      },
      min_score: query ? 0.1 : undefined,
    });

    const total =
      typeof response.hits.total === 'number'
        ? response.hits.total
        : (response.hits.total?.value ?? 0);

    const totalPages = Math.ceil(total / validatedLimit);
    const hasMore = validatedPage < totalPages;

    console.log(response.hits.hits);

    const posts = response.hits.hits.map((hit) =>
      this.searchResponseFactory.toDto(hit),
    );

    return {
      posts,
      total,
      page: validatedPage,
      limit: validatedLimit,
      totalPages,
      hasMore,
    };
  }

  async suggest(query: string): Promise<any> {
    if (!query || !query.trim()) {
      return [];
    }

    const response = await this.elasticsearchService.search<SearchHitSource>({
      index: 'posts',
      size: 8,
      query: {
        bool: {
          should: [
            {
              match_phrase_prefix: {
                title: {
                  query: query,
                  boost: 5,
                },
              },
            },
            {
              match: {
                'title.ngram': {
                  query: query,
                  boost: 3,
                },
              },
            },
            {
              match: {
                title: {
                  query: query,
                  fuzziness: 'AUTO',
                  operator: 'and',
                  boost: 1,
                },
              },
            },
            {
              match_phrase_prefix: {
                subreddit: {
                  query: query,
                  boost: 4,
                },
              },
            },
          ],
          minimum_should_match: 1,
        },
      },
    });

    const suggestions = this.searchResponseFactory.toGroupedSuggestions(
      response.hits.hits,
      query,
    );

    return suggestions;
  }
}

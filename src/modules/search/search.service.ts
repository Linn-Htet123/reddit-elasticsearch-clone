/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

export interface SearchResult {
  id: string;
  title: string;
  subreddit: string;
  type: 'post' | 'subreddit'; // To show an icon in the UI
}

@Injectable()
export class SearchService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  // 1. Full Search (Result Page)
  async search(text: string) {
    const response = await this.elasticsearchService.search({
      index: 'posts',
      query: {
        multi_match: {
          query: text,
          fields: ['title^3', 'content', 'subreddit^2', 'flair'],
          fuzziness: 'AUTO',
        },
      },
    });
    return response.hits.hits.map((item) => item._source);
  }

  async suggest(text: string): Promise<SearchResult[]> {
    const response = await this.elasticsearchService.search({
      index: 'posts',
      size: 5, // Keep suggestions small (dropdown size)
      query: {
        multi_match: {
          query: text,
          // 'phrase_prefix' treats the last word as a partial match
          // e.g., "Beginner Gui" -> matches "Beginner Guide"
          type: 'phrase_prefix',
          fields: ['title', 'subreddit'],
        },
      },
    });
    return response.hits.hits.map((hit: any) => {
      const source = hit._source;
      return {
        id: hit._id,
        title: source.title,
        subreddit: source.subreddit,
        // Simple logic to distinguish type for the UI
        type: source.title.toLowerCase().includes(text.toLowerCase())
          ? 'post'
          : 'subreddit',
      };
    });
  }
}

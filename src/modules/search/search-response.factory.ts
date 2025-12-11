// search-response.factory.ts
import { Injectable } from '@nestjs/common';
import { SearchPostDto } from './search-result.interface';
import { SearchHit } from 'node_modules/@elastic/elasticsearch/lib/api/types';

export interface SearchHitSource {
  title: string;
  content: string;
  subreddit?: string;
}

@Injectable()
export class SearchResponseFactory {
  toDto(hit: SearchHit<SearchHitSource>): SearchPostDto {
    const source = hit._source;

    if (!source) {
      throw new Error('Search hit source is undefined');
    }

    return {
      id: hit._id || 'unknown',
      title: source.title || 'Untitled',
      excerpt: this.createExcerpt(source.content),
    };
  }

  private createExcerpt(content: string): string {
    if (!content) return '';
    return content.length > 100 ? content.substring(0, 100) + '...' : content;
  }
}

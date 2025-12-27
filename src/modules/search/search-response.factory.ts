// search-response.factory.ts
import { Injectable } from '@nestjs/common';
import { SearchHit } from 'node_modules/@elastic/elasticsearch/lib/api/types';
import { GroupedSuggestions, SearchHitSource } from './search-result.interface';
import { SearchResultDto, SearchSuggestionDto } from './search.dto';

@Injectable()
export class SearchResponseFactory {
  toDto(hit: SearchHit<SearchHitSource>): SearchResultDto {
    const source = hit._source;

    if (!source) {
      throw new Error('Search hit source is undefined');
    }

    const title = hit.highlight?.title ? hit.highlight.title[0] : source.title;

    const excerpt = hit.highlight?.content
      ? hit.highlight.content[0]
      : this.createExcerpt(source.content);

    return {
      id: hit._id ?? '',
      title: title,
      excerpt: excerpt,
      subreddit: source.subreddit || '',
      flair: source.flair || null,
      authorId: source.authorId,
      authorUsername: source.authorUsername || 'unknown',
      subredditId: source.subredditId || 0,
      createdAt: source.createdAt,
      upvotes: source.upvotes || 0,
      downvotes: source.downvotes || 0,
      commentCount: source.commentCount || 0,
    };
  }

  public toGroupedSuggestions(
    hits: SearchHit<SearchHitSource>[],
    query: string,
  ): GroupedSuggestions {
    const result: GroupedSuggestions = {
      subreddits: [],
      posts: [],
    };

    const seenSubreddits = new Set<string>();

    for (const hit of hits) {
      const dto = this.toSuggestionDto(hit, query);

      if (dto.type === 'subreddit') {
        if (seenSubreddits.has(dto.text)) {
          continue;
        }
        seenSubreddits.add(dto.text);
        result.subreddits.push(dto);
      } else {
        result.posts.push(dto);
      }
    }

    return result;
  }

  private toSuggestionDto(
    hit: SearchHit<SearchHitSource>,
    query: string,
  ): SearchSuggestionDto {
    const source = hit._source;
    if (!source)
      return { id: '', text: 'Unknown', subText: '', type: 'post', url: '#' };

    const isSubredditMatch = source.subreddit
      ? source.subreddit.toLowerCase().includes(query.toLowerCase())
      : false;

    if (isSubredditMatch && source.subreddit) {
      return {
        id: `${source.subredditId}`,
        text: `r/${source.subreddit}`,
        type: 'subreddit',
        url: `/r/${source.subreddit}`,
      };
    }

    const displayTitle = hit.highlight?.title
      ? hit.highlight.title[0]
      : source.title;

    return {
      id: hit._id ?? '',
      text: displayTitle,
      type: 'post',
      url: `/r/${source.subreddit}/comments/${hit._id}`,
    };
  }
  private createExcerpt(content: string): string {
    if (!content) return '';
    return content.length > 100 ? content.substring(0, 100) + '...' : content;
  }
}

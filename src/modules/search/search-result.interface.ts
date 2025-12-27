// search-result.interface.ts
import { SearchResultDto, SearchSuggestionDto } from './search.dto';

export interface SearchHitSource {
  id?: string;
  title: string;
  content: string;
  subreddit?: string;
  subredditId?: number;
  flair?: string | null;
  authorId: number;
  authorUsername?: string;
  createdAt: Date;
  upvotes?: number;
  downvotes?: number;
  commentCount?: number;
}

export interface PaginatedSearchResult {
  posts: SearchResultDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface GroupedSuggestions {
  subreddits: SearchSuggestionDto[];
  posts: SearchSuggestionDto[];
}

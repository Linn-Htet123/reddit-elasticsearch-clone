import { SearchResultDto, SearchSuggestionDto } from './search.dto';

export interface SearchHitSource {
  id?: string;
  title: string;
  content: string;
  subreddit?: string;
  subredditId?: number;
}

export interface PaginatedSearchResult {
  posts: SearchResultDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

// ✅ NEW: The Split Response Structure
export interface GroupedSuggestions {
  subreddits: SearchSuggestionDto[];
  posts: SearchSuggestionDto[];
}

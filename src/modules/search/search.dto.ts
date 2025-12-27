// search.dto.ts
export interface SearchResultDto {
  id: string;
  title: string;
  excerpt: string;
  subreddit: string;
  flair: string | null;
  authorId: number;
  authorUsername: string;
  subredditId: number;
  createdAt: Date;
  upvotes: number;
  downvotes: number;
  commentCount: number;
}

export interface SearchSuggestionDto {
  id: string;
  text: string;
  subText?: string;
  type: 'post' | 'subreddit';
  url: string;
}

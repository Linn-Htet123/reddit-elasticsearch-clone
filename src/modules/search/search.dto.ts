export interface SearchResultDto {
  id: string;
  title: string;
  excerpt: string;
  subreddit: string;
}

export interface SearchSuggestionDto {
  id: string;
  text: string;
  subText?: string;
  type: 'post' | 'subreddit';
  url: string;
}

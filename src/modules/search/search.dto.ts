// search.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

// --- Request DTOs ---

export class SearchQueryDto {
  @ApiProperty({ description: 'The search text', required: false })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Filter by subreddit' })
  @IsOptional()
  @IsString()
  subreddit?: string;

  @ApiPropertyOptional({ description: 'Filter by flair' })
  @IsOptional()
  @IsString()
  flair?: string;

  @ApiPropertyOptional({
    enum: ['relevance', 'new', 'top', 'hot'],
    default: 'relevance',
  })
  @IsOptional()
  @IsEnum(['relevance', 'new', 'top', 'hot'])
  sortBy?: 'relevance' | 'new' | 'top' | 'hot' = 'relevance';

  @ApiPropertyOptional({
    enum: ['hour', 'day', 'week', 'month', 'year', 'all'],
    default: 'all',
  })
  @IsOptional()
  @IsEnum(['hour', 'day', 'week', 'month', 'year', 'all'])
  timeRange?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all' = 'all';

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 25, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 25;
}

export class SuggestionQueryDto {
  @ApiProperty({ description: 'Text to autocomplete', minLength: 2 })
  @IsString()
  q: string;
}

// --- Response DTOs ---

export class SearchResultItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  subreddit: string;

  @ApiProperty({ enum: ['post', 'subreddit'] })
  type: 'post' | 'subreddit';
}

export class PostSearchResultDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  subreddit: string;

  @ApiProperty({ nullable: true })
  flair: string | null;

  @ApiProperty()
  upvotes: number;

  @ApiProperty()
  downvotes: number;

  @ApiProperty()
  score: number;

  @ApiProperty()
  createdAt: Date;
}

export class SearchResponseDto {
  @ApiProperty({ type: [PostSearchResultDto] })
  posts: PostSearchResultDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}

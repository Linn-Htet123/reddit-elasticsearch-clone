import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Subreddit } from '../subreddits/subreddit.entity';
import { User } from '../users/user.entity';
import { Comment } from '../comments/comment.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('increment')
  post_id: number;

  @ManyToOne(() => Subreddit, (subreddit) => subreddit.posts, {
    onDelete: 'CASCADE',
  })
  subreddit: Subreddit;

  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  author: User;

  @Column({ length: 300 })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'text', nullable: true })
  url: string;

  @Column({ length: 20, default: 'text' })
  post_type: string;

  @Column({ length: 100, nullable: true })
  flair: string;

  @Column({ default: false })
  is_nsfw: boolean;

  @Column({ default: false })
  is_spoiler: boolean;

  @Column({ default: 0 })
  upvotes: number;

  @Column({ default: 0 })
  downvotes: number;

  @Column({
    generatedType: 'STORED',
    asExpression: 'upvotes - downvotes',
    type: 'int',
  })
  score: number;

  @Column({ default: 0 })
  comment_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({
    type: 'tsvector',
    generatedType: 'STORED',
    asExpression: `
      setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(content, '')), 'B') ||
      setweight(to_tsvector('english', coalesce(flair, '')), 'C')
    `,
  })
  search_vector: string;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];
}

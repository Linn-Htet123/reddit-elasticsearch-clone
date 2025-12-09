import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Post } from '../posts/post.entity';

@Entity('subreddits')
export class Subreddit {
  @PrimaryGeneratedColumn('increment')
  subreddit_id: number;

  @Column({ unique: true, length: 50 })
  name: string; // e.g., "javascript"

  @Column({ length: 100 })
  display_name: string; // "r/javascript"

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 0 })
  subscriber_count: number;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @OneToMany(() => Post, (post) => post.subreddit)
  posts: Post[];
}

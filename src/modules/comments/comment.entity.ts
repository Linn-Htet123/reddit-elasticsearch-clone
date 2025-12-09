import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from '../posts/post.entity';
import { User } from '../users/user.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('increment')
  comment_id: number;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
  post: Post;

  @ManyToOne(() => Comment, (comment) => comment.children, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  parent_comment: Comment;

  @OneToMany(() => Comment, (comment) => comment.parent_comment)
  children: Comment[];

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  author: User;

  // Content
  @Column({ type: 'text' })
  text: string;

  // Engagement
  @Column({ default: 0 })
  upvotes: number;

  @Column({ default: 0 })
  downvotes: number;

  @Column({
    type: 'int',
    generatedType: 'STORED',
    asExpression: 'upvotes - downvotes',
  })
  score: number;

  // Metadata
  @Column({ default: 0 })
  depth: number;

  @Column({ default: false })
  is_edited: boolean;

  // Timestamps
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({
    type: 'tsvector',
    generatedType: 'STORED',
    asExpression: `to_tsvector('english', coalesce(text, ''))`,
  })
  search_vector: string;
}

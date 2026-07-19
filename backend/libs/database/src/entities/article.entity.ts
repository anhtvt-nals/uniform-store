import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ArticleCategoryEntity } from './article-category.entity';
import { ArticleTagEntity } from './article-tag.entity';

@Entity('articles')
export class ArticleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', unique: true })
  slug: string;

  @Column({ type: 'jsonb' })
  title: Record<string, string>;

  @Column({ type: 'jsonb', default: {} })
  content: Record<string, string>;

  @Column({ type: 'jsonb', default: {} })
  excerpt: Record<string, string>;

  @Column({ name: 'image_url', type: 'text', default: '' })
  imageUrl: string;

  @Column({ type: 'text', default: '' })
  author: string;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ name: 'is_published', type: 'boolean', default: false })
  isPublished: boolean;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @ManyToMany(() => ArticleCategoryEntity)
  @JoinTable({
    name: 'article_category_map',
    joinColumn: { name: 'article_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories: ArticleCategoryEntity[];

  @ManyToMany(() => ArticleTagEntity)
  @JoinTable({
    name: 'article_tag_map',
    joinColumn: { name: 'article_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: ArticleTagEntity[];
}

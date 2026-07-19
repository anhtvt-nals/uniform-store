import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('article_tags')
export class ArticleTagEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', unique: true })
  slug: string;

  @Column({ type: 'jsonb' })
  name: Record<string, string>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

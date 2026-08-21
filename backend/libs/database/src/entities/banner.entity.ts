import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';

@Entity('banners')
export class BannerEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({type: 'jsonb'}) title: Record<string, string>;
  @Column({type: 'jsonb', default: {}}) subtitle: Record<string, string>;
  @Column({name: 'image_url', type: 'text', default: ''}) imageUrl: string;
  @Column({type: 'text', default: 'hero'}) position: string;
  @Column({name: 'is_active', type: 'boolean', default: true}) isActive: boolean;
  @Column({name: 'sort_order', type: 'int', default: 0}) sortOrder: number;
  @CreateDateColumn({name: 'created_at'}) createdAt: Date;
  @UpdateDateColumn({name: 'updated_at'}) updatedAt: Date;
}

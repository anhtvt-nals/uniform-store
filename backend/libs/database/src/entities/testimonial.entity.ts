import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';

@Entity('testimonials')
export class TestimonialEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({type: 'jsonb'}) content: Record<string, string>;
  @Column({type: 'jsonb'}) author: Record<string, string>;
  @Column({type: 'jsonb', default: {}}) role: Record<string, string>;
  @Column({name: 'avatar_url', type: 'text', default: ''}) avatarUrl: string;
  @Column({type: 'smallint', default: 5}) rating: number;
  @Column({name: 'is_active', type: 'boolean', default: true}) isActive: boolean;
  @Column({name: 'sort_order', type: 'int', default: 0}) sortOrder: number;
  @CreateDateColumn({name: 'created_at'}) createdAt: Date;
  @UpdateDateColumn({name: 'updated_at'}) updatedAt: Date;
}

import {Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';

@Entity('sizes')
export class SizeEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({type: 'varchar', unique: true}) code: string;
  @Column({name: 'weight_range', type: 'varchar', default: ''}) weightRange: string;
  @Column({name: 'sort_order', type: 'int', default: 0}) sortOrder: number;
  @Column({name: 'is_active', type: 'boolean', default: true}) isActive: boolean;
  @CreateDateColumn({name: 'created_at'}) createdAt: Date;
  @UpdateDateColumn({name: 'updated_at'}) updatedAt: Date;
  @DeleteDateColumn({name: 'deleted_at'}) deletedAt: Date | null;
}

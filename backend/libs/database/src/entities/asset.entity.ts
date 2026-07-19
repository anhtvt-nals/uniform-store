import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('assets')
export class AssetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  url: string;

  @Column({ type: 'varchar' })
  key: string;

  @Column({ type: 'varchar' })
  filename: string;

  @Column({ name: 'mime_type', type: 'varchar' })
  mimeType: string;

  @Column({ type: 'int', default: 0 })
  size: number;

  @Column({ type: 'jsonb', default: {} })
  alt: Record<string, string>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}

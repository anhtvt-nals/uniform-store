import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('addresses')
export class AddressEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'full_name', type: 'varchar', default: '' })
  fullName: string;

  @Column({ type: 'varchar', default: '' })
  company: string;

  @Column({ name: 'street_line1', type: 'varchar', default: '' })
  streetLine1: string;

  @Column({ name: 'street_line2', type: 'varchar', default: '' })
  streetLine2: string;

  @Column({ type: 'varchar', default: '' })
  city: string;

  @Column({ type: 'varchar', default: '' })
  province: string;

  @Column({ name: 'postal_code', type: 'varchar', default: '' })
  postalCode: string;

  @Column({ name: 'country_code', type: 'varchar', default: 'VN' })
  countryCode: string;

  @Column({ type: 'varchar', default: '' })
  phone: string;

  @Column({ name: 'is_default_shipping', type: 'boolean', default: false })
  isDefaultShipping: boolean;

  @Column({ name: 'is_default_billing', type: 'boolean', default: false })
  isDefaultBilling: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;
}

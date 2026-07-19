import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { UserRoleEntity } from './user-role.entity';

@Entity('users')
export class UserEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ name: 'first_name', type: 'varchar', default: '' })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', default: '' })
  lastName: string;

  @Column({ type: 'varchar', default: '' })
  phone: string;

  @Column({ name: 'avatar_url', type: 'varchar', default: '' })
  avatarUrl: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => UserRoleEntity, (ur) => ur.user)
  userRoles?: UserRoleEntity[];
}

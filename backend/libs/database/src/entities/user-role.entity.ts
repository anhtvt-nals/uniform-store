import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { UserEntity } from './user.entity';
import { RoleEntity } from './role.entity';

@Entity('user_roles')
export class UserRoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'role_id', type: 'uuid' })
  roleId: string;

  @ManyToOne(() => UserEntity, (u) => u.userRoles)
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;

  @ManyToOne(() => RoleEntity, (r) => r.userRoles)
  @JoinColumn({ name: 'role_id' })
  role?: RoleEntity;
}

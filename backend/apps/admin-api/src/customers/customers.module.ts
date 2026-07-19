import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import {
  UserEntity,
  AddressEntity,
  OrderEntity,
  UserRoleEntity,
  RoleEntity,
} from '@app/database';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      AddressEntity,
      OrderEntity,
      UserRoleEntity,
      RoleEntity,
    ]),
  ],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}

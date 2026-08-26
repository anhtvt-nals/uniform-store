import {Column, Entity, JoinColumn, ManyToOne, PrimaryColumn} from 'typeorm';
import {ProductEntity} from './product.entity';
import {SizeEntity} from './size.entity';

@Entity('product_sizes')
export class ProductSizeEntity {
  @PrimaryColumn({name: 'product_id', type: 'uuid'}) productId: string;
  @PrimaryColumn({name: 'size_id', type: 'uuid'}) sizeId: string;
  @ManyToOne(() => ProductEntity) @JoinColumn({name: 'product_id'}) product?: ProductEntity;
  @ManyToOne(() => SizeEntity) @JoinColumn({name: 'size_id'}) size?: SizeEntity;
}

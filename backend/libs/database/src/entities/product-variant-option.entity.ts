import { Entity, ManyToOne, JoinColumn, PrimaryColumn, Column } from 'typeorm';
import { ProductVariantEntity } from './product-variant.entity';
import { ProductOptionEntity } from './product-option.entity';

@Entity('product_variant_options')
export class ProductVariantOptionEntity {
  @PrimaryColumn({ name: 'variant_id', type: 'uuid' })
  variantId: string;

  @PrimaryColumn({ name: 'option_id', type: 'uuid' })
  optionId: string;

  @ManyToOne(() => ProductVariantEntity, (v) => v.variantOptions)
  @JoinColumn({ name: 'variant_id' })
  variant?: ProductVariantEntity;

  @ManyToOne(() => ProductOptionEntity)
  @JoinColumn({ name: 'option_id' })
  option?: ProductOptionEntity;
}

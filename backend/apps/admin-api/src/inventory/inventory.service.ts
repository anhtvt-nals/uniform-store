import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, Between, FindOptionsWhere } from 'typeorm';
import {
  InventoryEntity,
  StockHistoryEntity,
  ProductVariantEntity,
} from '@app/database';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { SetStockDto } from './dto/set-stock.dto';
import { ReserveStockDto } from './dto/reserve-stock.dto';
import { ReleaseStockDto } from './dto/release-stock.dto';
import { InventoryHistoryQueryDto } from './dto/inventory-history-query.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(InventoryEntity)
    private readonly inventoryRepo: Repository<InventoryEntity>,
    @InjectRepository(StockHistoryEntity)
    private readonly historyRepo: Repository<StockHistoryEntity>,
    @InjectRepository(ProductVariantEntity)
    private readonly variantRepo: Repository<ProductVariantEntity>,
  ) {}

  async getInventory(variantId: string) {
    const variant = await this.variantRepo.findOne({
      where: { id: variantId },
    });
    if (!variant) {
      throw new NotFoundException(`Variant not found: ${variantId}`);
    }

    const inventory = await this.inventoryRepo.findOne({
      where: { variantId },
    });
    if (!inventory) {
      throw new NotFoundException(`Inventory not found for variant: ${variantId}`);
    }

    return {
      id: inventory.id,
      variantId: inventory.variantId,
      quantity: inventory.quantity,
      reserved: inventory.reserved,
      available: inventory.quantity - inventory.reserved,
      lowStockLevel: inventory.lowStockLevel,
      trackInventory: inventory.trackInventory,
      allowBackorder: inventory.allowBackorder,
      createdAt: inventory.createdAt,
      updatedAt: inventory.updatedAt,
    };
  }

  async adjustStock(
    variantId: string,
    dto: AdjustStockDto,
    adminId?: string,
  ) {
    const variant = await this.variantRepo.findOne({
      where: { id: variantId },
    });
    if (!variant) {
      throw new NotFoundException(`Variant not found: ${variantId}`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let inventory = await queryRunner.manager.findOne(InventoryEntity, {
        where: { variantId },
      });

      if (!inventory) {
        inventory = queryRunner.manager.create(InventoryEntity, {
          variantId,
          quantity: 0,
          reserved: 0,
        });
        await queryRunner.manager.save(inventory);
      }

      const oldQuantity = inventory.quantity;
      const newQuantity = oldQuantity + dto.quantityChange;

      if (newQuantity < 0) {
        throw new BadRequestException(
          `Insufficient stock: ${oldQuantity} + ${dto.quantityChange} = ${newQuantity}`,
        );
      }

      await queryRunner.manager.update(
        InventoryEntity,
        inventory.id,
        { quantity: newQuantity },
      );

      const history = this.historyRepo.create({
        variantId,
        type: dto.type,
        reasonCode: dto.reasonCode,
        reason: dto.reason,
        quantityChange: dto.quantityChange,
        quantityBefore: oldQuantity,
        quantityAfter: newQuantity,
        reservedBefore: inventory.reserved,
        reservedAfter: inventory.reserved,
        reference: dto.reference,
        createdBy: adminId,
      });
      await queryRunner.manager.save(history);

      await queryRunner.commitTransaction();

      return {
        variantId,
        quantity: newQuantity,
        reserved: inventory.reserved,
        available: newQuantity - inventory.reserved,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async setStock(
    variantId: string,
    dto: SetStockDto,
    adminId?: string,
  ) {
    const variant = await this.variantRepo.findOne({
      where: { id: variantId },
    });
    if (!variant) {
      throw new NotFoundException(`Variant not found: ${variantId}`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let inventory = await queryRunner.manager.findOne(InventoryEntity, {
        where: { variantId },
      });

      if (!inventory) {
        inventory = queryRunner.manager.create(InventoryEntity, {
          variantId,
          quantity: 0,
          reserved: 0,
        });
        await queryRunner.manager.save(inventory);
      }

      const oldQuantity = inventory.quantity;
      const quantityChange = dto.quantity - oldQuantity;

      await queryRunner.manager.update(
        InventoryEntity,
        inventory.id,
        { quantity: dto.quantity },
      );

      const history = this.historyRepo.create({
        variantId,
        type: 'correction',
        reason: dto.reason ?? 'Manual stock set',
        quantityChange,
        quantityBefore: oldQuantity,
        quantityAfter: dto.quantity,
        reservedBefore: inventory.reserved,
        reservedAfter: inventory.reserved,
        createdBy: adminId,
      });
      await queryRunner.manager.save(history);

      await queryRunner.commitTransaction();

      return {
        variantId,
        quantity: dto.quantity,
        reserved: inventory.reserved,
        available: dto.quantity - inventory.reserved,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async reserveStock(
    variantId: string,
    dto: ReserveStockDto,
    adminId?: string,
  ) {
    const variant = await this.variantRepo.findOne({
      where: { id: variantId },
    });
    if (!variant) {
      throw new NotFoundException(`Variant not found: ${variantId}`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const inventory = await queryRunner.manager.findOne(InventoryEntity, {
        where: { variantId },
      });

      if (!inventory) {
        throw new NotFoundException(
          `Inventory not found for variant: ${variantId}`,
        );
      }

      const available = inventory.quantity - inventory.reserved;
      if (dto.quantity > available) {
        throw new BadRequestException(
          `Insufficient available stock: ${available} < ${dto.quantity}`,
        );
      }

      const oldReserved = inventory.reserved;
      const newReserved = oldReserved + dto.quantity;

      await queryRunner.manager.update(
        InventoryEntity,
        inventory.id,
        { reserved: newReserved },
      );

      const history = this.historyRepo.create({
        variantId,
        type: 'reservation',
        quantityChange: 0,
        quantityBefore: inventory.quantity,
        quantityAfter: inventory.quantity,
        reservedBefore: oldReserved,
        reservedAfter: newReserved,
        createdBy: adminId,
      });
      await queryRunner.manager.save(history);

      await queryRunner.commitTransaction();

      return {
        variantId,
        quantity: inventory.quantity,
        reserved: newReserved,
        available: inventory.quantity - newReserved,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async releaseStock(
    variantId: string,
    dto: ReleaseStockDto,
    adminId?: string,
  ) {
    const variant = await this.variantRepo.findOne({
      where: { id: variantId },
    });
    if (!variant) {
      throw new NotFoundException(`Variant not found: ${variantId}`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const inventory = await queryRunner.manager.findOne(InventoryEntity, {
        where: { variantId },
      });

      if (!inventory) {
        throw new NotFoundException(
          `Inventory not found for variant: ${variantId}`,
        );
      }

      if (dto.quantity > inventory.reserved) {
        throw new BadRequestException(
          `Cannot release ${dto.quantity}, only ${inventory.reserved} reserved`,
        );
      }

      const oldReserved = inventory.reserved;
      const newReserved = oldReserved - dto.quantity;

      await queryRunner.manager.update(
        InventoryEntity,
        inventory.id,
        { reserved: newReserved },
      );

      const history = this.historyRepo.create({
        variantId,
        type: 'release',
        quantityChange: 0,
        quantityBefore: inventory.quantity,
        quantityAfter: inventory.quantity,
        reservedBefore: oldReserved,
        reservedAfter: newReserved,
        createdBy: adminId,
      });
      await queryRunner.manager.save(history);

      await queryRunner.commitTransaction();

      return {
        variantId,
        quantity: inventory.quantity,
        reserved: newReserved,
        available: inventory.quantity - newReserved,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getHistory(variantId: string, query: InventoryHistoryQueryDto) {
    const variant = await this.variantRepo.findOne({
      where: { id: variantId },
    });
    if (!variant) {
      throw new NotFoundException(`Variant not found: ${variantId}`);
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: FindOptionsWhere<StockHistoryEntity> = { variantId };

    if (query.type) {
      where.type = query.type;
    }

    if (query.from || query.to) {
      const dateFilter: any = {};
      if (query.from) dateFilter.$gte = new Date(query.from);
      if (query.to) dateFilter.$lte = new Date(query.to);
      where.createdAt = Between(
        query.from ? new Date(query.from) : new Date(0),
        query.to ? new Date(query.to) : new Date(),
      );
    }

    const [items, total] = await this.historyRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getLowStock(query: { page?: number; limit?: number }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [items, total] = await this.inventoryRepo.findAndCount({
      where: { trackInventory: true },
      skip: (page - 1) * limit,
      take: limit,
    });

    const filtered = items.filter(
      (inv) => inv.quantity - inv.reserved <= inv.lowStockLevel,
    );

    return {
      items: filtered,
      total: filtered.length,
      page,
      pageSize: limit,
      totalPages: Math.ceil(filtered.length / limit),
    };
  }
}

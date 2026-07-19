import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  OrderEntity,
  OrderItemEntity,
  ProductEntity,
  UserEntity,
} from '@app/database';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepo: Repository<OrderItemEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async getStats() {
    const [totalOrders, totalCustomers, totalProducts, pendingOrders] = await Promise.all([
      this.orderRepo.count(),
      this.userRepo.count(),
      this.productRepo.count(),
      this.orderRepo.count({ where: { status: 'pending' } }),
    ]);
    const revenueAgg = await this.orderRepo
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o.grand_total), 0)', 'total')
      .where('o.status NOT IN (:...excluded)', { excluded: ['cancelled'] })
      .getRawOne();
    const totalRevenue = parseInt(revenueAgg?.total ?? '0', 10);
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      totalProducts,
      pendingOrders,
      totalCustomers,
    };
  }

  async getRevenue() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    const sumRevenue = async (since: Date) => {
      const result = await this.orderRepo
        .createQueryBuilder('o')
        .select('COALESCE(SUM(o.grand_total), 0)', 'total')
        .where('o.created_at >= :since', { since })
        .andWhere('o.status NOT IN (:...excluded)', { excluded: ['cancelled'] })
        .getRawOne();
      return parseInt(result?.total ?? '0', 10);
    };

    const [todayRevenue, weekRevenue, monthRevenue, yearRevenue] =
      await Promise.all([
        sumRevenue(today),
        sumRevenue(startOfWeek),
        sumRevenue(startOfMonth),
        sumRevenue(startOfYear),
      ]);

    return {
      today: todayRevenue,
      thisWeek: weekRevenue,
      thisMonth: monthRevenue,
      thisYear: yearRevenue,
    };
  }

  async getOrders(limit = 10) {
    const orders = await this.orderRepo.find({
      order: { createdAt: 'DESC' },
      take: Math.min(limit, 50),
    });

    const statusCounts = await this.orderRepo
      .createQueryBuilder('o')
      .select('o.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('o.status')
      .getRawMany();

    return {
      recent: orders,
      statusCounts: statusCounts.map((s) => ({
        status: s.status,
        count: parseInt(s.count, 10),
      })),
    };
  }

  async getTopProducts(limit = 10) {
    const items = await this.orderItemRepo
      .createQueryBuilder('oi')
      .select('oi.variant_id', 'variantId')
      .addSelect('oi.product_name', 'productName')
      .addSelect('oi.sku', 'sku')
      .addSelect('SUM(oi.quantity)', 'totalSold')
      .addSelect('SUM(oi.line_price)', 'totalRevenue')
      .groupBy('oi.variant_id')
      .addGroupBy('oi.product_name')
      .addGroupBy('oi.sku')
      .orderBy('SUM(oi.quantity)', 'DESC')
      .take(Math.min(limit, 50))
      .getRawMany();

    return items.map((i) => ({
      variantId: i.variantId,
      productName: i.productName,
      sku: i.sku,
      totalSold: parseInt(i.totalSold, 10),
      totalRevenue: parseInt(i.totalRevenue, 10),
    }));
  }

  async getRevenueSummary(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const rows = await this.orderRepo
      .createQueryBuilder('o')
      .select("DATE(o.created_at)", 'date')
      .addSelect('COALESCE(SUM(o.grand_total), 0)', 'revenue')
      .addSelect('COUNT(*)', 'orders')
      .where('o.created_at >= :since', { since })
      .andWhere('o.status NOT IN (:...excluded)', { excluded: ['cancelled'] })
      .groupBy('DATE(o.created_at)')
      .orderBy('DATE(o.created_at)', 'ASC')
      .getRawMany();

    return rows.map((r) => ({
      date: r.date,
      revenue: parseInt(r.revenue, 10),
      orders: parseInt(r.orders, 10),
    }));
  }

  async getOrderStats() {
    const rows = await this.orderRepo
      .createQueryBuilder('o')
      .select('o.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .addSelect('COALESCE(SUM(o.grand_total), 0)', 'total')
      .groupBy('o.status')
      .getRawMany();

    return rows.map((r) => ({
      status: r.status,
      count: parseInt(r.count, 10),
      total: parseInt(r.total, 10),
    }));
  }

  async getCustomerStats(days = 30) {
    const total = await this.userRepo.count();

    const since = new Date();
    since.setDate(since.getDate() - days);

    const newCustomers = await this.userRepo.count({
      where: { createdAt: { $gte: since } as any },
    });

    const active = await this.userRepo.count({
      where: { isActive: true },
    });

    return {
      total,
      newCustomers,
      active,
      periodDays: days,
    };
  }
}

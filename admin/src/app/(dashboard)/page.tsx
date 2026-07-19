"use client"

import { useQuery } from "@tanstack/react-query"
import { apiClient, getToken } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, TrendingDown } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

type DashboardStats = {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  averageOrderValue: number;
  ordersToday: number;
  revenueToday: number;
  pendingOrders: number;
  lowStockCount: number;
};

type RevenueData = {
  date: string;
  revenue: number;
  orders: number;
};

type TopProduct = {
  id: string;
  name: Record<string, string>;
  slug: string;
  totalSold: number;
  totalRevenue: number;
  image?: string;
};

type OrderStats = Record<string, number>;

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export default function DashboardPage() {
  const token = getToken();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => apiClient<DashboardStats>("/dashboard/stats", { token }),
    select: (res) => res.data,
  });

  const { data: revenue, isLoading: revenueLoading } = useQuery({
    queryKey: ["dashboard", "revenue-summary"],
    queryFn: () => apiClient<RevenueData[]>("/dashboard/revenue-summary", { params: { days: 30 }, token }),
    select: (res) => res.data,
  });

  const { data: topProducts, isLoading: topLoading } = useQuery({
    queryKey: ["dashboard", "top-products"],
    queryFn: () => apiClient<TopProduct[]>("/dashboard/top-products", { params: { limit: 5 }, token }),
    select: (res) => res.data,
  });

  const { data: orderStats, isLoading: orderStatsLoading } = useQuery({
    queryKey: ["dashboard", "order-stats"],
    queryFn: () => apiClient<OrderStats>("/dashboard/order-stats", { token }),
    select: (res) => res.data,
  });

  const statCards = stats ? [
    { title: "Total Revenue", value: formatCurrency(stats.totalRevenue ?? 0), icon: DollarSign, trend: "+12.5%", trendUp: true },
    { title: "Total Orders", value: (stats.totalOrders ?? 0).toLocaleString(), icon: ShoppingCart, trend: "+8.2%", trendUp: true },
    { title: "Total Customers", value: (stats.totalCustomers ?? 0).toLocaleString(), icon: Users, trend: "+5.1%", trendUp: true },
    { title: "Total Products", value: (stats.totalProducts ?? 0).toLocaleString(), icon: Package, trend: "+3.4%", trendUp: true },
    { title: "Avg Order Value", value: formatCurrency(stats.averageOrderValue ?? 0), icon: DollarSign, trend: "-2.1%", trendUp: false },
    { title: "Pending Orders", value: (stats.pendingOrders ?? 0).toString(), icon: ShoppingCart, trend: "", trendUp: true },
  ] : [];

  const orderStatusEntries = orderStats
    ? Object.entries(orderStats).map(([status, count]) => ({ status, count }))
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your store performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statsLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </CardContent>
              </Card>
            ))
          : statCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">
                      {card.title}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{card.value}</div>
                    {card.trend && (
                      <p className={cn("text-xs flex items-center gap-1 mt-1", card.trendUp ? "text-emerald-600" : "text-red-600")}>
                        {card.trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {card.trend} from last month
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : revenue && revenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenue}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(val) => {
                      try { return format(new Date(val), "dd/MM"); } catch { return val; }
                    }}
                    className="text-xs text-muted-foreground"
                  />
                  <YAxis className="text-xs text-muted-foreground" />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No revenue data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {orderStatsLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : orderStatusEntries.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={orderStatusEntries} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs text-muted-foreground" />
                  <YAxis dataKey="status" type="category" className="text-xs capitalize" />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No orders yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          {topLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : topProducts && topProducts.length > 0 ? (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-muted-foreground w-6">{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {product.name?.en || product.name?.vi || product.slug}
                    </p>
                    <p className="text-xs text-muted-foreground">{product.totalSold} sold</p>
                  </div>
                  <p className="text-sm font-medium">{formatCurrency(product.totalRevenue)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              No products sold yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

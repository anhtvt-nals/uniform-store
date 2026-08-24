"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Loader2, Plus, Search, Trash2, X } from "lucide-react";
import { apiClient, getToken } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Product = { id: string; name: Record<string, string>; sku: string };
type Discount = {
  id: string;
  name: Record<string, string>;
  type: "percentage" | "fixed";
  value: number;
  targetIds: string[];
  endsAt: string | null;
  minQuantityPerProduct: number;
};

type FormState = {
  name: string;
  type: "percentage" | "fixed";
  value: string;
  endsAt: string;
  minQuantityPerProduct: string;
  productIds: string[];
};

const initialForm: FormState = {
  name: "",
  type: "percentage",
  value: "",
  endsAt: "",
  minQuantityPerProduct: "1",
  productIds: [],
};

function toDateInput(value: string | null) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

export default function PromotionsPage() {
  const token = getToken();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Discount | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [productSearch, setProductSearch] = useState("");
  const [error, setError] = useState("");

  const { data: discounts = [], isLoading } = useQuery({
    queryKey: ["discounts"],
    queryFn: async () => (await apiClient<Discount[]>("/discounts", { token })).data,
  });
  const { data: products = [], isFetching: isSearchingProducts } = useQuery({
    queryKey: ["promotion-products", productSearch],
    queryFn: async () => {
      const response = await apiClient<{ items: Product[] }>("/products", {
        token,
        params: { search: productSearch || undefined, limit: 20, page: 1 },
      });
      return response.data.items;
    },
    enabled: open,
  });

  const selectedProducts = useMemo(
    () => products.filter((product) => form.productIds.includes(product.id)),
    [form.productIds, products],
  );

  const save = useMutation({
    mutationFn: (payload: FormState) => apiClient<Discount>(
      editing ? `/discounts/${editing.id}` : "/discounts",
      {
        method: editing ? "PATCH" : "POST",
        token,
        body: {
          name: payload.name,
          type: payload.type,
          value: Number(payload.value),
          productIds: payload.productIds,
          endsAt: payload.endsAt || undefined,
          minQuantityPerProduct: Number(payload.minQuantityPerProduct),
        },
      },
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
      setOpen(false);
    },
    onError: (cause: Error) => setError(cause.message),
  });
  const remove = useMutation({
    mutationFn: (id: string) => apiClient(`/discounts/${id}`, { method: "DELETE", token }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["discounts"] }),
  });

  function openCreate() {
    setEditing(null);
    setForm(initialForm);
    setProductSearch("");
    setError("");
    setOpen(true);
  }
  function openEdit(discount: Discount) {
    setEditing(discount);
    setForm({
      name: discount.name.vi || discount.name.en || "",
      type: discount.type,
      value: String(discount.value),
      endsAt: toDateInput(discount.endsAt),
      minQuantityPerProduct: String(discount.minQuantityPerProduct || 1),
      productIds: discount.targetIds || [],
    });
    setProductSearch("");
    setError("");
    setOpen(true);
  }
  function toggleProduct(id: string) {
    setForm((current) => ({
      ...current,
      productIds: current.productIds.includes(id)
        ? current.productIds.filter((productId) => productId !== id)
        : [...current.productIds, id],
    }));
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.productIds.length) return setError("Vui lòng chọn ít nhất một sản phẩm áp dụng.");
    setError("");
    save.mutate(form);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Khuyến mãi</h1>
          <p className="mt-1 text-sm text-muted-foreground">Thiết lập ưu đãi theo sản phẩm và số lượng mua.</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Tạo khuyến mãi</Button>
      </div>

      <Card><CardContent className="pt-6">
        {isLoading ? <div className="py-12 text-center text-sm text-muted-foreground">Đang tải...</div> : discounts.length ? (
          <Table><TableHeader><TableRow>
            <TableHead>Tiêu đề</TableHead><TableHead>Loại giảm</TableHead><TableHead>Điều kiện</TableHead><TableHead>Hết hạn</TableHead><TableHead className="text-right">Thao tác</TableHead>
          </TableRow></TableHeader><TableBody>
            {discounts.map((discount) => <TableRow key={discount.id}>
              <TableCell className="font-medium">{discount.name.vi || discount.name.en}</TableCell>
              <TableCell>{discount.type === "percentage" ? `${discount.value}%` : `${new Intl.NumberFormat("vi-VN").format(discount.value)} VNĐ`}</TableCell>
              <TableCell>Từ {discount.minQuantityPerProduct || 1} SP / loại · {discount.targetIds?.length || 0} sản phẩm</TableCell>
              <TableCell>{discount.endsAt ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(discount.endsAt)) : "Không giới hạn"}</TableCell>
              <TableCell className="text-right"><div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(discount)}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { if (confirm("Xóa khuyến mãi này?")) remove.mutate(discount.id); }}><Trash2 className="h-4 w-4" /></Button>
              </div></TableCell>
            </TableRow>)}
          </TableBody></Table>
        ) : <div className="py-12 text-center text-sm text-muted-foreground">Chưa có chương trình khuyến mãi.</div>}
      </CardContent></Card>

      <Dialog open={open} onOpenChange={setOpen} className="max-w-2xl">
        <DialogHeader><DialogTitle>{editing ? "Cập nhật khuyến mãi" : "Tạo khuyến mãi"}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="max-h-[75vh] space-y-5 overflow-y-auto pr-1">
          <div className="space-y-2"><Label htmlFor="promotion-name">Tiêu đề</Label><Input id="promotion-name" value={form.name} onChange={(event) => setForm({...form, name: event.target.value})} required /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Loại giảm</Label><Select value={form.type} onChange={(event) => setForm({...form, type: event.target.value as FormState["type"]})} options={[{value:"percentage", label:"Giảm phần trăm (%)"},{value:"fixed", label:"Giảm số tiền (VNĐ)"}]} /></div>
            <div className="space-y-2"><Label htmlFor="promotion-value">Giá trị giảm</Label><Input id="promotion-value" type="number" min="1" step="1" value={form.value} onChange={(event) => setForm({...form, value: event.target.value})} required /></div>
            <div className="space-y-2"><Label htmlFor="promotion-expiry">Ngày hết hạn</Label><Input id="promotion-expiry" type="date" value={form.endsAt} onChange={(event) => setForm({...form, endsAt: event.target.value})} /></div>
            <div className="space-y-2"><Label htmlFor="promotion-quantity">Tối thiểu / một loại SP</Label><Input id="promotion-quantity" type="number" min="1" step="1" value={form.minQuantityPerProduct} onChange={(event) => setForm({...form, minQuantityPerProduct: event.target.value})} required /></div>
          </div>
          <div className="space-y-2">
            <Label>Sản phẩm áp dụng</Label>
            <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={productSearch} onChange={(event) => setProductSearch(event.target.value)} placeholder="Tìm theo tên hoặc SKU..." /></div>
            {form.productIds.length > 0 && <div className="flex flex-wrap gap-2">{selectedProducts.map((product) => <span key={product.id} className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">{product.name.vi || product.name.en}<button type="button" onClick={() => toggleProduct(product.id)}><X className="h-3 w-3" /></button></span>)}</div>}
            <div className="max-h-48 overflow-y-auto rounded-md border">
              {isSearchingProducts ? <p className="p-3 text-sm text-muted-foreground">Đang tìm...</p> : products.map((product) => <button key={product.id} type="button" onClick={() => toggleProduct(product.id)} className={`flex w-full items-center justify-between border-b px-3 py-2 text-left text-sm last:border-0 hover:bg-muted ${form.productIds.includes(product.id) ? "bg-primary/5" : ""}`}><span>{product.name.vi || product.name.en}<span className="ml-2 text-xs text-muted-foreground">{product.sku}</span></span><span className="text-xs font-medium text-primary">{form.productIds.includes(product.id) ? "Đã chọn" : "Chọn"}</span></button>)}</div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="sticky bottom-0 flex justify-end gap-2 bg-background py-3"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Hủy</Button><Button type="submit" disabled={save.isPending}>{save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editing ? "Lưu thay đổi" : "Tạo khuyến mãi"}</Button></div>
        </form>
      </Dialog>
    </div>
  );
}

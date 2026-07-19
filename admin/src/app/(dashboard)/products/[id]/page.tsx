"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient, getToken } from "@/lib/api"
import { ProductForm } from "../product-form"
import { Tabs } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Plus, Trash2, Pencil } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"

type Variant = {
  id: string;
  name: Record<string, string>;
  sku: string;
  barcode?: string;
  price: number;
  comparePrice?: number;
  isActive: boolean;
  sortOrder: number;
  inventory?: { quantity: number; reserved: number };
  variantOptions?: { option: { id: string; name: Record<string, string>; group: { id: string; name: Record<string, string> } } }[];
};

type Image = {
  id: string;
  url: string;
  alt?: Record<string, string>;
  sortOrder: number;
};

type OptionGroup = {
  id: string;
  name: Record<string, string>;
  sortOrder: number;
  options: { id: string; name: Record<string, string>; value?: Record<string, string>; sortOrder: number }[];
};

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const token = getToken();

  const [variantDialog, setVariantDialog] = useState<{ open: boolean; editId?: string }>({ open: false });
  const [variantForm, setVariantForm] = useState({ nameEn: "", nameVi: "", nameDe: "", sku: "", price: 0, barcode: "" });
  const [deleteVariantId, setDeleteVariantId] = useState<string | null>(null);
  const [deleteImageId, setDeleteImageId] = useState<string | null>(null);

  const { data: product, isLoading, isError, error } = useQuery({
    queryKey: ["product", id],
    queryFn: () => apiClient<Record<string, unknown>>(`/products/${id}`, { token }),
    select: (res) => res.data,
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (formData: Record<string, unknown>) =>
      apiClient(`/products/${id}`, { method: "PATCH", body: formData, token }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["product", id] }); toast.success("Product updated"); },
    onError: (err: Error) => toast.error(err.message),
  });

  const createVariantMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiClient(`/products/${id}/variants`, { method: "POST", body: data, token }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["product", id] }); toast.success("Variant added"); setVariantDialog({ open: false }); },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteVariantMutation = useMutation({
    mutationFn: (variantId: string) => apiClient(`/products/${id}/variants/${variantId}`, { method: "DELETE", token }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["product", id] }); toast.success("Variant deleted"); setDeleteVariantId(null); },
    onError: (err: Error) => toast.error(err.message),
  });

  const addImageMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiClient(`/products/${id}/images`, { method: "POST", body: data, token }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["product", id] }); toast.success("Image added"); },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteImageMutation = useMutation({
    mutationFn: (imageId: string) => apiClient(`/products/${id}/images/${imageId}`, { method: "DELETE", token }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["product", id] }); toast.success("Image deleted"); setDeleteImageId(null); },
    onError: (err: Error) => toast.error(err.message),
  });

  const variants = (product?.variants as Variant[]) || [];
  const images = (product?.images as Image[]) || [];
  const optionGroups = (product?.optionGroups as OptionGroup[]) || [];

  const tabs = [
    {
      id: "details",
      label: "Details",
      content: (
        <ProductForm
          defaultValues={product}
          onSubmit={(data) => updateMutation.mutate(data)}
          isSubmitting={updateMutation.isPending}
          productId={id}
          images={images}
          onAddImage={(url) => addImageMutation.mutate({ url })}
          onDeleteImage={(imageId) => deleteImageMutation.mutate(imageId)}
        />
      ),
    },
    {
      id: "variants",
      label: "Variants",
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{variants.length} variant(s)</p>
            <Button size="sm" onClick={() => setVariantDialog({ open: true })}>
              <Plus className="h-4 w-4" /> Add Variant
            </Button>
          </div>
          {variants.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variants.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{v.name?.en || v.name?.vi || v.sku}</TableCell>
                      <TableCell className="text-muted-foreground">{v.sku}</TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v.price)}
                      </TableCell>
                      <TableCell>{v.inventory ? `${v.inventory.quantity - v.inventory.reserved} / ${v.inventory.quantity}` : "—"}</TableCell>
                      <TableCell>{v.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteVariantId(v.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">No variants yet. Add one to get started.</p>
          )}
        </div>
      ),
    },
    {
      id: "images",
      label: "Images",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium">All Product Images</h3>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3">The first image is used as the product thumbnail</p>
            {images.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {images.map((img, idx) => (
                  <div key={img.id} className="group relative rounded-md border overflow-hidden">
                    {idx === 0 && (
                      <div className="absolute top-1 left-1 z-10 rounded bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                        Thumbnail
                      </div>
                    )}
                    <img src={img.url} alt={img.alt?.en || ""} className="aspect-square object-cover" />
                    <button
                      onClick={() => setDeleteImageId(img.id)}
                      className="absolute top-1 right-1 rounded-full bg-background/80 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">No images yet.</p>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "options",
      label: "Options",
      content: (
        <div className="space-y-4">
          {optionGroups.length > 0 ? (
            optionGroups.map((og) => (
              <Card key={og.id}>
                <CardHeader>
                  <CardTitle className="text-sm">{og.name?.en || og.name?.vi}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {og.options?.map((opt) => (
                      <Badge key={opt.id} variant="outline">{opt.name?.en || opt.name?.vi}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">No option groups defined.</p>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-96 w-full" /></div>;
  if (isError) return <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-4 text-destructive"><AlertCircle className="h-4 w-4" />Failed to load product: {(error as Error).message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {(product?.name as Record<string, string>)?.en || (product?.slug as string)}
          </h1>
          <p className="text-muted-foreground text-sm">Edit product details</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/products")}>Back to Products</Button>
      </div>

      <Tabs tabs={tabs} defaultTab="details" />

      {/* Add Variant Dialog */}
      <Dialog open={variantDialog.open} onOpenChange={(o) => !o && setVariantDialog({ open: false })}>
        <DialogHeader>
          <DialogTitle>Add Variant</DialogTitle>
          <DialogDescription>Create a new variant for this product</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {["en", "vi", "de"].map((l) => (
            <div key={l} className="space-y-1">
              <Label className="text-xs uppercase text-muted-foreground">Name ({l})</Label>
              <Input value={l === "en" ? variantForm.nameEn : l === "vi" ? variantForm.nameVi : variantForm.nameDe}
                onChange={(e) => {
                  const v = e.target.value;
                  if (l === "en") setVariantForm(p => ({ ...p, nameEn: v }));
                  else if (l === "vi") setVariantForm(p => ({ ...p, nameVi: v }));
                  else setVariantForm(p => ({ ...p, nameDe: v }));
                }} />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>SKU</Label>
              <Input value={variantForm.sku} onChange={(e) => setVariantForm(p => ({ ...p, sku: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Price (VND)</Label>
              <Input type="number" min={0} value={variantForm.price} onChange={(e) => setVariantForm(p => ({ ...p, price: Number(e.target.value) }))} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setVariantDialog({ open: false })}>Cancel</Button>
          <Button onClick={() => {
            createVariantMutation.mutate({
              name: { en: variantForm.nameEn, vi: variantForm.nameVi, de: variantForm.nameDe },
              sku: variantForm.sku,
              price: variantForm.price,
              barcode: variantForm.barcode || undefined,
            });
            setVariantForm({ nameEn: "", nameVi: "", nameDe: "", sku: "", price: 0, barcode: "" });
          }} disabled={createVariantMutation.isPending}>
            {createVariantMutation.isPending ? "Adding..." : "Add Variant"}
          </Button>
        </DialogFooter>
      </Dialog>

      <ConfirmDialog open={!!deleteVariantId} onOpenChange={() => setDeleteVariantId(null)}
        onConfirm={() => deleteVariantId && deleteVariantMutation.mutate(deleteVariantId)}
        title="Delete Variant" description="This variant will be soft-deleted." isLoading={deleteVariantMutation.isPending} />

      <ConfirmDialog open={!!deleteImageId} onOpenChange={() => setDeleteImageId(null)}
        onConfirm={() => deleteImageId && deleteImageMutation.mutate(deleteImageId)}
        title="Delete Image" description="This image will be deleted." isLoading={deleteImageMutation.isPending} />
    </div>
  );
}

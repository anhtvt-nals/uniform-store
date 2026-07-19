"use client"

import { useState, useRef } from "react"
import { ProductForm } from "../product-form"
import { useRouter } from "next/navigation"
import { apiClient, getToken } from "@/lib/api"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

export default function NewProductPage() {
  const router = useRouter();
  const token = getToken();
  const [pendingImages, setPendingImages] = useState<{ id: string; url: string; sortOrder: number }[]>([]);
  const imageIdCounter = useRef(Date.now());

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiClient("/products", { method: "POST", body: data, token }),
    onSuccess: async (res) => {
      const newId = (res.data as { id: string }).id;

      for (const img of pendingImages) {
        try {
          await apiClient(`/products/${newId}/images`, { method: "POST", body: { url: img.url }, token });
        } catch (e) {
          console.error("Failed to link image:", img.url, e);
        }
      }

      toast.success("Product created successfully");
      router.push(`/products/${newId}`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function handleAddImage(url: string) {
    imageIdCounter.current++;
    setPendingImages((prev) => [...prev, { id: `pending-${imageIdCounter.current}`, url, sortOrder: prev.length }]);
  }

  function handleDeleteImage(id: string) {
    setPendingImages((prev) => prev.filter((img) => img.id !== id));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Product</h1>
        <p className="text-muted-foreground text-sm">Create a new product</p>
      </div>
      <ProductForm
        onSubmit={(data) => mutation.mutate(data)}
        isSubmitting={mutation.isPending}
        images={pendingImages}
        onAddImage={handleAddImage}
        onDeleteImage={handleDeleteImage}
      />
    </div>
  );
}

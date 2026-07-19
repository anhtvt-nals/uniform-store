"use client"

import { CategoryForm } from "../category-form"
import { useRouter } from "next/navigation"
import { apiClient, getToken } from "@/lib/api"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

export default function NewCategoryPage() {
  const router = useRouter();
  const token = getToken();

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiClient("/categories", { method: "POST", body: data, token }),
    onSuccess: () => {
      toast.success("Category created successfully");
      router.push("/categories");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Category</h1>
        <p className="text-muted-foreground text-sm">Create a new product category</p>
      </div>
      <CategoryForm
        onSubmit={(data) => mutation.mutate(data)}
        isSubmitting={mutation.isPending}
      />
    </div>
  );
}

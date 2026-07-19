"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient, getToken } from "@/lib/api"
import { CategoryForm } from "../category-form"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { toast } from "sonner"

export default function EditCategoryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const token = getToken();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["category", id],
    queryFn: () => apiClient<Record<string, unknown>>(`/categories/${id}`, { token }),
    select: (res) => res.data,
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: (formData: Record<string, unknown>) =>
      apiClient(`/categories/${id}`, { method: "PATCH", body: formData, token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["category", id] });
      toast.success("Category updated successfully");
      router.push("/categories");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full max-w-2xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-4 text-destructive text-sm">
        <AlertCircle className="h-4 w-4" />
        Failed to load category: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Category</h1>
        <p className="text-muted-foreground text-sm">Update category details</p>
      </div>
      <CategoryForm
        defaultValues={data}
        onSubmit={(formData) => mutation.mutate(formData)}
        isSubmitting={mutation.isPending}
      />
    </div>
  );
}

"use client"

import { BrandForm } from "../brand-form"
import { useRouter } from "next/navigation"
import { apiClient, getToken } from "@/lib/api"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

export default function NewBrandPage() {
  const router = useRouter();
  const token = getToken();

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiClient("/brands", { method: "POST", body: data, token }),
    onSuccess: () => {
      toast.success("Brand created successfully");
      router.push("/brands");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Brand</h1>
        <p className="text-muted-foreground text-sm">Create a new product brand</p>
      </div>
      <BrandForm onSubmit={(data) => mutation.mutate(data)} isSubmitting={mutation.isPending} />
    </div>
  );
}

"use client"

import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { apiClient, getToken } from "@/lib/api"
import { toast } from "sonner"
import { ArticleForm } from "../article-form"

export default function NewArticlePage() {
  const router = useRouter();
  const token = getToken();

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiClient("/articles", { method: "POST", body: data, token }),
    onSuccess: () => { toast.success("Article created"); router.push("/articles"); },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">New Article</h1><p className="text-muted-foreground text-sm">Create a new article</p></div>
      <ArticleForm onSubmit={(data) => mutation.mutate(data)} isSubmitting={mutation.isPending} />
    </div>
  );
}

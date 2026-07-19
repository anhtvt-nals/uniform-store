"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient, getToken } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { ArticleForm } from "../article-form"

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const token = getToken();

  const { data: article, isLoading } = useQuery({
    queryKey: ["article", id],
    queryFn: () => apiClient<Record<string, unknown>>(`/articles/${id}`, { token }),
    select: (res) => res.data,
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiClient(`/articles/${id}`, { method: "PATCH", body: data, token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["article", id] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      toast.success("Article updated");
      router.push("/articles");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-96 w-full max-w-2xl" /></div>;
  if (!article) return <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-4 text-destructive"><AlertCircle className="h-4 w-4" />Article not found</div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Edit Article</h1><p className="text-muted-foreground text-sm">Update article content</p></div>
      <ArticleForm
        defaultValues={article}
        onSubmit={(data) => mutation.mutate(data)}
        isSubmitting={mutation.isPending}
        articleId={id}
      />
    </div>
  );
}

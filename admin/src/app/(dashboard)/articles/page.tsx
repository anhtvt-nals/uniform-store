"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient, getToken } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination } from "@/components/shared/pagination"
import { EmptyState } from "@/components/shared/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { SearchInput } from "@/components/shared/search-input"
import { Plus, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useT } from "@/i18n"
import { format } from "date-fns"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"

type Article = {
  id: string;
  title: Record<string, string>;
  slug: string;
  isPublished: boolean;
  createdAt: string;
};

export default function ArticlesPage() {
  const { t } = useT();
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const token = getToken();

  const { data, isLoading } = useQuery({
    queryKey: ["articles", page],
    queryFn: () => apiClient<{ items: Article[]; total: number; page: number; totalPages: number }>("/articles", { params: { page, limit: 20 }, token }),
    select: (res) => res.data,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient(`/articles/${id}`, { method: "DELETE", token }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["articles"] }); toast.success("Article deleted"); setDeleteId(null); },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Articles</h1><p className="text-muted-foreground text-sm">Blog & content management</p></div>
        <Button asChild><Link href="/articles/new"><Plus className="h-4 w-4" /> New Article</Link></Button>
      </div>
      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : data && data.items.length > 0 ? (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.title?.en || a.title?.vi || a.slug}</TableCell>
                    <TableCell className="text-muted-foreground">{a.slug}</TableCell>
                    <TableCell>{a.isPublished ? <Badge variant="success">Published</Badge> : <Badge variant="secondary">Draft</Badge>}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{format(new Date(a.createdAt), "dd/MM/yyyy")}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" asChild><Link href={`/articles/${a.id}`}><Pencil className="h-4 w-4" /></Link></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} totalItems={data.total} onPageChange={setPage} />
        </>
      ) : (
        <EmptyState title="No articles" description="Create your first article." action={<Button asChild><Link href="/articles/new"><Plus className="h-4 w-4" /> New Article</Link></Button>} />
      )}
      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} title="Delete Article" description="This will permanently delete the article." isLoading={deleteMutation.isPending} />
    </div>
  );
}

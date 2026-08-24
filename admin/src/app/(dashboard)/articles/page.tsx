"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, getToken } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ArticleForm } from "./article-form";
import { Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type Article = {
  id: string;
  title: Record<string, string>;
  slug: string;
  imageUrl: string;
  isPublished: boolean;
  createdAt: string;
  excerpt?: Record<string, string>;
  content?: Record<string, string>;
  tags?: { id: string; name: Record<string, string> }[];
};

type ArticleList = {
  items: Article[];
  total: number;
  page: number;
  totalPages: number;
};

export default function ArticlesPage() {
  const token = getToken();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["articles", page],
    queryFn: () =>
      apiClient<ArticleList>("/articles", {
        params: { page, limit: 20 },
        token,
      }).then((res) => res.data),
  });
  const { data: editingArticle, isLoading: isLoadingArticle } = useQuery({
    queryKey: ["article", editingId],
    queryFn: () =>
      apiClient<Article>(`/articles/${editingId}`, { token }).then(
        (res) => res.data,
      ),
    enabled: Boolean(editingId),
  });

  const closeDialog = () => {
    setCreating(false);
    setEditingId(null);
  };
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["articles"] });
  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiClient("/articles", { method: "POST", body, token }),
    onSuccess: () => {
      refresh();
      closeDialog();
      toast.success("Đã tạo bài viết");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const updateMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiClient(`/articles/${editingId}`, { method: "PATCH", body, token }),
    onSuccess: () => {
      refresh();
      closeDialog();
      toast.success("Đã lưu bài viết");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/articles/${id}`, { method: "DELETE", token }),
    onSuccess: () => {
      refresh();
      setDeleteId(null);
      toast.success("Đã xóa bài viết");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const showEditor = creating || Boolean(editingId);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bài viết</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý tin tức và nội dung website.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" />
          Thêm bài viết
        </Button>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      ) : data && data.items.length ? (
        <>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Ảnh</TableHead>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Đường dẫn
                    </TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Ngày tạo
                    </TableHead>
                    <TableHead className="w-24">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell>
                        {article.imageUrl ? (
                          <img
                            src={article.imageUrl}
                            alt=""
                            className="h-[60px] w-[60px] rounded-md object-cover"
                          />
                        ) : (
                          <div className="h-[60px] w-[60px] rounded-md bg-muted" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                      {article.title.vi || article.title.en || article.slug}
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">
                        {article.slug}
                      </TableCell>
                      <TableCell>
                        {article.isPublished ? (
                          <Badge variant="success">Đã xuất bản</Badge>
                        ) : (
                          <Badge variant="secondary">Bản nháp</Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden text-xs text-muted-foreground sm:table-cell">
                        {format(new Date(article.createdAt), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingId(article.id)}
                            aria-label="Chỉnh sửa bài viết"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(article.id)}
                            aria-label="Xóa bài viết"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            totalItems={data.total}
            onPageChange={setPage}
          />
        </>
      ) : (
        <EmptyState
          title="Chưa có bài viết"
          description="Tạo bài viết đầu tiên cho website."
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" />
              Thêm bài viết
            </Button>
          }
        />
      )}
      <Dialog
        open={showEditor}
        onOpenChange={(open) => !open && closeDialog()}
        className="flex max-h-[calc(90vh-3rem)] min-h-[500px] max-w-5xl flex-col"
      >
        <DialogHeader className="shrink-0">
          <DialogTitle>
            {editingId ? "Chỉnh sửa bài viết" : "Thêm bài viết"}
          </DialogTitle>
          <DialogDescription>
            Chỉ nhập nội dung tiếng Việt. Các thẻ mới sẽ được tạo tự động.
          </DialogDescription>
        </DialogHeader>
        {editingId && isLoadingArticle ? (
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <ArticleForm
            key={editingId ?? "new"}
            defaultValues={editingArticle}
            articleId={editingId ?? undefined}
            embedded
            onCancel={closeDialog}
            onSubmit={(body) =>
              editingId
                ? updateMutation.mutate(body)
                : createMutation.mutate(body)
            }
            isSubmitting={createMutation.isPending || updateMutation.isPending}
          />
        )}
      </Dialog>
      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Xóa bài viết"
        description="Bài viết sẽ bị xóa và không còn hiển thị trên website."
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

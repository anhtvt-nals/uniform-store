"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, getToken } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select as SelectNative } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useT } from "@/i18n";

type AdminUser = {
  id: string;
  email: string;
  role: string;
  createdAt: string;
};

export default function PermissionsPage() {
  const { t } = useT();
  const token = getToken();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["permissions"],
    queryFn: () =>
      apiClient<{ items: AdminUser[] }>("/permissions/admin-users", { token }),
    select: (res) => res.data,
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      apiClient(`/permissions/admin-users/${id}/role`, {
        method: "PATCH",
        body: { role },
        token,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      toast.success("Đã cập nhật vai trò");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const roleColors: Record<
    string,
    "default" | "secondary" | "success" | "warning"
  > = {
    super_admin: "default",
    admin: "success",
    editor: "secondary",
    analyst: "warning",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Phân quyền</h1>
        <p className="text-muted-foreground text-sm">
          Quản lý vai trò người dùng quản trị
        </p>
      </div>
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : data?.items && data.items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Đổi vai trò</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant={roleColors[u.role] || "secondary"}>
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <SelectNative
                        options={[
                          { value: "super_admin", label: "Quản trị tối cao" },
                          { value: "admin", label: "Quản trị viên" },
                          { value: "editor", label: "Biên tập viên" },
                          { value: "analyst", label: "Nhân viên phân tích" },
                        ]}
                        value={u.role}
                        onChange={(e) =>
                          roleMutation.mutate({
                            id: u.id,
                            role: e.target.value,
                          })
                        }
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Chưa có người dùng quản trị.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

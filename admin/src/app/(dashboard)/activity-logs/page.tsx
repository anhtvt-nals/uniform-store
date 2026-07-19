"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { apiClient, getToken } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination } from "@/components/shared/pagination"
import { Select as SelectNative } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"

type Log = {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export default function ActivityLogsPage() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const [entityType, setEntityType] = useState("");
  const token = getToken();

  const params: Record<string, string | number | undefined> = { page, limit: 50 };
  if (action) params.action = action;
  if (entityType) params.entityType = entityType;

  const { data: actionsData } = useQuery({
    queryKey: ["activity-logs", "actions"],
    queryFn: () => apiClient<string[]>("/activity-logs/actions", { token }),
    select: (res) => res.data,
  });

  const { data: entityTypes } = useQuery({
    queryKey: ["activity-logs", "entity-types"],
    queryFn: () => apiClient<string[]>("/activity-logs/entity-types", { token }),
    select: (res) => res.data,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["activity-logs", page, action, entityType],
    queryFn: () => apiClient<{ items: Log[]; total: number; page: number; totalPages: number }>("/activity-logs", { params, token }),
    select: (res) => res.data,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Activity Logs</h1>
        <p className="text-muted-foreground text-sm">Audit trail of all admin actions</p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <SelectNative options={[{ value: "", label: "All Actions" }, ...((actionsData as string[] | undefined)?.map(a => ({ value: a, label: a })) || [])]} value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }} />
        <SelectNative options={[{ value: "", label: "All Entity Types" }, ...((entityTypes as string[] | undefined)?.map(t => ({ value: t, label: t })) || [])]} value={entityType} onChange={(e) => { setEntityType(e.target.value); setPage(1); }} />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2">{Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
          ) : data && data.items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.action}</TableCell>
                    <TableCell className="text-muted-foreground">{log.entityType}{log.entityId ? `:${log.entityId.slice(0, 8)}...` : ""}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{log.userId?.slice(0, 8) || "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{format(new Date(log.createdAt), "dd/MM/yyyy HH:mm")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No activity logs yet.</p>
          )}
        </CardContent>
      </Card>
      {data && <Pagination page={data.page} totalPages={data.totalPages} totalItems={data.total} onPageChange={setPage} />}
    </div>
  );
}

"use client"

import { useQuery } from "@tanstack/react-query"
import { apiClient, getToken } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

type Setting = {
  key: string;
  value: string;
};

export default function SettingsPage() {
  const token = getToken();

  const { data, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => apiClient<Setting[]>("/settings", { token }),
    select: (res) => res.data,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">System configuration</p>
      </div>
      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : data && data.length > 0 ? (
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium text-muted-foreground">Key</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Value</th>
              </tr>
            </thead>
            <tbody>
              {data.map((s) => (
                <tr key={s.key} className="border-b last:border-0">
                  <td className="p-3 font-medium">{s.key}</td>
                  <td className="p-3 text-muted-foreground">{s.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">No settings configured.</p>
      )}
    </div>
  );
}

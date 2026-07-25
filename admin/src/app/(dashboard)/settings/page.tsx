"use client"

import { useT } from "@/i18n"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient, getToken } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { toast } from "sonner"

type Setting = {
  id: string;
  key: string;
  value: string | number | Record<string, unknown>;
  groupName: string;
  isPublic: boolean;
  description: string;
};

type GroupedSettings = Record<string, Setting[]>;

export default function SettingsPage() {
  const { t } = useT();
  const token = getToken();
  const queryClient = useQueryClient();
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => apiClient<Setting[]>("/settings", { token }),
    select: (res) => res.data,
  });

  const updateMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      apiClient(`/settings/${key}`, {
        method: "PATCH",
        body: { key, value },
        token,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Setting updated");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update setting");
    },
  });

  const handleSave = async (key: string) => {
    const value = editValues[key];
    if (value === undefined) return;
    setSaving((prev) => ({ ...prev, [key]: true }));
    try {
      await updateMutation.mutateAsync({ key, value });
      setEditValues((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } finally {
      setSaving((prev) => ({ ...prev, [key]: false }));
    }
  };

  const isEditing = (key: string) => editValues[key] !== undefined;

  const grouped: GroupedSettings = {};
  if (data) {
    for (const s of data) {
      if (!grouped[s.groupName]) grouped[s.groupName] = [];
      grouped[s.groupName].push(s);
    }
  }

  const displayValue = (setting: Setting) => {
    if (typeof setting.value === "string") return setting.value;
    if (typeof setting.value === "number") return String(setting.value);
    return JSON.stringify(setting.value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">System configuration</p>
      </div>
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => <Skeleton key={j} className="h-10 w-full" />)}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data && data.length > 0 ? (
        Object.entries(grouped).map(([group, settings]) => (
          <Card key={group}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base capitalize">{group}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {settings.map((setting) => (
                  <div key={setting.key} className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{setting.key}</p>
                      {setting.description && (
                        <p className="text-xs text-muted-foreground">{setting.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 max-w-[400px]">
                      {isEditing(setting.key) ? (
                        <Input
                          defaultValue={editValues[setting.key] ?? displayValue(setting)}
                          onChange={(e) =>
                            setEditValues((prev) => ({ ...prev, [setting.key]: e.target.value }))
                          }
                          className="h-9 text-sm"
                          autoFocus
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground truncate block max-w-[300px]">
                          {displayValue(setting)}
                        </span>
                      )}
                      {isEditing(setting.key) ? (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleSave(setting.key)}
                            disabled={saving[setting.key]}
                          >
                            {saving[setting.key] ? "..." : t("save")}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setEditValues((prev) => {
                                const next = { ...prev };
                                delete next[setting.key];
                                return next;
                              })
                            }
                          >
                            {t("cancel")}
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setEditValues((prev) => ({ ...prev, [setting.key]: displayValue(setting) }))
                          }
                        >
                          {t("edit")}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">No settings configured.</p>
      )}
    </div>
  );
}

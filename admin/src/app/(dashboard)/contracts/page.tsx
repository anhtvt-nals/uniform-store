"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, getToken } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUploader } from "@/components/shared/image-uploader";
import { AssetPicker } from "@/components/shared/asset-picker";
import { toast } from "sonner";
import { Search, Plus, Pencil, Trash2, ImageIcon } from "lucide-react";
import { useT } from "@/i18n";

type CustomerContract = {
  id: string;
  name: string;
  logoUrl: string;
  contractImageUrl: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
};

export default function ContractsPage() {
  const { t } = useT();
  const token = getToken();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<CustomerContract | null>(null);
  const [editModal, setEditModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    logoUrl: "",
    contractImageUrl: "",
    description: "",
    displayOrder: 0,
  });
  const [pickerTarget, setPickerTarget] = useState<"logo" | "contract" | null>(
    null,
  );

  const { data, isLoading } = useQuery({
    queryKey: ["customer-contracts", search, page],
    queryFn: () =>
      apiClient<{
        items: CustomerContract[];
        total: number;
        totalPages: number;
      }>("/customer-contracts", {
        params: { search: search || undefined, page, limit: 20 },
        token,
      }),
    select: (res) => res.data,
  });

  const createMutation = useMutation({
    mutationFn: (body: typeof form) =>
      apiClient("/customer-contracts", { method: "POST", body, token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-contracts"] });
      toast.success("Đã tạo hợp đồng");
      closeEdit();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { id: string; body: Partial<typeof form> }) =>
      apiClient(`/customer-contracts/${vars.id}`, {
        method: "PATCH",
        body: vars.body,
        token,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-contracts"] });
      toast.success("Đã cập nhật hợp đồng");
      closeEdit();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/customer-contracts/${id}`, { method: "DELETE", token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-contracts"] });
      toast.success("Đã xóa hợp đồng");
    },
  });

  const closeEdit = () => {
    setEditModal(false);
    setSelected(null);
    setForm({
      name: "",
      logoUrl: "",
      contractImageUrl: "",
      description: "",
      displayOrder: 0,
    });
  };

  const openCreate = () => {
    setSelected(null);
    setForm({
      name: "",
      logoUrl: "",
      contractImageUrl: "",
      description: "",
      displayOrder: 0,
    });
    setEditModal(true);
  };

  const openEdit = (contract: CustomerContract) => {
    setSelected(contract);
    setForm({
      name: contract.name,
      logoUrl: contract.logoUrl,
      contractImageUrl: contract.contractImageUrl,
      description: contract.description,
      displayOrder: contract.displayOrder,
    });
    setEditModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return toast.error("Vui lòng nhập tên khách hàng");
    if (selected) {
      updateMutation.mutate({ id: selected.id, body: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const ImageField = ({
    label,
    value,
    field,
  }: {
    label: string;
    value: string;
    field: "logoUrl" | "contractImageUrl";
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            value={value}
            onChange={(e) =>
              setForm((p) => ({ ...p, [field]: e.target.value }))
            }
            placeholder="Dán URL hình ảnh hoặc tải lên..."
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            setPickerTarget(field === "logoUrl" ? "logo" : "contract")
          }
        >
          Chọn ảnh
        </Button>
      </div>
      <ImageUploader
        onUploadComplete={(image) =>
          setForm((p) => ({ ...p, [field]: image.url }))
        }
      />
      {value && (
        <div className="relative inline-block border rounded-lg overflow-hidden">
          <img
            src={value}
            alt=""
            className="h-20 w-20 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("contracts.title")}</h1>
          <p className="text-muted-foreground text-sm">
            {t("contracts.description")}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> {t("contracts.add")}
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("contracts.search")}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Logo</TableHead>
                    <TableHead className="w-[80px]">H.đồng</TableHead>
                    <TableHead>{t("contracts.name")}</TableHead>
                    <TableHead>{t("contracts.description")}</TableHead>
                    <TableHead className="w-[60px]">
                      {t("contracts.order")}
                    </TableHead>
                    <TableHead className="w-[80px]">
                      {t("contracts.active")}
                    </TableHead>
                    <TableHead className="w-[100px]">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.items?.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground py-8"
                      >
                        {t("contracts.empty")}
                      </TableCell>
                    </TableRow>
                  )}
                  {data?.items?.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell>
                        {contract.logoUrl ? (
                          <img
                            src={contract.logoUrl}
                            alt=""
                            className="w-8 h-8 object-contain rounded"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {contract.contractImageUrl ? (
                          <img
                            src={contract.contractImageUrl}
                            alt=""
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {contract.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-[200px] truncate">
                        {contract.description || "-"}
                      </TableCell>
                      <TableCell>{contract.displayOrder}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${contract.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                        >
                          {contract.isActive ? "Hiển thị" : "Ẩn"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEdit(contract)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => {
                              if (confirm("Bạn có muốn xóa hợp đồng này?"))
                                deleteMutation.mutate(contract.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Trang {page} / {data.totalPages} ({data.total} bản ghi)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={editModal}
        onOpenChange={(v) => {
          if (!v) closeEdit();
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {selected ? t("contracts.edit") : t("contracts.add")}
          </DialogTitle>
          <DialogDescription>{t("contracts.formDesc")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-5 text-sm pb-4 px-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              {t("contracts.name")} *
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Tên khách hàng"
            />
          </div>

          <ImageField
            label="Logo khách hàng"
            value={form.logoUrl}
            field="logoUrl"
          />
          <ImageField
            label="Ảnh hợp đồng"
            value={form.contractImageUrl}
            field="contractImageUrl"
          />

          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              {t("contracts.description")}
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Mô tả (không bắt buộc)"
              rows={2}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              {t("contracts.order")}
            </label>
            <Input
              type="number"
              min="0"
              value={form.displayOrder}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  displayOrder: parseInt(e.target.value) || 0,
                }))
              }
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={closeEdit}>
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {selected ? "Lưu thay đổi" : "Tạo hợp đồng"}
            </Button>
          </div>
        </div>
      </Dialog>

      <AssetPicker
        open={pickerTarget !== null}
        onOpenChange={() => setPickerTarget(null)}
        onSelect={(url) => {
          setForm((p) => ({
            ...p,
            [pickerTarget === "logo" ? "logoUrl" : "contractImageUrl"]: url,
          }));
          setPickerTarget(null);
        }}
      />
    </div>
  );
}

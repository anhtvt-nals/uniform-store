"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface CartQuoteContactFormProps {
  lines: Array<{
    quantity: number;
    productVariant: {
      name: string;
      sku: string;
      product: { name: string };
    };
  }>;
  isSubmitting: boolean;
  onSubmittingChange: (isSubmitting: boolean) => void;
}

export function CartQuoteContactForm({ lines, isSubmitting, onSubmittingChange }: CartQuoteContactFormProps) {
  const router = useRouter();
  const cartProducts = useMemo(
    () =>
      lines
        .map(
          (line) =>
            `${line.productVariant.product.name}${line.productVariant.name !== line.productVariant.product.name ? ` – ${line.productVariant.name}` : ""} (${line.productVariant.sku}) × ${line.quantity}`,
        )
        .join("\n"),
    [lines],
  );
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    region: "",
    address: "",
    productType: cartProducts,
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<"customerName" | "phone" | "email", string>>>({});
  const submissionLock = useRef(false);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError(null);
    if (field === "customerName" || field === "phone" || field === "email") {
      setFieldErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || submissionLock.current) return;
    const nextFieldErrors: Partial<Record<"customerName" | "phone" | "email", string>> = {};

    if (!form.customerName.trim()) {
      nextFieldErrors.customerName = "Vui lòng nhập họ tên hoặc tên công ty.";
    }
    if (!form.phone.trim()) {
      nextFieldErrors.phone = "Vui lòng nhập số điện thoại.";
    } else if (!/^(\+?84|0)\d{7,11}$/.test(form.phone.replace(/[\s\-.]/g, ""))) {
      nextFieldErrors.phone = "Số điện thoại không hợp lệ.";
    }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextFieldErrors.email = "Email không hợp lệ.";
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    submissionLock.current = true;
    onSubmittingChange(true);
    try {
      const response = await fetch("/api/v1/orders/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          productType: form.productType.trim(),
          ...(form.email.trim() ? { email: form.email.trim() } : {}),
          ...(form.region ? { region: form.region } : {}),
        }),
      });
      const payload = (await response.json()) as {
        data?: {code?: string};
        error?: {message?: string | string[]};
      };

      if (!response.ok || !payload.data?.code) {
        const message = Array.isArray(payload.error?.message)
          ? payload.error.message.join(" ")
          : payload.error?.message;
        throw new Error(message || "Unable to create order");
      }
      router.push(`/order-confirmation/${payload.data.code}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Không thể lưu thông tin đặt hàng. Vui lòng thử lại.");
      submissionLock.current = false;
      onSubmittingChange(false);
    }
  };

  return (
    <form id="cart-order-contact" onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-bold">Thông tin người đặt hàng</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Thông tin được lưu cùng yêu cầu đặt hàng để bộ phận kinh doanh liên hệ báo giá.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cart-customer-name">Tên Quý khách hoặc công ty *</Label>
        <Input id="cart-customer-name" value={form.customerName} onChange={(event) => updateField("customerName", event.target.value)} aria-invalid={Boolean(fieldErrors.customerName)} className={fieldErrors.customerName ? "border-destructive focus-visible:ring-destructive" : ""} />
        {fieldErrors.customerName && <p className="text-xs text-destructive">{fieldErrors.customerName}</p>}
      </div>

      <div className="grid gap-3 sm:grid-cols-[3fr_7fr]">
        <div className="space-y-1.5">
          <Label htmlFor="cart-phone">Số điện thoại *</Label>
          <Input id="cart-phone" type="tel" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} aria-invalid={Boolean(fieldErrors.phone)} className={fieldErrors.phone ? "border-destructive focus-visible:ring-destructive" : ""} />
          {fieldErrors.phone && <p className="text-xs text-destructive">{fieldErrors.phone}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cart-email">Email</Label>
          <Input id="cart-email" type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} aria-invalid={Boolean(fieldErrors.email)} className={fieldErrors.email ? "border-destructive focus-visible:ring-destructive" : ""} />
          {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[3fr_7fr]">
        <div className="space-y-1.5">
          <Label>Khu vực</Label>
          <Select value={form.region} onValueChange={(value) => updateField("region", value ?? "")}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Khu vực" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Miền Bắc">Miền Bắc</SelectItem>
              <SelectItem value="Miền Trung">Miền Trung</SelectItem>
              <SelectItem value="Miền Nam">Miền Nam</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cart-address">Địa chỉ</Label>
          <Input id="cart-address" value={form.address} onChange={(event) => updateField("address", event.target.value)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cart-products">Sản phẩm cần báo giá</Label>
        <Textarea id="cart-products" rows={Math.min(5, Math.max(2, lines.length))} value={form.productType} onChange={(event) => updateField("productType", event.target.value)} />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

    </form>
  );
}

"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { ResultOf } from "@/graphql";
import { GetActiveOrderQuery } from "@/lib/vendure/queries";
import { CartQuoteContactForm } from "./cart-quote-contact-form";
import { OrderSummary } from "./order-summary";

type ActiveOrder = NonNullable<ResultOf<typeof GetActiveOrderQuery>["activeOrder"]>;

export function CartCheckoutContent({ activeOrder }: { activeOrder: ActiveOrder }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <CartQuoteContactForm
          lines={activeOrder.lines}
          isSubmitting={isSubmitting}
          onSubmittingChange={setIsSubmitting}
        />
        <OrderSummary activeOrder={activeOrder} isSubmitting={isSubmitting} />
      </div>

      {isSubmitting && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-4 bg-foreground/65 text-background backdrop-blur-sm" role="status" aria-live="assertive">
          <div className="flex size-16 items-center justify-center rounded-full bg-background/15 shadow-2xl">
            <Loader2 className="size-9 animate-spin" />
          </div>
          <p className="text-base font-bold">Đang đặt hàng...</p>
        </div>
      )}
    </>
  );
}

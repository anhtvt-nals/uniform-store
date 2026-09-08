"use client";

import { Children, type CSSProperties, type ReactNode } from "react";

interface ProductGridTransitionProps {
  transitionKey: string;
  children: ReactNode;
}

/**
 * Remounts the product grid whenever its result set changes, so category and
 * search filters get the same concise staggered entrance animation.
 */
export function ProductGridTransition({
  transitionKey,
  children,
}: ProductGridTransitionProps) {
  return (
    <div
      key={transitionKey}
      className="product-grid-transition grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5"
    >
      {Children.toArray(children).map((child, index) => (
        <div
          key={index}
          className="product-grid-transition-item"
          style={{ "--product-grid-index": index } as CSSProperties}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

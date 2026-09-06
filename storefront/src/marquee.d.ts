import type { HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      marquee: HTMLAttributes<HTMLElement> & {
        behavior?: "alternate" | "scroll" | "slide";
        direction?: "down" | "left" | "right" | "up";
        loop?: number;
        scrollamount?: number;
      };
    }
  }
}

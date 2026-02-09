import * as React from "react"

import { cn } from "@/lib/utils"

const Input = ({ className, type, ...props }: React.ComponentPropsWithRef<"input">) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-input/90 bg-background/95 px-3 py-2 text-base text-foreground shadow-[inset_0_1px_0_hsl(var(--card))] ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/75 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        {...props}
      />
    )
  }
Input.displayName = "Input"

export { Input }

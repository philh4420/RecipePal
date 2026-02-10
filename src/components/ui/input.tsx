import * as React from "react"

import { cn } from "@/lib/utils"

const Input = ({ className, type, ...props }: React.ComponentPropsWithRef<"input">) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-input/85 bg-card px-3.5 py-2 text-base text-foreground shadow-[0_2px_0_hsl(var(--card)),inset_0_1px_0_hsl(var(--background))] ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/85 focus-visible:border-primary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        {...props}
      />
    )
  }
Input.displayName = "Input"

export { Input }

"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-semibold leading-none text-foreground/95 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = ({ className, ...props }: React.ComponentPropsWithRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>) => (
  <LabelPrimitive.Root
    className={cn(labelVariants(), className)}
    {...props}
  />
)
Label.displayName = LabelPrimitive.Root.displayName

export { Label }

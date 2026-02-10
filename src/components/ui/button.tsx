import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(130deg,hsl(var(--primary))_0%,hsl(var(--accent))_140%)] text-primary-foreground shadow-[0_14px_28px_hsl(var(--primary)/0.3)] hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_18px_34px_hsl(var(--primary)/0.36)]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_12px_24px_hsl(var(--destructive)/0.24)] hover:-translate-y-0.5 hover:bg-destructive/90",
        outline:
          "border border-border/85 bg-card text-foreground shadow-[0_8px_18px_rgba(68,53,33,0.08)] hover:-translate-y-0.5 hover:border-primary/45 hover:bg-primary/10 hover:text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[inset_0_1px_0_hsl(var(--card))] hover:bg-secondary/90",
        ghost: "hover:bg-muted/80 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-lg px-3.5",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ComponentPropsWithRef<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = ({ className, variant, size, asChild = false, ...props }: ButtonProps) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
Button.displayName = "Button"

export { Button, buttonVariants }

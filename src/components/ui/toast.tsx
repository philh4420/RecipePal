"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = ({ className, ...props }: React.ComponentPropsWithRef<typeof ToastPrimitives.Viewport>) => (
  <ToastPrimitives.Viewport
    className={cn(
      "fixed z-[110] flex max-h-screen w-full flex-col-reverse gap-3 p-4 sm:bottom-4 sm:right-4 sm:top-auto sm:w-[420px] sm:flex-col",
      className
    )}
    {...props}
  />
)
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-start justify-between gap-4 overflow-hidden rounded-2xl border p-4 pr-10 shadow-[0_22px_44px_rgba(24,17,10,0.3)] transition-all before:absolute before:inset-y-0 before:left-0 before:w-1.5 data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border-border/85 bg-card/95 text-foreground before:bg-primary",
        destructive:
          "destructive group border-destructive/70 bg-destructive text-destructive-foreground before:bg-destructive-foreground/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = ({ className, variant, ...props }: React.ComponentPropsWithRef<typeof ToastPrimitives.Root> & VariantProps<typeof toastVariants>) => {
  return (
    <ToastPrimitives.Root
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
}
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = ({ className, ...props }: React.ComponentPropsWithRef<typeof ToastPrimitives.Action>) => (
  <ToastPrimitives.Action
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-border/85 bg-background/65 px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring/70 focus:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-red-300/40 group-[.destructive]:bg-red-950/20 group-[.destructive]:hover:border-red-200/55 group-[.destructive]:hover:bg-destructive/70 group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-red-300",
      className
    )}
    {...props}
  />
)
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = ({ className, ...props }: React.ComponentPropsWithRef<typeof ToastPrimitives.Close>) => (
  <ToastPrimitives.Close
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/60 opacity-70 transition-opacity hover:bg-muted/65 hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring/70 group-hover:opacity-100 group-[.destructive]:text-red-100 group-[.destructive]:hover:bg-destructive/80 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-300",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
)
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = ({ className, ...props }: React.ComponentPropsWithRef<typeof ToastPrimitives.Title>) => (
  <ToastPrimitives.Title
    className={cn("font-headline text-base font-semibold leading-tight tracking-tight", className)}
    {...props}
  />
)
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = ({ className, ...props }: React.ComponentPropsWithRef<typeof ToastPrimitives.Description>) => (
  <ToastPrimitives.Description
    className={cn("text-[13px] leading-relaxed text-foreground/88", className)}
    {...props}
  />
)
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}

import * as React from 'react';

import {cn} from '@/lib/utils';

const Textarea = ({className, ...props}: React.ComponentPropsWithRef<'textarea'>) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-xl border border-input/85 bg-card px-3.5 py-2 text-base text-foreground shadow-[0_2px_0_hsl(var(--card)),inset_0_1px_0_hsl(var(--background))] ring-offset-background placeholder:text-muted-foreground/85 focus-visible:border-primary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className
        )}
        {...props}
      />
    );
  }
Textarea.displayName = 'Textarea';

export {Textarea};

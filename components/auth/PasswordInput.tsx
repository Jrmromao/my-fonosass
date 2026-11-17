'use client';

import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { forwardRef, useState, type ComponentPropsWithoutRef } from 'react';
import { inputClass } from './AuthShell';

type PasswordInputProps = Omit<ComponentPropsWithoutRef<'input'>, 'type'>;

// Password field with a leading lock icon and an accessible show/hide toggle.
const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ className = '', ...props }, ref) {
    const [visible, setVisible] = useState(false);
    return (
      <div className="relative">
        <Lock
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          aria-hidden
        />
        <Input
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={`${inputClass} pl-10 pr-10 ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-neutral-600 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-500/30"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" aria-hidden />
          ) : (
            <Eye className="h-4 w-4" aria-hidden />
          )}
        </button>
      </div>
    );
  }
);

export default PasswordInput;

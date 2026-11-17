import { Input } from '@/components/ui/input';
import { Mail } from 'lucide-react';
import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { inputClass } from './AuthShell';

type EmailInputProps = Omit<ComponentPropsWithoutRef<'input'>, 'type'>;

// Email field with a leading envelope icon.
const EmailInput = forwardRef<HTMLInputElement, EmailInputProps>(
  function EmailInput({ className = '', ...props }, ref) {
    return (
      <div className="relative">
        <Mail
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          aria-hidden
        />
        <Input
          ref={ref}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="seu@email.com"
          className={`${inputClass} pl-10 ${className}`}
          {...props}
        />
      </div>
    );
  }
);

export default EmailInput;

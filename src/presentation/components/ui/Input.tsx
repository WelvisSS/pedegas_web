import { forwardRef } from 'react';

/**
 * Reusable Input Component
 * Following Single Responsibility Principle
 */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', required = false, ...props }, ref) => {
    const inputClasses = `
    input-field
    ${error ? 'border-red-500 focus:ring-red-500' : ''}
    ${className}
  `.trim();

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-secondary-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <input ref={ref} className={inputClasses} {...props} />

        {error && <p className="text-sm text-red-600">{error}</p>}

        {helperText && !error && <p className="text-sm text-secondary-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

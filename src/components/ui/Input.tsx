import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const inputStyles: React.CSSProperties = {
      width: '100%',
      padding: '10px 14px',
      fontSize: '16px',
      lineHeight: '1.5',
      border: error ? '2px solid #DC2626' : '1px solid #D1D5DB',
      borderRadius: '6px',
      outline: 'none',
      transition: 'border-color 0.2s ease',
    };

    return (
      <div style={{ marginBottom: '16px' }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151',
            }}
          >
            {label}
            {props.required && (
              <span style={{ color: '#DC2626', marginLeft: '4px' }} aria-label="required">
                *
              </span>
            )}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          style={inputStyles}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
          onFocus={(e) => {
            if (!error) {
              e.currentTarget.style.borderColor = '#2563EB';
            }
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? '#DC2626' : '#D1D5DB';
            props.onBlur?.(e);
          }}
        />
        {error && (
          <div
            id={`${inputId}-error`}
            role="alert"
            style={{
              marginTop: '6px',
              fontSize: '14px',
              color: '#DC2626',
            }}
          >
            {error}
          </div>
        )}
        {helperText && !error && (
          <div
            id={`${inputId}-helper`}
            style={{
              marginTop: '6px',
              fontSize: '14px',
              color: '#6B7280',
            }}
          >
            {helperText}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

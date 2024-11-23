import React from 'react';

interface InputProps {
  className?: string;
  id?: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number';
  name?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

const CustomInput = ({
  className = '',
  id,
  type = 'text',
  name,
  value,
  onChange,
  disabled = false,
  placeholder,
  required = false,
  variant = 'primary',
  size = 'md',
  rounded = 'md'
}: InputProps) => {
  const getVariantClasses = () => {
    const variants = {
      primary: `border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                disabled:border-gray-200 disabled:bg-gray-100 dark:disabled:border-gray-700 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-500`,
      secondary: `border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400
                  disabled:border-gray-100 disabled:bg-gray-50 dark:disabled:border-gray-800 dark:disabled:bg-gray-900 disabled:text-gray-300 dark:disabled:text-gray-600`,
      outline: `border-gray-400 dark:border-gray-500 bg-transparent text-gray-800 dark:text-gray-200
                disabled:border-gray-300 disabled:bg-transparent dark:disabled:border-gray-600 disabled:text-gray-400 dark:disabled:text-gray-500`
    };
    return variants[variant] || variants.primary;
  };

  const getSizeClasses = () => {
    const sizes = {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-2.5 text-lg',
      xl: 'px-8 py-3 text-xl'
    };
    return sizes[size] || sizes.md;
  };

  const getRoundedClasses = () => {
    const roundedSizes = {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      full: 'rounded-full'
    };
    return roundedSizes[rounded] || roundedSizes.md;
  };

  const baseClasses = `
    w-full
    border
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
    disabled:cursor-not-allowed
    ${getVariantClasses()}
    ${getSizeClasses()}
    ${getRoundedClasses()}
    ${className}
  `;

  return (
    <input
      id={id}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      required={required}
      className={baseClasses}
    />
  );
};

export default CustomInput;
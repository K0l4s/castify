import React from 'react';
import Loading from './Loading';

interface ButtonProps {
  className?: string;
  id?: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  disabled?: boolean;
  text?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  children?: React.ReactNode;
  fullWidth?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  animation?: 'none' | 'pulse' | 'bounce';
  isShining?: boolean;
}

const CustomButton = ({
  className = '',
  id,
  type = 'button',
  onClick,
  disabled = false,
  text,
  icon,
  loading = false,
  variant = 'primary',
  size = 'md',
  children,
  fullWidth = false,
  rounded = 'md',
  animation = 'none',
  isShining = false
}: ButtonProps) => {
  const getVariantClasses = () => {
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-md hover:shadow-lg',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 shadow-md hover:shadow-lg',
      danger: 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 shadow-md hover:shadow-lg',
      outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20',
      ghost: 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20'
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

  const getAnimationClasses = () => {
    const animations = {
      none: '',
      pulse: 'animate-pulse',
      bounce: 'animate-bounce'
    };
    return animations[animation] || '';
  };

  const baseClasses = `
    inline-flex items-center justify-center
    font-medium transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
    dark:focus:ring-offset-gray-800
    ${getVariantClasses()}
    ${getSizeClasses()}
    ${getRoundedClasses()}
    ${getAnimationClasses()}
    ${fullWidth ? 'w-full' : ''}
    ${isShining ? 'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-[1s] before:ease-in-out' : ''}
    ${className}
  `;

  return (
    <button
      id={id}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} relative group overflow-hidden`}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          <Loading />
        ) : (
          <>
            {icon && <span className="transition-transform group-hover:scale-110">{icon}</span>}
            {text || children}
          </>
        )}
      </span>
    </button>
  );
};

export default CustomButton;

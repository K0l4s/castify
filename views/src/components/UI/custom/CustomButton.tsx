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
  variant?: 'primary' | 'secondary' | 'danger'; // Variants for styling
  size?: 'small' | 'medium' | 'large'; // Button size
  children?: React.ReactNode;
}

const CustomButton = (props: ButtonProps) => {
  const getVariantClasses = () => {
    switch (props.variant) {
      case 'secondary':
        return 'bg-gray-500 text-white hover:bg-gray-600';
      case 'danger':
        return 'bg-red-500 text-white hover:bg-red-600';
      default:
        return 'bg-blue-500 text-white hover:bg-blue-600';
    }
  };

  const getSizeClasses = () => {
    switch (props.size) {
      case 'small':
        return 'px-2 py-1 text-sm';
      case 'large':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  };

  const baseClasses = `inline-flex items-center justify-center font-semibold rounded ${getVariantClasses()} ${getSizeClasses()} ${props.className}`;

  return (
    <button
      id={props.id}
      type={props.type}
      onClick={props.onClick}
      disabled={props.disabled || props.loading}
      className={`${baseClasses} ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {props.loading ? (
          <Loading />
      ) : (
        <>
          {props.icon && <span className="mr-2">{props.icon}</span>}
          {props.text ? props.text : props.children}
        </>
      )}
    </button>
  );
};

export default CustomButton;

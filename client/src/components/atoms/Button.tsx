import React from "react";

type ButtonType = "primary" | "secondary" | "link";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  btnType?: ButtonType;
}

const getButtonClasses = (type: ButtonType, extra?: string): string => {
  const base =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  const variants: Record<ButtonType, string> = {
    primary: "bg-black text-white hover:bg-gray-700 focus:ring-black",
    secondary:
      "border border-gray-300 text-black hover:bg-gray-300 focus:ring-gray-300",
    link: "text-black hover:bg-gray-200 focus:ring-gray-300",
  };

  return `${base} ${variants[type]} ${extra ?? ""}`.trim();
};

export const Button: React.FC<ButtonProps> = ({
  btnType = "primary",
  className,
  children,
  ...props
}) => {
  const classes = getButtonClasses(btnType, className);
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};

export default Button;

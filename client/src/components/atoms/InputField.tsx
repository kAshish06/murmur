import React from "react";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id: string;
  registration?: UseFormRegisterReturn;
  error?: FieldError;
  inputClassName?: string;
}

export default function InputField({
  label,
  id,
  registration,
  error,
  inputClassName,
  ...inputProps
}: InputFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        {...registration}
        className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black ${inputClassName}`}
        {...inputProps}
      />
      {error && <span className="text-xs text-red-500">{error.message}</span>}
    </div>
  );
}

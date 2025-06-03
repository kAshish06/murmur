import { useRef } from "react";
import useClickOutside from "../../hooks/useClickOutside";

const Dropdown = ({
  children,
  isOpen,
  onClose = () => {},
  className = "",
}: {
  children: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside<HTMLDivElement>(ref, onClose);
  if (!isOpen) return null;
  return (
    <div className="relative" ref={ref}>
      <div
        className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-gray-300 ring-opacity-5 transition-opacity duration-200 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        } ${className}`}
      >
        {children}
      </div>
    </div>
  );
};

export default Dropdown;

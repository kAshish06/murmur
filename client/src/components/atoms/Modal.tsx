import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import type { ReactNode } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  header?: ReactNode;
  body: ReactNode;
  footer?: ReactNode;
  closeOnOverlayClick?: boolean;
};

let modalRoot = document.getElementById("modal-root");
if (!modalRoot) {
  modalRoot = document.createElement("div");
  modalRoot.setAttribute("id", "modal-root");
  document.body.appendChild(modalRoot);
}

let modalCount = 0;

export default function Modal({
  isOpen,
  onClose,
  header,
  body,
  footer,
  closeOnOverlayClick = false,
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      modalCount++;
      document.body.style.overflow = "hidden";
    }
    return () => {
      modalCount--;
      if (modalCount <= 0) {
        document.body.style.overflow = "";
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const zIndex = 1000 + modalCount * 10;

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  }

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm"
      style={{ zIndex }}
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 sm:mx-0
                   h-auto sm:h-auto max-h-screen overflow-auto sm:overflow-visible p-6"
      >
        <div className="flex items-start justify-between mb-4">
          {header && <div className="text-lg font-semibold">{header}</div>}
          <button
            aria-label="Close modal"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6 cursor-pointer" />
          </button>
        </div>

        <div className="mb-4">{body}</div>

        {footer && <div>{footer}</div>}
      </div>
    </div>,
    modalRoot!
  );
}

import { useEffect } from "react";
import { createPortal } from "react-dom";
import Button from "./Button";
import { Icon } from "@/components/Icon";

function Modal({ isOpen, onClose, title, children, size = "md" }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${sizeClasses[size]} rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 h-auto rounded-full"
          >
            <Icon name="faXmark" />
          </Button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.getElementById("root"),
  );
}

export default Modal;

import { TriangleAlert } from "lucide-react";

import { cn } from "../lib/cn";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
  onClose,
  loading,
}) {
  return (
    <Modal open={open} onClose={onClose} className="max-w-sm">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-danger/10 text-danger">
          <TriangleAlert className="size-6" />
        </div>
        <h2 className="text-lg font-semibold text-fg">{title}</h2>
        {description && (
          <p className="mt-1.5 text-sm text-muted">{description}</p>
        )}
        <div className="mt-6 flex w-full gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className={cn(
              "flex-1 bg-danger text-white shadow-none ring-0 hover:bg-danger/90",
            )}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

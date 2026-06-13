import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";

const FIRST_VISIT_KEY = "resource-warning-shown";

export default function ResourceWarningDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasSeenDialog = localStorage.getItem(FIRST_VISIT_KEY);

    if (!hasSeenDialog) {
      setOpen(true);
      localStorage.setItem(FIRST_VISIT_KEY, "true");
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Initial Load May Take Some Time</DialogTitle>

          <DialogDescription className="pt-2 text-sm leading-6">
            Due to limited server capacity, resources may take some time to load
            on your first visit.
            <br />
            <br />
            Please allow approximately 1–2 minutes for the application to fully
            initialize.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

import { DialogExamples } from './modals/DialogExamples';
import { AlertDialogExamples } from './modals/AlertDialogExamples';
import { SheetExamples } from './modals/SheetExamples';
import { ModalUsageGuide } from './modals/ModalUsageGuide';

export function ModalsSection() {
  return (
    <div className="space-y-6">
      <DialogExamples />
      <AlertDialogExamples />
      <SheetExamples />
      <ModalUsageGuide />
    </div>
  );
}

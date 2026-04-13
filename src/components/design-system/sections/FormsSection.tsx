import { FormsTextInputs } from './forms/FormsTextInputs';
import { FormsSelectionControls } from './forms/FormsSelectionControls';
import { FormsCompleteExample } from './forms/FormsCompleteExample';

export function FormsSection() {
  return (
    <div className="space-y-6">
      <FormsTextInputs />
      <FormsSelectionControls />
      <FormsCompleteExample />
    </div>
  );
}

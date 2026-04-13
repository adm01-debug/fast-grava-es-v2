import { HttpErrorStates } from './error-states/HttpErrorStates';
import { InlineErrorStates } from './error-states/InlineErrorStates';
import { CriticalErrorStates } from './error-states/CriticalErrorStates';

export function ErrorStatesSection() {
  return (
    <div className="space-y-6">
      <HttpErrorStates />
      <InlineErrorStates />
      <CriticalErrorStates />
    </div>
  );
}

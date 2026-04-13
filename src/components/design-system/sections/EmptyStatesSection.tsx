import { BasicEmptyStates } from './empty-states/BasicEmptyStates';
import { CTAEmptyStates } from './empty-states/CTAEmptyStates';
import { IllustratedEmptyStates } from './empty-states/IllustratedEmptyStates';
import { ContextualEmptyStates } from './empty-states/ContextualEmptyStates';

export function EmptyStatesSection() {
  return (
    <div className="space-y-6">
      <BasicEmptyStates />
      <CTAEmptyStates />
      <IllustratedEmptyStates />
      <ContextualEmptyStates />
    </div>
  );
}

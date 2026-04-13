import { SpinnersSection } from './loading/SpinnersSection';
import { ProgressBarsSection } from './loading/ProgressBarsSection';
import { ButtonLoadingSection } from './loading/ButtonLoadingSection';
import { PageLoadingSection } from './loading/PageLoadingSection';

export function LoadingSection() {
  return (
    <div className="space-y-6">
      <SpinnersSection />
      <ProgressBarsSection />
      <ButtonLoadingSection />
      <PageLoadingSection />
    </div>
  );
}

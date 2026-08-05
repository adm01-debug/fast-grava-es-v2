import { TooltipsBasicSection } from './tooltips/TooltipsBasicSection';
import { PopoversSection } from './tooltips/PopoversSection';
import { HoverCardsSection } from './tooltips/HoverCardsSection';

export function TooltipsSection() {
  return (
    <div className="space-y-6">
      <TooltipsBasicSection />
      <PopoversSection />
      <HoverCardsSection />
    </div>
  );
}

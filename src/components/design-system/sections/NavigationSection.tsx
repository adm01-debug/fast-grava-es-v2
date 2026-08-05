import { BreadcrumbExamples } from './navigation/BreadcrumbExamples';
import { TabsExamples } from './navigation/TabsExamples';
import { NavigationMenuExamples } from './navigation/NavigationMenuExamples';

export function NavigationSection() {
  return (
    <div className="space-y-6">
      <BreadcrumbExamples />
      <TabsExamples />
      <NavigationMenuExamples />
    </div>
  );
}

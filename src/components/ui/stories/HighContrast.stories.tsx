import type { Meta, StoryObj } from '@storybook/react';
import { HighContrastProvider, useHighContrast } from '../HighContrast';
import { Button } from '../button';

// Demo component for the story
function HighContrastDemo() {
  const { isHighContrast, toggleHighContrast } = useHighContrast();
  return (
    <div className="space-y-4">
      <p>High Contrast: {isHighContrast ? 'Enabled' : 'Disabled'}</p>
      <Button onClick={toggleHighContrast}>Toggle High Contrast</Button>
    </div>
  );
}

const meta: Meta<typeof HighContrastProvider> = {
  title: 'UI/HighContrast',
  component: HighContrastProvider,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof HighContrastProvider>;

export const Default: Story = {
  render: () => (
    <HighContrastProvider>
      <HighContrastDemo />
    </HighContrastProvider>
  ),
};

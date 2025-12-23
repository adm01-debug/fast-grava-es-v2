import type { Meta, StoryObj } from '@storybook/react';
import { ReducedMotionProvider, useReducedMotion, MotionSafe } from '../ReducedMotion';

// Demo component for the story
function ReducedMotionDemo() {
  const { prefersReducedMotion } = useReducedMotion();
  return (
    <div className="space-y-4">
      <p>Prefers Reduced Motion: {prefersReducedMotion ? 'Yes' : 'No'}</p>
      <MotionSafe fallback={<div>Static content</div>}>
        <div className="animate-pulse">Animated content</div>
      </MotionSafe>
    </div>
  );
}

const meta: Meta<typeof ReducedMotionProvider> = {
  title: 'UI/ReducedMotion',
  component: ReducedMotionProvider,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ReducedMotionProvider>;

export const Default: Story = {
  render: () => (
    <ReducedMotionProvider>
      <ReducedMotionDemo />
    </ReducedMotionProvider>
  ),
};

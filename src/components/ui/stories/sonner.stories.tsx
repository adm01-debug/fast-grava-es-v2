import type { Meta, StoryObj } from '@storybook/react';
import { Toaster, toast } from '../sonner';
import { Button } from '../button';

const meta: Meta<typeof Toaster> = {
  title: 'UI/Sonner',
  component: Toaster,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Toaster>;

export const Default: Story = {
  render: () => (
    <>
      <Toaster />
      <div className="space-x-2">
        <Button onClick={() => toast('Hello World!')}>Show Toast</Button>
        <Button variant="destructive" onClick={() => toast.error('Error!')}>Error Toast</Button>
        <Button variant="secondary" onClick={() => toast.success('Success!')}>Success Toast</Button>
      </div>
    </>
  ),
};

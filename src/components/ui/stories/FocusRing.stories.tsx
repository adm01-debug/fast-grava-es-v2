import type { Meta, StoryObj } from '@storybook/react';
import { FocusRing } from '../FocusRing';

const meta: Meta<typeof FocusRing> = {
  title: 'UI/FocusRing',
  component: FocusRing,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add argTypes based on component props
  },
};

export default meta;
type Story = StoryObj<typeof FocusRing>;

export const Default: Story = {
  args: {
    // Default props
  },
};

export const Playground: Story = {
  args: {
    // Playground props
  },
};

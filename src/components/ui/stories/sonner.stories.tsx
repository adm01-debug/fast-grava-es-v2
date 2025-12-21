import type { Meta, StoryObj } from '@storybook/react';
import { Sonner } from '../sonner';

const meta: Meta<typeof Sonner> = {
  title: 'UI/Sonner',
  component: Sonner,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add argTypes based on component props
  },
};

export default meta;
type Story = StoryObj<typeof Sonner>;

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

import type { Meta, StoryObj } from '@storybook/react';
import { ReducedMotion } from '../ReducedMotion';

const meta: Meta<typeof ReducedMotion> = {
  title: 'UI/ReducedMotion',
  component: ReducedMotion,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add argTypes based on component props
  },
};

export default meta;
type Story = StoryObj<typeof ReducedMotion>;

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

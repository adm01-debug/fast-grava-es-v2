import type { Meta, StoryObj } from '@storybook/react';
import { LiveRegion } from '../LiveRegion';

const meta: Meta<typeof LiveRegion> = {
  title: 'UI/LiveRegion',
  component: LiveRegion,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add argTypes based on component props
  },
};

export default meta;
type Story = StoryObj<typeof LiveRegion>;

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

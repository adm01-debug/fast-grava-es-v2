import type { Meta, StoryObj } from '@storybook/react';
import { AriaLabel } from '../AriaLabel';

const meta: Meta<typeof AriaLabel> = {
  title: 'UI/AriaLabel',
  component: AriaLabel,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add argTypes based on component props
  },
};

export default meta;
type Story = StoryObj<typeof AriaLabel>;

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

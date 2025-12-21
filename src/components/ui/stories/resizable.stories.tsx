import type { Meta, StoryObj } from '@storybook/react';
import { Resizable } from '../resizable';

const meta: Meta<typeof Resizable> = {
  title: 'UI/Resizable',
  component: Resizable,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add argTypes based on component props
  },
};

export default meta;
type Story = StoryObj<typeof Resizable>;

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

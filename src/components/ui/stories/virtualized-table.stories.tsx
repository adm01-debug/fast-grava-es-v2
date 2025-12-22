import type { Meta, StoryObj } from '@storybook/react';
import { VirtualizedTable } from '../virtualized-table';

const meta: Meta<typeof VirtualizedTable> = {
  title: 'UI/VirtualizedTable',
  component: VirtualizedTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add argTypes based on component props
  },
};

export default meta;
type Story = StoryObj<typeof VirtualizedTable>;

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

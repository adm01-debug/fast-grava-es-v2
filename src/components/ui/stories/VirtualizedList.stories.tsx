import type { Meta, StoryObj } from '@storybook/react';
import { VirtualizedList } from '../VirtualizedList';

const meta: Meta<typeof VirtualizedList> = {
  title: 'UI/VirtualizedList',
  component: VirtualizedList,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add argTypes based on component props
  },
};

export default meta;
type Story = StoryObj<typeof VirtualizedList>;

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

import type { Meta, StoryObj } from '@storybook/react';
import { Tabs } from '../tabs';

const meta: Meta<typeof Tabs> = {
  title: 'UI/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add argTypes based on component props
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

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

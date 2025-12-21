import type { Meta, StoryObj } from '@storybook/react';
import { KeyboardNav } from '../KeyboardNav';

const meta: Meta<typeof KeyboardNav> = {
  title: 'UI/KeyboardNav',
  component: KeyboardNav,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add argTypes based on component props
  },
};

export default meta;
type Story = StoryObj<typeof KeyboardNav>;

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

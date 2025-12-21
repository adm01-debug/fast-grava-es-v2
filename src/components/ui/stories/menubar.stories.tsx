import type { Meta, StoryObj } from '@storybook/react';
import { Menubar } from '../menubar';

const meta: Meta<typeof Menubar> = {
  title: 'UI/Menubar',
  component: Menubar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add argTypes based on component props
  },
};

export default meta;
type Story = StoryObj<typeof Menubar>;

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

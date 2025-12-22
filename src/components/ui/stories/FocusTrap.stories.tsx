import type { Meta, StoryObj } from '@storybook/react';
import { FocusTrap } from '../FocusTrap';

const meta: Meta<typeof FocusTrap> = {
  title: 'UI/FocusTrap',
  component: FocusTrap,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add argTypes based on component props
  },
};

export default meta;
type Story = StoryObj<typeof FocusTrap>;

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

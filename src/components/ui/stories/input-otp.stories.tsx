import type { Meta, StoryObj } from '@storybook/react';
import { InputOtp } from '../input-otp';

const meta: Meta<typeof InputOtp> = {
  title: 'UI/InputOtp',
  component: InputOtp,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add argTypes based on component props
  },
};

export default meta;
type Story = StoryObj<typeof InputOtp>;

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

import type { Meta, StoryObj } from '@storybook/react';
import { ScreenReaderOnly } from '../ScreenReaderOnly';

const meta: Meta<typeof ScreenReaderOnly> = {
  title: 'UI/ScreenReaderOnly',
  component: ScreenReaderOnly,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add argTypes based on component props
  },
};

export default meta;
type Story = StoryObj<typeof ScreenReaderOnly>;

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

import type { Meta, StoryObj } from '@storybook/react';
import { HighContrast } from '../HighContrast';

const meta: Meta<typeof HighContrast> = {
  title: 'UI/HighContrast',
  component: HighContrast,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add argTypes based on component props
  },
};

export default meta;
type Story = StoryObj<typeof HighContrast>;

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

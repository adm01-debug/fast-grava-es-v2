import type { Meta, StoryObj } from '@storybook/react';
import { SkipLink } from '../SkipLink';

const meta: Meta<typeof SkipLink> = {
  title: 'UI/SkipLink',
  component: SkipLink,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add argTypes based on component props
  },
};

export default meta;
type Story = StoryObj<typeof SkipLink>;

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

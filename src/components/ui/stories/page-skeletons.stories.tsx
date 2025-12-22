import type { Meta, StoryObj } from '@storybook/react';
import { PageSkeletons } from '../page-skeletons';

const meta: Meta<typeof PageSkeletons> = {
  title: 'UI/PageSkeletons',
  component: PageSkeletons,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add argTypes based on component props
  },
};

export default meta;
type Story = StoryObj<typeof PageSkeletons>;

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

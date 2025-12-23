import type { Meta, StoryObj } from '@storybook/react';
import { PageSkeleton, HeaderSkeleton } from '../page-skeletons';

const meta: Meta<typeof PageSkeleton> = {
  title: 'UI/PageSkeletons',
  component: PageSkeleton,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof PageSkeleton>;

export const Default: Story = {
  render: () => (
    <PageSkeleton>
      <HeaderSkeleton />
    </PageSkeleton>
  ),
};

export const Playground: Story = {
  render: () => (
    <PageSkeleton className="max-w-4xl mx-auto">
      <HeaderSkeleton />
    </PageSkeleton>
  ),
};

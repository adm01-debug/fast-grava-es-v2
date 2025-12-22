import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = { title: 'Features/BottleneckWidget', parameters: { layout: 'centered' }, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { args: {} };
export const Loading: Story = { args: { isLoading: true } };
export const Empty: Story = { args: { data: [] } };

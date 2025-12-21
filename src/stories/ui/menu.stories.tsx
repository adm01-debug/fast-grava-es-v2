import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = { title: 'UI/menu', parameters: { layout: 'centered' }, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { args: {} };

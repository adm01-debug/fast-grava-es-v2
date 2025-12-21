import type { Meta, StoryObj } from '@storybook/react';
const meta: Meta = { title: 'ABC/CostPoolsCard', parameters: { layout: 'padded' }, tags: ['autodocs'] };
export default meta;
export const Default: StoryObj = { args: {} };
export const WithData: StoryObj = { args: { data: [{ id: '1', value: 100 }] } };

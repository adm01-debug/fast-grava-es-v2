import type { Meta, StoryObj } from '@storybook/react';
const meta: Meta = { title: 'OEE/LossesChart', parameters: { layout: 'padded' }, tags: ['autodocs'] };
export default meta;
export const Default: StoryObj = { args: {} };
export const HighOEE: StoryObj = { args: { value: 95 } };
export const LowOEE: StoryObj = { args: { value: 45 } };

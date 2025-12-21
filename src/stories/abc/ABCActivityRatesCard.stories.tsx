import type { Meta, StoryObj } from '@storybook/react';
const meta: Meta = { title: 'ABC/ActivityRatesCard', parameters: { layout: 'padded' } };
export default meta;
export const Default: StoryObj = { args: {} };
export const WithData: StoryObj = { args: { rates: [{ activity: 'Gravação', rate: 150 }] } };

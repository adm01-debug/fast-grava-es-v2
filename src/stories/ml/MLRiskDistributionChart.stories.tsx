import type { Meta, StoryObj } from '@storybook/react';
const meta: Meta = { title: 'ML/MLRiskDistributionChart', parameters: { layout: 'padded' }, tags: ['autodocs'] };
export default meta;
export const Default: StoryObj = { args: {} };
export const HighRisk: StoryObj = { args: { risk: 'high' } };

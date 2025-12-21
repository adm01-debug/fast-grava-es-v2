import type { Meta, StoryObj } from '@storybook/react';
const meta: Meta = { title: 'Reliability/MTBFMTTRWidget', tags: ['autodocs'] };
export default meta;
export const Default: StoryObj = { args: { mtbf: 120, mttr: 15 } };

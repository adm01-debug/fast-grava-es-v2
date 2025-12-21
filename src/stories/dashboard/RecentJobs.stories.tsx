import type { Meta, StoryObj } from '@storybook/react';
const meta: Meta = { title: 'Dashboard/RecentJobs', parameters: { layout: 'padded' }, tags: ['autodocs'] };
export default meta;
export const Default: StoryObj = { args: {} };
export const Loading: StoryObj = { args: { isLoading: true } };
export const Empty: StoryObj = { args: { data: [] } };

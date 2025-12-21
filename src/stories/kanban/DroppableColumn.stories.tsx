import type { Meta, StoryObj } from '@storybook/react';
const meta: Meta = { title: 'Kanban/DroppableColumn', parameters: { layout: 'padded' }, tags: ['autodocs'] };
export default meta;
export const Default: StoryObj = { args: {} };
export const WithJobs: StoryObj = { args: { jobs: [{ id: '1', title: 'Job 1' }] } };

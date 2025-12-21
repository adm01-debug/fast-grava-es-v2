import type { Meta, StoryObj } from '@storybook/react';
const meta: Meta = { title: 'Integrations/Bitrix24SyncPanel', parameters: { layout: 'padded' }, tags: ['autodocs'] };
export default meta;
export const Default: StoryObj = { args: {} };
export const Connected: StoryObj = { args: { status: 'connected' } };
export const Error: StoryObj = { args: { status: 'error' } };

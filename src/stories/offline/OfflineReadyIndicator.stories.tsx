import type { Meta, StoryObj } from '@storybook/react';
const meta: Meta = { title: 'Offline/OfflineReadyIndicator', parameters: { layout: 'padded' }, tags: ['autodocs'] };
export default meta;
export const Online: StoryObj = { args: { isOnline: true } };
export const Offline: StoryObj = { args: { isOnline: false } };

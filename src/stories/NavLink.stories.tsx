import type { Meta, StoryObj } from '@storybook/react';
const meta: Meta = { title: 'Navigation/NavLink' };
export default meta;
export const Default: StoryObj = { args: { to: '/', children: 'Home' } };

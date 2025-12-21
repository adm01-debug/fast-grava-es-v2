import type { Meta, StoryObj } from '@storybook/react';
const meta: Meta = { title: 'Auth/ProtectedRoute', tags: ['autodocs'] };
export default meta;
export const Authenticated: StoryObj = { args: { isAuth: true } };
export const Unauthenticated: StoryObj = { args: { isAuth: false } };

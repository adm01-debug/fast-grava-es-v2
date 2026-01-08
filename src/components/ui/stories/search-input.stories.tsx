import type { Meta, StoryObj } from '@storybook/react';
import { SearchInput } from '../search-input';

const meta: Meta<typeof SearchInput> = {
  title: 'UI/SearchInput',
  component: SearchInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof SearchInput>;

export const Default: Story = {
  args: {
    onSearch: (value) => console.log('Search:', value),
    placeholder: 'Buscar...',
  },
};

export const Small: Story = {
  args: {
    onSearch: (value) => console.log('Search:', value),
    size: 'sm',
    placeholder: 'Buscar...',
  },
};

export const Large: Story = {
  args: {
    onSearch: (value) => console.log('Search:', value),
    size: 'lg',
    placeholder: 'Buscar...',
  },
};

export const WithMinLength: Story = {
  args: {
    onSearch: (value) => console.log('Search:', value),
    minLength: 3,
    placeholder: 'Digite pelo menos 3 caracteres...',
  },
};

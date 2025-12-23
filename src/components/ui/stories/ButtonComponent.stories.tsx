import type { Meta, StoryObj } from '@storybook/react';

const Button = ({ children, variant = 'default', size = 'md', disabled = false, loading = false }: any) => (
  <button 
    className={`px-4 py-2 rounded-md font-medium transition-colors
      ${variant === 'default' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}
      ${variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
      ${variant === 'outline' ? 'border border-input bg-background hover:bg-accent' : ''}
      ${variant === 'ghost' ? 'hover:bg-accent hover:text-accent-foreground' : ''}
      ${size === 'sm' ? 'text-sm px-3 py-1' : ''}
      ${size === 'lg' ? 'text-lg px-6 py-3' : ''}
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `}
    disabled={disabled || loading}
  >
    {loading ? 'Loading...' : children}
  </button>
);

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'destructive', 'outline', 'ghost'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: 'Button' } };
export const Destructive: Story = { args: { children: 'Delete', variant: 'destructive' } };
export const Outline: Story = { args: { children: 'Outline', variant: 'outline' } };
export const Ghost: Story = { args: { children: 'Ghost', variant: 'ghost' } };
export const Small: Story = { args: { children: 'Small', size: 'sm' } };
export const Large: Story = { args: { children: 'Large', size: 'lg' } };
export const Disabled: Story = { args: { children: 'Disabled', disabled: true } };
export const Loading: Story = { args: { children: 'Submit', loading: true } };

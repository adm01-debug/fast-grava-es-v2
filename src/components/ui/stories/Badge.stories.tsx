import type { Meta, StoryObj } from '@storybook/react';

const Badge = ({ children, variant = 'default' }: any) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
    ${variant === 'default' ? 'bg-primary text-primary-foreground' : ''}
    ${variant === 'secondary' ? 'bg-secondary text-secondary-foreground' : ''}
    ${variant === 'destructive' ? 'bg-destructive text-destructive-foreground' : ''}
    ${variant === 'outline' ? 'border text-foreground' : ''}
    ${variant === 'success' ? 'bg-green-500 text-white' : ''}
    ${variant === 'warning' ? 'bg-yellow-500 text-black' : ''}
  `}>
    {children}
  </span>
);

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'secondary', 'destructive', 'outline', 'success', 'warning'] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: 'Badge' } };
export const Secondary: Story = { args: { children: 'Secondary', variant: 'secondary' } };
export const Destructive: Story = { args: { children: 'Error', variant: 'destructive' } };
export const Success: Story = { args: { children: 'Success', variant: 'success' } };
export const Warning: Story = { args: { children: 'Warning', variant: 'warning' } };

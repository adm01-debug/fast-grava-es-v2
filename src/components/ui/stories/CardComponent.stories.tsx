import type { Meta, StoryObj } from '@storybook/react';

const Card = ({ title, description, children, footer }: any) => (
  <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
    {(title || description) && (
      <div className="flex flex-col space-y-1.5 p-6">
        {title && <h3 className="text-2xl font-semibold leading-none tracking-tight">{title}</h3>}
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
    )}
    {children && <div className="p-6 pt-0">{children}</div>}
    {footer && <div className="flex items-center p-6 pt-0">{footer}</div>}
  </div>
);

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Card Title',
    description: 'Card description goes here',
    children: <p>Card content</p>,
  },
};

export const WithFooter: Story = {
  args: {
    title: 'Card with Footer',
    description: 'This card has a footer',
    children: <p>Main content area</p>,
    footer: <button className="px-4 py-2 bg-primary text-white rounded">Action</button>,
  },
};

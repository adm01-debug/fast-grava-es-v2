import type { Meta, StoryObj } from '@storybook/react';
import { VirtualizedList } from '../virtualized-list';

const sampleItems = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
  description: `Description for item ${i + 1}`,
}));

const meta: Meta<typeof VirtualizedList> = {
  title: 'UI/VirtualizedList',
  component: VirtualizedList,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof VirtualizedList>;

export const Default: Story = {
  args: {
    data: sampleItems,
    renderItem: (item: { id: number; name: string; description: string }) => (
      <div className="p-4 border-b bg-card">
        <div className="font-medium">{item.name}</div>
        <div className="text-sm text-muted-foreground">{item.description}</div>
      </div>
    ),
    itemHeight: 72,
    maxHeight: 400,
  },
};

export const Empty: Story = {
  args: {
    data: [],
    renderItem: () => null,
    emptyMessage: 'Nenhum item para exibir',
    maxHeight: 400,
  },
};

export const WithGap: Story = {
  args: {
    data: sampleItems.slice(0, 50),
    renderItem: (item: { id: number; name: string; description: string }) => (
      <div className="p-4 bg-card rounded-lg border">
        <div className="font-medium">{item.name}</div>
        <div className="text-sm text-muted-foreground">{item.description}</div>
      </div>
    ),
    itemHeight: 72,
    maxHeight: 400,
    gap: 8,
  },
};

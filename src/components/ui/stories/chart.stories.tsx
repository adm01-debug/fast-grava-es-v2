import type { Meta, StoryObj } from '@storybook/react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '../chart';
import { BarChart, Bar, XAxis, YAxis } from 'recharts';

const chartConfig: ChartConfig = {
  value: {
    label: 'Value',
    color: 'hsl(var(--primary))',
  },
};

const data = [
  { name: 'A', value: 100 },
  { name: 'B', value: 200 },
  { name: 'C', value: 150 },
];

const meta: Meta<typeof ChartContainer> = {
  title: 'UI/Chart',
  component: ChartContainer,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ChartContainer>;

export const Default: Story = {
  render: () => (
    <ChartContainer config={chartConfig} className="h-[300px] w-[400px]">
      <BarChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Bar dataKey="value" fill="var(--color-value)" />
        <ChartTooltip content={<ChartTooltipContent />} />
      </BarChart>
    </ChartContainer>
  ),
};

import type { Meta, StoryObj } from '@storybook/react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../resizable';

const meta: Meta<typeof ResizablePanelGroup> = {
  title: 'UI/Resizable',
  component: ResizablePanelGroup,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ResizablePanelGroup>;

export const Default: Story = {
  render: () => (
    <ResizablePanelGroup direction="horizontal" className="min-h-[200px] max-w-md rounded-lg border">
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Panel 1</span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Panel 2</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const Playground: Story = {
  render: () => (
    <ResizablePanelGroup direction="vertical" className="min-h-[300px] max-w-md rounded-lg border">
      <ResizablePanel defaultSize={30}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Top</span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={70}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Bottom</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

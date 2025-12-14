import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';

describe('Card Component', () => {
  it('should render basic card', () => {
    render(<Card data-testid="card">Card Content</Card>);
    
    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('should render with all subcomponents', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
        <CardContent>Test Content</CardContent>
        <CardFooter>Test Footer</CardFooter>
      </Card>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.getByText('Test Footer')).toBeInTheDocument();
  });

  it('should render with different variants', () => {
    const { rerender } = render(<Card variant="elevated" data-testid="card">Elevated</Card>);
    expect(screen.getByTestId('card')).toBeInTheDocument();

    rerender(<Card variant="interactive" data-testid="card">Interactive</Card>);
    expect(screen.getByTestId('card')).toBeInTheDocument();

    rerender(<Card variant="glass" data-testid="card">Glass</Card>);
    expect(screen.getByTestId('card')).toBeInTheDocument();

    rerender(<Card variant="ghost" data-testid="card">Ghost</Card>);
    expect(screen.getByTestId('card')).toBeInTheDocument();

    rerender(<Card variant="outline" data-testid="card">Outline</Card>);
    expect(screen.getByTestId('card')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<Card className="custom-class" data-testid="card">Content</Card>);
    
    expect(screen.getByTestId('card')).toHaveClass('custom-class');
  });

  it('should render CardTitle with correct heading level', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Heading</CardTitle>
        </CardHeader>
      </Card>
    );

    const heading = screen.getByRole('heading');
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Heading');
  });
});

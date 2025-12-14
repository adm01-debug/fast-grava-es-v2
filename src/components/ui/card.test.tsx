import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';

describe('Card Component', () => {
  it('should render basic card', () => {
    const { getByTestId, getByText } = render(<Card data-testid="card">Card Content</Card>);
    
    expect(getByTestId('card')).toBeInTheDocument();
    expect(getByText('Card Content')).toBeInTheDocument();
  });

  it('should render with all subcomponents', () => {
    const { getByText, getByRole } = render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
        <CardContent>Test Content</CardContent>
        <CardFooter>Test Footer</CardFooter>
      </Card>
    );

    expect(getByText('Test Title')).toBeInTheDocument();
    expect(getByText('Test Description')).toBeInTheDocument();
    expect(getByText('Test Content')).toBeInTheDocument();
    expect(getByText('Test Footer')).toBeInTheDocument();
  });

  it('should render with different variants', () => {
    const { getByTestId, rerender } = render(<Card variant="elevated" data-testid="card">Elevated</Card>);
    expect(getByTestId('card')).toBeInTheDocument();

    rerender(<Card variant="interactive" data-testid="card">Interactive</Card>);
    expect(getByTestId('card')).toBeInTheDocument();

    rerender(<Card variant="glass" data-testid="card">Glass</Card>);
    expect(getByTestId('card')).toBeInTheDocument();

    rerender(<Card variant="ghost" data-testid="card">Ghost</Card>);
    expect(getByTestId('card')).toBeInTheDocument();

    rerender(<Card variant="outline" data-testid="card">Outline</Card>);
    expect(getByTestId('card')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { getByTestId } = render(<Card className="custom-class" data-testid="card">Content</Card>);
    
    expect(getByTestId('card')).toHaveClass('custom-class');
  });

  it('should render CardTitle with correct heading level', () => {
    const { getByRole } = render(
      <Card>
        <CardHeader>
          <CardTitle>Heading</CardTitle>
        </CardHeader>
      </Card>
    );

    const heading = getByRole('heading');
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Heading');
  });
});

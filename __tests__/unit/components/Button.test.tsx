//@ts-ignore
import { Button } from '@/components/ui/button';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

describe('Button', () => {
  it('should render button with default variant', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary');
  });

  it('should render button with secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>);

    const button = screen.getByRole('button', { name: 'Secondary' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-secondary');
  });

  it('should render button with destructive variant', () => {
    render(<Button variant="destructive">Delete</Button>);

    const button = screen.getByRole('button', { name: 'Delete' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-destructive');
  });

  it('should render button with outline variant', () => {
    render(<Button variant="outline">Outline</Button>);

    const button = screen.getByRole('button', { name: 'Outline' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('border');
  });

  it('should render button with ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>);

    const button = screen.getByRole('button', { name: 'Ghost' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('hover:bg-accent');
  });

  it('should render button with link variant', () => {
    render(<Button variant="link">Link</Button>);

    const button = screen.getByRole('button', { name: 'Link' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('text-primary');
  });

  it('should render button with different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-8');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-10');

    rerender(<Button size="icon">Icon</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-9');
  });

  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button', { name: 'Click me' });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);

    const button = screen.getByRole('button', { name: 'Disabled' });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:pointer-events-none');
  });

  it('should not handle click events when disabled', () => {
    const handleClick = jest.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    );

    const button = screen.getByRole('button', { name: 'Disabled' });
    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should render as different HTML elements', () => {
    const { rerender } = render(
      <Button asChild>
        <a href="/test">Link</a>
      </Button>
    );
    expect(screen.getByRole('link')).toBeInTheDocument();

    rerender(
      <Button asChild>
        <span>Span</span>
      </Button>
    );
    expect(screen.getByText('Span')).toBeInTheDocument();
  });

  it('should accept custom className', () => {
    render(<Button className="custom-class">Custom</Button>);

    const button = screen.getByRole('button', { name: 'Custom' });
    expect(button).toHaveClass('custom-class');
  });

  it('should accept custom props', () => {
    render(
      <Button data-testid="custom-button" aria-label="Custom button">
        Custom
      </Button>
    );

    const button = screen.getByTestId('custom-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Custom button');
  });

  it('should render with loading state', () => {
    render(<Button disabled>Loading...</Button>);

    const button = screen.getByRole('button', { name: 'Loading...' });
    expect(button).toBeDisabled();
  });

  it('should render with icon and text', () => {
    render(
      <Button>
        <span>Icon</span>
        Button Text
      </Button>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Icon');
    expect(button).toHaveTextContent('Button Text');
  });

  it('should handle keyboard events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Keyboard</Button>);

    const button = screen.getByRole('button', { name: 'Keyboard' });
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
    fireEvent.keyDown(button, { key: ' ', code: 'Space' });

    // Note: Button doesn't automatically handle keyboard events, this would need to be implemented
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should render with different variants and sizes combined', () => {
    render(
      <Button variant="outline" size="lg">
        Large Outline
      </Button>
    );

    const button = screen.getByRole('button', { name: 'Large Outline' });
    expect(button).toHaveClass('border');
    expect(button).toHaveClass('h-10');
  });
});

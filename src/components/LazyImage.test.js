import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import LazyImage from './LazyImage';

// Mock IntersectionObserver using a class-based mock
let mockInstances = [];

class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
    this.observe = jest.fn();
    this.unobserve = jest.fn();
    this.disconnect = jest.fn();
    mockInstances.push(this);
  }
}

window.IntersectionObserver = MockIntersectionObserver;

// Mock to avoid "Not implemented: HTMLMediaElement.prototype.load" error
Object.defineProperty(window.HTMLMediaElement.prototype, 'load', {
    configurable: true,
    value: function () { /* do nothing */ },
});

describe('LazyImage', () => {
  beforeEach(() => {
    mockInstances = [];
  });

  it('renders without crashing and observes the element', () => {
    render(<LazyImage src="test.jpg" alt="test" />);
    expect(mockInstances.length).toBe(1);
    expect(mockInstances[0].observe).toHaveBeenCalledTimes(1);
  });

  it('resets loading state when src prop changes', () => {
    const { rerender } = render(<LazyImage src="test1.jpg" alt="test" />);

    // Simulate the image coming into view
    const observerInstance = mockInstances[0];
    const element = observerInstance.observe.mock.calls[0][0];
    act(() => {
      observerInstance.callback([{ isIntersecting: true, target: element }]);
    });

    // After intersection, the img tag is rendered.
    let image = screen.getByAltText('test');

    // Simulate image loading
    fireEvent.load(image);
    expect(image).toHaveClass('opacity-100');

    // Change the src prop
    rerender(<LazyImage src="test2.jpg" alt="test" />);
    image = screen.getByAltText('test');

    // The bug is that the component does not reset its state.
    // It should go back to a loading state (opacity-0).
    // This assertion will fail, proving the bug.
    expect(image).toHaveClass('opacity-0');
  });
});
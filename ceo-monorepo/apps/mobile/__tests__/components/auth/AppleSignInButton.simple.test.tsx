import React from 'react';
import { AppleSignInButton } from '@/components/auth/AppleSignInButton';

// Simple test to verify the component exports correctly
describe('AppleSignInButton', () => {
  it('should be defined', () => {
    expect(AppleSignInButton).toBeDefined();
  });

  it('should be a function component', () => {
    expect(typeof AppleSignInButton).toBe('function');
  });
});
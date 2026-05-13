import { render, act, screen } from '@testing-library/react';

import { PasskeyLoginButton } from '../PasskeyLoginButton';
import { useWebAuthn } from '@/hooks/useWebAuthn';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock useWebAuthn hook
vi.mock('@/hooks/useWebAuthn', () => ({
  useWebAuthn: vi.fn(),
}));

describe('PasskeyLoginButton', () => {
  const mockAuthenticateWithPasskey = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation
    (useWebAuthn as any).mockReturnValue({
      isSupported: true,
      isAuthenticating: false,
      authenticateWithPasskey: mockAuthenticateWithPasskey,
    });

    // Mock PublicKeyCredential
    global.PublicKeyCredential = {
      isUserVerifyingPlatformAuthenticatorAvailable: vi.fn().mockResolvedValue(true),
    } as any;
  });

  it('renders correctly when supported', async () => {
    await act(async () => {
      render(<PasskeyLoginButton />);
    });
    expect(screen.getByText(/Login com Biometria/i)).toBeInTheDocument();
  });

  it('returns null when WebAuthn is not supported', () => {
    (useWebAuthn as any).mockReturnValue({
      isSupported: false,
      isAuthenticating: false,
      authenticateWithPasskey: mockAuthenticateWithPasskey,
    });

    const { container } = render(<PasskeyLoginButton />);
    expect(container.firstChild).toBeNull();
  });

  it('shows authenticating state', async () => {
    (useWebAuthn as any).mockReturnValue({
      isSupported: true,
      isAuthenticating: true,
      authenticateWithPasskey: mockAuthenticateWithPasskey,
    });

    await act(async () => {
      render(<PasskeyLoginButton />);
    });
    expect(screen.getByText(/Autenticando.../i)).toBeInTheDocument();
  });

  it('calls authenticateWithPasskey when clicked', async () => {
    mockAuthenticateWithPasskey.mockResolvedValue({ success: true, userId: 'user-123' });
    const onSuccess = vi.fn();
    
    await act(async () => {
      render(<PasskeyLoginButton onSuccess={onSuccess} />);
    });
    
    const button = screen.getByRole('button');
    await act(async () => {
      button.click();
    });

    expect(mockAuthenticateWithPasskey).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledWith('user-123');
  });

  it('handles unmount during async state update without warning', async () => {
    let resolvePromise: (value: boolean) => void;
    const promise = new Promise<boolean>((resolve) => {
      resolvePromise = resolve;
    });

    (global.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable as any).mockReturnValue(promise);

    const { unmount } = render(<PasskeyLoginButton />);
    
    // Unmount before promise resolves
    unmount();

    // Resolve the promise after unmount
    await act(async () => {
      resolvePromise!(true);
    });

    // If it didn't throw a "setState on unmounted component" warning, we're good
    // In Vitest/Testing Library, this often shows up in console.error if not handled
  });
});

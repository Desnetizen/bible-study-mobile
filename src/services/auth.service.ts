import { supabase } from '../lib/supabase';

type AuthResult = {
  error?: string;
};

const EMAIL_IN_USE_MESSAGE = 'An account with this email already exists. Try signing in instead.';

type SignUpResult = AuthResult & {
  needsConfirmation?: boolean;
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const authService = {
  async signUp(email: string, password: string): Promise<SignUpResult> {
    if (!isValidEmail(email)) {
      return { error: 'Please enter a valid email address' };
    }

    if (password.length < 8) {
      return { error: 'Password must be at least 8 characters' };
    }

    if (!supabase) {
      return { error: 'Service unavailable' };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'bibleconnection://auth-confirm',
      },
    });

    if (error) {
      // Thrown when "Confirm email" is disabled in the Supabase project.
      if (error.message.toLowerCase().includes('already registered')) {
        return { error: EMAIL_IN_USE_MESSAGE };
      }
      return { error: 'Something went wrong. Please try again.' };
    }

    // When "Confirm email" is enabled, Supabase does NOT return an error for an
    // email that's already registered and confirmed — it silently returns an
    // obfuscated user object instead (to avoid leaking which emails exist).
    // The one reliable signal is an empty `identities` array.
    // See: https://supabase.com/docs/reference/javascript/auth-signup
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      return { error: EMAIL_IN_USE_MESSAGE };
    }

    return { needsConfirmation: true };
  },

  async signIn(email: string, password: string): Promise<AuthResult> {
    if (!isValidEmail(email)) {
      return { error: 'Please enter a valid email address' };
    }

    if (!password) {
      return { error: 'Password is required' };
    }

    if (!supabase) {
      return { error: 'Service unavailable' };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: 'Invalid email or password' };
    }

    return {};
  },

  async requestPasswordReset(email: string): Promise<AuthResult> {
    if (!isValidEmail(email)) {
      return { error: 'Please enter a valid email address' };
    }

    if (!supabase) {
      return { error: 'Service unavailable' };
    }

    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'bibleconnection://auth-reset-password',
    });

    // Always succeed from the caller's point of view, whether or not the email
    // is registered — this avoids revealing which emails have accounts.
    return {};
  },

  async updatePassword(newPassword: string): Promise<AuthResult> {
    if (newPassword.length < 8) {
      return { error: 'Password must be at least 8 characters' };
    }

    if (!supabase) {
      return { error: 'Service unavailable' };
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      return { error: 'Could not update your password. Please request a new reset link.' };
    }

    return {};
  },

  async signOut(): Promise<void> {
    if (!supabase) return;
    await supabase.auth.signOut();
  },

  async getSession() {
    if (!supabase) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },
};

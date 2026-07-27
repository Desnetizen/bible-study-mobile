import { supabase } from '../lib/supabase';

type AuthResult = {
  error?: string;
};

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

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'bibleconnection://auth-confirm',
      },
    });

    if (error) {
      return { error: 'Something went wrong. Please try again.' };
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

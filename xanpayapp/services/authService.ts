import {
  signInWithPopup,
  signOut,
  User,
  UserCredential,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithCustomToken,
  GoogleAuthProvider,
  OAuthCredential
} from 'firebase/auth';
import { auth, googleProvider } from '@/config/firebase';
import { Platform } from 'react-native';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

class AuthService {
  // Sign in with Google using popup (web) or credential (mobile)
  async signInWithGoogle(): Promise<AuthUser | null> {
    try {
      let result: UserCredential;

      if (Platform.OS === 'web') {
        // Use popup for web
        result = await signInWithPopup(auth, googleProvider);
      } else {
        // For React Native/Expo, we'll use popup as fallback
        // In a real React Native app, you'd use @react-native-google-signin/google-signin
        try {
          result = await signInWithPopup(auth, googleProvider);
        } catch (popupError) {
          // If popup fails, throw a more user-friendly error
          throw new Error('Google Sign In is not available on this platform. Please use the Continue button instead.');
        }
      }

      const user = result.user;
      return this.formatUser(user);
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  }

  // Sign in with Google credential (for React Native Google Sign-In SDK)
  async signInWithGoogleCredential(idToken: string, accessToken?: string): Promise<AuthUser | null> {
    try {
      const credential = GoogleAuthProvider.credential(idToken, accessToken);
      const result = await signInWithCredential(auth, credential);
      return this.formatUser(result.user);
    } catch (error) {
      console.error('Google credential sign in error:', error);
      throw error;
    }
  }

  // Generic method to sign in with any OAuth credential
  async signInWithOAuthCredential(credential: OAuthCredential): Promise<AuthUser | null> {
    try {
      const result = await signInWithCredential(auth, credential);
      return this.formatUser(result.user);
    } catch (error) {
      console.error('OAuth credential sign in error:', error);
      throw error;
    }
  }

  // Sign in with email and password (direct Firebase auth)
  async signInWithEmail(email: string, password: string): Promise<AuthUser | null> {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return this.formatUser(result.user);
    } catch (error) {
      console.error('Email sign in error:', error);
      throw error;
    }
  }

  // Sign in with custom token
  async signInWithCustomToken(token: string): Promise<AuthUser | null> {
    try {
      const result = await signInWithCustomToken(auth, token);
      return this.formatUser(result.user);
    } catch (error) {
      console.error('Custom token sign in error:', error);
      throw error;
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  // Format user data
  private formatUser(user: User): AuthUser {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    };
  }

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: AuthUser | null) => void) {
    return auth.onAuthStateChanged((user) => {
      if (user) {
        callback(this.formatUser(user));
      } else {
        callback(null);
      }
    });
  }
}

export const authService = new AuthService();
'use client';

import { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Label } from '../components/ui/label';

const GoogleIcon = () => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="mr-2 h-4 w-4"
  >
    <path
      fill="currentColor"
      d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.58 2.6-5.49 2.6-4.4 0-7.99-3.6-7.99-8s3.59-8 7.99-8c2.43 0 4.1.99 5.38 2.18l2.6-2.6C18.29 2.37 15.65 1 12.48 1 5.88 1 1 5.99 1 12.5s4.88 11.5 11.48 11.5c6.9 0 11.23-4.84 11.23-11.5 0-.7-.08-1.3-.2-1.92h-11.83z"
    />
  </svg>
);

export default function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { toast } = useToast();

  const handleSignup = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!auth || !db) {
        throw new Error('Firebase services not available');
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCredential.user.uid;

      await setDoc(doc(db, 'users', uid), {
        email,
        createdAt: new Date(),
      });

      toast({
        title: 'Success!',
        description: 'You have signed up successfully.',
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    try {
      if (!auth || !db) {
        throw new Error('Firebase services not available');
      }

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(
        doc(db, 'users', user.uid),
        {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date(),
        },
        { merge: true }
      );

      toast({
        title: 'Success!',
        description: 'You have signed in with Google successfully.',
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Google Sign-in Failed',
        description: err.message,
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSignup} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            type="email"
            disabled={isLoading || isGoogleLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={isLoading || isGoogleLoading}
          />
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || isGoogleLoading}
        >
          {isLoading ? 'Signing up...' : 'Sign Up with Email'}
        </Button>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button
        variant="outline"
        className="w-full"
        onClick={handleGoogleSignup}
        disabled={isLoading || isGoogleLoading}
      >
        {isGoogleLoading ? (
          'Signing in...'
        ) : (
          <>
            <GoogleIcon />
            Google
          </>
        )}
      </Button>
    </div>
  );
}

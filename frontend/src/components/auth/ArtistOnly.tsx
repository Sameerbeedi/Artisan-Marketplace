'use client';

import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette, Lock } from 'lucide-react';

interface ArtistOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ArtistOnly({ children, fallback }: ArtistOnlyProps) {
  const { isArtist, isAuthenticated, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isArtist) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="bg-primary/10 p-4 rounded-full">
                <Lock className="h-8 w-8 text-primary" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Artist Account Required</h2>
              <p className="text-muted-foreground">
                You need an Artist account to access the Artisan Tools.
              </p>
            </div>

            <div className="space-y-3">
              {!isAuthenticated ? (
                <>
                  <Button 
                    onClick={() => setShowAuthModal(true)} 
                    className="w-full"
                  >
                    <Palette className="mr-2 h-4 w-4" />
                    Sign Up as Artist
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <button 
                      onClick={() => setShowAuthModal(true)}
                      className="text-primary hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                </>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Your current account is registered as a Customer.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Please contact support to upgrade to an Artist account.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
          defaultTab="signup"
        />
      </div>
    );
  }

  return <>{children}</>;
}
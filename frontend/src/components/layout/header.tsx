'use client';

import Link from 'next/link';
import { KalaaVerseLogo } from '../icons';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import { Languages, Menu, UserPlus, User, LogOut, Palette, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '../auth/AuthModal';
import { Badge } from '../ui/badge';
import { useTranslation } from '@/contexts/LanguageContext';

const navLinks = [
  { href: '/marketplace', label: 'nav.marketplace', requiresAuth: false },
  { href: '/tools', label: 'nav.tools', requiresAuth: true, artistOnly: true },
  { href: '/#features', label: 'nav.features', requiresAuth: false },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isAuthenticated, isArtist, userProfile, signOut, loading } = useAuth();
  const { language, setLanguage, t } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="mr-6 flex items-center">
          <KalaaVerseLogo className="h-8 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-1 items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => {
            // Show artisan tools only to artists or show as disabled
            if (link.artistOnly && !isArtist && isAuthenticated) {
              return (
                <span
                  key={link.href}
                  className="text-muted-foreground/50 cursor-not-allowed"
                  title="Artist account required"
                >
                  {t(link.label)}
                </span>
              );
            }
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {t(link.label)}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-2">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Languages className="h-5 w-5" />
                <span className="sr-only">Change language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map((lang) => (
                <DropdownMenuItem 
                  key={lang.code}
                  onClick={() => setLanguage(lang.code as any)}
                  className={`cursor-pointer ${language === lang.code ? 'bg-primary/10 text-primary' : ''}`}
                >
                  {lang.nativeName}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className='hidden md:flex items-center gap-2'>
            {!isAuthenticated ? (
              <>
                <Button variant="ghost" onClick={() => setShowAuthModal(true)}>
                  {t('nav.signIn')}
                </Button>
                <Button onClick={() => setShowAuthModal(true)}>
                  {t('nav.signUp')}
                </Button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden lg:inline">{userProfile?.displayName || 'User'}</span>
                    {userProfile?.role && (
                      <Badge variant={userProfile.role === 'artist' ? 'default' : 'secondary'} className="ml-1">
                        {userProfile.role === 'artist' ? (
                          <>
                            <Palette className="h-3 w-3 mr-1" />
                            Artist
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="h-3 w-3 mr-1" />
                            Customer
                          </>
                        )}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled>
                    <div className="flex flex-col">
                      <span className="font-medium">{userProfile?.displayName}</span>
                      <span className="text-xs text-muted-foreground">{userProfile?.email}</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('nav.signOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          

          {/* Mobile Navigation */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col h-full">
                <div className="p-6">
                  <Link
                    href="/"
                    className="mr-6 flex items-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <KalaaVerseLogo className="h-8 w-auto" />
                  </Link>
                </div>
                <nav className="flex flex-col gap-4 p-6 pt-0">
                  {navLinks.map((link) => {
                    // Show artisan tools only to artists or show as disabled
                    if (link.artistOnly && !isArtist && isAuthenticated) {
                      return (
                        <span
                          key={link.href}
                          className="text-lg font-medium text-muted-foreground/50 cursor-not-allowed"
                          title="Artist account required"
                        >
                          {t(link.label)}
                        </span>
                      );
                    }
                    
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-lg font-medium text-muted-foreground transition-colors hover:text-foreground"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {t(link.label)}
                      </Link>
                    );
                  })}
                </nav>
                <div className='mt-auto p-6'>
                  <Separator className='mb-4'/>
                  {!isAuthenticated ? (
                    <div className="space-y-2">
                      <Button variant="outline" className='w-full' onClick={() => {
                        setShowAuthModal(true);
                        setIsMobileMenuOpen(false);
                      }}>
                        <User className="mr-2 h-4 w-4" />
                        {t('nav.signIn')}
                      </Button>
                      <Button className='w-full' onClick={() => {
                        setShowAuthModal(true);
                        setIsMobileMenuOpen(false);
                      }}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        {t('nav.signUp')}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-center">
                        <p className="font-medium">{userProfile?.displayName}</p>
                        <div className="flex justify-center mt-1">
                          <Badge variant={userProfile?.role === 'artist' ? 'default' : 'secondary'}>
                            {userProfile?.role === 'artist' ? (
                              <>
                                <Palette className="h-3 w-3 mr-1" />
                                Artist
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="h-3 w-3 mr-1" />
                                Customer
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="outline" className='w-full' onClick={() => {
                        signOut();
                        setIsMobileMenuOpen(false);
                      }}>
                        <LogOut className="mr-2 h-4 w-4" />
                        {t('nav.signOut')}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
      />
    </header>
  );
}

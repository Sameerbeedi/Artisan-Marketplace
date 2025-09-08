import { Facebook, Instagram, Twitter } from 'lucide-react';
import Link from 'next/link';
import { KalaaVerseLogo } from '../icons';

export function Footer() {
  return (
    <footer className="bg-secondary/70">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link href="/" className="flex items-center gap-2">
              <KalaaVerseLogo className="h-8 w-auto" />
            </Link>
          </div>
          <div className="text-center text-sm text-muted-foreground mb-4 md:mb-0">
            <p>&copy; {new Date().getFullYear()} kalaaVerse. All rights reserved.</p>
            <p>Connecting Heritage, Craft, and Technology.</p>
          </div>
          <div className="flex gap-4">
            <Link href="#" aria-label="Twitter">
              <Twitter className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
            </Link>
            <Link href="#" aria-label="Facebook">
              <Facebook className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
            </Link>
            <Link href="#" aria-label="Instagram">
              <Instagram className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

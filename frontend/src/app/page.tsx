'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles, Heart, Star } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/contexts/LanguageContext';

export default function HomePage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="outline" className="w-fit">
                  <Sparkles className="mr-1 h-3 w-3" />
                  {t('hero.badge')}
                </Badge>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900">
                  {t('hero.title')}
                </h1>
                <p className="text-xl text-gray-600 max-w-lg">
                  {t('hero.subtitle')}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="text-lg px-8">
                  <Link href="/marketplace">
                    {t('hero.exploreMarketplace')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8">
                  <Link href="/tools">
                    {t('hero.artisanTools')}
                  </Link>
                </Button>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span>{t('hero.happyCustomers')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>{t('hero.rating')}</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <img 
                    src="/uploads/1758256877178-images-2.jpeg" 
                    alt="Handcrafted pottery"
                    className="rounded-2xl shadow-lg"
                  />
                  <img 
                    src="/uploads/1758257624768-images-2.jpeg" 
                    alt="Traditional textiles"
                    className="rounded-2xl shadow-lg"
                  />
                </div>
                <div className="space-y-4 mt-8">
                  <img 
                    src="/uploads/1758256877178-images-2.jpeg" 
                    alt="Handmade jewelry"
                    className="rounded-2xl shadow-lg"
                  />
                  <img 
                    src="/uploads/1758257624768-images-2.jpeg" 
                    alt="Wood crafts"
                    className="rounded-2xl shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Discover Amazing Crafts?
            </h2>
            <p className="text-xl opacity-90">
              Join thousands of satisfied customers who have found their perfect 
              handcrafted treasures with our AI-powered recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8">
                <Link href="/marketplace">
                  Start Shopping Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="text-lg px-8 bg-white text-primary hover:bg-gray-100">
                <Link href="/signup">
                  Join as Artisan
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

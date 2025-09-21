'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles, Heart, Shield, Truck, Star } from 'lucide-react';
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

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('features.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>AI-Powered Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Our advanced AI understands your preferences and suggests products 
                  that perfectly match your style and needs.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Authentic Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Every product is carefully verified for authenticity and quality 
                  by our team of craft experts.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Support Artisans</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Direct purchases from artisans ensure they receive fair compensation 
                  for their incredible craftsmanship.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Truck className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Secure Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Safe and secure packaging ensures your precious handcrafted items 
                  reach you in perfect condition.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Premium Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Enjoy a seamless shopping experience with AR preview, 
                  detailed stories, and expert recommendations.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-teal-600" />
                </div>
                <CardTitle>Artisan Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Powerful AI tools help artisans with product cataloging, 
                  storytelling, and quality assessment.
                </CardDescription>
              </CardContent>
            </Card>
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
              <Button asChild size="lg" variant="outline" className="text-lg px-8 border-white text-white hover:bg-white hover:text-primary">
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

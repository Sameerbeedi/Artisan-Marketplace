'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles, Heart, Star } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function HomePage() {
  const { t } = useTranslation();

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" } // Increased from 0.6 to 1.2
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.6 // Increased from 0.1 to 0.6
      }
    }
  };

  const scaleOnHover = {
    whileHover: { scale: 1.05, transition: { duration: 0.2 } },
    whileTap: { scale: 0.95 }
  };
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section 
        className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-20 lg:py-32"
        initial="initial"
        animate="animate"
        variants={staggerChildren}
      >
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div className="space-y-8" variants={staggerChildren}>
              <div className="space-y-4">
                <motion.div variants={fadeInUp}>
                  <Badge variant="outline" className="w-fit hover:bg-orange-100 transition-colors duration-300">
                    <Sparkles className="mr-1 h-3 w-3" />
                    {t('hero.badge')}
                  </Badge>
                </motion.div>
                <motion.h1 
                  className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900"
                  variants={fadeInUp}
                >
                  {t('hero.title')}
                </motion.h1>
                <motion.p 
                  className="text-xl text-gray-600 max-w-lg"
                  variants={fadeInUp}
                >
                  {t('hero.subtitle')}
                </motion.p>
              </div>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                variants={fadeInUp}
              >
                <motion.div {...scaleOnHover}>
                  <Button asChild size="lg" className="text-lg px-8 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all duration-300">
                    <Link href="/marketplace">
                      {t('hero.exploreMarketplace')}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </motion.div>
                <motion.div {...scaleOnHover}>
                  <Button asChild variant="outline" size="lg" className="text-lg px-8 hover:bg-orange-50 transition-all duration-300">
                    <Link href="/tools">
                      {t('hero.artisanTools')}
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div 
                className="flex items-center gap-6 text-sm text-gray-600"
                variants={fadeInUp}
              >
                <motion.div 
                  className="flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <Heart className="h-4 w-4 text-red-500" />
                  <span>{t('hero.happyCustomers')}</span>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>{t('hero.rating')}</span>
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.5, delay: 0.5 }} // Increased duration from 0.8 to 1.5, delay from 0.2 to 0.5
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.0, delay: 0.8 }} // Increased duration from 0.5 to 1.0, delay from 0.4 to 0.8
                    whileHover={{ scale: 1.02, rotate: -1 }}
                    className="overflow-hidden rounded-2xl shadow-lg cursor-pointer"
                  >
                    <img 
                      src="/uploads/1758256877178-images-2.jpeg" 
                      alt="Handcrafted pottery"
                      className="w-full h-auto transition-transform duration-300 hover:scale-110"
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.0, delay: 1.2 }} // Increased duration from 0.5 to 1.0, delay from 0.6 to 1.2
                    whileHover={{ scale: 1.02, rotate: 1 }}
                    className="overflow-hidden rounded-2xl shadow-lg cursor-pointer"
                  >
                    <img 
                      src="/uploads/1758257624768-images-2.jpeg" 
                      alt="Traditional textiles"
                      className="w-full h-auto transition-transform duration-300 hover:scale-110"
                    />
                  </motion.div>
                </div>
                <div className="space-y-4 mt-8">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.0, delay: 1.6 }} // Increased duration from 0.5 to 1.0, delay from 0.8 to 1.6
                    whileHover={{ scale: 1.02, rotate: 1 }}
                    className="overflow-hidden rounded-2xl shadow-lg cursor-pointer"
                  >
                    <img 
                      src="/uploads/1758257624768-images-2.jpeg" 
                      alt="Handmade jewelry"
                      className="w-full h-auto transition-transform duration-300 hover:scale-110"
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.0, delay: 2.0 }} // Increased duration from 0.5 to 1.0, delay from 1.0 to 2.0
                    whileHover={{ scale: 1.02, rotate: -1 }}
                    className="overflow-hidden rounded-2xl shadow-lg cursor-pointer"
                  >
                    <img 
                      src="/uploads/1758256877178-images-2.jpeg" 
                      alt="Wood crafts"
                      className="w-full h-auto transition-transform duration-300 hover:scale-110"
                    />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="py-20 bg-primary text-primary-foreground relative overflow-hidden"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 3.0 }} // Increased duration from 0.8 to 1.2, delay from 1.5 to 3.0
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-10 -left-10 w-20 h-20 bg-white/10 rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          />
          <motion.div
            className="absolute top-1/2 -right-10 w-16 h-16 bg-white/5 rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2 }}
          />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div 
            className="max-w-3xl mx-auto space-y-8"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.0, delay: 3.3 }} // Increased duration from 0.6 to 1.0, delay from 1.7 to 3.3
          >
            <motion.h2 
              className="text-3xl md:text-4xl font-bold"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 3.6 }} // Increased duration from 0.5 to 0.8, delay from 1.8 to 3.6
            >
              Ready to Discover Amazing Crafts?
            </motion.h2>
            <motion.p 
              className="text-xl opacity-90"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 0.9 }}
              transition={{ duration: 0.8, delay: 3.9 }} // Increased duration from 0.5 to 0.8, delay from 1.9 to 3.9
            >
              Join thousands of satisfied customers who have found their perfect 
              handcrafted treasures with our AI-powered recommendations.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 4.2 }} // Increased duration from 0.5 to 0.8, delay from 2.0 to 4.2
            >
              <motion.div {...scaleOnHover}>
                <Button asChild size="lg" variant="secondary" className="text-lg px-8 hover:shadow-lg transition-all duration-300">
                  <Link href="/marketplace">
                    Start Shopping Now
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 5.0 }} // Increased delay from 2.5 to 5.0
                    >
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </motion.div>
                  </Link>
                </Button>
              </motion.div>

              {/* 👇 NEW Cart Button */}
              <motion.div {...scaleOnHover}>
                <Button asChild size="lg" variant="secondary" className="text-lg px-8 bg-orange-500 text-white hover:bg-orange-600 hover:shadow-lg transition-all duration-300">
                  <Link href="/cart">
                    Go to Cart 🛒
                  </Link>
                </Button>
              </motion.div>

              <motion.div {...scaleOnHover}>
                <Button asChild size="lg" variant="secondary" className="text-lg px-8 bg-white text-primary hover:bg-gray-100 hover:shadow-lg transition-all duration-300">
                  <Link href="/signup">
                    Join as Artisan
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}

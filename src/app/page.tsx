import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Palette,
  Sparkles,
  ScanSearch,
  CheckCircle,
  BookText,
  Workflow,
  Heart,
} from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { products, artisans } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FirebaseTest } from '@/components/firebase-test';

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="relative h-[60vh] md:h-[80vh] w-full">
        <Image
          src="https://picsum.photos/1800/1000"
          alt="Indian artisan crafting a pot"
          fill
          className="object-cover object-center"
          data-ai-hint="indian artisan"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-black/30" />
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div className="relative px-4 text-primary-foreground">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-headline text-white drop-shadow-lg">
              kalaaVerse
            </h1>
            <p className="mt-4 max-w-2xl text-lg md:text-xl font-body text-white/90 drop-shadow-md">
              Empowering India&apos;s Artisans with AI. <br />
              Bridging Heritage and the Digital World.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="font-headline text-lg">
                <Link href="/marketplace">Explore the Marketplace</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="font-headline text-lg"
              >
                <Link href="/tools">Artisan Tools</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <FirebaseTest />
        </div>
      </section>

      <section id="features" className="py-16 md:py-24 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-headline text-primary">
              AI-Powered Tools for Artisans
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              We provide cutting-edge AI features to help artisans thrive in the
              digital marketplace, from cataloging to storytelling.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit">
                  <ScanSearch className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-headline mt-4">
                  Automated Cataloging
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Automatically categorize crafts using image recognition, from
                  textiles to pottery.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit">
                  <Palette className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-headline mt-4">
                  Technique Identification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Our AI identifies traditional techniques like block printing and
                  embroidery styles from your photos.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-headline mt-4">
                  Quality Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Receive feedback on your product photos to improve visual
                  appeal and attract more customers.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-headline mt-4">
                  Heritage Storytelling
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Craft compelling narratives about your background, traditions,
                  and craft history to connect with buyers.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit">
                  <BookText className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-headline mt-4">
                  Process Documentation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Generate step-by-step descriptions of your craft process,
                  rich with cultural context.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit">
                  <Workflow className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-headline mt-4">
                  Multilingual Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Communicate your stories and product details in multiple Indian
                  languages with AI-powered translation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-headline text-primary">
              Featured Products
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Discover unique, handcrafted treasures from artisans across India.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button asChild className="font-headline text-lg">
              <Link href="/marketplace">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-headline text-primary">
              Stories from the HeART
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Each creation has a story. Meet the artisans who pour their soul
              into their work.
            </p>
          </div>
          <div className="mt-12 grid gap-12 md:grid-cols-1 lg:grid-cols-2">
            {artisans.slice(0, 2).map((artisan) => (
              <Card
                key={artisan.id}
                className="overflow-hidden flex flex-col md:flex-row"
              >
                <div className="md:w-1/3 relative min-h-[200px]">
                  <Image
                    src={artisan.imageUrl}
                    alt={artisan.name}
                    fill
                    className="object-cover"
                    data-ai-hint={artisan.aiHint}
                  />
                </div>
                <div className="md:w-2/3">
                  <CardHeader className="items-start">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={artisan.imageUrl}
                          alt={artisan.name}
                        />
                        <AvatarFallback>
                          {artisan.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="font-headline text-2xl">
                          {artisan.name}
                        </CardTitle>
                        <CardDescription>{artisan.craft}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="italic">&quot;{artisan.story}&quot;</p>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

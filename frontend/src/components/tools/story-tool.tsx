'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent } from '../ui/card';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2 } from 'lucide-react';
import { Badge } from '../ui/badge';

const formSchema = z.object({
  productTitle: z.string().min(3, 'Please enter a product title.'),
  productDescription: z.string().min(5, 'Please enter a product description.'),
  materials: z.string().min(2, 'Please enter materials used.'),
  artisan_hours: z.coerce.number().min(1, 'Enter valid artisan hours'),
  state: z.string().min(2, 'Please select a state.'),
});

interface StoryResult {
  creativeStory: string;
  seoTags: string[];
  minPrice: number;
  maxPrice: number;
  reasoning: string;
}

export function StoryTool() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<StoryResult | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productTitle: '',
      productDescription: '',
      materials: '',
      artisan_hours: 1,
      state: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      // Run both APIs in parallel
      const [storyRes, priceRes] = await Promise.all([
        fetch('/api/generateStory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values), // send full form for story
        }),
        fetch('/api/estimatePrice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: values.productTitle,       // map correctly
            materials: values.materials,
            artisan_hours: values.artisan_hours,
            state: values.state,
          }),
        }),
      ]);

      if (!storyRes.ok || !priceRes.ok) {
        throw new Error('Failed to fetch story or price.');
      }

      const storyData = await storyRes.json();
      const priceData = await priceRes.json();

      setResult({
        creativeStory: storyData.creativeStory,
        seoTags: storyData.seoTags,
        minPrice: priceData.minPrice,
        maxPrice: priceData.maxPrice,
        reasoning: priceData.reasoning,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description:
          error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
      {/* Input Form */}
      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="productTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Title</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., Hand-carved Wooden Elephant" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="productDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="E.g., A decorative piece crafted from sustainably sourced wood."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="materials"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Materials Used</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., Clay, Natural Dye" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="artisan_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Artisan Hours</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="E.g., 12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State (India)</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., Karnataka" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Generate Story + Price
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="flex items-start justify-center">
        {isLoading && (
          <div className="text-center mt-10">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">AI is generating...</p>
          </div>
        )}
        {result && (
          <Card className="w-full">
            <CardContent className="p-6">
              <h3 className="text-2xl font-headline text-primary mb-4">
                Generated Product Story
              </h3>
              <div
                className="prose prose-sm md:prose-base max-w-none prose-p:font-body mb-4"
                dangerouslySetInnerHTML={{
                  __html: result.creativeStory.replace(/\n/g, '<br />'),
                }}
              />
              <h4 className="text-lg font-semibold text-primary mb-2">SEO Tags:</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                {result.seoTags.map((tag, index) => (
                  <Badge key={index} variant="secondary">{tag}</Badge>
                ))}
              </div>
              <h4 className="text-lg font-semibold text-primary mb-2">Estimated Price Range:</h4>
              <p className="text-green-600 font-bold">
                ₹{result.minPrice} – ₹{result.maxPrice}
              </p>
              <p className="mt-2 text-muted-foreground">{result.reasoning}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

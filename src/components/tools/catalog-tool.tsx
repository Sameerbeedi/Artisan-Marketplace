'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2 } from 'lucide-react';
import { catalogProductAction } from '@/lib/actions';
import { FileUpload } from './file-upload';
import { Progress } from '../ui/progress';

const formSchema = z.object({
  photoDataUri: z.string().min(1, 'Please upload a photo of your craft.'),
});

type CatalogResult = {
  category: string;
  confidence: number;
};

export function CatalogTool() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CatalogResult | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      photoDataUri: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await catalogProductAction(values);
      if (response.error) {
        throw new Error(response.error);
      }
      setResult(response.data!);
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="photoDataUri"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Photo</FormLabel>
                    <FormControl>
                      <FileUpload
                        value={field.value}
                        onChange={field.onChange}
                      />
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
                Categorize Product
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="flex items-center justify-center">
        {isLoading && (
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">
              AI is analyzing your product...
            </p>
          </div>
        )}
        {result && (
          <Card className="w-full">
            <CardContent className="p-6 text-center">
              <p className="text-lg text-muted-foreground">
                Predicted Category
              </p>
              <h3 className="text-4xl font-headline text-primary my-2">
                {result.category}
              </h3>
              <p className="text-lg text-muted-foreground mt-4">Confidence</p>
              <div className="flex items-center gap-4 mt-2">
                <Progress value={result.confidence * 100} className="w-full" />
                <span className="font-bold text-lg text-primary">
                  {Math.round(result.confidence * 100)}%
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

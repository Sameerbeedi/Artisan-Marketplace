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
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2 } from 'lucide-react';
import { assessQualityAction } from '@/lib/actions';
import { FileUpload } from './file-upload';
import { Progress } from '../ui/progress';

const formSchema = z.object({
  photoDataUri: z.string().min(1, 'Please upload a photo of your craft.'),
  productDescription: z
    .string()
    .min(10, 'Please provide a brief product description.'),
});

type QualityResult = {
  qualityScore: number;
  suggestedImprovements: string;
};

export function QualityTool() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<QualityResult | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      photoDataUri: '',
      productDescription: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await assessQualityAction(values);
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
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
              <FormField
                control={form.control}
                name="productDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Briefly describe the product shown in the photo."
                        {...field}
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
                Assess Photo Quality
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="flex items-start justify-center">
        {isLoading && (
          <div className="text-center mt-10">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">
              AI is assessing your photo...
            </p>
          </div>
        )}
        {result && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-primary">
                Quality Assessment Result
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Quality Score</h4>
                <div className="flex items-center gap-4">
                  <Progress value={result.qualityScore} className="w-full" />
                  <span className="font-bold text-xl text-primary">
                    {result.qualityScore}/100
                  </span>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Suggested Improvements</h4>
                <div
                  className="prose prose-sm md:prose-base max-w-none text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html: result.suggestedImprovements.replace(/\n/g, '<br />'),
                  }}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

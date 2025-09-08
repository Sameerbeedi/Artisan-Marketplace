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
import { generateProcessAction } from '@/lib/actions';

const formSchema = z.object({
  craftName: z.string().min(3, 'Craft name must be at least 3 characters.'),
  craftDescription: z
    .string()
    .min(10, 'Craft description is required.'),
  materials: z.string().min(5, 'Please list the materials used.'),
  steps: z.string().min(10, 'Please describe the steps.'),
  culturalContext: z
    .string()
    .min(10, 'Please provide some cultural context.'),
});

export function ProcessTool() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      craftName: '',
      craftDescription: '',
      materials: '',
      steps: '',
      culturalContext: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await generateProcessAction(values);
      if (response.error) {
        throw new Error(response.error);
      }
      setResult(response.data!.processDescription);
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="craftName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Craft Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Bandhani Tie-Dye" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="craftDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Craft Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the craft and its cultural significance."
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
                      <Textarea
                        placeholder="List the materials, e.g., Cotton cloth, natural dyes, thread..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="steps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Process Steps</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the key steps of the creation process."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="culturalContext"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cultural Context</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Explain any rituals, traditions, or stories associated with the craft."
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
                Generate Documentation
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
              AI is documenting the process...
            </p>
          </div>
        )}
        {result && (
          <Card className="w-full">
            <CardContent className="p-6">
              <h3 className="text-2xl font-headline text-primary mb-4">
                Generated Process Documentation
              </h3>
              <div
                className="prose prose-sm md:prose-base max-w-none"
                dangerouslySetInnerHTML={{ __html: result.replace(/\n/g, '<br />') }}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

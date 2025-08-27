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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2 } from 'lucide-react';
import { identifyTechniqueAction } from '@/lib/actions';
import { FileUpload } from './file-upload';
import { Progress } from '../ui/progress';

const formSchema = z.object({
  photoDataUri: z.string().min(1, 'Please upload a photo of your craft.'),
  craftDescription: z
    .string()
    .min(10, 'Please provide a brief description of the craft.'),
});

type TechniqueResult = {
  techniques: string[];
  confidenceLevels: number[];
};

export function TechniqueTool() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TechniqueResult | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      photoDataUri: '',
      craftDescription: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await identifyTechniqueAction(values);
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
                    <FormLabel>Craft Photo</FormLabel>
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
                name="craftDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Craft Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Briefly describe the craft shown in the photo."
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
                Identify Techniques
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
              AI is identifying techniques...
            </p>
          </div>
        )}
        {result && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-primary">
                Identified Techniques
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.techniques.length > 0 ? (
                <ul className="space-y-4">
                  {result.techniques.map((technique, index) => (
                    <li key={index}>
                      <p className="font-semibold">{technique}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <Progress
                          value={result.confidenceLevels[index] * 100}
                          className="w-full"
                        />
                        <span className="font-bold text-sm text-primary">
                          {Math.round(result.confidenceLevels[index] * 100)}%
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">
                  No specific techniques were identified. Try a different image
                  or a more detailed description.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

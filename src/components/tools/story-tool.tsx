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
import { Card, CardContent } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mic, Wand2 } from 'lucide-react';
import { generateStoryAction } from '@/lib/actions';

const formSchema = z.object({
  artisanBackground: z
    .string()
    .min(10, 'Please tell us a bit about your background.'),
  familyTraditions: z
    .string()
    .min(10, 'Please describe your family traditions related to the craft.'),
  craftHistory: z
    .string()
    .min(10, 'Please share some history about your craft.'),
  productDescription: z
    .string()
    .min(10, 'Please describe the product you want to feature.'),
});

// A simple hook for speech recognition
function useSpeechRecognition(onResult: (transcript: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.lang = 'en-US'; // Can be changed based on language switcher
      recog.onstart = () => setIsListening(true);
      recog.onend = () => setIsListening(false);
      recog.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      };
      setRecognition(recog);
    }
  }, [onResult]);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      recognition?.start();
    }
  };
  
  const isSupported = !!recognition;

  return { isListening, toggleListening, isSupported };
}

export function StoryTool() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      artisanBackground: '',
      familyTraditions: '',
      craftHistory: '',
      productDescription: '',
    },
  });

  const [activeField, setActiveField] = useState<keyof z.infer<typeof formSchema> | null>(null);

  const { isListening, toggleListening, isSupported } = useSpeechRecognition((transcript) => {
    if (activeField) {
      const currentVal = form.getValues(activeField);
      form.setValue(activeField, currentVal ? `${currentVal} ${transcript}`: transcript);
    }
  });


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await generateStoryAction(values);
      if (response.error) {
        throw new Error(response.error);
      }
      setResult(response.data!.heritageStory);
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

  const renderTextarea = (name: keyof z.infer<typeof formSchema>, label: string, placeholder: string) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <Textarea placeholder={placeholder} {...field} onFocus={() => setActiveField(name)} />
              {isSupported && (
                <Button 
                  type="button" 
                  size="icon" 
                  variant={isListening && activeField === name ? 'destructive' : 'ghost'}
                  className="absolute bottom-2 right-2 h-7 w-7" 
                  onClick={toggleListening}
                  disabled={!isSupported || (isListening && activeField !== name)}
                >
                  <Mic className="h-4 w-4" />
                </Button>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {renderTextarea('artisanBackground', 'Your Background', 'E.g., I am a third-generation weaver from Kanchipuram...')}
              {renderTextarea('familyTraditions', 'Family Traditions', 'E.g., Our family has been dyeing silk with natural pigments...')}
              {renderTextarea('craftHistory', 'Craft History', 'E.g., The art of Kalamkari in our village dates back to...')}
              {renderTextarea('productDescription', 'Product Description', 'E.g., This saree features a traditional annapakshi motif...')}

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Generate My Story
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
              AI is crafting your story...
            </p>
          </div>
        )}
        {result && (
          <Card className="w-full">
            <CardContent className="p-6">
              <h3 className="text-2xl font-headline text-primary mb-4">
                Your Generated Heritage Story
              </h3>
              <div
                className="prose prose-sm md:prose-base max-w-none prose-p:font-body"
                dangerouslySetInnerHTML={{ __html: result.replace(/\n/g, '<br />') }}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

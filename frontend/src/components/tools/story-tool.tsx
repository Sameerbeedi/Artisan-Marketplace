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

// 🔥 Firebase
import { storage } from '@/firebase';
import { ref, uploadBytes, getDownloadURL, FirebaseStorage, StorageReference } from 'firebase/storage';

const formSchema = z.object({
  productTitle: z.string().min(3, 'Please enter a product title.'),
  productDescription: z.string().min(5, 'Please enter a product description.'),
  materials: z.string().min(2, 'Please enter materials used.'),
  artisan_hours: z.coerce.number().min(1, 'Enter valid artisan hours'),
  state: z.string().min(2, 'Please select a state.'),
  productImage: z.array(z.instanceof(File)).optional().default([]),
});

interface StoryResult {
  isPainting: boolean;
  imageUrl?: string;
  classifiedAs?: string;
  creativeStory?: string;
  seoTags?: string[];
  minPrice?: number;
  maxPrice?: number;
  reasoning?: string;
  arModelUrl?: string;
  arGenerationStatus?: 'generating' | 'success' | 'failed' | 'not-applicable';
}

export function StoryTool() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<StoryResult | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);
  const { toast } = useToast();

  // Backend base URL
  const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://artisan-marketplace-production.up.railway.app';

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

  // Upload to Firebase Storage
  async function uploadImage(file: File): Promise<string> {
    try {
      if (!file) {
        throw new Error('No file provided for upload');
      }
      
      // Check if Firebase storage is available
      if (!storage) {
        console.log('⚠️ Firebase storage not available, using local fallback');
        // Create a local object URL as fallback
        const localUrl = URL.createObjectURL(file);
        console.log('✅ Local image URL:', localUrl);
        return localUrl;
      }
      
      const storageRef = ref(storage, `products/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      console.log('✅ Firebase image URL:', url);
      return url;
    } catch (error) {
      console.error('❌ Upload failed:', error);
      // Fallback to local URL if Firebase fails
      try {
        const localUrl = URL.createObjectURL(file);
        console.log('✅ Fallback local image URL:', localUrl);
        return localUrl;
      } catch (fallbackError) {
        throw new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    setDraftId(null);

    try {
      // ---------- STEP 1: Upload Image to Firebase ----------
      let imageUrl: string | undefined;
      if (values.productImage && values.productImage.length > 0 && values.productImage[0]) {
        imageUrl = await uploadImage(values.productImage[0]);
      }

      // ---------- STEP 2: Classify product ----------
      const formData = new FormData();
      formData.append('productTitle', values.productTitle);
      if (values.productImage && values.productImage.length > 0 && values.productImage[0]) {
        formData.append('file', values.productImage[0]);
      }

      const classifyRes = await fetch(
        `${backendBase}/classify_product`,
        { method: 'POST', body: formData }
      );
      if (!classifyRes.ok) throw new Error('Classification failed');
      const classifyData = await classifyRes.json();

      const category = classifyData.category || 'other';
      const isPainting = !!classifyData.isPainting;

      // ---------- STEP 3: Generate story ----------
      const storyRes = await fetch(
        `${backendBase}/generate_product_story`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productTitle: values.productTitle,
            productDescription: values.productDescription,
          }),
        }
      );
      if (!storyRes.ok) throw new Error('Story generation failed');
      const storyData = await storyRes.json();

      // ---------- STEP 4: Estimate price ----------
      const priceRes = await fetch(
        `${backendBase}/estimate_price`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category,
            materials: values.materials,
            artisan_hours: values.artisan_hours,
            state: values.state,
          }),
        }
      );
      if (!priceRes.ok) throw new Error('Price estimation failed');
      const priceData = await priceRes.json();

      // ---------- STEP 5: Save draft in Firestore ----------
      const saveRes = await fetch(
        `${backendBase}/save_product_draft`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: values.productTitle,
            description: values.productDescription,
            materials: values.materials,
            artisan_hours: values.artisan_hours,
            state: values.state,
            image_url: imageUrl,
            seoTags: storyData.seoTags,
            story: storyData.creativeStory, // ✅ now saved
            price: { min: priceData.minPrice, max: priceData.maxPrice },
            category,
            isPainting,
          }),
        }
      );
      if (!saveRes.ok) throw new Error('Saving draft failed');
      const saveData = await saveRes.json();

      // ---------- STEP 6: Generate AR Model (if painting) ----------
      let arModelUrl: string | undefined;
      let arGenerationStatus: 'generating' | 'success' | 'failed' | 'not-applicable' = 'not-applicable';
      
      if (isPainting && saveData.id) {
        try {
          arGenerationStatus = 'generating';
          console.log('🎯 Starting AR model generation for painting...');
          
          // Create FormData to send the image file
          const formData = new FormData();
          formData.append('file', values.productImage[0]);
          
          const arRes = await fetch(
            `${backendBase}/generate_ar_model/${saveData.id}`,
            {
              method: 'POST',
              body: formData
            }
          );
          
          const arData = await arRes.json();
          console.log('🎨 AR generation response:', arData);
          
          if (arData.success && arData.ar_model_url) {
            arModelUrl = arData.ar_model_url;
            arGenerationStatus = 'success';
            console.log('✅ AR model generated successfully:', arModelUrl);
          } else {
            arGenerationStatus = 'failed';
            console.warn('⚠️ AR generation failed:', arData.message || 'Unknown error');
          }
        } catch (arError) {
          arGenerationStatus = 'failed';
          console.error('❌ AR generation error:', arError);
        }
      }

      // ---------- COMBINE RESULTS ----------
      setResult({
        isPainting,
        imageUrl,
        classifiedAs: category,
        creativeStory: storyData.creativeStory,
        seoTags: storyData.seoTags,
        minPrice: priceData.minPrice,
        maxPrice: priceData.maxPrice,
        reasoning: priceData.reasoning,
        arModelUrl,
        arGenerationStatus,
      });
      setDraftId(saveData.id);

      toast({
        title: 'Draft saved successfully!',
        description: `Draft ID: ${saveData.id}${
          isPainting 
            ? arGenerationStatus === 'success' 
              ? ' • AR model generated!' 
              : arGenerationStatus === 'failed'
              ? ' • AR generation failed'
              : ' • AR model generating...'
            : ''
        }`,
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
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
              encType="multipart/form-data"
            >
              {/* Form Fields */}
              <FormField
                control={form.control}
                name="productTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Title</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., Mona Lisa Painting" {...field} />
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
                        placeholder="E.g., A traditional painting inspired by Mughal miniature art."
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
                      <Input placeholder="E.g., Canvas, Oil Paint" {...field} />
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
                      <Input type="number" placeholder="E.g., 40" {...field} />
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
                      <Input placeholder="E.g., Rajasthan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="productImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload Product Image</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const files = e.target.files;
                          field.onChange(files ? Array.from(files) : []);
                        }}
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
                Generate Story + Price + AR Model
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="flex flex-col items-start justify-center space-y-4">
        {isLoading && (
          <div className="text-center mt-10">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">AI is working...</p>
          </div>
        )}
        {result && (
          <Card className="w-full">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-2xl font-headline text-primary">
                Classification Result
              </h3>
              <p>
                <strong>Category:</strong> {result.classifiedAs}
              </p>
              <p>
                <strong>Is Painting?:</strong>{' '}
                {result.isPainting ? 'Yes 🎨' : 'No'}
              </p>
              {result.imageUrl && (
                <>
                  <img
                    src={result.imageUrl}
                    alt="Uploaded product"
                    className="max-w-xs rounded border"
                  />
                  <p className="text-xs break-all text-blue-600 underline">
                  </p>
                </>
              )}

              <h3 className="text-2xl font-headline text-primary">
                Generated Story
              </h3>
              <p>{result.creativeStory}</p>

              {result.seoTags && (
                <>
                  <h4 className="text-lg font-semibold">SEO Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.seoTags.map((tag, i) => (
                      <Badge key={i} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </>
              )}

              {result.minPrice && result.maxPrice && (
                <>
                  <h4 className="text-lg font-semibold">Estimated Price:</h4>
                  <p className="text-green-600 font-bold">
                    ₹{result.minPrice} – ₹{result.maxPrice}
                  </p>
                  <p className="text-muted-foreground">{result.reasoning}</p>
                </>
              )}

              {/* AR Model Section */}
              {result.isPainting && (
                <>
                  <h4 className="text-lg font-semibold">AR Model Status:</h4>
                  {result.arGenerationStatus === 'generating' && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span>Generating 3D AR model with Blender...</span>
                    </div>
                  )}
                  {result.arGenerationStatus === 'success' && result.arModelUrl && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-green-600">
                        <span>✅ AR model generated successfully!</span>
                      </div>
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <h5 className="font-medium mb-2">3D AR Preview:</h5>
                        <model-viewer
                          src={result.arModelUrl}
                          ios-src={result.arModelUrl.replace(".glb", ".usdz")}
                          alt="3D AR model of your product"
                          ar
                          ar-modes="scene-viewer quick-look webxr"
                          auto-rotate
                          camera-controls
                          style={{ width: "100%", height: "300px" }}
                          loading="eager"
                        ></model-viewer>
                        <p className="text-xs text-gray-500 mt-2">
                          Model URL: {result.arModelUrl}
                        </p>
                      </div>
                    </div>
                  )}
                  {result.arGenerationStatus === 'failed' && (
                    <div className="text-orange-600">
                      ⚠️ AR model generation failed. You can try generating it manually later.
                    </div>
                  )}
                  {result.arGenerationStatus === 'not-applicable' && (
                    <div className="text-gray-500">
                      AR generation is only available for paintings.
                    </div>
                  )}
                </>
              )}

              {/* ✅ Next Button */}
              {draftId && (
                <Button
                  className="mt-4"
                  onClick={() => {
                    window.location.href = `/product/${draftId}/ar`;
                  }}
                >
                  {result.arGenerationStatus === 'success' ? 'View Full AR Experience' : 'Continue to Product Page'} →
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

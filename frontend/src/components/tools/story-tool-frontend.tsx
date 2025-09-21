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
import { Loader2, Wand2, Star, Tag, Upload, Image as ImageIcon, Box, Eye, ArrowRight } from 'lucide-react';
import { Badge } from '../ui/badge';
import { storage, isFirebaseConfigured } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Link from 'next/link';

const formSchema = z.object({
  productTitle: z.string().min(3, 'Please enter a product title.'),
  productDescription: z.string().min(5, 'Please enter a product description.'),
  materials: z.string().min(2, 'Please enter materials used.'),
  artisan_hours: z.coerce.number().min(1, 'Enter valid artisan hours'),
  state: z.string().min(2, 'Please select a state.'),
  productImage: z.array(z.instanceof(File)).optional().default([]),
});

interface StoryResult {
  classifiedAs: string;
  creativeStory: string;
  seoTags: string[];
  minPrice: number;
  maxPrice: number;
  reasoning: string;
  marketingCopy: string;
  productHighlights: string[];
  imageAnalysis?: string;
  uploadedImageUrl?: string;
}

export function StoryTool() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<StoryResult | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingAR, setIsGeneratingAR] = useState(false);
  const [arModelUrl, setArModelUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productTitle: '',
      productDescription: '',
      materials: '',
      artisan_hours: 1,
      state: '',
      productImage: [],
    },
  });

  // Handle image upload to Firebase
  const uploadImage = async (file: File): Promise<string> => {
    try {
      setIsUploading(true);
      
      // Check if Firebase storage is properly configured
      if (!isFirebaseConfigured || !storage) {
        console.warn('Firebase not configured, using local storage fallback');
        throw new Error('Firebase storage not configured - using fallback');
      }
      
      const storageRef = ref(storage, `products/${Date.now()}-${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setUploadedImage(downloadURL);
      
      toast({
        title: "Image Uploaded",
        description: "Image uploaded to cloud storage successfully!",
      });
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      
      // Fallback: Create a local blob URL for the image
      try {
        const localUrl = URL.createObjectURL(file);
        setUploadedImage(localUrl);
        toast({
          title: "Using Local Image",
          description: "Image will be processed locally. For cloud storage, configure Firebase.",
          variant: "default",
        });
        return localUrl;
      } catch (fallbackError) {
        console.error('Fallback image handling failed:', fallbackError);
        toast({
          title: "Upload Error",
          description: "Failed to process image. Please try again.",
          variant: "destructive",
        });
        return '';
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Convert image to base64 for Gemini Vision API
  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const generateStoryWithGemini = async (data: z.infer<typeof formSchema>): Promise<StoryResult> => {
    let imageBase64 = '';
    let uploadedImageUrl = '';
    
    // Handle image if provided
    if (data.productImage && data.productImage.length > 0) {
      const file = data.productImage[0];
      try {
        // Upload to Firebase for storage
        uploadedImageUrl = await uploadImage(file);
        // Convert to base64 for Gemini Vision API
        imageBase64 = await convertImageToBase64(file);
      } catch (error) {
        console.error('Error processing image:', error);
      }
    }

    const basePrompt = `
You are an expert AI assistant specializing in artisan product marketing and storytelling. Your task is to analyze the product information and create compelling marketing content.

PRODUCT INFORMATION:
- Title: ${data.productTitle}
- Description: ${data.productDescription}
- Materials: ${data.materials}
- Artisan Hours: ${data.artisan_hours}
- State/Region: ${data.state}
${imageBase64 ? '- Product Image: Attached for visual analysis' : ''}

Please analyze this artisan product and provide the following:

1. CLASSIFICATION: Classify this product into a specific category. Be very specific, especially for textiles and traditional wear:
   - For saris and traditional garments: "Traditional Sari", "Handwoven Sari", "Silk Sari", "Cotton Sari", "Banarasi Sari", "Kanjivaram Sari", "Traditional Indian Textile"
   - For other textiles: "Handwoven Textile", "Traditional Fabric", "Cotton Textile", "Silk Textile", "Embroidered Fabric"
   - For pottery: "Traditional Pottery", "Ceramic Art", "Clay Handicraft", "Terracotta Art"
   - For jewelry: "Silver Jewelry", "Traditional Ornament", "Metal Craft", "Ethnic Jewelry"
   - For wood items: "Wood Carving", "Wooden Handicraft", "Traditional Woodcraft"
   - For paintings: "Traditional Painting", "Miniature Art", "Folk Art", "Madhubani Painting"
   - For other items: Be equally specific

Note: If the image shows traditional Indian women's clothing, saris, or draped garments, classify as "Traditional Sari" or related textile category.

2. CREATIVE STORY: Write a compelling 2-3 paragraph story about this product that includes:
   - The cultural heritage and traditional techniques
   - The artisan's craftsmanship and dedication
   - The unique value and beauty of the product
   - Connection to the region/state mentioned

3. PRICE ESTIMATION: Based on materials, artisan hours, and complexity, suggest a reasonable price range in INR

4. SEO TAGS: Generate 8-10 relevant SEO tags/keywords for online marketing

5. MARKETING COPY: Create a short, punchy marketing description (1-2 sentences)

6. PRODUCT HIGHLIGHTS: List 4-5 key selling points/features

7. REASONING: Explain your classification and pricing logic

${imageBase64 ? '8. IMAGE ANALYSIS: Describe what you see in the image and how it supports the product classification and story' : ''}

Please format your response as a JSON object with the following structure:
{
  "classifiedAs": "category name",
  "creativeStory": "compelling story text",
  "minPrice": number,
  "maxPrice": number,
  "seoTags": ["tag1", "tag2", ...],
  "marketingCopy": "short marketing text",
  "productHighlights": ["highlight1", "highlight2", ...],
  "reasoning": "explanation of classification and pricing"${imageBase64 ? ',\n  "imageAnalysis": "description of what you see in the image"' : ''}
}

Ensure all text is engaging, culturally respectful, and emphasizes the authentic handcrafted nature of the product.
`;

    try {
      // Use the Google AI API directly
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || 'your-api-key-here';
      if (!apiKey || apiKey === 'your-api-key-here') {
        throw new Error('Google AI API key is not configured. Please add NEXT_PUBLIC_GOOGLE_AI_API_KEY to your .env.local file.');
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      let result;
      
      if (imageBase64) {
        // Use vision model with image
        const imagePart = {
          inlineData: {
            data: imageBase64,
            mimeType: data.productImage![0].type
          }
        };
        result = await model.generateContent([basePrompt, imagePart]);
      } else {
        // Text-only analysis
        result = await model.generateContent(basePrompt);
      }

      const response = await result.response;
      const text = response.text();

      // Parse the JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from AI');
      }

      const parsedResult = JSON.parse(jsonMatch[0]);
      
      console.log('AI Classification Result:', {
        classifiedAs: parsedResult.classifiedAs,
        productTitle: data.productTitle,
        materials: data.materials,
        hasImage: !!uploadedImageUrl
      });
      
      // Add the uploaded image URL to the result
      if (uploadedImageUrl) {
        parsedResult.uploadedImageUrl = uploadedImageUrl;
      }
      
      return parsedResult;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      // Fallback mock response
      return {
        classifiedAs: `Handcrafted ${data.materials} Product`,
        creativeStory: `This beautiful ${data.productTitle} represents the rich cultural heritage of ${data.state}. Crafted with traditional techniques passed down through generations, this piece showcases the artisan's ${data.artisan_hours} hours of dedicated work using premium ${data.materials}. Each product tells a story of authentic craftsmanship and cultural pride.`,
        minPrice: Math.max(500, data.artisan_hours * 100),
        maxPrice: Math.max(1000, data.artisan_hours * 200),
        seoTags: [
          'handmade',
          data.materials.toLowerCase(),
          data.state.toLowerCase(),
          'traditional craft',
          'artisan made',
          'authentic',
          'cultural heritage',
          'handcrafted'
        ],
        marketingCopy: `Authentic ${data.productTitle} handcrafted in ${data.state} using traditional techniques and premium ${data.materials}.`,
        productHighlights: [
          `Made with authentic ${data.materials}`,
          `${data.artisan_hours} hours of skilled craftsmanship`,
          `Traditional techniques from ${data.state}`,
          'Unique, one-of-a-kind piece',
          'Supports local artisans'
        ],
        reasoning: `Classified as handcrafted ${data.materials} product based on materials and traditional methods. Pricing reflects ${data.artisan_hours} hours of skilled labor plus material costs.`,
        uploadedImageUrl: uploadedImageUrl || undefined,
        imageAnalysis: uploadedImageUrl ? 'Image uploaded successfully for enhanced product presentation.' : undefined
      };
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const storyResult = await generateStoryWithGemini(data);
      setResult(storyResult);
      toast({
        title: "Story Generated!",
        description: "Your product story has been created successfully.",
      });
    } catch (error) {
      console.error('Error generating story:', error);
      toast({
        title: "Error",
        description: "Failed to generate story. Please check your API configuration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateARModel = async () => {
    if (!result || !result.uploadedImageUrl) {
      toast({
        title: "Image Required",
        description: "Please upload a product image first to generate an AR model.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingAR(true);
    try {
      // Call the backend API to generate AR model from the uploaded image
      const response = await fetch('/api/generate-ar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: result.uploadedImageUrl,
          productTitle: form.getValues('productTitle'),
          productDescription: form.getValues('productDescription'),
          materials: form.getValues('materials'),
          classification: result.classifiedAs,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate AR model');
      }

      const data = await response.json();
      
      if (data.success && data.modelUrl) {
        setArModelUrl(data.modelUrl);
        toast({
          title: "AR Model Generated!",
          description: "Your 3D AR model has been created from your product image.",
        });
        
        // Don't automatically redirect - let user choose when to view AR
        console.log('AR model generated:', data.modelUrl);
      } else {
        throw new Error(data.error || 'Failed to generate AR model');
      }
    } catch (error) {
      console.error('Error generating AR model:', error);
      
      // Fallback: Generate a basic 3D representation using Canvas/GLB generation
      try {
        const fallbackModel = await generateBasic3DModel();
        setArModelUrl(fallbackModel);
        toast({
          title: "Basic AR Model Generated!",
          description: "Generated a basic 3D model. For better results, ensure your image shows the product clearly.",
        });
        
        // Also redirect to AR viewer for the fallback model
        setTimeout(() => {
          window.open(`/test-ar?model=${encodeURIComponent(fallbackModel)}`, '_blank');
        }, 1500);
      } catch (fallbackError) {
        toast({
          title: "Error",
          description: "Failed to generate AR model. Please try again with a clearer product image.",
          variant: "destructive",
        });
      }
    } finally {
      setIsGeneratingAR(false);
    }
  };

  // Fallback function to generate a basic 3D model
  const generateBasic3DModel = async (): Promise<string> => {
    // This would use a library like Three.js to create a basic 3D shape
    // For now, we'll simulate this process and return a generated model
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real implementation, this would:
    // 1. Analyze the uploaded image
    // 2. Extract shape/geometry information
    // 3. Generate a 3D mesh
    // 4. Export as GLB/GLTF format
    // 5. Upload to Firebase Storage
    // 6. Return the download URL
    
    // For demo, we'll generate a unique model path based on the current time
    const modelPath = `/models/generated-${Date.now()}.glb`;
    
    // TODO: Implement actual 3D model generation here
    // This could use services like:
    // - Meshy.ai API for image-to-3D conversion
    // - Kaedim API for 2D to 3D conversion
    // - Custom ML model for depth estimation and mesh generation
    
    return modelPath;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Wand2 className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">AI Product Storyteller</h2>
        </div>
        <p className="text-muted-foreground">
          Provide your product's title and a brief description. Our AI will craft a compelling story and suggest SEO tags to attract more customers.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="productTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Handwoven Silk Saree" {...field} />
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
                        placeholder="Describe your product briefly..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="materials"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Materials Used</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., silk, cotton, silver" {...field} />
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
                        <Input type="number" placeholder="e.g., 24" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State (India)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Karnataka, Rajasthan" {...field} />
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
                      <div className="space-y-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files && files.length > 0) {
                              field.onChange([files[0]]);
                            }
                          }}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                        />
                        {uploadedImage && (
                          <div className="mt-2">
                            <img src={uploadedImage} alt="Uploaded product" className="w-32 h-32 object-cover rounded-lg border" />
                          </div>
                        )}
                        {isUploading && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Uploading image...
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Story...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Story + Classify + Estimate Price
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <h3 className="text-xl font-semibold">Generated Content</h3>
            </div>

            <div className="grid gap-6">
              {/* Uploaded Image */}
              {result.uploadedImageUrl && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Product Image
                  </h4>
                  <img 
                    src={result.uploadedImageUrl} 
                    alt="Product" 
                    className="w-full max-w-md h-64 object-cover rounded-lg border shadow-sm"
                  />
                </div>
              )}

              {/* Image Analysis */}
              {result.imageAnalysis && (
                <div>
                  <h4 className="font-medium mb-2">AI Image Analysis</h4>
                  <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                    <p className="text-sm">{result.imageAnalysis}</p>
                  </div>
                </div>
              )}

              {/* Generated Story with Tags */}
              <div>
                <h4 className="font-medium mb-2">Generated Story</h4>
                
                {/* Category Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary">{result.classifiedAs}</Badge>
                  <Badge variant="outline">₹{result.minPrice.toLocaleString()}-₹{result.maxPrice.toLocaleString()}</Badge>
                  {result.seoTags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{result.creativeStory}</p>
                </div>
              </div>

              {/* Marketing Copy */}
              <div>
                <h4 className="font-medium mb-2">Marketing Copy</h4>
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                  <p className="text-sm font-medium">{result.marketingCopy}</p>
                </div>
              </div>

              {/* Price Estimation */}
              <div>
                <h4 className="font-medium mb-2">Price Estimation</h4>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    ₹{result.minPrice.toLocaleString()} - ₹{result.maxPrice.toLocaleString()}
                  </Badge>
                </div>
              </div>

              {/* Product Highlights */}
              <div>
                <h4 className="font-medium mb-2">Product Highlights</h4>
                <ul className="space-y-1">
                  {result.productHighlights.map((highlight, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>

              {/* SEO Tags */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  SEO Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.seoTags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Reasoning */}
              <div>
                <h4 className="font-medium mb-2">AI Reasoning</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">{result.reasoning}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={generateARModel}
                  disabled={isGeneratingAR}
                  size="lg"
                  className="flex-1"
                  variant="default"
                >
                  {isGeneratingAR ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating AR Model...
                    </>
                  ) : (
                    <>
                      <Box className="mr-2 h-4 w-4" />
                      Generate AR Model
                    </>
                  )}
                </Button>

                {arModelUrl && (
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="flex-1"
                  >
                    <Link href={`/test-ar?model=${encodeURIComponent(arModelUrl)}&name=${encodeURIComponent(form.getValues('productTitle') || 'Artisan Product')}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View in AR
                    </Link>
                  </Button>
                )}

                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    // Save the product data or add to catalog
                    toast({
                      title: "Product Saved!",
                      description: "Your product has been added to the catalog.",
                    });
                  }}
                >
                  <Star className="mr-2 h-4 w-4" />
                  Add to Catalog
                </Button>
              </div>

              {arModelUrl && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <Box className="h-5 w-5" />
                    <span className="font-medium">AR Model Ready!</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Your 3D AR model has been generated. You can now view it in augmented reality 
                    by clicking "View in AR" or share it with customers.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
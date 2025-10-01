"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input"; // ✅ added Input


export default function ProductARPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [arUrl, setArUrl] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [generatingAR, setGeneratingAR] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [userPrice, setUserPrice] = useState(""); // ✅ new state
  const [priceError, setPriceError] = useState<string | null>(null); // ✅ inline error


  const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://artisan-marketplace-pvy1.onrender.com';

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`${backendBase}/get_product/${productId}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          setArUrl(data.ar_model_url || null);
        } else {
          // Fallback to local mock data if backend is not ready
          console.log("Backend not ready, using fallback mock data");
          const mockProduct = {
            id: productId,
            title: "Traditional Ceramic Vase",
            category: "pottery",
            isPainting: false,
            story: "A beautiful handcrafted ceramic vase made using traditional techniques passed down through generations.",
            image_url: `${backendBase}/ar_models/${productId}.glb`,
            ar_model_url: `${backendBase}/ar_models/${productId}.glb`,
            status: "published",
            price: { min: 150, max: 250 },
            finalPrice: 200,
            technique: "Traditional pottery wheel",
            materials: "Clay, ceramic glaze",
            dimensions: "Height: 25cm, Width: 15cm"
          };
          setProduct(mockProduct);
          setArUrl(mockProduct.ar_model_url);
        }
      } catch (err) {
        console.error("❌ Failed to fetch product:", err);
        // Fallback to local mock data on error
        const mockProduct = {
          id: productId,
          title: "Traditional Ceramic Vase",
          category: "pottery",
          isPainting: false,
          story: "A beautiful handcrafted ceramic vase made using traditional techniques passed down through generations.",
          image_url: `${backendBase}/ar_models/${productId}.glb`,
          ar_model_url: `${backendBase}/ar_models/${productId}.glb`,
          status: "published",
          price: { min: 150, max: 250 },
          finalPrice: 200,
          technique: "Traditional pottery wheel",
          materials: "Clay, ceramic glaze",
          dimensions: "Height: 25cm, Width: 15cm"
        };
        setProduct(mockProduct);
        setArUrl(mockProduct.ar_model_url);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productId, backendBase]);

  async function generateAR() {
    setGeneratingAR(true);
    setError(null);
    setDebugInfo(null);
    
    try {
      console.log('🎯 Starting AR generation for product:', productId);
      console.log('🖼️ Product image URL:', product?.image_url);
      
      if (!product?.image_url) {
        throw new Error('No image URL available for this product');
      }
      
      // Fetch the image from the URL and convert to File
      console.log('📥 Fetching image from URL...');
      const imageResponse = await fetch(product.image_url);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
      }
      
      const imageBlob = await imageResponse.blob();
      const imageFile = new File([imageBlob], 'product-image.jpg', { type: imageBlob.type || 'image/jpeg' });
      console.log('✅ Image converted to File:', imageFile.name, imageFile.size, 'bytes');
      
      // Send the file to the backend
      const formData = new FormData();
      formData.append('file', imageFile);
      
      console.log('📤 Sending AR generation request...');
      const res = await fetch(`${backendBase}/generate_ar_model/${productId}`, { 
        method: "POST",
        body: formData
      });
      
      const data = await res.json();
      console.log('📊 AR generation response:', data);
      
      setDebugInfo(data);
      
      if (data.success) {
        setArUrl(data.ar_model_url);
        console.log('✅ AR model generated:', data.ar_model_url);
      } else {
        const errorMsg = data.message || data.error || 'AR model generation failed';
        setError(errorMsg);
        console.error('❌ AR generation failed:', errorMsg);
      }
    } catch (err) {
      const errorMsg = `Network error: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMsg);
      console.error('❌ AR generation error:', err);
    } finally {
      setGeneratingAR(false);
    }
  }

  async function publishProduct() {
    const price = parseFloat(userPrice);

    if (isNaN(price) || price <= 0) {
      setPriceError("❌ Please enter a valid positive price.");
      return;
    }
    setPriceError(null);

    setPublishing(true);
    try {
      const res = await fetch(`${backendBase}/publish_product/${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price }),
      });
      const data = await res.json();
      alert(`✅ Product published at ₹${price}: ${data.id}`);

      // ✅ redirect to marketplace after publish
      router.push("/marketplace");
    } catch (err) {
      console.error("❌ Publish error:", err);
    } finally {
      setPublishing(false);
    }
  }


  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          {/* 🔹 Title */}
          <h2 className="text-2xl font-bold">{product.title}</h2>

          {/* 🔹 SEO Tags */}
          {product.seoTags && (
            <div className="flex flex-wrap gap-2">
              {product.seoTags.map((tag: string, i: number) => (
                <Badge key={i} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* 🔹 Product Image */}
          {product.image_url && (
            <img
              src={product.image_url}
              alt="Product"
              className="max-w-xs rounded border"
            />
          )}

          {/* 🔹 Generated Story */}
          {product.story && (
            <>
              <h3 className="text-lg font-semibold">Generated Story</h3>
              <p className="text-gray-700">{product.story}</p>
            </>
          )}

          {/* 🔹 Price Range */}
          {product.price && (
            <p className="text-green-600 font-bold">
              ₹{product.price.min} – ₹{product.price.max}
            </p>
          )}

          {/* 🔹 Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="text-red-800 font-medium">AR Generation Error</h4>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* 🔹 Debug Info */}
          {debugInfo && (
            <details className="bg-gray-50 border rounded-lg p-4">
              <summary className="cursor-pointer font-medium">Debug Information</summary>
              <pre className="mt-2 text-xs overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          )}

          {/* 🔹 Generate AR Model Button */}
          {product.isPainting && !arUrl && (
            <Button onClick={generateAR} disabled={generatingAR}>
              {generatingAR ? "Generating AR..." : "Generate AR Model"}
            </Button>
          )}

          {/* 🔹 Show AR Model */}
          {arUrl && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">3D AR Model</h3>
              <p className="text-sm text-gray-600">
                Point your camera at a flat surface to place the 3D model in AR
              </p>
              <model-viewer
                src={arUrl}
                ios-src={arUrl.replace(".glb", ".usdz")} // ✅ Quick Look for iOS
                alt="3D model of your product"
                ar
                ar-modes="scene-viewer quick-look webxr"
                auto-rotate
                camera-controls
                style={{ width: "100%", height: "500px" }}
                loading="eager"
                onError={(e: any) => {
                  console.error('❌ Model viewer error:', e);
                  setError('Failed to load 3D model. The model file might be corrupted.');
                }}
                onLoad={() => {
                  console.log('✅ 3D model loaded successfully');
                }}
              ></model-viewer>
              <p className="text-xs text-gray-500">
                Model URL: {arUrl}
              </p>
            </div>
          )}

          {/* 🔹 User Price Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Enter your price
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={userPrice}
                onChange={(e) => setUserPrice(e.target.value)}
                placeholder="e.g. 1500"
                className="w-40"
              />
              <Button
                onClick={publishProduct}
                disabled={publishing}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {publishing ? "Publishing..." : "Publish Product"}
              </Button>
            </div>
            {priceError && (
              <p className="text-red-600 text-sm">{priceError}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProductARPage() {
  const params = useParams();
  const productId = params?.id as string;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [arUrl, setArUrl] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [generatingAR, setGeneratingAR] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/get_product/${productId}`
        );
        const data = await res.json();
        setProduct(data);
        setArUrl(data.ar_model_url || null);
      } catch (err) {
        console.error("❌ Failed to fetch product:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productId]);

  async function generateAR() {
    setGeneratingAR(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/generate_ar_model/${productId}`,
        { method: "POST" }
      );
      const data = await res.json();
      if (data.success) {
        setArUrl(data.ar_model_url);
      } else {
        alert("⚠️ AR model generation failed.");
      }
    } catch (err) {
      console.error("❌ AR generation error:", err);
    } finally {
      setGeneratingAR(false);
    }
  }

  async function publishProduct() {
    setPublishing(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/publish_product/${productId}`,
        { method: "POST" }
      );
      const data = await res.json();
      alert(`✅ Product published: ${data.id}`);
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

          {/* 🔹 Generate AR Model Button */}
          {product.isPainting && !arUrl && (
            <Button onClick={generateAR} disabled={generatingAR}>
              {generatingAR ? "Generating AR..." : "Generate AR Model"}
            </Button>
          )}

          {/* 🔹 Show AR Model */}
          {arUrl && (
            <model-viewer
              src={arUrl}
              ios-src={arUrl.replace(".glb", ".usdz")} // ✅ Quick Look for iOS
              alt="3D model"
              ar
              ar-modes="scene-viewer quick-look webxr"
              auto-rotate
              camera-controls
              style={{ width: "100%", height: "500px" }}
            ></model-viewer>
          )}

          {/* 🔹 Publish Product Button */}
          <Button
            onClick={publishProduct}
            disabled={publishing}
            className="bg-green-600 hover:bg-green-700"
          >
            {publishing ? "Publishing..." : "Publish Product"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

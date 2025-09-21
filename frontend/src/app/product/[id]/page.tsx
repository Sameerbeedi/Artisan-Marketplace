"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cartMessage, setCartMessage] = useState<string | null>(null);

  const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || "https://artisan-marketplace-production.up.railway.app";

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`${backendBase}/get_product/${id}`);
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error("❌ Failed to fetch product:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProduct();
  }, [id]);

  const addToCart = () => {
    if (!product) return;

    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");

    // Avoid duplicate entries
    const alreadyInCart = existingCart.some((item: any) => item.id === product.id);
    if (!alreadyInCart) {
        existingCart.push({
        id: product.id,
        title: product.title,
        price: product.finalPrice || product.price?.min || product.price,
        image: product.image_url,
        artisan: product.artisan || "Unknown",
        quantity: 1,
        });
        localStorage.setItem("cart", JSON.stringify(existingCart));

        // ✅ tell Navbar to update
        window.dispatchEvent(new Event("cartUpdated"));

        setCartMessage("✅ Added to cart!");
    } else {
        setCartMessage("⚠️ Already in cart!");
    }

    setTimeout(() => setCartMessage(null), 2000); // auto-hide message
    };


  if (loading) return <p className="text-center py-10">Loading...</p>;
  if (!product) return <p className="text-center py-10">Product not found.</p>;

  return (
    <div className="max-w-4xl mx-auto py-10">
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Image */}
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full max-h-[500px] object-contain rounded"
            />
          )}

          {/* Title */}
          <h1 className="text-3xl font-bold">{product.title}</h1>

          {/* Artist */}
          <p className="text-lg text-gray-700">
            By <span className="font-semibold">{product.artisan || "Unknown"}</span>
          </p>

          {/* Price */}
          <p className="text-2xl font-bold text-green-600">
            ₹{product.finalPrice || product.price?.min || product.price}
          </p>

          {/* SEO Tags */}
          {product.seoTags && product.seoTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {product.seoTags.map((tag: string, i: number) => (
                <Badge key={i} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Heritage Storytelling */}
          {product.story && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold">Heritage Storytelling</h2>
              <p className="text-gray-700 mt-2 leading-relaxed">{product.story}</p>
            </div>
          )}

          {/* Add to Cart Button */}
          <div className="mt-6">
            <Button
              onClick={addToCart}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Add to Cart
            </Button>
            {cartMessage && (
              <p className="mt-2 text-sm text-gray-600">{cartMessage}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

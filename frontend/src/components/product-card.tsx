"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Heart } from "lucide-react";
import { Badge } from "./ui/badge";

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  artisan: string;
  category: string;
  aiHint: string;
};

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);

  // Debug logging
  console.log('ProductCard Debug:', {
    productId: product.id,
    originalImageUrl: product.imageUrl,
    imgError,
    productName: product.name
  });

  // ✅ Pick URL with reliable fallback
  const imageUrl =
    !imgError && product.imageUrl
      ? product.imageUrl
      : "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=500&fit=crop&auto=format";

  console.log('Final imageUrl used:', imageUrl);

  return (
    <Card className="group flex flex-col overflow-hidden h-full transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <CardHeader className="p-0">
        <div className="relative h-56 w-full">
          {/* 🔹 Try Next.js Image */}
          {!imgError ? (
            <Image
              src={imageUrl}
              alt={product.name || "Product image"}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={product.aiHint}
              onError={() => {
                console.error("❌ Next.js Image failed for:", {
                  url: imageUrl,
                  productId: product.id,
                  productName: product.name,
                  originalUrl: product.imageUrl
                });
                setImgError(true); // switch to fallback <img>
              }}
            />
          ) : (
            // 🔹 Fallback to plain <img>
            <img
              src={imageUrl}
              alt={product.name || "Product image"}
              className="object-cover w-full h-full"
            />
          )}

          <Badge variant="secondary" className="absolute top-2 left-2">
            {product.category}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/70 hover:bg-white rounded-full text-muted-foreground hover:text-primary"
          >
            <Heart className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col">
        <CardTitle className="font-headline text-lg leading-tight mb-2">
          {/* ✅ Clicking title goes to details page */}
          <Link href={`/product/${product.id}`}>{product.name}</Link>
        </CardTitle>

        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">
                {product.artisan?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">By</span>
            <Badge
              variant="outline"
              className="text-xs font-medium text-primary border-primary/30"
            >
              {product.artisan || 'Unknown Artisan'}
            </Badge>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <p className="text-xl font-semibold text-primary">
          ₹{typeof product.price === 'object' && product.price !== null 
            ? (product.price as any)?.min || (product.price as any)?.max || 0
            : product.price || 0}
        </p>
        {/* ✅ View Details now links to /product/[id] */}
        <Button variant="secondary" asChild>
          <Link href={`/product/${product.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

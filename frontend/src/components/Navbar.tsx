"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
        const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
        const totalItems = storedCart.reduce(
        (sum: number, item: any) => sum + item.quantity,
        0
        );
        setCartCount(totalItems);
    };

    updateCartCount();

    // ✅ Listen for cart updates in this tab
    window.addEventListener("cartUpdated", updateCartCount);

    // ✅ Listen for updates from *other* tabs
    window.addEventListener("storage", updateCartCount);

    return () => {
        window.removeEventListener("cartUpdated", updateCartCount);
        window.removeEventListener("storage", updateCartCount);
    };
    }, []);

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-white shadow-md">
      {/* Left - Logo */}
      <Link href="/" className="text-2xl font-bold text-orange-600">
        Artisan Marketplace
      </Link>

      {/* Right - Cart */}
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" className="relative">
          <Link href="/cart">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
        </Button>
      </div>
    </nav>
  );
}

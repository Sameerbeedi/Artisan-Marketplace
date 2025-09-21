"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(storedCart);
  }, []);

  const updateCart = (newCart: any[]) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cartUpdated")); // ✅ Update navbar count
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    if (quantity <= 0) return;
    const newCart = [...cart];
    newCart[index].quantity = quantity;
    updateCart(newCart);
  };

  const handleRemove = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    updateCart(newCart);
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-6">
      <h1 className="text-3xl font-bold">Your Cart 🛒</h1>

      {cart.length === 0 ? (
        <p className="text-gray-600">Your cart is empty.</p>
      ) : (
        <Card>
          <CardContent className="p-6 space-y-4">
            {cart.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b pb-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <h2 className="font-semibold">{item.name}</h2>
                    <p className="text-sm text-gray-600">
                      By {item.artisan || "Unknown"}
                    </p>
                    <p className="text-primary font-bold">₹{item.price}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(index, parseInt(e.target.value))
                    }
                    className="w-16"
                  />
                  <Button
                    variant="destructive"
                    onClick={() => handleRemove(index)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}

            {/* ✅ Total Price */}
            <div className="flex justify-between items-center pt-4">
              <h2 className="text-xl font-bold">Total:</h2>
              <p className="text-2xl font-bold text-green-600">
                ₹{totalAmount.toFixed(2)}
              </p>
            </div>

            {/* ✅ Checkout Button */}
            <Button
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            onClick={() => (window.location.href = "/checkout")}
            >
            Proceed to Checkout
            </Button>

          </CardContent>
        </Card>
      )}
    </div>
  );
}

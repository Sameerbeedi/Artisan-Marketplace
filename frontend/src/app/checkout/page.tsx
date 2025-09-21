"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CheckoutPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(storedCart);
  }, []);

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleConfirmPurchase = () => {
    if (!name || !address || !phone) {
      alert("❌ Please fill in all shipping details");
      return;
    }

    // ✅ Save order to localStorage (or later push to backend)
    const order = {
      id: Date.now(),
      items: cart,
      totalAmount,
      customer: { name, address, phone },
      createdAt: new Date().toISOString(),
    };

    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    orders.push(order);
    localStorage.setItem("orders", JSON.stringify(orders));

    // ✅ Clear cart
    localStorage.removeItem("cart");
    window.dispatchEvent(new Event("cartUpdated"));

    alert("✅ Order confirmed! Thank you for your purchase.");
    window.location.href = "/"; // redirect to homepage
  };

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-6">
      <h1 className="text-3xl font-bold">Checkout</h1>

      {cart.length === 0 ? (
        <p className="text-gray-600">Your cart is empty.</p>
      ) : (
        <>
          {/* 🛒 Order Summary */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">Order Summary</h2>
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between border-b pb-2">
                    <span>
                    {item.name || item.title} × {item.quantity}
                    </span>
                    <span>₹{item.price * item.quantity}</span>
                </div>
                ))}
              <div className="flex justify-between font-bold pt-4">
                <span>Total</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* 🚚 Shipping Details */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">Shipping Details</h2>
              <Input
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <Input
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* ✅ Confirm Button */}
          <Button
            onClick={handleConfirmPurchase}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            Confirm Purchase
          </Button>
        </>
      )}
    </div>
  );
}

"use client";

import dynamic from "next/dynamic";

const ARViewer = dynamic(() => import("@/components/ARViewer"), { ssr: false });

export default function TestAR() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">AR Test – Artisan Painting</h1>
      <ARViewer modelUrl="/models/PaintingMaterial.glb" altText="Test AR Model" />
    </div>
  );
}

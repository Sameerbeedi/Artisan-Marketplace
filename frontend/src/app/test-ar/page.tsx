"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const ARViewer = dynamic(() => import("@/components/ARViewer"), { ssr: false });

function ARViewerContent() {
  const searchParams = useSearchParams();
  const modelUrl = searchParams.get('model');
  const productName = searchParams.get('name') || 'Artisan Product';

  if (!modelUrl) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">AR Viewer – {productName}</h1>
        <div className="text-center p-8">
          <div className="text-4xl mb-4">🚫</div>
          <h2 className="text-lg font-semibold mb-2">No AR Model Specified</h2>
          <p className="text-gray-600">Please generate an AR model first using the storytelling tool.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">AR Viewer – {productName}</h1>
      <div className="mb-4 text-sm text-gray-600">
        <p>Point your camera at a flat surface to place the 3D model in AR</p>
        <p>Model: {modelUrl}</p>
        <p className="text-xs text-blue-500">Generated uniquely from your uploaded image</p>
      </div>
      <ARViewer modelUrl={modelUrl} altText={`AR Model of ${productName}`} />
    </div>
  );
}

export default function TestAR() {
  return (
    <Suspense fallback={
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Loading AR Viewer...</h1>
        <div className="animate-pulse bg-gray-200 h-64 rounded"></div>
      </div>
    }>
      <ARViewerContent />
    </Suspense>
  );
}

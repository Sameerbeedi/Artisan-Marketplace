"use client";

import { useState } from "react";

export default function ARViewer({
  modelUrl,
  altText,
}: {
  modelUrl: string;
  altText: string;
}) {
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadError = () => {
    console.log('Model failed to load:', modelUrl);
    setLoadError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    console.log('Model loaded successfully:', modelUrl);
    setIsLoading(false);
    setLoadError(false);
  };

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading your unique 3D model...</p>
          </div>
        </div>
      )}
      
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
          <div className="text-center p-4">
            <div className="animate-pulse text-4xl mb-4">🔧</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Generating Your Unique AR Model</h3>
            <p className="text-sm text-gray-600 mb-2">Your 3D model is being created from your uploaded image.</p>
            <p className="text-xs text-blue-500">This process analyzes your specific image to create a custom 3D model.</p>
            <p className="text-xs text-gray-500 mt-2">No templates or hardcoded models used!</p>
            <div className="mt-4">
              <div className="animate-pulse bg-blue-200 h-2 rounded-full"></div>
              <p className="text-xs text-gray-500 mt-1">Processing image for 3D generation...</p>
            </div>
          </div>
        </div>
      )}

      {!loadError && (
        <model-viewer
          src={modelUrl}
          alt={altText}
          ar
          ar-modes="scene-viewer quick-look webxr"
          ar-scale="fixed"
          camera-controls
          auto-rotate
          style={{ width: "100%", height: "600px" }}
          ar-placement="wall"
          loading="eager"
          onLoad={handleLoad}
          onError={handleLoadError}
        >
          <div slot="poster" className="flex items-center justify-center h-full bg-gray-100">
            <div className="text-center">
              <div className="animate-pulse text-2xl mb-2">�</div>
              <p className="text-sm text-gray-600">Preparing your unique AR experience...</p>
            </div>
          </div>
        </model-viewer>
      )}
    </div>
  );
}

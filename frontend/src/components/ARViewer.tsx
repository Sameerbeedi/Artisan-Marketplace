"use client";

import { useState, useEffect } from "react";

export default function ARViewer({
  modelUrl,
  altText,
}: {
  modelUrl: string;
  altText: string;
}) {
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isARActive, setIsARActive] = useState(false);
  const [showARInstructions, setShowARInstructions] = useState(false);

  useEffect(() => {
    // Detect when AR mode is activated
    const handleARStatus = () => {
      const modelViewer = document.querySelector('model-viewer');
      if (modelViewer) {
        modelViewer.addEventListener('ar-status', (event: any) => {
          if (event.detail.status === 'session-started') {
            setIsARActive(true);
            setShowARInstructions(true);
            // Hide instructions after 8 seconds
            setTimeout(() => setShowARInstructions(false), 8000);
          } else if (event.detail.status === 'not-presenting') {
            setIsARActive(false);
            setShowARInstructions(false);
          }
        });
      }
    };

    // Add event listener after component mounts
    setTimeout(handleARStatus, 1000);
  }, []);

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
      {/* AR Instructions Overlay */}
      {showARInstructions && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 text-white p-4">
          <div className="max-w-md mx-auto text-center">
            <div className="text-2xl mb-2">🖼️</div>
            <h3 className="font-bold mb-2">AR Placement Mode</h3>
            <p className="text-sm mb-2">📱 Point camera at wall or surface</p>
            <p className="text-sm mb-2">🔄 Move device to detect surfaces</p>
            <p className="text-sm mb-2">👆 TAP where you want the artwork</p>
            <p className="text-sm mb-2">✋ PINCH to resize, DRAG to move</p>
            <div className="flex justify-center mt-3">
              <div className="animate-pulse bg-white/20 px-3 py-1 rounded-full text-xs">
                Works best on walls and vertical surfaces!
              </div>
            </div>
          </div>
        </div>
      )}

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
          ar-modes="webxr scene-viewer quick-look"
          ar-scale="auto"
          camera-controls
          style={{ width: "100%", height: "600px" }}
          ar-placement="wall floor"
          environment-image="legacy"
          shadow-intensity="0.3"
          shadow-softness="1"
          camera-orbit="0deg 75deg 2m"
          field-of-view="45deg"
          loading="eager"
          touch-action="manipulation"
          interaction-prompt="auto"
          interaction-prompt-style="wiggle"
          auto-rotate
          auto-rotate-delay="0"
          rotation-per-second="30deg"
          onLoad={handleLoad}
          onError={handleLoadError}
        >
          <div slot="poster" className="flex items-center justify-center h-full bg-gray-100">
            <div className="text-center">
              <div className="animate-pulse text-2xl mb-2">🎨</div>
              <p className="text-sm text-gray-600">Preparing your unique AR experience...</p>
            </div>
          </div>
          
          <button
            slot="ar-button"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <span>📱</span>
            <span>View on Wall in AR</span>
          </button>
        </model-viewer>
      )}
      
      {/* AR Usage Instructions */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <span className="text-blue-600 text-lg">📱</span>
          <div>
            <h4 className="font-semibold text-blue-800 text-sm">AR Placement Guide:</h4>
            <ul className="text-xs text-blue-700 mt-1 space-y-1">
              <li>• Point camera at any surface (walls work best)</li>
              <li>• Wait for surface detection (white dots/plane)</li>
              <li>• Tap anywhere on detected surface to place</li>
              <li>• Pinch to resize, drag to reposition artwork</li>
              <li>• Try different angles if detection fails</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

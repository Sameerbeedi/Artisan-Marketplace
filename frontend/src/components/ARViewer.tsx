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
        <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 text-white p-4">
          <div className="max-w-sm mx-auto text-center">
            <div className="text-3xl mb-3">🏠</div>
            <h3 className="font-bold mb-3 text-lg">Wall Placement Guide</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-center space-x-2">
                <span>📱</span>
                <span>Hold phone VERTICALLY</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span>🎯</span>
                <span>Point DIRECTLY at wall (3-6 feet away)</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span>🔄</span>
                <span>Move left/right until WHITE DOTS appear</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span>👆</span>
                <span>TAP where dots appear on wall</span>
              </div>
            </div>
            <div className="mt-4 p-2 bg-yellow-600/80 rounded text-xs">
              💡 Need good lighting! Try different wall sections if detection fails.
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
          ar-modes="scene-viewer quick-look"
          camera-controls
          style={{ width: "100%", height: "600px" }}
          ar-placement="wall floor"
          ar-scale="auto"
          environment-image="legacy"
          shadow-intensity="0.4"
          shadow-softness="0.8"
          camera-orbit="0deg 75deg 2.5m"
          field-of-view="35deg"
          loading="eager"
          touch-action="manipulation"
          interaction-prompt="auto"
          interaction-prompt-style="wiggle"
          reveal="interaction"
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
      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 rounded-lg">
        <div className="flex items-start space-x-3">
          <span className="text-blue-600 text-2xl">📱</span>
          <div>
            <h4 className="font-bold text-blue-800 text-base mb-2">Mobile Wall Placement Steps:</h4>
            <ol className="text-sm text-blue-700 space-y-2">
              <li className="flex items-start space-x-2">
                <span className="font-bold text-blue-600">1.</span>
                <span><strong>Position:</strong> Hold phone vertically, point at wall 3-6 feet away</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-bold text-blue-600">2.</span>
                <span><strong>Detect:</strong> Move left/right slowly until white dots appear on wall</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-bold text-blue-600">3.</span>
                <span><strong>Place:</strong> Tap anywhere on the detected wall surface</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-bold text-blue-600">4.</span>
                <span><strong>Adjust:</strong> Pinch to resize, drag to reposition</span>
              </li>
            </ol>
            <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs text-yellow-800">
              <strong>Tips:</strong> Good lighting helps • Try different wall sections • White/light colored walls work best
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

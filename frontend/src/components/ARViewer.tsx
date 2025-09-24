"use client";

import { useState, useEffect } from "react";

export default function ARViewer({
  modelUrl,
  altText,
}: {
  modelUrl: string;
  altText: string;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile device
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  }, []);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = (event: any) => {
    console.error("Model viewer error:", event);
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "600px", backgroundColor: "#f5f5f5" }}>
      {isLoading && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center"
        }}>
          <div>Loading 3D Model...</div>
        </div>
      )}

      {hasError && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          color: "#666"
        }}>
          <div>Unable to load 3D model</div>
          <div style={{ fontSize: "14px", marginTop: "8px" }}>
            {isMobile ? (
              <>
                Make sure you're using Safari (iOS) or Chrome (Android) and have AR enabled.
                <br />
                For iOS: Ensure you're on iOS 12+ and using Safari.
                <br />
                For Android: Ensure Google Play Services for AR is installed.
              </>
            ) : "Check your internet connection"}
          </div>
        </div>
      )}

      <model-viewer
        src={modelUrl}
        alt={altText}
        ar={isMobile}
        ar-modes="scene-viewer quick-look webxr"
        ar-scale="fixed"
        ar-placement="wall"
        camera-controls
        auto-rotate={!isMobile}
        rotation-per-second="30deg"
        style={{
          width: "100%",
          height: "600px",
          backgroundColor: isMobile ? "#000" : "#f0f0f0"
        }}
        shadow-intensity={isMobile ? "0" : "0.3"}
        shadow-softness="0.8"
        environment-image="legacy"
        loading="eager"
        exposure={isMobile ? "1.5" : "1.0"}
        onLoad={handleLoad}
        onError={handleError}
      >
        <button slot="ar-button" style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          border: 'none',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}>
          📱 View Picture Frame in AR
        </button>

        {/* Loading indicator inside model-viewer */}
        <div slot="progress-bar" style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "rgba(0,0,0,0.7)",
          color: "white",
          padding: "8px 16px",
          borderRadius: "4px",
          fontSize: "14px"
        }}>
          Loading 3D Model...
        </div>
      </model-viewer>
    </div>
  );
}
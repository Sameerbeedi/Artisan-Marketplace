"use client";

export default function ARViewer({
  modelUrl,
  altText,
}: {
  modelUrl: string;
  altText: string;
}) {
  return (
    <model-viewer
      src={modelUrl}
      alt={altText}
      ar
      ar-modes="scene-viewer quick-look"
      ar-scale="fixed"
      ar-placement="wall"
      camera-controls
      style={{ width: "100%", height: "600px" }}
      shadow-intensity="0.3"
      shadow-softness="0.8"
      environment-image="legacy"
      loading="eager"
    >
      <button slot="ar-button" style={{
        backgroundColor: '#3b82f6',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        border: 'none',
        fontSize: '16px',
        fontWeight: 'bold'
      }}>
        📱 View Picture Frame in AR
      </button>
    </model-viewer>
  );
}

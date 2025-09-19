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
      ar-modes="scene-viewer quick-look webxr"
      ar-scale="fixed"
      camera-controls
      auto-rotate
      style={{ width: "100%", height: "600px" }}
      ar-placement="wall"
    >
    </model-viewer>
  );
}

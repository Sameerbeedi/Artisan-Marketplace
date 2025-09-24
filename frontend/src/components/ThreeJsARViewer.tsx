"use client";

import { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ARButton, XR, useXR, useXRHitTest, createXRStore } from '@react-three/xr';
import { GLTFLoader } from 'three-stdlib';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';

const store = createXRStore();

function Model({ url }: { url: string }) {
  const gltf = useLoader(GLTFLoader, url);
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Optional: Add some rotation for visual appeal
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <primitive
      ref={meshRef}
      object={gltf.scene}
      scale={[1, 1, 1]}
      position={[0, 0, 0]}
    />
  );
}

function ARScene({ modelUrl }: { modelUrl: string }) {
  const { session } = useXR();

  // Note: Hit testing is available but simplified for this basic implementation
  // useXRHitTest((results, getWorldMatrix) => {
  //   // Handle hit test results for placing models on surfaces
  // });

  if (!session) {
    return (
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        color: '#666',
        fontSize: '18px'
      }}>
        <div>👆 Tap "Enter AR" to view the 3D model</div>
        <div style={{ fontSize: '14px', marginTop: '8px' }}>
          Make sure you're on iOS Safari for the best experience
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      {/* Ground plane for reference */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshBasicMaterial color="#f0f0f0" transparent opacity={0.3} />
      </mesh>

      {/* 3D Model */}
      <Model url={modelUrl} />
    </>
  );
}

export default function ThreeJsARViewer({
  modelUrl,
  altText,
}: {
  modelUrl: string;
  altText: string;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Preload the model to check if it's accessible
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      () => {
        setIsLoading(false);
        setHasError(false);
      },
      undefined,
      (error: any) => {
        console.error('Error loading GLTF model:', error);
        setIsLoading(false);
        setHasError(true);
      }
    );
  }, [modelUrl]);

  if (hasError) {
    return (
      <div style={{
        width: '100%',
        height: '600px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        color: '#666',
        textAlign: 'center'
      }}>
        <div>
          <div>Unable to load 3D model</div>
          <div style={{ fontSize: '14px', marginTop: '8px' }}>
            Check your internet connection or try again
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '600px' }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 10
        }}>
          <div>Loading 3D Model...</div>
        </div>
      )}

      <XR store={store}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
        >
          <ARScene modelUrl={modelUrl} />
        </Canvas>
      </XR>

      {/* AR Button positioned over the canvas */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20
      }}>
        <ARButton
          store={store}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        />
      </div>
    </div>
  );
}
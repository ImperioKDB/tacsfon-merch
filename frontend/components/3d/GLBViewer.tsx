'use client'
import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Stage, Environment, Center } from '@react-three/drei'

interface ModelProps {
  url: string;
}

function Model({ url }: ModelProps) {
  // useGLTF handles the loading, error states, and types automatically
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

interface GLBViewerProps {
  modelUrl: string;
  onError?: () => void;
}

export default function GLBViewer({ modelUrl, onError }: GLBViewerProps) {
  return (
    <div style={{ width: '100%', height: '100%', background: 'transparent' }}>
      <Canvas shadows camera={{ position: [0, 0, 4], fov: 40 }}>
        <Suspense fallback={null}>
          <Stage intensity={0.5} environment="city" adjustCamera={false}>
            <Center>
              <Model url={modelUrl} />
            </Center>
          </Stage>
          <Environment preset="city" />
        </Suspense>
        <OrbitControls makeDefault enableZoom={false} />
      </Canvas>
    </div>
  );
}

'use client'
import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Stage, Environment, Center } from '@react-three/drei'

interface ModelProps {
  url: string;
}

function Model({ url }: ModelProps) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

interface HeroViewerProps {
  modelUrl: string;
  fallbackImageUrl?: string;
}

export default function HeroViewer({ modelUrl }: HeroViewerProps) {
  return (
    <div style={{ width: '100%', height: '100%', background: 'transparent' }}>
      <Canvas shadows camera={{ position: [0, 0, 4], fov: 40 }}>
        <Suspense fallback={null}>
          <Stage intensity={0.6} environment="city" adjustCamera={false}>
            <Center>
              <Model url={modelUrl} />
            </Center>
          </Stage>
          <Environment preset="city" />
        </Suspense>
        {/* autoRotate makes the hero shirt spin slowly on its own */}
        <OrbitControls 
          autoRotate 
          autoRotateSpeed={1.5}
          enableZoom={false} 
          enablePan={false} 
          makeDefault 
        />
      </Canvas>
    </div>
  );
}

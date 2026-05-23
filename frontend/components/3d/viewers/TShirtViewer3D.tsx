'use client'
import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Stage, Environment, Center } from '@react-three/drei'

function Model({ color }: { color: string }) {
  const { scene } = useGLTF('/models/tshirt_real.glb')
  
  // Apply the color to the fabric
  scene.traverse((child: any) => {
    if (child.isMesh) {
      child.material.color.set(color)
      child.material.roughness = 0.8
      child.castShadow = true
      child.receiveShadow = true
    }
  })
  return <primitive object={scene} />
}

export default function TShirtViewer3D({ color = '#7B1A2E' }) {
  return (
    <div style={{ width: '100%', height: '100%', background: 'transparent' }}>
      <Canvas shadows camera={{ position: [0, 0, 4], fov: 35 }}>
        <Suspense fallback={null}>
          <Stage intensity={0.5} environment="city" adjustCamera={true}>
            <Center>
              <Model color={color} />
            </Center>
          </Stage>
        </Suspense>
        <OrbitControls autoRotate autoRotateSpeed={2} enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  )
}

'use client'
import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { 
  OrbitControls, 
  useGLTF, 
  Environment, 
  Decal, 
  useTexture,
  Center,
  ContactShadows
} from '@react-three/drei'
import * as THREE from 'three'

function TShirtModel({ color }: { color: string }) {
  // Load the pro model and the logo
  const { nodes } = useGLTF('/models/tshirt_base.glb') as any
  const logoTexture = useTexture('/models/logo.png')

  return (
    <group dispose={null}>
      {Object.keys(nodes).map((key) => {
        if (nodes[key].type === 'Mesh') {
          return (
            <mesh key={key} geometry={nodes[key].geometry} castShadow receiveShadow>
              <meshStandardMaterial 
                color={color} 
                roughness={0.8} 
                metalness={0.1} 
              />
              <Decal
                position={[0, 0.05, 0.15]} 
                rotation={[0, 0, 0]}
                scale={0.18}
                map={logoTexture}
              />
            </mesh>
          )
        }
        return null
      })}
    </group>
  )
}

export default function RealisticViewer({ color = '#7B1A2E' }) {
  return (
    <div style={{ width: '100%', height: '100%', background: '#0A0A0F' }}>
      <Canvas shadows camera={{ position: [0, 0, 4.5], fov: 25 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Suspense fallback={null}>
          <Environment preset="city" />
          <Center>
            <TShirtModel color={color} />
          </Center>
          <ContactShadows position={[0, -1, 0]} opacity={0.4} scale={10} blur={2} far={1} />
        </Suspense>
        <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={Math.PI/2.2} maxPolarAngle={Math.PI/2.2} />
      </Canvas>
    </div>
  )
}

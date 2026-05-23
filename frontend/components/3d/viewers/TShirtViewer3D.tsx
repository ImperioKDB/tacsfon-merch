'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function TShirtViewer3D({ color = '#7B1A2E', onError }: { color?: string, onError?: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const mount = ref.current; if (!mount) return
    try {
      const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0A0A0F)
      const camera = new THREE.PerspectiveCamera(40, mount.clientWidth / mount.clientHeight, 0.1, 50)
      camera.position.set(0, 0, 2.8)
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(mount.clientWidth, mount.clientHeight); renderer.outputEncoding = THREE.sRGBEncoding
      mount.appendChild(renderer.domElement)
      scene.add(new THREE.AmbientLight(0xffffff, 0.6))
      const light = new THREE.DirectionalLight(0xffffff, 1); light.position.set(5, 5, 5); scene.add(light)
      
      const shape = new THREE.Shape()
      shape.moveTo(-0.5, 0.5); shape.lineTo(-0.5, 0.3); shape.lineTo(-0.3, 0.3); shape.lineTo(-0.3, -0.6)
      shape.lineTo(0.3, -0.6); shape.lineTo(0.3, 0.3); shape.lineTo(0.5, 0.3); shape.lineTo(0.5, 0.5)
      shape.lineTo(0.15, 0.5); shape.bezierCurveTo(0.15, 0.6, -0.15, 0.6, -0.15, 0.5); shape.lineTo(-0.5, 0.5)
      
      const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.02 })
      const material = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: 0.7, metalness: 0.1 })
      const mesh = new THREE.Mesh(geometry, material); mesh.rotation.x = Math.PI; scene.add(mesh)

      const animate = () => { requestAnimationFrame(animate); mesh.rotation.y += 0.008; renderer.render(scene, camera) }
      animate()
      return () => { renderer.dispose(); if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement) }
    } catch { onError?.() }
  }, [color, onError])
  return <div ref={ref} className="w-full h-full" />
}
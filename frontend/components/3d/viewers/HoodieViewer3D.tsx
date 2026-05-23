'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function HoodieViewer3D({ color = '#1C1C1C', onError }: { color?: string, onError?: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const mount = ref.current; if (!mount) return
    try {
      const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0A0A0F)
      const camera = new THREE.PerspectiveCamera(40, mount.clientWidth / mount.clientHeight, 0.1, 50)
      camera.position.set(0, 0, 3.2)
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(mount.clientWidth, mount.clientHeight); renderer.outputEncoding = THREE.sRGBEncoding
      mount.appendChild(renderer.domElement)
      scene.add(new THREE.AmbientLight(0xffffff, 0.5))
      const light = new THREE.DirectionalLight(0xffffff, 1); light.position.set(2, 2, 5); scene.add(light)

      const bodyGeo = new THREE.BoxGeometry(0.9, 1.1, 0.25)
      const material = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: 0.85 })
      const body = new THREE.Mesh(bodyGeo, material); scene.add(body)
      
      const hoodGeo = new THREE.SphereGeometry(0.32, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2)
      const hood = new THREE.Mesh(hoodGeo, material); hood.position.y = 0.55; scene.add(hood)

      const animate = () => { requestAnimationFrame(animate); body.rotation.y += 0.008; hood.rotation.y += 0.008; renderer.render(scene, camera) }
      animate()
      return () => { renderer.dispose(); if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement) }
    } catch { onError?.() }
  }, [color, onError])
  return <div ref={ref} className="w-full h-full" />
}
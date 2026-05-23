'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function TShirtViewer3D({ color = '#7B1A2E' }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const mount = ref.current; if (!mount) return
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, mount.clientWidth / mount.clientHeight, 0.1, 100)
    camera.position.set(0, 0, 3.2)
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    mount.appendChild(renderer.domElement)
    
    scene.add(new THREE.AmbientLight(0xffffff, 1.0))
    const light = new THREE.DirectionalLight(0xffffff, 1.5); light.position.set(2, 5, 5); scene.add(light)

    const s = new THREE.Shape()
    s.moveTo(-0.15, 0.5)   // Neck Top Left
    s.lineTo(-0.5, 0.4)    // Shoulder Left
    s.lineTo(-0.7, 0.1)    // Sleeve Outer Top Left
    s.lineTo(-0.5, -0.1)   // Sleeve Bottom Left
    s.lineTo(-0.4, 0.0)    // Underarm Left
    s.lineTo(-0.4, -0.8)   // Bottom Left
    s.lineTo(0.4, -0.8)    // Bottom Right
    s.lineTo(0.4, 0.0)     // Underarm Right
    s.lineTo(0.5, -0.1)    // Sleeve Bottom Right
    s.lineTo(0.7, 0.1)     // Sleeve Outer Top Right
    s.lineTo(0.5, 0.4)     // Shoulder Right
    s.lineTo(0.15, 0.5)    // Neck Top Right
    s.absarc(0, 0.5, 0.15, 0, Math.PI, true) // Smooth neck cutout

    const geometry = new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 5 })
    const material = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: 0.65, metalness: 0.05 })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.rotation.x = Math.PI; 
    mesh.position.y = 0.2;
    scene.add(mesh)

    let time = 0
    const animate = () => {
      requestAnimationFrame(animate)
      time += 0.02
      mesh.rotation.y += 0.01
      mesh.position.y = 0.2 + Math.sin(time) * 0.06 
      renderer.render(scene, camera)
    }
    animate()
    return () => { renderer.dispose(); if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement) }
  }, [color])
  return <div ref={ref} style={{ width: '100%', height: '100%' }} />
}

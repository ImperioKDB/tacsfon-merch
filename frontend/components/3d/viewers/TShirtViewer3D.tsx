'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function TShirtViewer3D({ color = '#7B1A2E' }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const mount = ref.current; if (!mount) return
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 100)
    camera.position.set(0, 0, 3)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    mount.appendChild(renderer.domElement)
    
    scene.add(new THREE.AmbientLight(0xffffff, 0.8))
    const light = new THREE.DirectionalLight(0xffffff, 1); light.position.set(2, 2, 5); scene.add(light)

    const shape = new THREE.Shape()
    shape.moveTo(-0.6, 0.5); shape.lineTo(-0.6, 0.3); shape.lineTo(-0.4, 0.3); shape.lineTo(-0.4, -0.7)
    shape.lineTo(0.4, -0.7); shape.lineTo(0.4, 0.3); shape.lineTo(0.6, 0.3); shape.lineTo(0.6, 0.5)
    shape.lineTo(0.2, 0.5); shape.absarc(0, 0.5, 0.2, 0, Math.PI, true); shape.lineTo(-0.6, 0.5)

    const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.15, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05 })
    const material = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: 0.6, metalness: 0.1 })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.rotation.x = Math.PI; mesh.position.y = 0.2; scene.add(mesh)

    const animate = () => { requestAnimationFrame(animate); mesh.rotation.y += 0.01; renderer.render(scene, camera) }
    animate()
    return () => { renderer.dispose(); if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement) }
  }, [color])
  return <div ref={ref} style={{ width: '100%', height: '100%' }} />
}

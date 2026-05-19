'use client'

/**
 * Procedural beanie (beamer) viewer — Three.js r128.
 * LatheGeometry body, folded cuff, pom-pom on top.
 */

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface Props {
  color?:   string
  onError?: () => void
}

export default function BeanieViewer3D({ color = '#1C1C1C', onError }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = ref.current
    if (!mount) return
    try {
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0x13131A)

      const w = mount.clientWidth  || 400
      const h = mount.clientHeight || 400
      const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 50)
      camera.position.set(0, 0.1, 2.2)

      const renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(w, h)
      renderer.outputEncoding = THREE.sRGBEncoding
      mount.appendChild(renderer.domElement)

      scene.add(new THREE.AmbientLight(0xffffff, 0.8))
      const key = new THREE.DirectionalLight(0xfff5e0, 1.1)
      key.position.set(3, 4, 4); scene.add(key)
      const fill = new THREE.DirectionalLight(0xc9a84c, 0.3)
      fill.position.set(-3, -1, -3); scene.add(fill)

      const beanieColor = new THREE.Color(color)
      const cuffColor   = new THREE.Color(color).lerp(new THREE.Color(0xffffff), 0.08)

      // ── Main body — LatheGeometry ─────────────────────────────────────────
      // Points: (radius, height) pairs — Y is vertical axis
      const bodyPoints = [
        new THREE.Vector2(0.00, 0.64),   // very top (centre)
        new THREE.Vector2(0.06, 0.62),
        new THREE.Vector2(0.18, 0.55),
        new THREE.Vector2(0.24, 0.40),
        new THREE.Vector2(0.26, 0.24),
        new THREE.Vector2(0.27, 0.12),
        new THREE.Vector2(0.28, 0.00),   // bottom rim
      ]
      const bodyGeo  = new THREE.LatheGeometry(bodyPoints, 48)
      const bodyMat  = new THREE.MeshStandardMaterial({ color: beanieColor, roughness: 0.88, metalness: 0, side: THREE.DoubleSide })
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat)

      // ── Folded cuff ───────────────────────────────────────────────────────
      const cuffGeo  = new THREE.CylinderGeometry(0.29, 0.28, 0.11, 48)
      const cuffMat  = new THREE.MeshStandardMaterial({ color: cuffColor, roughness: 0.90, metalness: 0 })
      const cuffMesh = new THREE.Mesh(cuffGeo, cuffMat)
      cuffMesh.position.y = 0.055

      // Ribbing lines on cuff (thin boxes)
      const ribbingMat = new THREE.MeshBasicMaterial({ color: beanieColor, transparent: true, opacity: 0.35 })
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2
        const ribGeo = new THREE.BoxGeometry(0.008, 0.11, 0.008)
        const ribMesh = new THREE.Mesh(ribGeo, ribbingMat)
        ribMesh.position.set(Math.cos(angle) * 0.29, 0.055, Math.sin(angle) * 0.29)
        scene.add(ribMesh)
      }

      // ── Pom-pom on top ────────────────────────────────────────────────────
      const pomGeo  = new THREE.SphereGeometry(0.075, 16, 12)
      const pomMat  = new THREE.MeshStandardMaterial({ color: 0xC9A84C, roughness: 0.95, metalness: 0 }) // gold pom
      const pomMesh = new THREE.Mesh(pomGeo, pomMat)
      pomMesh.position.y = 0.69

      // Pom-pom connector nub
      const nubGeo  = new THREE.CylinderGeometry(0.018, 0.018, 0.04, 10)
      const nubMesh = new THREE.Mesh(nubGeo, pomMat)
      nubMesh.position.y = 0.66

      // ── Group ────────────────────────────────────────────────────────────
      const group = new THREE.Group()
      group.add(bodyMesh, cuffMesh, pomMesh, nubMesh)
      // Slight tilt for a natural worn look
      group.rotation.z = 0.08
      group.position.y = -0.32
      scene.add(group)

      let down = false, lx = 0, ly = 0
      const onDown  = (e: PointerEvent) => { down = true; lx = e.clientX; ly = e.clientY }
      const onUp    = () => { down = false }
      const onMove  = (e: PointerEvent) => {
        if (!down) return
        group.rotation.y += (e.clientX - lx) * 0.010
        group.rotation.x += (e.clientY - ly) * 0.006
        lx = e.clientX; ly = e.clientY
      }
      const onWheel = (e: WheelEvent) => {
        e.preventDefault()
        camera.position.z = Math.max(1.0, Math.min(5, camera.position.z + e.deltaY * 0.005))
      }
      const onResize = () => {
        camera.aspect = mount.clientWidth / mount.clientHeight
        camera.updateProjectionMatrix()
        renderer.setSize(mount.clientWidth, mount.clientHeight)
      }
      mount.addEventListener('pointerdown', onDown)
      window.addEventListener('pointerup',   onUp)
      window.addEventListener('pointermove', onMove)
      mount.addEventListener('wheel', onWheel, { passive: false })
      window.addEventListener('resize', onResize)

      let animId: number
      const tick = () => {
        animId = requestAnimationFrame(tick)
        if (!down) group.rotation.y += 0.006
        renderer.render(scene, camera)
      }
      tick()

      return () => {
        cancelAnimationFrame(animId)
        mount.removeEventListener('pointerdown', onDown)
        window.removeEventListener('pointerup',   onUp)
        window.removeEventListener('pointermove', onMove)
        mount.removeEventListener('wheel', onWheel)
        window.removeEventListener('resize', onResize)
        scene.traverse(obj => {
          if ((obj as THREE.Mesh).isMesh) {
            const m = obj as THREE.Mesh
            m.geometry.dispose()
            const mats = Array.isArray(m.material) ? m.material : [m.material]
            mats.forEach(mat => mat.dispose())
          }
        })
        renderer.dispose()
        if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
      }
    } catch { onError?.() }
  }, [color, onError])

  return (
    <div ref={ref}
      className="w-full h-full cursor-grab active:cursor-grabbing"
      aria-label="3D beanie viewer"
    />
  )
}
'use client'

/**
 * Procedural necktie viewer — Three.js r128.
 * Extruded blade (wide trapezoid), four-in-hand knot, tail, and brand strip.
 */

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface Props {
  color?:   string
  onError?: () => void
}

export default function TieViewer3D({ color = '#7B1A2E', onError }: Props) {
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
      camera.position.set(0, 0, 3.0)

      const renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(w, h)
      renderer.outputEncoding = THREE.sRGBEncoding
      mount.appendChild(renderer.domElement)

      scene.add(new THREE.AmbientLight(0xffffff, 0.8))
      const key = new THREE.DirectionalLight(0xfff5e0, 1.2)
      key.position.set(3, 5, 5); scene.add(key)
      const fill = new THREE.DirectionalLight(0xc9a84c, 0.3)
      fill.position.set(-3, -1, -3); scene.add(fill)

      const tieColor  = new THREE.Color(color)
      const tieMat    = new THREE.MeshStandardMaterial({ color: tieColor, roughness: 0.88, metalness: 0.05 })
      const knotColor = new THREE.Color(color).lerp(new THREE.Color(0x000000), 0.12)
      const knotMat   = new THREE.MeshStandardMaterial({ color: knotColor, roughness: 0.86, metalness: 0.05 })

      // ── Blade (main wide part) — extruded trapezoid ───────────────────────
      const bladeShape = new THREE.Shape()
      bladeShape.moveTo(-0.095,  0)
      bladeShape.lineTo(-0.105,  0.08)
      bladeShape.lineTo(-0.115,  0.55)
      bladeShape.lineTo( 0.115,  0.55)
      bladeShape.lineTo( 0.105,  0.08)
      bladeShape.lineTo( 0.095,  0)

      // Pointed tip — smooth bezier
      bladeShape.bezierCurveTo( 0.095, -0.04, -0.095, -0.04, -0.095, 0)

      const bladeGeo  = new THREE.ExtrudeGeometry(bladeShape, {
        depth: 0.022, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 3,
      })
      bladeGeo.center()
      const bladeMesh = new THREE.Mesh(bladeGeo, tieMat)

      // ── Tail (narrow back part) ───────────────────────────────────────────
      const tailShape = new THREE.Shape()
      tailShape.moveTo(-0.044,  0)
      tailShape.lineTo(-0.044,  0.40)
      tailShape.lineTo( 0.044,  0.40)
      tailShape.lineTo( 0.044,  0)
      tailShape.bezierCurveTo( 0.044, -0.025, -0.044, -0.025, -0.044, 0)

      const tailGeo  = new THREE.ExtrudeGeometry(tailShape, {
        depth: 0.018, bevelEnabled: false,
      })
      const tailMesh = new THREE.Mesh(tailGeo, tieMat)
      tailMesh.position.y = 0.58   // sits above blade

      // ── Knot (four-in-hand shape) ─────────────────────────────────────────
      const knotGeo  = new THREE.BoxGeometry(0.26, 0.14, 0.10)
      // Round the knot with bevel via SphereGeometry approach — use box for simplicity
      const knotMesh = new THREE.Mesh(knotGeo, knotMat)
      // Fine-tune knot position: sits where blade meets tail
      knotMesh.position.set(0, 0.58 + 0.07 + 0.025, 0.012)

      // ── Gold diagonal stripe on blade ────────────────────────────────────
      const stripeGeo = new THREE.PlaneGeometry(0.30, 0.015)
      const stripeMat = new THREE.MeshBasicMaterial({ color: 0xC9A84C, transparent: true, opacity: 0.55 })
      for (let i = 0; i < 4; i++) {
        const s = new THREE.Mesh(stripeGeo, stripeMat)
        s.rotation.z = Math.PI / 4    // 45° diagonal
        s.position.set(0, -0.15 + i * 0.12, 0.014)
        bladeMesh.add(s)
      }

      // ── Group ────────────────────────────────────────────────────────────
      const group = new THREE.Group()
      group.add(bladeMesh, tailMesh, knotMesh)
      // Center vertically
      group.position.y = -0.5
      scene.add(group)

      let down = false, lx = 0, ly = 0
      const onDown  = (e: PointerEvent) => { down = true; lx = e.clientX; ly = e.clientY }
      const onUp    = () => { down = false }
      const onMove  = (e: PointerEvent) => {
        if (!down) return
        group.rotation.y += (e.clientX - lx) * 0.008
        group.rotation.x += (e.clientY - ly) * 0.006
        lx = e.clientX; ly = e.clientY
      }
      const onWheel = (e: WheelEvent) => {
        e.preventDefault()
        camera.position.z = Math.max(1.5, Math.min(6, camera.position.z + e.deltaY * 0.005))
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
        if (!down) group.rotation.y += 0.004
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
      aria-label="3D tie viewer"
    />
  )
}
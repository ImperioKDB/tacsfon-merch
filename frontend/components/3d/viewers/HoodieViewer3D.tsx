'use client'

/**
 * Procedural pullover hoodie viewer — Three.js r128.
 *
 * Logo spec (cross IS the T in TACSFON):
 *   Vertical bar:   fillRect(44, 4, 30, 140)
 *   Crossbar:       fillRect(4, 28, 110, 30)
 *   "ACSFON":       x=122, baseline=144
 *   Subtitle:       centred at y=188
 */

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface Props {
  color?:   string
  onError?: () => void
}

export default function HoodieViewer3D({ color = '#1C1C1C', onError }: Props) {
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

      scene.add(new THREE.AmbientLight(0xffffff, 0.75))
      const key = new THREE.DirectionalLight(0xfff5e0, 1.2)
      key.position.set(3, 4, 5); scene.add(key)
      const fill = new THREE.DirectionalLight(0xc9a84c, 0.28)
      fill.position.set(-3, -2, -3); scene.add(fill)

      const shirtColor = new THREE.Color(color)

      // ── Hoodie body ───────────────────────────────────────────────────────
      const bodyShape = new THREE.Shape()
      bodyShape.moveTo(-0.53,  0.52)
      bodyShape.lineTo(-0.53,  0.30)
      bodyShape.lineTo(-0.32,  0.30)
      bodyShape.lineTo(-0.32, -0.66)
      bodyShape.lineTo( 0.32, -0.66)
      bodyShape.lineTo( 0.32,  0.30)
      bodyShape.lineTo( 0.53,  0.30)
      bodyShape.lineTo( 0.53,  0.52)
      bodyShape.lineTo( 0.15,  0.52)
      bodyShape.bezierCurveTo( 0.15, 0.64, -0.15, 0.64, -0.15, 0.52)
      bodyShape.lineTo(-0.53,  0.52)

      const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, {
        steps: 1, depth: 0.075,
        bevelEnabled: true, bevelThickness: 0.014,
        bevelSize: 0.014, bevelSegments: 4,
      })
      bodyGeo.center()
      const bodyMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.90, metalness: 0 })
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat)

      // ── Hood ──────────────────────────────────────────────────────────────
      const hoodShape = new THREE.Shape()
      hoodShape.moveTo(-0.20, 0)
      hoodShape.lineTo( 0.20, 0)
      hoodShape.bezierCurveTo( 0.38, 0.15,  0.38, 0.44,  0.00, 0.46)
      hoodShape.bezierCurveTo(-0.38, 0.44, -0.38, 0.15, -0.20, 0)

      const hoodGeo = new THREE.ExtrudeGeometry(hoodShape, {
        steps: 1, depth: 0.04, bevelEnabled: false,
      })
      hoodGeo.center()
      const hoodMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.90, metalness: 0 })
      const hoodMesh = new THREE.Mesh(hoodGeo, hoodMat)
      hoodMesh.position.set(0, 0.28, -0.06)

      // ── Kangaroo pocket ───────────────────────────────────────────────────
      const pocketGeo = new THREE.BoxGeometry(0.38, 0.14, 0.015)
      const pocketMat = new THREE.MeshStandardMaterial({
        color: shirtColor, roughness: 0.88, metalness: 0,
        emissive: new THREE.Color(0x000000),
      })
      const pocketMesh = new THREE.Mesh(pocketGeo, pocketMat)
      pocketMesh.position.set(0, -0.34, 0.048)

      const seamGeo = new THREE.BoxGeometry(0.38, 0.004, 0.002)
      const seamMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25 })
      const seamTop = new THREE.Mesh(seamGeo, seamMat)
      seamTop.position.set(0, -0.27, 0.058)
      const seamBot = new THREE.Mesh(seamGeo, seamMat)
      seamBot.position.set(0, -0.41, 0.058)

      // ── TACSFON logo — cross IS the T ─────────────────────────────────────
      const cvs = document.createElement('canvas')
      cvs.width = 512; cvs.height = 252
      const ctx = cvs.getContext('2d')!
      ctx.clearRect(0, 0, 512, 252)
      ctx.fillStyle = '#FFFFFF'

      ctx.fillRect(44, 4, 30, 140)     // vertical bar (T-stem + cross top)
      ctx.fillRect(4, 28, 110, 30)     // crossbar at cap-height

      ctx.font = 'bold 82px "Arial Black", Arial'
      ctx.textBaseline = 'alphabetic'
      ctx.fillText('ACSFON', 122, 144)

      ctx.font = 'bold 20px Arial'
      const sub = 'SHARING THE LOVE OF CHRIST'
      ctx.fillText(sub, (512 - ctx.measureText(sub).width) / 2, 188)

      const logoTex = new THREE.CanvasTexture(cvs)
      logoTex.encoding = THREE.sRGBEncoding
      const logoMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.52, 0.26),
        new THREE.MeshBasicMaterial({ map: logoTex, transparent: true, depthWrite: false })
      )
      logoMesh.position.set(0, 0.06, 0.090)

      const group = new THREE.Group()
      group.add(hoodMesh, bodyMesh, pocketMesh, seamTop, seamBot, logoMesh)
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
        ;[bodyGeo, hoodGeo, pocketGeo, seamGeo].forEach(g => g.dispose())
        ;[bodyMat, hoodMat, pocketMat, seamMat].forEach(m => m.dispose())
        logoTex.dispose()
        renderer.dispose()
        if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
      }
    } catch { onError?.() }
  }, [color, onError])

  return (
    <div ref={ref}
      className="w-full h-full cursor-grab active:cursor-grabbing"
      aria-label="3D hoodie viewer"
    />
  )
}
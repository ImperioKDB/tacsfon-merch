'use client'

/**
 * Procedural canvas tote bag viewer — Three.js r128.
 * Box body + two looping TubeGeometry handles + TACSFON print on front.
 */

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface Props {
  color?:   string
  onError?: () => void
}

export default function ToteBagViewer3D({ color = '#F0EDE8', onError }: Props) {
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
      camera.position.set(0, 0.1, 2.8)

      const renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(w, h)
      renderer.outputEncoding = THREE.sRGBEncoding
      mount.appendChild(renderer.domElement)

      scene.add(new THREE.AmbientLight(0xffffff, 0.8))
      const key = new THREE.DirectionalLight(0xfff5e0, 1.2)
      key.position.set(3, 4, 5); scene.add(key)
      const fill = new THREE.DirectionalLight(0xc9a84c, 0.3)
      fill.position.set(-3, -1, -3); scene.add(fill)

      const bagColor    = new THREE.Color(color)
      const handleColor = new THREE.Color(color).lerp(new THREE.Color(0x000000), 0.2)

      // ── Bag body ─────────────────────────────────────────────────────────
      const bodyGeo  = new THREE.BoxGeometry(0.68, 0.72, 0.10)
      const bodyMat  = new THREE.MeshStandardMaterial({ color: bagColor, roughness: 0.92, metalness: 0 })
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat)

      // Bottom gusset (slightly thicker at base)
      const gussetGeo  = new THREE.BoxGeometry(0.68, 0.04, 0.10)
      const gussetMesh = new THREE.Mesh(gussetGeo, bodyMat)
      gussetMesh.position.y = -0.36

      // ── TACSFON logo on front face ────────────────────────────────────────
      const cvs = document.createElement('canvas')
      cvs.width = 512; cvs.height = 512
      const ctx = cvs.getContext('2d')!
      ctx.clearRect(0, 0, 512, 512)

      // Bag is light — use the brand gold + dark for contrast
      const printColor = bagColor.r + bagColor.g + bagColor.b > 1.5 ? '#1C1C1C' : '#FFFFFF'
      ctx.fillStyle = printColor

      ctx.fillRect(80, 110, 52, 200)   // cross vertical
      ctx.fillRect(24, 162, 164, 52)   // cross horizontal
      ctx.font = 'bold 120px "Arial Black", Arial'
      ctx.textBaseline = 'alphabetic'
      ctx.fillText('ACSFON', 172, 285)
      ctx.font = 'bold 34px Arial'
      const sub = 'SHARING THE LOVE OF CHRIST'
      ctx.fillText(sub, (512 - ctx.measureText(sub).width) / 2, 350)

      const logoTex = new THREE.CanvasTexture(cvs)
      logoTex.encoding = THREE.sRGBEncoding
      const logoMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.64, 0.64),
        new THREE.MeshBasicMaterial({ map: logoTex, transparent: true, depthWrite: false })
      )
      logoMesh.position.set(0, 0.0, 0.052)

      // ── Handles (QuadraticBezierCurve3 + TubeGeometry) ───────────────────
      const handleMat = new THREE.MeshStandardMaterial({ color: handleColor, roughness: 0.88, metalness: 0.05 })

      const makeHandle = (xOffset: number) => {
        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(xOffset - 0.08, 0.36, 0.0),
          new THREE.Vector3(xOffset,        0.78, 0.0),
          new THREE.Vector3(xOffset + 0.08, 0.36, 0.0)
        )
        const geo  = new THREE.TubeGeometry(curve, 24, 0.018, 10, false)
        return new THREE.Mesh(geo, handleMat)
      }

      const leftHandle  = makeHandle(-0.16)
      const rightHandle = makeHandle( 0.16)

      // ── Stitching line at top ─────────────────────────────────────────────
      const stitchGeo  = new THREE.BoxGeometry(0.68, 0.006, 0.011)
      const stitchMat  = new THREE.MeshBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.4 })
      const stitchMesh = new THREE.Mesh(stitchGeo, stitchMat)
      stitchMesh.position.y = 0.32

      // ── Group ────────────────────────────────────────────────────────────
      const group = new THREE.Group()
      group.add(bodyMesh, gussetMesh, logoMesh, leftHandle, rightHandle, stitchMesh)
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
        logoTex.dispose()
        renderer.dispose()
        if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
      }
    } catch { onError?.() }
  }, [color, onError])

  return (
    <div ref={ref}
      className="w-full h-full cursor-grab active:cursor-grabbing"
      aria-label="3D tote bag viewer"
    />
  )
}
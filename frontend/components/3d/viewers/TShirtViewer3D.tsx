'use client'

/**
 * Procedural crew-neck t-shirt viewer — Three.js r128.
 * Renders the TACSFON merch t-shirt exactly as photographed:
 *   • Maroon (#7B1A2E) or black body  (colour prop)
 *   • White cross + "ACSFON" + "SHARING THE LOVE OF CHRIST" print
 * No .glb files needed — zero storage cost.
 */

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface Props {
  color?:   string   // hex — e.g. '#7B1A2E' or '#1C1C1C'
  onError?: () => void
}

export default function TShirtViewer3D({ color = '#7B1A2E', onError }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = ref.current
    if (!mount) return
    try {
      // ── Scene ────────────────────────────────────────────────────────────
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0x13131A)

      const w = mount.clientWidth  || 400
      const h = mount.clientHeight || 400
      const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 50)
      camera.position.set(0, 0, 2.8)

      const renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(w, h)
      renderer.outputEncoding = THREE.sRGBEncoding
      mount.appendChild(renderer.domElement)

      // ── Lights ───────────────────────────────────────────────────────────
      scene.add(new THREE.AmbientLight(0xffffff, 0.75))
      const key = new THREE.DirectionalLight(0xfff5e0, 1.2)
      key.position.set(3, 4, 5)
      scene.add(key)
      const fill = new THREE.DirectionalLight(0xc9a84c, 0.28)
      fill.position.set(-3, -2, -3)
      scene.add(fill)
      const rim = new THREE.DirectionalLight(0xffffff, 0.35)
      rim.position.set(0, -4, -4)
      scene.add(rim)

      // ── T-shirt silhouette (ExtrudeGeometry) ─────────────────────────────
      const shape = new THREE.Shape()
      shape.moveTo(-0.50,  0.52)   // top of left sleeve
      shape.lineTo(-0.50,  0.34)   // bottom of left sleeve
      shape.lineTo(-0.30,  0.34)   // left armpit
      shape.lineTo(-0.30, -0.56)   // bottom left of body
      shape.lineTo( 0.30, -0.56)   // bottom right of body
      shape.lineTo( 0.30,  0.34)   // right armpit
      shape.lineTo( 0.50,  0.34)   // bottom of right sleeve
      shape.lineTo( 0.50,  0.52)   // top of right sleeve
      shape.lineTo( 0.13,  0.52)   // right shoulder edge

      // Round crew collar
      shape.bezierCurveTo( 0.13, 0.67, -0.13, 0.67, -0.13, 0.52)
      shape.lineTo(-0.50,  0.52)   // close

      const bodyGeo = new THREE.ExtrudeGeometry(shape, {
        steps: 1, depth: 0.06,
        bevelEnabled: true, bevelThickness: 0.012,
        bevelSize: 0.012, bevelSegments: 4,
      })
      bodyGeo.center()

      const bodyMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: 0.92, metalness: 0.0,
      })
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat)
      bodyMesh.castShadow = true

      // ── TACSFON logo via canvas texture ──────────────────────────────────
      const cvs = document.createElement('canvas')
      cvs.width = 512; cvs.height = 252
      const ctx = cvs.getContext('2d')!
      ctx.clearRect(0, 0, 512, 252)
      ctx.fillStyle = '#FFFFFF'

      // Cross — vertical bar
      ctx.fillRect(38, 8, 34, 130)
      // Cross — horizontal bar
      ctx.fillRect(6, 40, 100, 34)

      // "ACSFON" — bold, large, flush right of cross
      ctx.font = 'bold 82px "Arial Black", Arial'
      ctx.textBaseline = 'alphabetic'
      ctx.fillText('ACSFON', 113, 126)

      // "SHARING THE LOVE OF CHRIST" — centred below
      ctx.font = 'bold 21px Arial'
      ctx.textBaseline = 'alphabetic'
      const sub = 'SHARING THE LOVE OF CHRIST'
      const subW = ctx.measureText(sub).width
      ctx.fillText(sub, (512 - subW) / 2, 172)

      const logoTex = new THREE.CanvasTexture(cvs)
      logoTex.encoding = THREE.sRGBEncoding

      const logoMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.56, 0.276),
        new THREE.MeshBasicMaterial({ map: logoTex, transparent: true, depthWrite: false })
      )
      logoMesh.position.set(0, 0.08, 0.078)  // front face, upper chest

      // ── Group ────────────────────────────────────────────────────────────
      const group = new THREE.Group()
      group.add(bodyMesh, logoMesh)
      scene.add(group)

      // ── Interaction ──────────────────────────────────────────────────────
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
        if (!mount) return
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
        bodyGeo.dispose(); bodyMat.dispose(); logoTex.dispose()
        renderer.dispose()
        if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
      }
    } catch { onError?.() }
  }, [color, onError])

  return (
    <div ref={ref}
      className="w-full h-full cursor-grab active:cursor-grabbing"
      aria-label="3D t-shirt viewer — drag to rotate, scroll to zoom"
    />
  )
}
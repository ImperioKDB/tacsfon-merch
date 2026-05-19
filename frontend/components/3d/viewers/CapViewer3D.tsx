'use client'

/**
 * Procedural snapback/fitted cap viewer — Three.js r128.
 * Components: dome crown, structured band, flat brim, top button, snapback adjuster.
 */

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface Props {
  color?:   string
  onError?: () => void
}

export default function CapViewer3D({ color = '#1C1C1C', onError }: Props) {
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
      camera.position.set(0, 0, 2.4)

      const renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(w, h)
      renderer.outputEncoding = THREE.sRGBEncoding
      mount.appendChild(renderer.domElement)

      scene.add(new THREE.AmbientLight(0xffffff, 0.8))
      const key = new THREE.DirectionalLight(0xfff5e0, 1.2)
      key.position.set(3, 5, 4); scene.add(key)
      const fill = new THREE.DirectionalLight(0xc9a84c, 0.3)
      fill.position.set(-3, -1, -3); scene.add(fill)

      const capColor  = new THREE.Color(color)
      const brimColor = new THREE.Color(color).lerp(new THREE.Color(0x000000), 0.15)

      // ── Crown (top dome) ─────────────────────────────────────────────────
      // thetaLength = PI * 0.58 gives a nice structured dome (not a full half-sphere)
      const crownGeo = new THREE.SphereGeometry(0.30, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.58)
      const crownMat = new THREE.MeshStandardMaterial({ color: capColor, roughness: 0.85, metalness: 0 })
      const crownMesh = new THREE.Mesh(crownGeo, crownMat)
      crownMesh.position.y = 0.10   // sits on top of band

      // ── Band ─────────────────────────────────────────────────────────────
      const bandGeo  = new THREE.CylinderGeometry(0.300, 0.305, 0.12, 32)
      const bandMat  = new THREE.MeshStandardMaterial({ color: capColor, roughness: 0.88, metalness: 0 })
      const bandMesh = new THREE.Mesh(bandGeo, bandMat)
      bandMesh.position.y = 0.05

      // ── Sweat band (inner lighter ring) ──────────────────────────────────
      const sweatGeo = new THREE.CylinderGeometry(0.298, 0.298, 0.04, 32)
      const sweatMat = new THREE.MeshStandardMaterial({ color: 0x8B7355, roughness: 0.95, metalness: 0 })
      const sweatMesh = new THREE.Mesh(sweatGeo, sweatMat)
      sweatMesh.position.y = -0.01

      // ── Brim ─────────────────────────────────────────────────────────────
      // Full thin disc — front-heavy look via group tilt
      const brimGeo  = new THREE.CylinderGeometry(0.46, 0.46, 0.022, 32)
      const brimMat  = new THREE.MeshStandardMaterial({ color: brimColor, roughness: 0.88, metalness: 0 })
      const brimMesh = new THREE.Mesh(brimGeo, brimMat)
      brimMesh.position.y = -0.011

      // Brim underside (slightly different shade)
      const brimUnderGeo = new THREE.CylinderGeometry(0.44, 0.44, 0.005, 32)
      const brimUnderMat = new THREE.MeshStandardMaterial({ color: 0x2A2A2A, roughness: 0.95, metalness: 0 })
      const brimUnderMesh = new THREE.Mesh(brimUnderGeo, brimUnderMat)
      brimUnderMesh.position.y = -0.014

      // ── Top button ───────────────────────────────────────────────────────
      const btnGeo  = new THREE.SphereGeometry(0.028, 12, 8)
      const btnMat  = new THREE.MeshStandardMaterial({ color: capColor, roughness: 0.7, metalness: 0.1 })
      const btnMesh = new THREE.Mesh(btnGeo, btnMat)
      btnMesh.position.y = 0.37

      // ── Snapback adjuster (back strap) ───────────────────────────────────
      const snapGeo  = new THREE.BoxGeometry(0.26, 0.055, 0.018)
      const snapMat  = new THREE.MeshStandardMaterial({ color: 0x2A2A2A, roughness: 0.9, metalness: 0 })
      const snapMesh = new THREE.Mesh(snapGeo, snapMat)
      snapMesh.position.set(0, 0.038, 0.295)

      // Snap holes
      for (let i = -1; i <= 1; i++) {
        const hGeo  = new THREE.CylinderGeometry(0.006, 0.006, 0.025, 8)
        const hMat  = new THREE.MeshBasicMaterial({ color: 0x000000 })
        const hMesh = new THREE.Mesh(hGeo, hMat)
        hMesh.rotation.x = Math.PI / 2
        hMesh.position.set(i * 0.06, 0.038, 0.305)
        scene.add(hMesh) // add directly; will be removed on cleanup via scene.clear
      }

      // ── TACSFON embroidery on front panel ────────────────────────────────
      const cvs = document.createElement('canvas')
      cvs.width = 256; cvs.height = 128
      const ctx = cvs.getContext('2d')!
      ctx.clearRect(0, 0, 256, 128)
      ctx.fillStyle = '#FFFFFF'
      // Mini cross
      ctx.fillRect(18, 8, 14, 52)
      ctx.fillRect(6, 20, 38, 14)
      // "ACSFON" small
      ctx.font = 'bold 32px "Arial Black", Arial'
      ctx.fillText('ACSFON', 46, 52)
      const logoTex = new THREE.CanvasTexture(cvs)
      logoTex.encoding = THREE.sRGBEncoding
      const frontLogoMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.22, 0.11),
        new THREE.MeshBasicMaterial({ map: logoTex, transparent: true, depthWrite: false })
      )
      frontLogoMesh.position.set(0, 0.09, -0.301)
      frontLogoMesh.rotation.y = Math.PI   // face outward (front of cap)

      // ── Group ────────────────────────────────────────────────────────────
      const group = new THREE.Group()
      group.add(crownMesh, bandMesh, sweatMesh,
                brimMesh, brimUnderMesh,
                btnMesh, snapMesh, frontLogoMesh)
      // Tilt group so brim faces slightly down/forward — looks natural
      group.rotation.x = 0.18
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
        camera.position.z = Math.max(1.2, Math.min(5, camera.position.z + e.deltaY * 0.005))
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
        if (!down) group.rotation.y += 0.005
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
      aria-label="3D cap viewer"
    />
  )
}
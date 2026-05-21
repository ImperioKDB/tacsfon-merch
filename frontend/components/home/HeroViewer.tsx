'use client'

'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

interface HeroViewerProps {
  modelUrl: string
  fallbackImageUrl?: string
}

/**
 * Three.js r128 viewer for the hero section.
 * - All Three.js code lives in useEffect (never runs server-side)
 * - Mobile: antialias off, pixelRatio capped at 1, low-power GPU hint
 * - Auto-rotate stops when user drags (OrbitControls 'start' event)
 * - Gold-tinted directional lighting
 * - Full cleanup on unmount
 */
export default function HeroViewer({ modelUrl, fallbackImageUrl }: HeroViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [webglOk,  setWebglOk]  = useState(true)
  const [loading,  setLoading]  = useState(true)
  const [modelErr, setModelErr] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // ── WebGL support check ───────────────────────────────────────────
    try {
      const testCanvas = document.createElement('canvas')
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')
      if (!gl) { setWebglOk(false); setLoading(false); return }
    } catch { setWebglOk(false); setLoading(false); return }

    const isMobile = window.innerWidth < 768

    let animId: number
    let renderer: any = null
    let controls: any = null

    const init = async () => {
      // ── Dynamic import (never bundled for SSR) ───────────────────────
      const THREE = await import('three')
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls')
      const { GLTFLoader }    = await import('three/examples/jsm/loaders/GLTFLoader')

      const W = container.clientWidth
      const H = container.clientHeight

      // ── Renderer ──────────────────────────────────────────────────────
      renderer = new THREE.WebGLRenderer({
        antialias: !isMobile,
        alpha: true,
        powerPreference: 'low-power',
      })
      renderer.setSize(W, H)
      renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2))
      renderer.outputEncoding = THREE.sRGBEncoding
      renderer.setClearColor(0x000000, 0) // transparent background
      container.appendChild(renderer.domElement)

      // ── Scene ─────────────────────────────────────────────────────────
      const scene = new THREE.Scene()

      // ── Camera ────────────────────────────────────────────────────────
      const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100)
      camera.position.set(0, 0, 3.5)

      // ── Lighting — ambient warm white + gold directional ──────────────
      const ambient = new THREE.AmbientLight(0xF7F5F0, 0.85)
      scene.add(ambient)

      const goldSpot = new THREE.DirectionalLight(0xC8860A, 1.4) // Hermès amber
      goldSpot.position.set(2.5, 3, 2)
      scene.add(goldSpot)

      const fillLight = new THREE.DirectionalLight(0xffffff, 0.35)
      fillLight.position.set(-2, -1, 1.5)
      scene.add(fillLight)

      const rimLight = new THREE.DirectionalLight(0xE09B1A, 0.5)
      rimLight.position.set(0, -3, -2)
      scene.add(rimLight)

      // ── OrbitControls — drag to rotate, no pan, no zoom (hero) ────────
      controls = new OrbitControls(camera, renderer.domElement)
      controls.enablePan   = false
      controls.enableZoom  = false
      controls.autoRotate  = true
      controls.autoRotateSpeed = 1.2
      controls.enableDamping   = true
      controls.dampingFactor   = 0.06
      controls.minPolarAngle   = Math.PI / 3
      controls.maxPolarAngle   = (2 * Math.PI) / 3

      // Stop auto-rotate the moment user touches/clicks
      const stopAutoRotate = () => { controls.autoRotate = false }
      controls.addEventListener('start', stopAutoRotate)

      // ── Load GLB ──────────────────────────────────────────────────────
      const loader = new GLTFLoader()
      loader.load(
        modelUrl,
        (gltf: any) => {
          // Auto-center and scale the model
          const box    = new THREE.Box3().setFromObject(gltf.scene)
          const center = box.getCenter(new THREE.Vector3())
          const size   = box.getSize(new THREE.Vector3())
          const maxDim = Math.max(size.x, size.y, size.z)
          const scale  = 2.2 / maxDim

          gltf.scene.scale.setScalar(scale)
          gltf.scene.position.sub(center.multiplyScalar(scale))
          scene.add(gltf.scene)

          // Cap texture resolution on mobile
          if (isMobile) {
            gltf.scene.traverse((node: any) => {
              if (node.isMesh && node.material) {
                const mats = Array.isArray(node.material) ? node.material : [node.material]
                mats.forEach((mat: any) => {
                  const texFields = ['map','normalMap','roughnessMap','metalnessMap','emissiveMap']
                  texFields.forEach((f) => {
                    if (mat[f]) {
                      mat[f].minFilter = THREE.LinearFilter
                      mat[f].generateMipmaps = false
                    }
                  })
                })
              }
            })
          }

          setLoading(false)
        },
        undefined,
        () => {
          // GLB load failed — fall through to fallback image
          setModelErr(true)
          setLoading(false)
        },
      )

      // ── Animation loop ────────────────────────────────────────────────
      const animate = () => {
        animId = requestAnimationFrame(animate)
        controls.update()
        renderer.render(scene, camera)
      }
      animate()

      // ── Handle window resize ──────────────────────────────────────────
      const onResize = () => {
        if (!container) return
        const w = container.clientWidth
        const h = container.clientHeight
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        renderer.setSize(w, h)
      }
      window.addEventListener('resize', onResize)

      // ── Cleanup ───────────────────────────────────────────────────────
      return () => {
        cancelAnimationFrame(animId)
        window.removeEventListener('resize', onResize)
        controls.removeEventListener('start', stopAutoRotate)
        controls.dispose()
        renderer.dispose()
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement)
        }
      }
    }

    let cleanupFn: (() => void) | null = null
    init().then((fn) => { cleanupFn = fn ?? null })

    return () => { cleanupFn?.() }
  }, [modelUrl])

  // Fallback: WebGL not supported or model failed to load
  if (!webglOk || modelErr) {
    if (fallbackImageUrl) {
      return (
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <Image
          src={fallbackImageUrl}
          alt="Product showcase"
          fill
          className="object-contain"
        />
      </div>
      )
    }
    return (
      <div
        style={{
          width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.6875rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-disabled)' }}>
          {!webglOk ? '3D not supported' : 'Model unavailable'}
        </span>
      </div>
    )
  }

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      {loading && (
        <div
          style={{ position: 'absolute', inset: 0, zIndex: 1 }}
          aria-label="Loading 3D model…"
        >
          <div className="skeleton" style={{ width: '100%', height: '100%' }} />
        </div>
      )}
    </div>
  )
}
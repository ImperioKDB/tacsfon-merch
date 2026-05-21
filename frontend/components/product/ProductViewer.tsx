'use client';

/**
 * ProductViewer
 *
 * Renders the left-panel media for a product detail page.
 *
 * 3D Strategy — two approaches, zero storage cost, no free-tier limits:
 *
 *   Approach B (GLB from /public/models/ via Vercel CDN):
 *     - Active when product.model_url is set
 *     - Uses existing Three.js r128 + OrbitControls + GLTFLoader code (unchanged)
 *     - Files live in frontend/public/models/ — served free by Vercel CDN
 *
 *   Approach A (Procedural Three.js geometry):
 *     - Active when model_url is null OR the GLB fails to load
 *     - Pure Three.js code — no files, no storage, works forever
 *     - Shape picked from product category (tshirt, hoodie, cap, totebag, beanie, tie)
 *     - Colour driven reactively by useSelectedProductStore (set by VariantSelector)
 *     - Lazy-loaded — never in the initial bundle
 *
 * Tab behaviour:
 *   - "3D View" tab: always shown (Approach B or A depending on modelUrl)
 *   - "Image" tab: shown only when product has a photo
 *   - If no photo: only "3D View" tab shown
 */
'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import dynamic                                        from 'next/dynamic'
import Image                                          from 'next/image'
import { ShoppingBag, Box, ImageIcon }                from 'lucide-react'
import { useSelectedProductStore }                    from '@/store/selected-product'

// ── Approach A: lazy-load procedural viewer — never in initial bundle ────────
const ProceduralMerchViewer = dynamic(
  () => import('@/components/3d/ProceduralMerchViewer'),
  {
    ssr:     false,
    loading: () => (
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ background: 'var(--color-surface)' }}
      >
        <div
          className="h-1 w-32"
          style={{ background: 'var(--color-surface-2)' }}
        >
          <div
            className="h-full animate-pulse"
            style={{ background: 'var(--color-gold)', width: '60%' }}
          />
        </div>
      </div>
    ),
  }
)

interface Props {
  imageUrl:      string | null
  modelUrl:      string | null
  productName:   string
  categoryName?: string | null   // drives procedural viewer shape (Approach A)
}

type ActiveTab = '3d' | 'image'

export default function ProductViewer({ imageUrl, modelUrl, productName, categoryName }: Props) {
  const hasGLB   = Boolean(modelUrl)   // Approach B available
  const hasImage = Boolean(imageUrl)

  // Read selected variant colour from store (written by ProductInfo on variant change)
  const variantColor = useSelectedProductStore(s => s.variantColor)

  const [activeTab,    setActiveTab]    = useState<ActiveTab>('3d')
  const [modelLoaded,  setModelLoaded]  = useState(false)
  const [loadProgress, setLoadProgress] = useState(0)
  const [glbFailed,    setGlbFailed]    = useState(false)  // GLB load error → fall to Approach A

  const canvasRef  = useRef<HTMLDivElement>(null)
  const disposeRef = useRef<(() => void) | null>(null)

  // ── Approach B: GLB loader (original Three.js code, unchanged) ─────────────
  const initGLB = useCallback(async () => {
    if (!canvasRef.current || !modelUrl) return

    // WebGL availability check
    try {
      const testCanvas = document.createElement('canvas')
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')
      if (!gl) throw new Error('WebGL unavailable')
    } catch {
      setGlbFailed(true)
      return
    }

    try {
      const THREE             = await import('three')
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls')
      const { GLTFLoader }    = await import('three/examples/jsm/loaders/GLTFLoader')

      const container = canvasRef.current
      const w = container.clientWidth
      const h = container.clientHeight

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(w, h)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.outputEncoding = THREE.sRGBEncoding
      renderer.toneMapping    = THREE.ACESFilmicToneMapping
      container.appendChild(renderer.domElement)

      // Scene + Camera
      const scene  = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100)
      camera.position.set(0, 0, 3)

      // Three-point lighting (original — unchanged)
      const ambient = new THREE.AmbientLight(0xfff5e0, 0.6)
      const key     = new THREE.DirectionalLight(0xffffff, 1.2)
      const fill    = new THREE.DirectionalLight(0xfff5e0, 0.4)
      const rim     = new THREE.DirectionalLight(0xc8860a, 0.8)
      key.position.set(2, 4, 2)
      fill.position.set(-2, 0, 2)
      rim.position.set(0, -2, -3)
      scene.add(ambient, key, fill, rim)

      // OrbitControls
      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enablePan       = false
      controls.minDistance     = 1
      controls.maxDistance     = 8
      controls.enableDamping   = true
      controls.dampingFactor   = 0.05
      controls.autoRotate      = true
      controls.autoRotateSpeed = 1.2
      controls.addEventListener('start', () => { controls.autoRotate = false })

      // Load GLB
      const loader = new GLTFLoader()
      loader.load(
        modelUrl,
        (gltf) => {
          const box    = new THREE.Box3().setFromObject(gltf.scene)
          const center = box.getCenter(new THREE.Vector3())
          const size   = box.getSize(new THREE.Vector3())
          const maxDim = Math.max(size.x, size.y, size.z)
          gltf.scene.position.sub(center)
          camera.position.set(0, 0, maxDim * 2)
          controls.minDistance = maxDim * 0.8
          controls.maxDistance = maxDim * 6
          scene.add(gltf.scene)
          setLoadProgress(100)
          setModelLoaded(true)
        },
        (xhr) => {
          if (xhr.total) setLoadProgress(Math.round((xhr.loaded / xhr.total) * 100))
        },
        () => {
          // GLB failed — Approach A (procedural) takes over silently
          setGlbFailed(true)
        }
      )

      // Resize observer
      const resizeObserver = new ResizeObserver(() => {
        const nw = container.clientWidth
        const nh = container.clientHeight
        camera.aspect = nw / nh
        camera.updateProjectionMatrix()
        renderer.setSize(nw, nh)
      })
      resizeObserver.observe(container)

      // Render loop
      let animId: number
      const animate = () => {
        animId = requestAnimationFrame(animate)
        controls.update()
        renderer.render(scene, camera)
      }
      animate()

      disposeRef.current = () => {
        cancelAnimationFrame(animId)
        resizeObserver.disconnect()
        controls.dispose()
        renderer.dispose()
        if (renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement)
        }
      }
    } catch {
      // Any Three.js setup error → fall to Approach A
      setGlbFailed(true)
    }
  }, [modelUrl])

  // Mount / unmount GLB scene with tab
  useEffect(() => {
    if (activeTab === '3d' && hasGLB && !glbFailed) {
      initGLB()
    }
    return () => {
      disposeRef.current?.()
      disposeRef.current = null
      setModelLoaded(false)
      setLoadProgress(0)
    }
  }, [activeTab, hasGLB, glbFailed, initGLB])

  // ── Render logic ────────────────────────────────────────────────────────────
  // showGLB:        Approach B — real .glb is loading / loaded
  // showProcedural: Approach A — no GLB, or GLB failed
  const showGLB        = activeTab === '3d' && hasGLB && !glbFailed
  const showProcedural = activeTab === '3d' && (!hasGLB || glbFailed)

  return (
    <div className="space-y-4">

      {/* Media container */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          aspectRatio: '1 / 1',
          background:  'var(--color-surface)',
          border:      '1px solid var(--color-border)',
        }}
      >

        {/* ── Approach B: GLB canvas ─────────────────────────────────── */}
        {showGLB && (
          <>
            <div ref={canvasRef} className="absolute inset-0 h-full w-full" />

            {/* Loading progress bar */}
            {!modelLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div
                  className="h-1 w-48 overflow-hidden"
                  style={{ background: 'var(--color-surface-2)' }}
                >
                  <div
                    className="h-full transition-all duration-300"
                    style={{ background: 'var(--color-gold)', width: `${loadProgress}%` }}
                  />
                </div>
                <p className="text-xs" style={{ color: 'var(--color-text-disabled)' }}>
                  Loading 3D model… {loadProgress}%
                </p>
              </div>
            )}

            {/* 3D badge */}
            {modelLoaded && (
              <div
                className="absolute left-3 top-3 flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold"
                style={{
                  background: 'var(--color-gold-muted)',
                  border:     '1px solid rgba(200,134,10,0.3)',
                  color:      'var(--color-gold)',
                }}
              >
                <Box size={12} strokeWidth={1.5} />
                3D
              </div>
            )}
          </>
        )}

        {/* ── Approach A: Procedural viewer ──────────────────────────── */}
        {showProcedural && (
          <div className="absolute inset-0 h-full w-full">
            <ProceduralMerchViewer
              category={categoryName}
              colorName={variantColor}
            />
            {/* 3D badge */}
            <div
              className="absolute left-3 top-3 flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold"
              style={{
                background: 'var(--color-gold-muted)',
                border:     '1px solid rgba(200,134,10,0.3)',
                color:      'var(--color-gold)',
              }}
            >
              <Box size={12} strokeWidth={1.5} />
              3D
            </div>
          </div>
        )}

        {/* ── Image tab ──────────────────────────────────────────────── */}
        {activeTab === 'image' && (
          <>
            {hasImage ? (
              <Image
                src={imageUrl!}
                alt={productName}
                fill
                sizes="(max-width: 1024px) 100vw, 480px"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ShoppingBag
                  size={60}
                  strokeWidth={1}
                  style={{ color: 'var(--color-text-disabled)' }}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2">
        {[
          { key: '3d',    icon: <Box size={14} strokeWidth={1.5} />,       label: '3D View' },
          // Image tab only shown when a photo exists
          ...(hasImage
            ? [{ key: 'image', icon: <ImageIcon size={14} strokeWidth={1.5} />, label: 'Image' }]
            : []),
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as ActiveTab)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all"
            style={{
              background: activeTab === tab.key ? 'var(--color-gold-muted)' : 'var(--color-surface)',
              color:      activeTab === tab.key ? 'var(--color-gold)'        : 'var(--color-text-secondary)',
              border:     activeTab === tab.key
                ? '1px solid rgba(200,134,10,0.3)'
                : '1px solid var(--color-border)',
              minHeight: '44px',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
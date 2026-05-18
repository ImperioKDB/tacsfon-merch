/**
 * ProductViewer
 *
 * Renders the left-panel media for a product detail page.
 *
 * Behaviour:
 * - If product has a model_url: shows two tabs — "3D View" and "Image"
 * - If no model_url: shows image only (no tabs)
 * - 3D canvas: Three.js r128, OrbitControls (drag/zoom), three-point lighting,
 *   gold rim light, progress bar while loading, auto-dispose on unmount
 * - If WebGL is unavailable or model fails: silently falls back to image
 * - If no image and no model: shows a placeholder icon
 */
'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image                                         from 'next/image'
import { ShoppingBag, Box, ImageIcon }               from 'lucide-react'

interface Props {
  imageUrl:    string | null
  modelUrl:    string | null
  productName: string
}

type ActiveTab = '3d' | 'image'

export default function ProductViewer({ imageUrl, modelUrl, productName }: Props) {
  const has3D    = Boolean(modelUrl)
  const hasImage = Boolean(imageUrl)

  const [activeTab,    setActiveTab]    = useState<ActiveTab>(has3D ? '3d' : 'image')
  const [modelLoaded,  setModelLoaded]  = useState(false)
  const [modelError,   setModelError]   = useState(false)
  const [loadProgress, setLoadProgress] = useState(0)

  const canvasRef    = useRef<HTMLDivElement>(null)
  const disposeRef   = useRef<(() => void) | null>(null)

  const init3D = useCallback(async () => {
    if (!canvasRef.current || !modelUrl) return

    // Test WebGL availability before importing Three.js
    try {
      const testCanvas = document.createElement('canvas')
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')
      if (!gl) throw new Error('WebGL unavailable')
    } catch {
      setModelError(true)
      setActiveTab('image')
      return
    }

    try {
      const THREE = await import('three')
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

      // Three-point lighting
      const ambient = new THREE.AmbientLight(0xfff5e0, 0.6)               // warm white
      const key     = new THREE.DirectionalLight(0xffffff, 1.2)            // key
      const fill    = new THREE.DirectionalLight(0xfff5e0, 0.4)            // fill
      const rim     = new THREE.DirectionalLight(0xc8860a, 0.8)            // gold rim

      key.position.set(2, 4, 2)
      fill.position.set(-2, 0, 2)
      rim.position.set(0, -2, -3)

      scene.add(ambient, key, fill, rim)

      // Controls
      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enablePan  = false
      controls.minDistance = 1
      controls.maxDistance = 8
      controls.enableDamping    = true
      controls.dampingFactor    = 0.05
      controls.autoRotate       = true
      controls.autoRotateSpeed  = 1.2

      // Stop auto-rotate when user interacts
      controls.addEventListener('start', () => { controls.autoRotate = false })

      // Load model
      const loader = new GLTFLoader()
      loader.load(
        modelUrl,
        (gltf) => {
          // Center and fit model
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
          if (xhr.total) {
            setLoadProgress(Math.round((xhr.loaded / xhr.total) * 100))
          }
        },
        () => {
          // Silent fallback to image on error
          setModelError(true)
          setActiveTab('image')
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

      // Dispose function stored in ref
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
      setModelError(true)
      setActiveTab('image')
    }
  }, [modelUrl])

  // Mount / unmount 3D scene with tab
  useEffect(() => {
    if (activeTab === '3d' && has3D && !modelError) {
      init3D()
    }
    return () => {
      disposeRef.current?.()
      disposeRef.current = null
      setModelLoaded(false)
      setLoadProgress(0)
    }
  }, [activeTab, has3D, modelError, init3D])

  return (
    <div className="space-y-4">

      {/* Media container */}
      <div
        className="relative w-full overflow-hidden rounded-2xl"
        style={{
          aspectRatio: '1 / 1',
          background:  'var(--color-surface)',
          border:      '1px solid var(--color-border)',
        }}
      >
        {/* ── 3D canvas ── */}
        {activeTab === '3d' && !modelError && (
          <>
            <div ref={canvasRef} className="absolute inset-0 h-full w-full" />

            {/* Loading progress bar */}
            {!modelLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div
                  className="h-1 w-48 overflow-hidden rounded-full"
                  style={{ background: 'var(--color-surface-2)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-300"
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
                className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
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

        {/* ── Image ── */}
        {(activeTab === 'image' || modelError) && (
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
                <ShoppingBag size={60} strokeWidth={1} style={{ color: 'var(--color-text-disabled)' }} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Tab switcher — only rendered when model exists */}
      {has3D && !modelError && (
        <div className="flex gap-2">
          {[
            { key: '3d',    icon: <Box size={14} strokeWidth={1.5} />,       label: '3D View' },
            { key: 'image', icon: <ImageIcon size={14} strokeWidth={1.5} />, label: 'Image'   },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as ActiveTab)}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all"
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
      )}
    </div>
  )
}

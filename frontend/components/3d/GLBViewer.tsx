'use client'

/**
 * Loads and displays a .glb model from /public/models/ (served by Vercel CDN).
 * Called only when product.model_url is set.
 * On any error it calls onError() — parent falls back to ProceduralMerchViewer.
 */

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface Props {
  modelUrl: string
  onError?: () => void
}

export default function GLBViewer({ modelUrl, onError }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = ref.current
    if (!mount) return

    const scene  = new THREE.Scene()
    scene.background = new THREE.Color(0x13131A)

    const w = mount.clientWidth  || 400
    const h = mount.clientHeight || 400
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100)
    camera.position.set(0, 0, 3)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(w, h)
    renderer.outputEncoding = THREE.sRGBEncoding
    mount.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    const key = new THREE.DirectionalLight(0xfff5e0, 1.2)
    key.position.set(5, 5, 5); scene.add(key)
    const fill = new THREE.DirectionalLight(0xc9a84c, 0.4)
    fill.position.set(-5, 0, -5); scene.add(fill)

    let model: THREE.Object3D | null = null

    import('three/examples/jsm/loaders/GLTFLoader').then(({ GLTFLoader }) => {
      new GLTFLoader().load(
        modelUrl,
        (gltf) => {
          model = gltf.scene
          const box = new THREE.Box3().setFromObject(model)
          const centre = new THREE.Vector3()
          box.getCenter(centre)
          model.position.sub(centre)
          const size = box.getSize(new THREE.Vector3()).length()
          camera.position.set(0, 0, size * 1.8)
          camera.near = size / 100; camera.far = size * 100
          camera.updateProjectionMatrix()
          scene.add(model)
        },
        undefined,
        () => onError?.()
      )
    }).catch(() => onError?.())

    let down = false, lx = 0, ly = 0
    const onDown  = (e: PointerEvent) => { down = true; lx = e.clientX; ly = e.clientY }
    const onUp    = () => { down = false }
    const onMove  = (e: PointerEvent) => {
      if (!down || !model) return
      model.rotation.y += (e.clientX - lx) * 0.01
      model.rotation.x += (e.clientY - ly) * 0.01
      lx = e.clientX; ly = e.clientY
    }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      camera.position.z = Math.max(1, Math.min(10, camera.position.z + e.deltaY * 0.01))
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
      if (model && !down) model.rotation.y += 0.003
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
  }, [modelUrl, onError])

  return (
    <div ref={ref}
      className="w-full h-full cursor-grab active:cursor-grabbing"
      aria-label="3D product viewer — drag to rotate, scroll to zoom"
    />
  )
}
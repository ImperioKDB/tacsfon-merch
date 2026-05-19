# Phase 5 — 3D Viewers (Procedural, Zero Storage)

## Architecture

```
ProductViewer3D          ← top-level (used in ProductDetailClient)
  ├── GLBViewer          ← loads /public/models/*.glb via Vercel CDN (optional)
  └── ProceduralMerchViewer  ← routes by category name (always available)
        ├── TShirtViewer3D   ← maroon/black tee + TACSFON canvas-texture branding
        ├── HoodieViewer3D   ← pullover with hood, pocket, logo
        ├── CapViewer3D      ← crown, band, brim, snap adjuster, embroidered logo
        ├── ToteBagViewer3D  ← box body, arc handles, TACSFON print
        ├── BeanieViewer3D   ← LatheGeometry body, cuff, gold pom-pom
        └── TieViewer3D      ← extruded blade, knot, diagonal gold stripe
```

## Cost model — FREE FOREVER

| Asset | Storage | Cost |
|-------|---------|------|
| Procedural viewers | None — pure Three.js code | £0 forever |
| Optional real .glb | `/public/models/` in this repo | £0 — served by Vercel CDN |
| Supabase storage | Not used for 3D | Not consumed |

## npm install (one-time)

```bash
npm install three@0.128.0
npm install --save-dev @types/three
```

Pin to `0.128.0` — do NOT upgrade (r128 matches rest of spec).

## How ProductViewer3D decides what to show

```
product.model_url set?
  YES → GLBViewer → load /public/models/<file>.glb
          ↳ on error → ProceduralMerchViewer (silent fallback)
  NO  → ProceduralMerchViewer directly
```

## Category → viewer mapping

| Category name contains | Viewer |
|------------------------|--------|
| hoodie / sweat / pullover | HoodieViewer3D |
| cap / hat / snapback / fitted | CapViewer3D |
| bag / tote | ToteBagViewer3D |
| beanie / beamer / winter hat | BeanieViewer3D |
| tie | TieViewer3D |
| anything else (tshirt, shirt, …) | TShirtViewer3D |

## Adding a real .glb in future

1. Optimise the model: `npx gltf-pipeline -i raw.glb -o small.glb --draco.compressionLevel 10`
2. Drag into `frontend/public/models/` and commit
3. In Supabase, set `products.model_url = '/models/small.glb'`
4. Done — GLBViewer picks it up automatically

## Colour variants

Colour names stored in the DB (e.g. "Maroon", "Black") are resolved to hex
values by `lib/utils/merch-colors.ts`. Add new colours there; no viewer code changes needed.

## Test checklist

- [ ] TShirtViewer shows correct body colour from variant selection
- [ ] TShirtViewer logo: cross + "ACSFON" + subtitle all visible and white
- [ ] HoodieViewer shows hood behind collar and kangaroo pocket
- [ ] CapViewer shows full crown, brim, and snapback adjuster
- [ ] ToteBagViewer shows arc handles and TACSFON print
- [ ] BeanieViewer shows gold pom-pom and ribbed cuff
- [ ] TieViewer shows pointed blade, knot, and diagonal gold stripes
- [ ] All viewers: drag to rotate works, scroll to zoom works
- [ ] All viewers: auto-spin pauses on pointer hold
- [ ] Switching variant colour → viewer re-renders with new colour (no flicker)
- [ ] No memory leaks: navigate away and back several times — memory stable
- [ ] product.model_url set → GLBViewer loads; on error → silently shows procedural
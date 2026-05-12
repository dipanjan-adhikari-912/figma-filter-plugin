# (1) Figma plugin structure and setup
_Exported on 5/8/2026 at 16:19:57 GMT+5:30 from Cursor (3.3.27)_

---

**User**

I am building a Figma plugin for modern image filters. The goal is a React-based UI with a logic-heavy backend. Create a file structure that separates the UI layer (React/Tailwind) from the Image Processing layer (Canvas API).

Setup a manifest.json for a UI-based plugin.

Create a main.ts that handles image selection and message passing.

Create a UI.tsx with a category sidebar (Tactile, Glitch, Uncanny).

Keep the code modular. Do not write the filter logic yet—just the communication bridge.

---

**Cursor**

I’ll quickly inspect the current project structure so the plan fits your existing setup, then I’ll propose a concrete modular file layout and implementation steps for `manifest.json`, `main.ts`, and `ui.tsx` without adding filter logic.

---

**User**

The filter effects have to be modular, so that I can add or remove easily

---

**Cursor**

Great direction—I'll refine the plan to explicitly enforce a pluggable filter-module architecture (easy add/remove) in both UI categories and backend registry, while still keeping filter logic unimplemented.

Perfect—updated the plan to make filter effects explicitly **plug-and-play**.

I refined it so adding/removing filters only touches:
- `src/shared/filterCatalog.ts` (metadata + category mapping),
- `src/core/processing/filters/*` (individual filter stub modules),
- `src/core/processing/filterRegistry.ts` (handler registration).

`main.ts` stays clean and doesn’t grow switch-case logic.  
UI category/filter lists are data-driven from the catalog, so they auto-adjust when filters are added/removed.

If you want, next I can execute this plan and scaffold the actual files now.

---

**User**

Start execution

---

**Cursor**

I’m starting implementation now: I’ll scaffold the full modular structure, wire typed UI↔main messaging, and keep filter handlers as removable stubs with no real image effect logic yet.

I’ve added the shared typed contracts and catalog; next I’m wiring the backend bridge (`main.ts`, selection parsing, filter registry, and processing stubs), then I’ll build the React UI sidebar/list components around those contracts.

Backend bridge and registry stubs are in place. I’m finishing the React UI layer now (`ui.tsx`, `App.tsx`, sidebar + filter list) and then I’ll run a lint check for these new files.

Scaffold is complete; I’m doing a quick diagnostics pass now to catch any TypeScript/React issues in the new files before I hand it over.

Implemented the scaffold end-to-end with a modular UI/backend split and a plug-and-play filter registry (no filter math yet).

### What I created

- `manifest.json`  
  - UI-based plugin manifest with `main` + `ui` entries.

- Backend bridge + modular processing layer  
  - `src/main.ts` (selection handling + typed message routing)
  - `src/core/selection/getSelectedImage.ts` (selection parsing + image-fill validation)
  - `src/core/bridge/uiBridge.ts` (UI response/error helpers)
  - `src/core/processing/canvasAdapter.ts` (Canvas processing stub only)
  - `src/core/processing/filterRegistry.ts` (filter ID -> handler lookup)
  - `src/core/processing/filters/index.ts` (per-filter stub handlers)

- Shared contracts (single source of truth)  
  - `src/shared/messages.ts` (UI↔Main message types)
  - `src/shared/filterTypes.ts` (categories, ids, descriptors)
  - `src/shared/filterCatalog.ts` (catalog entries for Tactile/Glitch/Uncanny)

- React UI layer  
  - `src/ui/ui.tsx` (React entry)
  - `src/ui/App.tsx` (bridge wiring + layout)
  - `src/ui/components/CategorySidebar.tsx` (Tactile / Glitch / Uncanny sidebar)
  - `src/ui/components/FilterList.tsx` (dynamic filters per category)
  - `src/ui/styles/tailwind.css` (Tailwind-ready base)
  - `src/ui/ui.html` (UI mount)

### Modularity guarantees (add/remove filters easily)

- Add/remove filter metadata in `src/shared/filterCatalog.ts`
- Add/remove handler in `src/core/processing/filters/index.ts`
- Registry routes via `src/core/processing/filterRegistry.ts`
- `src/main.ts` does not need per-filter branching logic

### Communication bridge behavior

- UI requests:
  - `LIST_FILTERS`
  - `GET_SELECTION`
  - `APPLY_FILTER_PLACEHOLDER`
- Main responds with:
  - `FILTER_CATALOG`
  - `SELECTION_STATUS`
  - `PROCESSING_ACK` / `ERROR`
- All apply actions currently return a **not implemented** stub acknowledgement by design.

No linter issues were reported for the new scaffold.

If you want, next I can add a minimal build setup (`vite` + React + Tailwind + Figma plugin bundling) so this runs immediately in Figma without manual wiring.

---

**User**

yeah do that

---

**Cursor**

I’ll set up a minimal Vite + React + Tailwind + Figma plugin build pipeline next, including scripts to build/watch and output `dist/main.js` + `dist/ui.html` for the manifest.

Next I’m adding project configs (`package.json`, TypeScript, Vite, Tailwind/PostCSS) and installing dependencies, then I’ll run a build to confirm `dist` outputs match your manifest.

Build tooling scaffold is in place for Vite + React + Tailwind + Figma plugin output.

### Added build/config files

- `package.json`  
  - Scripts:
    - `build` (`build:ui` then `build:main`)
    - `dev` watch mode for both UI and main
    - `typecheck`
  - Dependencies and devDependencies for React, Vite, Tailwind, PostCSS, and `vite-plugin-singlefile`.

- `tsconfig.json`
- `postcss.config.cjs`
- `tailwind.config.cjs`
- `vite.ui.config.ts`
  - Builds from `src/ui`
  - Outputs `dist/ui.html`
  - Uses `vite-plugin-singlefile` so UI is self-contained
- `vite.main.config.ts`
  - Builds `src/main.ts` to `dist/main.js`
  - Inlines `dist/ui.html` into `__html__` during build
- `src/global.d.ts` (`declare const __html__: string;`)
- `.gitignore` (`node_modules`, `dist`, logs)

### Existing scaffold still aligned

- `manifest.json` already points to:
  - `dist/main.js`
  - `dist/ui.html`
- Your modular bridge architecture stays intact:
  - UI layer in `src/ui/*`
  - processing/registry in `src/core/processing/*`
  - shared contracts in `src/shared/*`

### Important blocker on your machine

`npm` is not currently available in this shell environment, so I could not run install/build commands here.

To run locally, install Node.js (which includes `npm`) or ensure `npm` is on PATH, then run:

```bash
npm install
npm run build
```

After that, load the plugin in Figma from this folder and it should pick up `manifest.json` + `dist/*`.

If you want, I can also add a tiny `README.md` with exact “run + load in Figma” steps and troubleshooting.

---

**User**

vendor-core-229ba1ea832d24ba.min.js.br:54 Error: Unable to load code: Error: Error invoking remote method 'web:getLocalFileExtensionSource': Error: ENOENT: no such file or directory, lstat 'C:\Users\dadhi\Documents\Figma Plugins\Filter plugin\dist\main.js'
    at eu (figma_app-ef473f2848b39390.min.js.br:46:434984)
    at async figma_app-ef473f2848b39390.min.js.br:46:452622
    at async Promise.all (/design/fdSXjwYYtBMIxCsNprvsZi/index 0)
    at async eo (figma_app-ef473f2848b39390.min.js.br:46:452593)
    at async figma_app-ef473f2848b39390.min.js.br:46:450140

---

**Cursor**

This error means Figma is loading `manifest.json` correctly, but your compiled plugin output is missing: `dist/main.js` does not exist yet. I’ll quickly add a no-build fallback so the plugin can load immediately, then you can switch back to Vite build once npm is available.

That stack trace is exactly because Figma can’t find `dist/main.js`.

I’ve now created a **working fallback `dist` output** so the plugin can load immediately:

- `dist/main.js`
- `dist/ui.html`

So your current `manifest.json` paths should resolve now.

### What to do now

1. In Figma, reload/re-import the plugin from the same folder.
2. It should open without the `ENOENT ... dist/main.js` error.

### Why this happened

Your scaffold had source/config files, but no built artifacts yet (because `npm` isn’t available in this terminal environment), so `dist/main.js` never got generated.

### Note

This fallback `dist/ui.html` is plain JS UI (not React-built) just to unblock loading right now.  
Your React/Tailwind source scaffold is still intact in `src/*`. Once npm is available on your machine, run:

- `npm install`
- `npm run build`

and it will switch back to the proper Vite React pipeline output.

---

**User**

Okay the plugin has summoned, start with the filter algo implement

---

**Cursor**

Great—next I’ll wire a real first-pass filter pipeline (pixel processing via Canvas in UI, then apply back to selected image node), while keeping it modular so each filter remains pluggable. I’ll inspect the current files and implement the bridge end-to-end.

I’m implementing a real processing roundtrip now: `main` will extract selected image bytes, UI will run Canvas-based pixel filters, then `main` will write processed bytes back to the node’s image fill. I’ll keep it pluggable per filter ID.

Filter algorithm pipeline is now implemented and wired end-to-end.

### What’s now working

- Real image-processing flow:
  - `main` reads selected image fill bytes
  - sends bytes to UI via `PROCESS_IMAGE`
  - UI runs Canvas pixel processing
  - UI returns processed bytes via `PROCESSING_RESULT`
  - `main` creates a new Figma image and replaces the selected node’s image fill

### Implemented filters (modular, pluggable)

- `tactile-grain`
- `tactile-print`
- `glitch-rgb-split`
- `glitch-scanline`
- `uncanny-haze`
- `uncanny-echo`

### Source files updated

- `src/shared/messages.ts` (new processing message contracts)
- `src/main.ts` (request/response processing bridge + image fill apply)
- `src/ui/App.tsx` (handles `PROCESS_IMAGE` and returns `PROCESSING_RESULT`)
- `src/ui/processing/filterAlgorithms.ts` (modular per-filter pixel algorithms)
- `src/ui/processing/canvasProcessor.ts` (canvas decode/process/encode pipeline)

### Immediate runtime files updated too

Since your current environment is loading from `dist` directly, I also updated:

- `dist/main.js`
- `dist/ui.html`

So this should work right away without waiting for npm build setup.

### Next step

Reload the plugin in Figma and test on an image-filled node.  
If you want, next I can add per-filter intensity sliders and pass parameter payloads through the same bridge (still modular per filter).

---

**User**

vendor-core-229ba1ea832d24ba.min.js.br:54 Syntax error on line 150: Unexpected token ...
        updatedFills[selected.paintIndex] = { ...target, imageHash: outputImage.hash };
                                              ^
(anonymous) @ vendor-core-229ba1ea832d24ba.min.js.br:54
2vendor-core-229ba1ea832d24ba.min.js.br:54 Error: Syntax error on line 150: Unexpected token ...
    at c (4555-b5daea119ebef0f4.min.js.br:572:45)
    at async figma_app-ef473f2848b39390.min.js.br:46:458215

---

**Cursor**

That error is from the fallback `dist/main.js` using object spread, which Figma’s parser for this local load is rejecting. I’ll patch it to ES5-safe assignment style now.

Patched the syntax issue in `dist/main.js`.

- Replaced object spread:
  - `updatedFills[selected.paintIndex] = { ...target, imageHash: outputImage.hash };`
- With parser-safe form:
  - `Object.assign({}, target, { imageHash: outputImage.hash })`

Reload the plugin once in Figma and test again.  
If another syntax error appears, share that line too and I’ll make the fallback `dist` fully legacy-safe.

---

**User**

Okay the filters work but is super slow. Can you add a loader to let the users know something is in progress and also try making the process faster. It's lagging the whole application

---

**Cursor**

I’ll add a visible processing loader and apply two performance optimizations: avoid expensive byte-array conversions in messaging, and process large images at a reduced working resolution before upscaling back. I’ll patch both `src` and currently-used `dist` so it helps immediately.

I’m now adding the UI loading state (overlay + disabled actions during processing), then I’ll mirror equivalent changes in `dist` so you feel the speedup immediately in your current setup.

Implemented both requested improvements: **loader UI** + **faster processing path**.

### What changed

- Added a visible in-progress state in UI:
  - Disables action buttons during filter processing
  - Button text changes to `Processing...`
  - Full-screen overlay shown: `Applying filter...`
- Applied performance optimizations:
  - Removed costly `Array.from(...)` conversion on the main → UI image payload path (now sends `Uint8Array` directly)
  - Added adaptive processing resolution in Canvas:
    - Large images are processed at a capped working size (`~1,000,000` pixels)
    - Result is upscaled back to original size before returning
  - Canvas contexts now use performance-friendly options (`willReadFrequently`, `desynchronized`)

### Files updated

- `src/shared/messages.ts`
- `src/main.ts`
- `src/ui/App.tsx`
- `src/ui/processing/canvasProcessor.ts`
- `dist/main.js`
- `dist/ui.html`

### Why this should feel faster

- Biggest lag was CPU + memory pressure from full-resolution pixel loops and byte-array copying.
- Now:
  - message serialization is lighter,
  - processing loops run on fewer pixels for large inputs,
  - users see immediate feedback that work is in progress instead of a frozen feeling.

If you want, I can add a **“Quality mode” toggle** (`Fast` vs `High`) so users can choose speed or fidelity per apply.

---

**User**

Okay, need to change the UI now. LHS should be  a image review panel.
RHS should be the control panel and will have the following tabs:
1. Apply Filters
2. Settings
3. About

1. Apply filters tab is where all the magic happens.
1.a There will be a plus button which will open the complete list of effects. Users can add more than one effect on the same image. The limit should be max upto 3 
2. Settings tab will have some settings like:
2.a "If enabled, you can save the result as a new image. If disabled, the image will be added to the fills. [Checkbox]"
2.b Add button in the properties panel for quick launch of the plugin.
[CTA to add]


---

**Cursor**

I’m implementing a full UI refactor now with the layout and behavior you described, plus backend support for stacked effects (max 3), settings, and relaunch CTA. I’ll update both `src` and currently-running `dist` so it works immediately.

I’ve updated the TypeScript source bridge/UI model; now I’m syncing the live `dist` runtime files with the same tabbed layout and stacked-effect behavior so you can test this immediately in Figma.

Refactored the plugin to the new product layout and behavior, and synced it to both source and live runtime output.

### UI changes implemented

- **LHS = Image Review Panel**
  - Large preview area now shows selected image.
  - Uses selection preview bytes from `main` to render the actual image.

- **RHS = Control Panel with tabs**
  - `Apply Filters`
  - `Settings`
  - `About`

- **Apply Filters tab**
  - `+` button opens a full effects drawer.
  - Users can add multiple effects.
  - Hard cap enforced at **3 effects max**.
  - Applied-effects list supports removing individual effects.
  - `Apply stack` applies chosen effects in order.

- **Settings tab**
  - Checkbox:
    - Enabled => save processed result as a **new image layer**
    - Disabled => write result into existing image fill
  - CTA:
    - **Add quick launch button to selected layer**
    - Uses Figma relaunch data so plugin can be launched quickly from properties panel.

### Backend/bridge updates

- Added stack apply message flow: `APPLY_FILTER_STACK`
- Added selection preview message: `SELECTION_PREVIEW`
- Added relaunch setup message: `SET_RELUNCH_ON_SELECTION`
- Main now supports:
  - stacked processing (up to 3),
  - preview publishing on selection changes,
  - conditional output behavior (new layer vs replace fill),
  - quick launch relaunch-data attachment.

### Files updated

- `src/shared/messages.ts`
- `src/main.ts`
- `src/ui/App.tsx`
- `dist/main.js`
- `dist/ui.html`

### What to do now

Reload the plugin once in Figma to pick up the new `dist` files.  
Then test:

1. Add 1–3 effects in `Apply Filters`
2. Toggle settings checkbox and apply
3. Click quick launch CTA on selected node(s)

If you want next, I can add **reorder drag** for stacked effects (effect order currently equals add order).

---

**User**

Okay, fix these issues:
1. When I select a effect, don't directly apply it to the main image. It should only be applied to the preview image and then when the user selects apply then only apply to the main image/
2. When I select a effect, backspace out of the list and go to the stack mode where I can see the selected effects.
3. If I remove an effect from the stack, the image is not going back to the previous state. Also, removing all the effects from the stack should revert the image to the original.

---

**Cursor**

I’ll fix this by making the left panel a true **non-destructive preview pipeline**: effect add/remove updates preview only, apply commits to Figma, list closes after effect pick, and removing effects re-renders preview back through prior stack (or original when empty). I’m patching `src` and `dist` together.

All three behaviors are fixed.

### What I changed

- **Preview is now non-destructive**
  - Selecting/removing effects only updates the **LHS preview panel**.
  - Main Figma image is changed only when user clicks **Apply stack**.
  - Implemented by storing `basePreviewBytes` from `SELECTION_PREVIEW` and re-rendering preview locally in UI from the current stack.

- **Effect picker auto-closes after select**
  - When user picks an effect from the full list, the drawer closes and returns to stack view.

- **Removing effects correctly reverts preview state**
  - Removing one effect re-renders preview with the remaining stack.
  - Removing all effects reverts preview to the original selection image.

### Files updated

- `src/ui/App.tsx`
  - Added preview base state + async stack preview rendering with race-token protection
  - Auto-close effect list on add
  - Stack remove now triggers preview re-render

- `dist/ui.html`
  - Same logic mirrored for your currently running fallback runtime
  - Added `refreshPreviewFromStack()` and wired it to:
    - selection preview updates
    - effect add
    - effect remove

### Notes

Your apply behavior is now exactly:
1. choose stack (preview only),
2. optionally edit stack,
3. click `Apply stack` to commit to main image/new image based on settings.

Reload the plugin once and retest the three scenarios.

---

**User**

okay good work. Now let's work on the list of filters.


1. Metaball Gradient Mesh (premium);

2. Brightness Contras;

3. Hue Saturation;

4. Curves;

5. Curves HSL;

6. Chromatic Aberration (premium);

7. Gradient Map (premium);

8. Lavels (premium);

9. Gamma;

10. Soft Contrast ;

11. Sepia;

12. Vibrance;

13. Grayscale;

14. Mono;



15. Noise RGB;

16. Noise HSL;

17. Simplex Noise;

18. Noise Displace;

19. Fluid Destruction;

20. Ripple;



21. Sharpen;

22. Sharpen Luminance;

23. Unsharp Mask;



24. Gaussian Blur;

25. Lens Blur;

26. Triangle Blur;

27. Tilt Shift;

28. Zoom Blur;

29. Denoise;



30. Droplets on water (premium);

31. Ripple Propagation (premium);



32. Ink;

33. Cartoon;

34. Posterization (premium);

35. Flat Chromatic Aberration (premium);

36. Emboss;

37. Crosshatch;

38. Night;

39. Bleach;

40. Neon;

41. Lsd;

42. Edge Work;

43. BlackWhite;

44. Outline;

45. Symbols;

46. Euphoria (premium);

47. Light Rays;



48. Lomo;

49. Night Vision;

50. Vignette;

51. Color Halftone;

52. Dot Screen;

53. Invert Color;



54. Bulge / Pinch;

45. Swirl;

46. Tunnel;

57. Perspective;

58. Hexagonal Pixelate;

59. Quadrangular Pixelate;



60. Alpha (transparency based on brightness: the darker a pixel, the more transparent it is);

61. FXAA Antialiasing (allows you to smooth out the pixel ladder a little).


---

**Cursor**

I’ll expand the catalog into your full 61-filter list, mark premium filters, and make the system resilient so unimplemented filters can still be listed/stacked without breaking apply. Then I’ll surface premium labels in the effect picker UI.

I’m finishing by syncing the runtime `dist` catalog and premium labels so your live plugin immediately shows the full filter list exactly in the new UI.

Done — the filter catalog is now expanded to your full list, with premium tags.

### Implemented

- Replaced the old 6-item list with your full **61-effect catalog**
- Added **premium markers** on the relevant effects
- Reorganized categories to match a scalable control panel grouping:
  - `Color & Tone`, `Noise & Distort`, `Sharpen`, `Blur`, `Water`, `Stylize`, `Retro`, `Geometry`, `Utility`
- Updated filter IDs to support a large catalog cleanly (`FilterId` is now string-based)
- Made backend handler registry dynamic from catalog, so all listed filters are recognized
- Kept algorithm execution safe for not-yet-implemented filters (no crash if effect has no specific algorithm yet)
- Updated live runtime UI (`dist/ui.html`) to show **(Premium)** labels in:
  - add-effects drawer
  - selected stack list

### Files updated

- `src/shared/filterTypes.ts`
- `src/shared/filterCatalog.ts`
- `src/core/processing/filters/index.ts`
- `src/ui/processing/filterAlgorithms.ts`
- `src/ui/App.tsx`
- `dist/main.js`
- `dist/ui.html`

### Notes

- I kept the name **“Lavels”** exactly as you listed.
- Since many filters are newly listed, several currently behave as pass-through until we implement their specific algorithms.

If you want, next I can start implementing them in a prioritized batch:
1) `Brightness Contrast`, `Hue Saturation`, `Gamma`, `Sepia`, `Grayscale`, `Vignette` first (fast wins), then  
2) `Curves`, `Unsharp Mask`, `Gaussian Blur`, `Color Halftone`, etc.

---

**User**

1. Color & Tonal Adjustments (Standard)
These are primary pixel manipulations. You can prompt Cursor to handle these as a single "Color Engine" module.

Brightness/Contrast: Basic linear offset and scaling.

Levers: Brightness (-100 to 100), Contrast (-100 to 100).

Hue/Saturation/Vibrance: Conversion from RGB to HSL space.

Levers: Hue (0° to 360°), Saturation (0 to 2), Vibrance (0 to 2).

Curves/Levels: Remapping the 0-255 range using a cubic spline or min/max clipping.

Levers: Input Min/Max, Gamma, Point Handles.

Sepia/Grayscale/Mono: Matrix-based color conversion.

Levers: Intensity (0 to 1).

2. Spatial & Convolution Blurs (Geometry-Based)
Use a "Kernel Manager" prompt for these to save tokens.

Gaussian/Triangle Blur: Standard weighted average of surrounding pixels.

Levers: Radius (0 to 50px).

Tilt Shift/Zoom Blur: Coordinate-dependent blur where radius increases based on distance from a center point or axis.

Levers: Center Point, Focus Area Size, Strength.

Lens Blur: Uses a bokeh-shaped kernel (hexagon/circle) for out-of-focus highlights.

Levers: Iris Radius, Brightness Threshold.

3. High-Trend Distortions & Noise (The "2026 Vibe")
These use Simplex Noise or Coordinate Warping. These are your "Designer-as-a-Founder" portfolio highlights.

Simplex Noise / Noise Displace: Uses a noise function to offset the UV coordinates of the image.

Levers: Scale (Frequency), Magnitude (Strength), Seed.

Fluid Distortion / Ripple: Sine-wave or vector-field based displacement.

Levers: Wave Frequency, Viscosity (Speed of curve), Amplitude.

Chromatic Aberration: Splitting the Red, Green, and Blue channels and offsetting them slightly.

Levers: Separation (px), Angle (0-360°).

Bulge / Pinch / Swirl: Non-linear coordinate transformation around a central point.

Levers: Radius, Strength (-1 to 1).

4. Stylized & Artistic (Complex Shaders)
These effects often require multi-pass processing.

Metaball Gradient Mesh (Premium): Generates organic, blob-like shapes based on image color clusters.

Levers: Complexity, Blur, Color Sensitivity.

Color Halftone / Dot Screen: Converting the image into a series of dots varying in size based on luminosity.

Levers: Dot Size, Angle, Grid Density.

Neon / Edge Work: Sobel or Canny edge detection followed by a bloom/glow pass.

Levers: Threshold, Glow Intensity, Neon Color.

Posterization: Quantizing the color palette to a specific number of levels.

Levers: Color Steps (2 to 256).

5. Technical Utilities
Alpha (Luminosity Mask): Sets pixel.a = pixel.brightness.

Levers: Invert (Toggle).

FXAA Antialiasing: A post-process pass to smooth jagged edges from heavy distortions like Pixelate or Edge Work.

Levers: Smoothness Amount.

Master Cursor Prompt for the "Effect Engine"
Use this prompt to build the foundation without hitting your token limit:

"Create a modular EffectProcessor class for a Figma plugin.

Use a Fragment Shader-like approach (Canvas API getImageData).

Implement a process(effectName, params) method.

For Color effects (Sepia, Grayscale, Brightness), use a 4x5 color matrix.

For Convolution effects (Sharpen, Blur), use a kernel-based loop.

For Distortion (Swirl, Ripple), use coordinate mapping.

Keep the code DRY: share the 'pixel loop' across all effects. No em-dashes in comments."

---

**Cursor**

I’ll implement this as a modular **EffectProcessor** foundation in the source pipeline: shared pixel loop, color matrix path, kernel path, coordinate-mapping path, and a single `process(effectName, params)` entrypoint. Then I’ll wire `canvasProcessor` to use it.

Implemented the **Effect Engine foundation** in source exactly around your structure.

### What I built

- Added a new modular processor:
  - `src/ui/processing/effectProcessor.ts`
  - Class: `EffectProcessor`
  - Entry point: `process(effectName, params, pixels, width, height)`

- Wired canvas pipeline to use it:
  - `src/ui/processing/canvasProcessor.ts`
  - Now calls `effectProcessor.process(...)`
  - Supports optional `params` argument (defaults safe)

### Engine architecture covered

- **Color engine path**
  - `brightness-contrast`
  - `hue-saturation` + `vibrance` (RGB<->HSL conversion)
  - `gamma`
  - `sepia`, `grayscale`, `mono` via **4x5 color matrix**

- **Kernel manager path**
  - Generic `applyKernel(...)`
  - `gaussian-blur`, `triangle-blur`
  - `sharpen`, `sharpen-luminance`, `unsharp-mask`

- **Coordinate mapping path**
  - `swirl`
  - `ripple`
  - `bulge-pinch`
  - `chromatic-aberration` (channel separation + angle)

- **Stylized/utility core**
  - `posterization`
  - `alpha` luminosity mask
  - `fxaa-antialiasing` (lightweight smoothing pass)

- **DRY looping**
  - Shared clamp/sample logic
  - Shared kernel implementation
  - Shared coordinate mapping framework

### Important note

You now have a solid processing backbone with default params.  
Next step is to expose **per-effect lever controls** in UI and pass params through your message bridge for full interactive tuning.

If you want, I’ll do that next in this order:
1) add params schema per effect,  
2) send params in `APPLY_FILTER_STACK`,  
3) build dynamic controls panel (sliders/toggles),  
4) live-preview with throttling.


# River material

`WaterRiver.jsx` mounts the canvas and handles WebGL context loss/restoration.
`renderer.js` contains the material configuration, GPU resource ownership and
three-pass rendering. `geometry.js` generates the curved subdivided mesh and
tileable tangent-space normal texture. `shaders.js` contains the complete GLSL
vertex, terrain-depth and water fragment shaders. No extra library is required.

The two normal layers use independent UV scales, directions and speeds. The
vertex shader displaces the mesh in elevation using two sine waves, projected
with an oblique orthographic camera. Water compares its linear camera depth
against the bank/rock depth prepass to generate intersection foam and shoreline
transparency. High-frequency noise varies roughness and specular exponent.

Depth comes from a modeled bank/rock height field, not the landscape photographs.
It does not detect photographed rocks or HTML cards. This is an artistic water
material, not a fluid simulation or screen-space reflection renderer.

Tuning lives in `waterMaterial`: waveAmplitude (CSS-pixel elevation),
normalStrength, foamDistance (same depth units), roughness, pixelBudget and
maxPixelRatio. Camera and scene depths share the same 100-unit origin and
220-unit encoding range. Keep them synchronized when changing the shaders.

The canvas is viewport-sized. Geometry resizes when page content changes. It
pauses off-screen/in hidden tabs, stops animation for reduced-motion users,
caps rendering at 30 FPS on small screens / 45 FPS otherwise, and frees GPU
resources on teardown. Unsupported or lost contexts show the static SVG river.

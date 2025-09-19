import bpy
import sys
import os

# ----------------------------
# Args from command line
# ----------------------------
argv = sys.argv
argv = argv[argv.index("--") + 1:] if "--" in argv else []

if len(argv) < 2:
    print("Usage: blender -b -P generate_canvas_glb.py -- <image_path> <output_glb>")
    sys.exit(1)

image_path = argv[0]
output_path = argv[1]

# ----------------------------
# Clean up default scene
# ----------------------------
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# ----------------------------
# Add a cube as the canvas (with thickness)
# ----------------------------
bpy.ops.mesh.primitive_cube_add(size=2)
canvas = bpy.context.active_object
canvas.name = "Canvas"

# Scale it: wide and tall, but very thin in Z (thickness)
canvas.scale[0] = 1.0  # width
canvas.scale[1] = 0.7  # height
canvas.scale[2] = 0.05  # thickness (like a real frame)

# ----------------------------
# Create material with image texture
# ----------------------------
mat = bpy.data.materials.new(name="CanvasMaterial")
mat.use_nodes = True
bsdf = mat.node_tree.nodes["Principled BSDF"]

# Add texture node
tex_image = mat.node_tree.nodes.new('ShaderNodeTexImage')
tex_image.image = bpy.data.images.load(image_path)

# Link texture color to material base color
mat.node_tree.links.new(bsdf.inputs['Base Color'], tex_image.outputs['Color'])

# Assign material to canvas
if canvas.data.materials:
    canvas.data.materials[0] = mat
else:
    canvas.data.materials.append(mat)

# ----------------------------
# UV Unwrap for proper mapping
# ----------------------------
bpy.context.view_layer.objects.active = canvas
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.uv.smart_project()
bpy.ops.object.mode_set(mode='OBJECT')

# ----------------------------
# Export as .glb
# ----------------------------
bpy.ops.export_scene.gltf(
    filepath=output_path,
    export_format='GLB',
    use_selection=True
)

print(f"✅ Exported canvas GLB: {output_path}")

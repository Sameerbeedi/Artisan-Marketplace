import bpy
import sys

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
# Load image & compute aspect ratio
# ----------------------------
img = bpy.data.images.load(image_path)
width, height = img.size
aspect_ratio = width / height

# Normalize → longer side = 1
if aspect_ratio >= 1:
    plane_width = 1.0
    plane_height = 1.0 / aspect_ratio
else:
    plane_width = aspect_ratio
    plane_height = 1.0

# ----------------------------
# Create plane (canvas)
# ----------------------------
bpy.ops.mesh.primitive_plane_add(size=2, location=(0, 0, 0))
canvas = bpy.context.active_object
canvas.name = "Canvas"

# Scale plane
canvas.scale[0] = plane_width
canvas.scale[1] = plane_height
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

# ----------------------------
# Give thickness (extrude along Z)
# ----------------------------
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")  # ✅ ensure all faces are selected
bpy.ops.mesh.extrude_region_move(
    TRANSFORM_OT_translate={"value": (0, 0, 0.02)}
)
bpy.ops.mesh.normals_make_consistent(inside=False)
bpy.ops.object.mode_set(mode="OBJECT")

# ----------------------------
# Create materials
# ----------------------------
# Painting (front)
painting_mat = bpy.data.materials.new(name="PaintingMaterial")
painting_mat.use_nodes = True
bsdf_paint = painting_mat.node_tree.nodes.get("Principled BSDF")
tex_image = painting_mat.node_tree.nodes.new("ShaderNodeTexImage")
tex_image.image = img
painting_mat.node_tree.links.new(bsdf_paint.inputs["Base Color"], tex_image.outputs["Color"])

# Wood (back + sides)
wood_mat = bpy.data.materials.new(name="WoodMaterial")
wood_mat.use_nodes = True
bsdf_wood = wood_mat.node_tree.nodes.get("Principled BSDF")
bsdf_wood.inputs["Base Color"].default_value = (0.4, 0.25, 0.1, 1)  # brown
bsdf_wood.inputs["Roughness"].default_value = 0.8

# Assign both materials
canvas.data.materials.append(painting_mat)  # index 0
canvas.data.materials.append(wood_mat)      # index 1

# ----------------------------
# Assign materials by face normal
# ----------------------------
mesh = canvas.data
for poly in mesh.polygons:
    if poly.normal.z > 0:  # front face
        poly.material_index = 0
    else:                  # back + sides
        poly.material_index = 1

# ----------------------------
# Export GLB
# ----------------------------
# ✅ make sure object is selected before export
bpy.ops.object.select_all(action="DESELECT")
canvas.select_set(True)
bpy.context.view_layer.objects.active = canvas

bpy.ops.export_scene.gltf(
    filepath=output_path,
    export_format="GLB",
    use_selection=True
)

print(f"✅ Exported GLB with painting front & wood back: {output_path}")

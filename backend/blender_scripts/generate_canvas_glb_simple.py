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

# Normalize dimensions
if aspect_ratio >= 1:
    plane_width = 1.0
    plane_height = 1.0 / aspect_ratio
else:
    plane_width = aspect_ratio
    plane_height = 1.0

# ----------------------------
# Create Simple Framed Picture
# ----------------------------

# Create a single plane
bpy.ops.mesh.primitive_plane_add(size=2, location=(0, 0, 0))
picture = bpy.context.active_object
picture.name = "FramedPicture"

# Scale to proper dimensions
picture.scale[0] = plane_width
picture.scale[1] = plane_height
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

# Add thickness by extruding
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.extrude_region_move(
    TRANSFORM_OT_translate={"value": (0, 0, 0.05)}
)
bpy.ops.mesh.normals_make_consistent(inside=False)

# Simple UV unwrap
bpy.ops.uv.unwrap(method='ANGLE_BASED', margin=0.001)
bpy.ops.object.mode_set(mode='OBJECT')

# ----------------------------
# Create Single Material
# ----------------------------
mat = bpy.data.materials.new(name="PictureMaterial")
mat.use_nodes = True
nodes = mat.node_tree.nodes
links = mat.node_tree.links

# Clear default nodes
for n in nodes:
    nodes.remove(n)

# Create simple material
output_node = nodes.new("ShaderNodeOutputMaterial")
bsdf_node = nodes.new("ShaderNodeBsdfPrincipled")
tex_image = nodes.new("ShaderNodeTexImage")
tex_image.image = img

# Connect nodes
links.new(bsdf_node.inputs["Base Color"], tex_image.outputs["Color"])
links.new(output_node.inputs["Surface"], bsdf_node.outputs["BSDF"])

# Assign material
picture.data.materials.append(mat)

# ----------------------------
# Basic lighting
# ----------------------------
world = bpy.context.scene.world or bpy.data.worlds.new("World")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[1].default_value = 0.8
bpy.context.scene.world = world

# ----------------------------
# Export GLB
# ----------------------------
bpy.ops.object.select_all(action="DESELECT")
picture.select_set(True)
bpy.context.view_layer.objects.active = picture

bpy.ops.export_scene.gltf(
    filepath=output_path,
    export_format="GLB",
    use_selection=True,
    export_texcoords=True,
    export_normals=True,
)

print(f"✅ Exported simple framed picture: {output_path}")
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
# Load image & compute aspect ratio
# ----------------------------
image_name = os.path.basename(image_path)

# Remove old image if it exists to force reload
if image_name in bpy.data.images:
    bpy.data.images.remove(bpy.data.images[image_name])

img = bpy.data.images.load(image_path)
img.reload()  # Ensure fresh load
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
# Create Vertical Plane (Wall Frame)
# ----------------------------
bpy.ops.mesh.primitive_plane_add(size=2, location=(0, 0, 0))
picture = bpy.context.active_object
picture.name = "FramedPicture"

# Rotate plane to be vertical (front face forward)
picture.rotation_euler[0] = 1.5708  # 90° X rotation
bpy.ops.object.transform_apply(location=True, rotation=True, scale=False)

# Scale plane to match aspect ratio
picture.scale[0] = plane_width
picture.scale[1] = plane_height
bpy.ops.object.transform_apply(location=True, rotation=False, scale=True)

# Optional: realistic width (~50cm)
picture.scale *= 0.5
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

# ----------------------------
# Add thin extrusion (optional) for depth
# ----------------------------
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.extrude_region_move(
    TRANSFORM_OT_translate={"value": (0, -0.05, 0)}  # extrude backward
)
bpy.ops.mesh.normals_make_consistent(inside=False)

# UV mapping
bpy.ops.uv.smart_project(angle_limit=66, island_margin=0.02)
bpy.ops.object.mode_set(mode='OBJECT')

# ----------------------------
# Create Material with Backface Culling
# ----------------------------

# Remove old material if exists
if "PictureMaterial" in bpy.data.materials:
    bpy.data.materials.remove(bpy.data.materials["PictureMaterial"], do_unlink=True)

mat = bpy.data.materials.new(name="PictureMaterial")
mat.use_nodes = True
mat.use_backface_culling = True  # Only render front face in AR

nodes = mat.node_tree.nodes
links = mat.node_tree.links

# Clear default nodes
for n in nodes:
    nodes.remove(n)

# Create nodes
output_node = nodes.new("ShaderNodeOutputMaterial")
bsdf_node = nodes.new("ShaderNodeBsdfPrincipled")
tex_image = nodes.new("ShaderNodeTexImage")
tex_image.image = img

# Set material properties
if "Roughness" in bsdf_node.inputs:
    bsdf_node.inputs["Roughness"].default_value = 0.3
if "Specular" in bsdf_node.inputs:
    bsdf_node.inputs["Specular"].default_value = 0.2

# Connect nodes
links.new(bsdf_node.inputs["Base Color"], tex_image.outputs["Color"])
links.new(output_node.inputs["Surface"], bsdf_node.outputs["BSDF"])

# Assign material
picture.data.materials.append(mat)

# ----------------------------
# Basic lighting (for preview only)
# ----------------------------
world = bpy.context.scene.world or bpy.data.worlds.new("World")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[1].default_value = 0.8
bpy.context.scene.world = world

# ----------------------------
# Apply all transforms (final cleanup)
# ----------------------------
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

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
    export_yup=True,
)

print(f"✅ Exported vertical framed picture for AR: {output_path}")

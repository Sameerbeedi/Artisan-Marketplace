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

# Frame dimensions (normalize to reasonable size)
if aspect_ratio >= 1:
    frame_width = 1.0
    frame_height = 1.0 / aspect_ratio
else:
    frame_width = aspect_ratio
    frame_height = 1.0

frame_depth = 0.05  # Depth of the frame (thickness)

# ----------------------------
# Create 3D Picture Frame
# ----------------------------

# 1. Create the main frame (outer rectangle)
bpy.ops.mesh.primitive_cube_add(size=2, location=(0, 0, 0))
frame = bpy.context.active_object
frame.name = "PictureFrame"

# Scale to frame dimensions
frame.scale[0] = frame_width
frame.scale[1] = frame_height  
frame.scale[2] = frame_depth
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

# 2. Create the inner picture area (slightly smaller)
bpy.ops.mesh.primitive_cube_add(size=2, location=(0, 0, 0.01))
inner_frame = bpy.context.active_object
inner_frame.name = "PictureArea"

# Scale inner area (90% of frame size)
inner_frame.scale[0] = frame_width * 0.9
inner_frame.scale[1] = frame_height * 0.9
inner_frame.scale[2] = frame_depth * 0.8
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

# ----------------------------
# Fix UV mapping for the picture frame
# ----------------------------
# Select the inner frame (picture area) and unwrap it properly
bpy.context.view_layer.objects.active = inner_frame
bpy.ops.object.select_all(action='DESELECT')
inner_frame.select_set(True)
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')

# Use simple cube projection which works reliably
bpy.ops.uv.cube_project()

bpy.ops.object.mode_set(mode='OBJECT')

# ----------------------------
# Create Materials
# ----------------------------

# Frame material (wood-like)
frame_mat = bpy.data.materials.new(name="FrameMaterial")
frame_mat.use_nodes = True
frame_bsdf = frame_mat.node_tree.nodes.get("Principled BSDF")
frame_bsdf.inputs["Base Color"].default_value = (0.4, 0.25, 0.1, 1)  # Brown wood
frame_bsdf.inputs["Roughness"].default_value = 0.7
frame_bsdf.inputs["Metallic"].default_value = 0.1

# Picture material (with the uploaded image)
picture_mat = bpy.data.materials.new(name="PictureMaterial")
picture_mat.use_nodes = True
nodes = picture_mat.node_tree.nodes
links = picture_mat.node_tree.links

# Clear default nodes
for n in nodes:
    nodes.remove(n)

# Create emission shader for the picture (so it glows slightly)
output_node = nodes.new("ShaderNodeOutputMaterial")
emission_node = nodes.new("ShaderNodeEmission")
tex_image = nodes.new("ShaderNodeTexImage")
tex_coord = nodes.new("ShaderNodeTexCoord")
mapping = nodes.new("ShaderNodeMapping")

# Load the image
tex_image.image = img
tex_image.interpolation = 'Linear'

# Set up proper texture coordinates to avoid cropping
# Connect: UV Coordinates → Mapping → Image Texture → Emission → Output
links.new(mapping.inputs["Vector"], tex_coord.outputs["UV"])
links.new(tex_image.inputs["Vector"], mapping.outputs["Vector"])
links.new(emission_node.inputs["Color"], tex_image.outputs["Color"])
links.new(output_node.inputs["Surface"], emission_node.outputs["Emission"])

# Set emission strength for visibility
emission_node.inputs["Strength"].default_value = 1.2

# ----------------------------
# Assign Materials
# ----------------------------
frame.data.materials.append(frame_mat)
inner_frame.data.materials.append(picture_mat)

# ----------------------------
# Position for Wall Hanging
# ----------------------------
# Rotate the entire frame to face forward (like hanging on wall)
frame.rotation_euler = (1.5708, 0, 0)  # 90 degrees around X-axis
inner_frame.rotation_euler = (1.5708, 0, 0)  # Same rotation

bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

# ----------------------------
# Export GLB
# ----------------------------
# Select both objects for export
bpy.ops.object.select_all(action="DESELECT")
frame.select_set(True)
inner_frame.select_set(True)
bpy.context.view_layer.objects.active = frame

# Add world lighting
world = bpy.context.scene.world or bpy.data.worlds.new("World")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[1].default_value = 1.0
bpy.context.scene.world = world

bpy.ops.export_scene.gltf(
    filepath=output_path,
    export_format="GLB",
    use_selection=True,
    export_texcoords=True,
    export_normals=True,
    export_materials='EXPORT'
)

print(f"✅ Exported 3D Picture Frame GLB: {output_path}")

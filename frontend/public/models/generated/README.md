# AR Model Generation System

This directory contains generated 3D models for AR viewing. The system dynamically creates AR models based on uploaded product images.

## How it works:

1. **Image Upload**: User uploads a product image in the storytelling tool
2. **AI Analysis**: The system analyzes the image to determine product type, materials, and geometry
3. **3D Generation**: Based on the analysis, a 3D model is generated using:
   - AI-powered image-to-3D conversion services (Meshy.ai, Kaedim)
   - Depth estimation algorithms
   - Custom 3D mesh generation
4. **AR Model**: The generated GLB/GLTF file is stored here and made available for AR viewing

## Model Types Generated:

- **pottery-model.glb**: For ceramic and pottery products
- **textile-model.glb**: For fabric and textile items
- **jewelry-model.glb**: For jewelry and ornaments
- **wood-model.glb**: For wooden handicrafts
- **metal-model.glb**: For metal and brass items
- **basic-[timestamp].glb**: Fallback models for unknown types

## Integration:

The AR viewer at `/test-ar` loads these models dynamically based on the `model` URL parameter.

Example usage:
```
/test-ar?model=/models/generated/pottery-vase-1234567890.glb
```

## Future Enhancements:

- Real-time 3D scanning from multiple angles
- Texture mapping from product images
- Advanced material property simulation
- Physics-based rendering for realistic AR experience
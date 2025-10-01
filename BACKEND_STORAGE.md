# Using Backend Storage (Firebase-Free)

This guide explains how to use the backend for file storage instead of Firebase Storage (no premium/payment required).

## Backend Endpoints

### 1. Upload Image
**Endpoint:** `POST /upload_image`
**Purpose:** Upload product images to the backend

```typescript
// Example: Upload image from frontend
const formData = new FormData();
formData.append('file', imageFile);

const response = await fetch('https://artisan-marketplace-pvy1.onrender.com/upload_image', {
  method: 'POST',
  body: formData
});

const data = await response.json();
// Returns: { success: true, imageUrl: "https://backend/uploads/uuid.jpg", filename: "uuid.jpg" }
```

### 2. Generate AR Model
**Endpoint:** `POST /generate_ar_model/{product_id}`
**Purpose:** Generate 3D AR model from uploaded image

```typescript
const formData = new FormData();
formData.append('file', imageFile);

const response = await fetch(`https://artisan-marketplace-pvy1.onrender.com/generate_ar_model/${productId}`, {
  method: 'POST',
  body: formData
});

const data = await response.json();
// Returns: { success: true, ar_model_url: "https://backend/ar_models/product_id.glb" }
```

## Static File Serving

The backend serves uploaded files through these routes:

- **Images:** `GET /uploads/{filename}` - Serves uploaded product images
- **AR Models:** `GET /ar_models/{filename}` - Serves generated GLB files

All files are served with proper CORS headers to work with your Vercel frontend.

## Frontend Integration

### Option 1: Direct Backend Upload (Recommended)
Use the `/upload_image` endpoint instead of Firebase Storage:

```typescript
async function uploadImageToBackend(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${BACKEND_URL}/upload_image`, {
    method: 'POST',
    body: formData
  });
  
  const data = await response.json();
  return data.imageUrl; // This is a backend URL, not Firebase
}
```

### Option 2: Keep Firebase as Fallback
The current frontend already has fallback logic - if Firebase fails, it creates blob URLs. You can enhance this to use the backend:

```typescript
async function uploadImage(file: File): Promise<string> {
  try {
    // Try backend first
    return await uploadImageToBackend(file);
  } catch (error) {
    console.error('Backend upload failed:', error);
    // Fallback to local blob URL for preview
    return URL.createObjectURL(file);
  }
}
```

## Deployment Notes

### Render.com
- Uploaded files are stored in the container's filesystem
- ⚠️ Files are ephemeral - they'll be lost when the container restarts
- For persistent storage, consider:
  1. Using Render's Disk storage (paid feature)
  2. Using a service like Cloudinary (free tier available)
  3. Using AWS S3 (free tier available)

### Local Development
- Files are stored in `backend/uploads/` and `backend/ar_models/`
- These directories are git-ignored
- Safe for testing and development

## Benefits of Backend Storage

✅ **No Payment Required** - No Firebase premium plan needed
✅ **Simple Setup** - No Firebase configuration or IAM permissions
✅ **Full Control** - You manage the files
✅ **Direct Integration** - Works seamlessly with AR generation

## Limitations

⚠️ **Ephemeral Storage** - Files on Render.com are temporary
⚠️ **No CDN** - Slower than Firebase Storage CDN for global users
⚠️ **No Built-in Backup** - Need to implement your own backup strategy

## Next Steps

1. Deploy the updated backend to Render.com
2. Test image upload via `/upload_image`
3. Test AR generation with uploaded images
4. Consider adding a persistent storage solution for production

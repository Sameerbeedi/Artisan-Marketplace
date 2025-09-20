'use client';

import { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase";

export default function FirebaseTest() {
  const [url, setUrl] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // 🔥 Upload to Firebase
    const storageRef = ref(storage, `test/${Date.now()}-${file.name}`);
    await uploadBytes(storageRef, file);

    // Get public download URL
    const downloadURL = await getDownloadURL(storageRef);
    setUrl(downloadURL);
    console.log("✅ File uploaded:", downloadURL);
  }

  return (
    <div className="p-6">
      <input type="file" onChange={handleUpload} />
      {url && (
        <div className="mt-4">
          <p>Download URL:</p>
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
            {url}
          </a>
          <br />
          <img src={url} alt="Uploaded" className="mt-2 max-w-xs border rounded" />
        </div>
      )}
    </div>
  );
}

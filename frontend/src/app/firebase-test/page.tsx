'use client';

import { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase";

export default function FirebaseTestPage() {
  const [url, setUrl] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Upload to Firebase Storage
    const storageRef = ref(storage, `test/${Date.now()}-${file.name}`);
    await uploadBytes(storageRef, file);

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    setUrl(downloadURL);
    console.log("✅ Uploaded:", downloadURL);
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Firebase Upload Test</h1>
      <input type="file" onChange={handleUpload} />
      {url && (
        <div className="mt-4">
          <p>File uploaded:</p>
          <a href={url} target="_blank" className="text-blue-600 underline">
            {url}
          </a>
          <br />
          <img src={url} alt="Uploaded" className="mt-2 max-w-xs rounded border" />
        </div>
      )}
    </div>
  );
}

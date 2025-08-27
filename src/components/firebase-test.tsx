'use client';

import { useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Terminal } from 'lucide-react';

export function FirebaseTest() {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    setStatus('idle');
    setError(null);
    try {
      // This is a lightweight operation to check connectivity.
      // It attempts to get a document that doesn't exist.
      // We only care if the request succeeds or fails.
      await getDoc(doc(db, 'test-collection', 'test-doc'));
      setStatus('success');
    } catch (e: any) {
      setStatus('error');
      setError(e.message);
    }
  };

  return (
    <div className="my-8 p-4 border rounded-lg">
      <h3 className="font-headline text-lg mb-2">Test Firebase Connection</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Click the button to verify that the app can connect to your Firestore
        database.
      </p>
      <Button onClick={handleTest}>Test Connection</Button>
      {status === 'success' && (
        <Alert variant="default" className="mt-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>
            Successfully connected to Firestore. Your configuration is correct.
          </AlertDescription>
        </Alert>
      )}
      {status === 'error' && (
        <Alert variant="destructive" className="mt-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Connection Failed</AlertTitle>
          <AlertDescription>
            Could not connect to Firestore. Check your console for errors and verify your security rules.
            <br />
            <pre className="mt-2 whitespace-pre-wrap text-xs">{error}</pre>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

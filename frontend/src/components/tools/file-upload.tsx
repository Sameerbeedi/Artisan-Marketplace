'use client';

import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  value: string;
  onChange: (base64: string) => void;
}

export function FileUpload({ value, onChange }: FileUploadProps) {
  const { toast } = useToast();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
          if (event.target?.result) {
            onChange(event.target.result as string);
          }
        };
        reader.onerror = () => {
          toast({
            variant: 'destructive',
            title: 'File Read Error',
            description: 'There was an issue reading the file.',
          });
        };
        reader.readAsDataURL(file);
      }
    },
    [onChange, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] },
    maxFiles: 1,
  });

  const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onChange('');
  };

  if (value) {
    return (
      <div className="relative h-64 w-full rounded-md overflow-hidden">
        <Image src={value} alt="Uploaded image" fill className="object-contain" />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8"
          onClick={handleRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`relative h-64 w-full rounded-md border-2 border-dashed border-input flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:border-primary transition-colors ${
        isDragActive ? 'border-primary bg-accent' : ''
      }`}
    >
      <input {...getInputProps()} />
      <Upload className="h-12 w-12 text-muted-foreground" />
      {isDragActive ? (
        <p className="mt-2 font-semibold">Drop the image here...</p>
      ) : (
        <p className="mt-2 text-muted-foreground">
          Drag & drop an image here, or click to select one
        </p>
      )}
    </div>
  );
}

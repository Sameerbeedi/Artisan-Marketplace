import { TechniqueTool } from '@/components/tools/technique-tool';
import { Palette } from 'lucide-react';

export default function TechniquePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="flex items-center gap-4">
          <Palette className="h-10 w-10 text-primary" />
          <h1 className="text-3xl md:text-4xl font-headline text-primary">
            Technique Identification
          </h1>
        </div>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
          Upload a photo and description of your craft to let our AI identify
          the traditional techniques used.
        </p>
      </div>
      <TechniqueTool />
    </div>
  );
}

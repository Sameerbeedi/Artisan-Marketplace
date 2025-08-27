import { QualityTool } from '@/components/tools/quality-tool';
import { CheckCircle } from 'lucide-react';

export default function QualityPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="flex items-center gap-4">
          <CheckCircle className="h-10 w-10 text-primary" />
          <h1 className="text-3xl md:text-4xl font-headline text-primary">
            Photo Quality Assessment
          </h1>
        </div>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
          Upload a product photo and description to get an AI-powered quality
          score and suggestions for improvement.
        </p>
      </div>
      <QualityTool />
    </div>
  );
}

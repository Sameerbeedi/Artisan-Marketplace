import { CatalogTool } from '@/components/tools/catalog-tool';
import { ScanSearch } from 'lucide-react';

export default function CatalogPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="flex items-center gap-4">
          <ScanSearch className="h-10 w-10 text-primary" />
          <h1 className="text-3xl md:text-4xl font-headline text-primary">
            Automated Product Cataloging
          </h1>
        </div>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
          Upload a photo of your craft, and our AI will predict its category
          with a confidence score.
        </p>
      </div>
      <CatalogTool />
    </div>
  );
}

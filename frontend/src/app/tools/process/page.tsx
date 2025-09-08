import { ProcessTool } from '../../../components/tools/process-tool';
import { BookText } from 'lucide-react';

export default function ProcessPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="flex items-center gap-4">
          <BookText className="h-10 w-10 text-primary" />
          <h1 className="text-3xl md:text-4xl font-headline text-primary">
            Process Documentation Generator
          </h1>
        </div>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
          Fill in the details about your craft, and our AI will generate a
          detailed, step-by-step process description enriched with cultural
          context.
        </p>
      </div>
      <ProcessTool />
    </div>
  );
}

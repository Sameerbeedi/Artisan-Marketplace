import { StoryTool } from '@/components/tools/story-tool';
import { Sparkles } from 'lucide-react';

export default function StoryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="flex items-center gap-4">
          <Sparkles className="h-10 w-10 text-primary" />
          <h1 className="text-3xl md:text-4xl font-headline text-primary">
            Heritage Story Generator
          </h1>
        </div>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
          Answer a few questions about your background, traditions, and craft.
          Our AI will help you weave a compelling story that connects with your
          customers.
        </p>
      </div>
      <StoryTool />
    </div>
  );
}

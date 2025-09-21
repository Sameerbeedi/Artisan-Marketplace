import { StoryTool } from '../../../components/tools/story-tool';
import { ArtistOnly } from '../../../components/auth/ArtistOnly';
import { Sparkles } from 'lucide-react';

export default function StoryPage() {
  return (
    <ArtistOnly>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center gap-4">
            <Sparkles className="h-10 w-10 text-primary" />
            <h1 className="text-3xl md:text-4xl font-headline text-primary">
              AI Product Storyteller
            </h1>
          </div>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            Provide your product's title and a brief description. Our AI will craft a
            compelling story and suggest SEO tags to attract more customers.
          </p>
        </div>
        <StoryTool />
      </div>
    </ArtistOnly>
  );
}

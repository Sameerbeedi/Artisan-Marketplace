import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  ArrowRight,
  BookText,
  CheckCircle,
  Palette,
  ScanSearch,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { ArtistOnly } from '../../components/auth/ArtistOnly';

const tools = [
  {
    title: 'Automated Product Cataloging',
    description: 'Categorize your craft using image recognition.',
    href: '/tools/catalog',
    icon: ScanSearch,
  },
  {
    title: 'Technique Identification',
    description: 'Identify traditional techniques from photos.',
    href: '/tools/technique',
    icon: Palette,
  },
  {
    title: 'Photo Quality Assessment',
    description: 'Get feedback to improve your product photos.',
    href: '/tools/quality',
    icon: CheckCircle,
  },
  {
    title: 'Heritage Storytelling',
    description: 'Craft a compelling narrative for your brand.',
    href: '/tools/story',
    icon: Sparkles,
  },
  {
    title: 'Process Documentation',
    description: 'Generate step-by-step guides for your craft.',
    href: '/tools/process',
    icon: BookText,
  },
];

export default function ToolsPage() {
  return (
    <ArtistOnly>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-headline text-primary">
            AI-Powered Artisan Tools
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Leverage our suite of AI tools to enhance your products, streamline
            your workflow, and tell your unique story.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool) => (
            <Link href={tool.href} key={tool.href} className="group">
              <Card className="h-full flex flex-col justify-between hover:border-primary transition-colors duration-300 transform hover:-translate-y-1 hover:shadow-xl">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <tool.icon className="h-10 w-10 mb-4 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-2xl">
                    {tool.title}
                  </CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <div className="p-6 pt-0 text-primary font-semibold flex items-center gap-2">
                  Use Tool
                  <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </ArtistOnly>
  );
}

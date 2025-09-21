export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  artisan: string;
  category: string;
  aiHint: string;
}

export const products: Product[] = [];

export const artisans = [
  {
    id: '1',
    name: 'Sanjay Chitara',
    craft: 'Mata ni Pachedi Textile Art',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=500&fit=crop',
    aiHint: 'indian man',
    story:
      'For generations, my family has painted the stories of our goddesses on cloth. This art is our prayer, our history, and our livelihood. Each piece I create is a continuation of that sacred tradition.',
  },
  {
    id: '2',
    name: 'Ramesh Prajapati',
    craft: 'Jaipur Blue Pottery',
    imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=500&fit=crop',
    aiHint: 'artisan pottery',
    story:
      'The blue of my pottery is the blue of Jaipur skies. I mix quartz stone powder with my own hands, a technique that has been passed down to me. It is a slow, beautiful process that connects me to the earth.',
  },
];

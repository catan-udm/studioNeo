import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://bikko.studio';
  // ISO 8601 compliant Date instance
  const lastModified = new Date();

  const publicRoutes: Array<{
    route: string;
    changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority: number;
  }> = [
    { route: '', changeFrequency: 'daily', priority: 1.0 },
    { route: '/gallery', changeFrequency: 'daily', priority: 0.9 },
    { route: '/projects', changeFrequency: 'weekly', priority: 0.85 },
    { route: '/about', changeFrequency: 'monthly', priority: 0.8 },
    { route: '/membership', changeFrequency: 'weekly', priority: 0.8 },
    { route: '/collection', changeFrequency: 'weekly', priority: 0.75 },
    { route: '/licensing', changeFrequency: 'monthly', priority: 0.7 },
    { route: '/contact', changeFrequency: 'monthly', priority: 0.7 },
    { route: '/terms', changeFrequency: 'monthly', priority: 0.5 },
    { route: '/privacy', changeFrequency: 'monthly', priority: 0.5 },
    { route: '/login', changeFrequency: 'monthly', priority: 0.4 },
    { route: '/register', changeFrequency: 'monthly', priority: 0.4 },
  ];

  return publicRoutes.map(({ route, changeFrequency, priority }) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}

import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/clubbyadmin',
          '/api/',
          '/auth/',
        ],
      },
    ],
    sitemap: 'https://www.moodsip.com.tr/sitemap.xml',
  }
}

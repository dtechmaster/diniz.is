import { defineCollection, z } from '@nuxt/content'
import { asSeoCollection } from '@nuxtjs/seo/content'

const commonContentSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  date: z.string().min(1),
})

const commonArticleSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  date: z.string().min(1),
  image: z.string().url(),
  readingTime: z.string().min(1),
  tags: z.array(z.string().min(1)),
})

const commonProjectSchema = z.object({
  name: z.string().min(1),
  image: z.string().url(),
  link: z.string().min(1),
  release: z.string().min(1),
  date: z.string().min(1),
  featured: z.boolean().optional(),
})

const commonFaqSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1),
  faqQuestions: z.array(
    z.object({
      title: z.string().min(1),
      questions: z.array(
        z.object({
          label: z.string().min(1),
          content: z.string().min(1),
        }),
      ),
    }),
  ),
})

export const collections = {
  content_en: defineCollection(
    asSeoCollection({
      type: 'page',
      source: {
        include: 'en/**/*.md',
        exclude: ['en/articles/*.md'],
        prefix: '/en',
      },
      schema: commonContentSchema,
    }),
  ),
  content_ja: defineCollection(
    asSeoCollection({
      type: 'page',
      source: {
        include: 'ja/**/*.md',
        exclude: ['ja/articles/*.md'],
        prefix: '/ja',
      },
      schema: commonContentSchema,
    }),
  ),
  articles_en: defineCollection(
    asSeoCollection({
      type: 'page',
      source: {
        include: 'en/articles/*.md',
        prefix: '/en/articles',
      },
      schema: commonArticleSchema,
    }),
  ),
  articles_ja: defineCollection(
    asSeoCollection({
      type: 'page',
      source: {
        include: 'ja/articles/*.md',
        prefix: '/ja/articles',
      },
      schema: commonArticleSchema,
    }),
  ),
  projects_en: defineCollection(
    asSeoCollection({
      type: 'data',
      source: 'en/projects/*.json',
      schema: commonProjectSchema,
    }),
  ),
  projects_ja: defineCollection(
    asSeoCollection({
      type: 'data',
      source: 'ja/projects/*.json',
      schema: commonProjectSchema,
    }),
  ),
  'content_pt-br': defineCollection(
    asSeoCollection({
      type: 'page',
      source: {
        include: 'pt-br/**/*.md',
        exclude: ['pt-br/articles/*.md'],
        prefix: '/pt-br',
      },
      schema: commonContentSchema,
    }),
  ),
  'articles_pt-br': defineCollection(
    asSeoCollection({
      type: 'page',
      source: {
        include: 'pt-br/articles/*.md',
        prefix: '/pt-br/articles',
      },
      schema: commonArticleSchema,
    }),
  ),
  'projects_pt-br': defineCollection(
    asSeoCollection({
      type: 'data',
      source: 'pt-br/projects/*.json',
      schema: commonProjectSchema,
    }),
  ),
  'faq_pt-br': defineCollection({
    type: 'data',
    source: 'pt-br/faq.json',
    schema: commonFaqSchema,
  }),
  stack: defineCollection({
    type: 'data',
    source: 'stack.json',
    schema: z.object({
      categories: z.array(
        z.object({
          name: z.string().min(1),
          items: z.array(
            z.object({
              name: z.string().min(1),
              link: z.string().url(),
              icon: z.string().min(1),
            }),
          ),
        }),
      ),
    }),
  }),
  faq_en: defineCollection({
    type: 'data',
    source: 'en/faq.json',
    schema: commonFaqSchema,
  }),
  faq_ja: defineCollection({
    type: 'data',
    source: 'ja/faq.json',
    schema: commonFaqSchema,
  }),
}

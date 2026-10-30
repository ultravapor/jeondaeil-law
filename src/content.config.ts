import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 글 1편 = 질문 1개 = 페이지 1장. 파일명이 곧 URL(/posts/파일명/)입니다.
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    // H1. 의뢰인이 실제로 묻는 질문 그대로
    title: z.string(),
    // 검색 결과 제목(<title>). 메인 키워드를 앞에
    seoTitle: z.string(),
    description: z.string(),
    // 제목 바로 아래 직답. 한 줄 = 한 문장
    answer: z.string(),
    category: z.enum(['sex', 'procedure', 'tax', 'damages']),
    faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    // 법령 등 확인 가능한 1차 출처
    sources: z.array(z.object({ title: z.string(), url: z.string().url() })).default([]),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };

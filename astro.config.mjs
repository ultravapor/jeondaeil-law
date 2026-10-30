// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkBreaks from 'remark-breaks';

// sitemap/canonical/JSON-LD가 전부 이 값을 씁니다.
export default defineConfig({
  site: 'https://ywdaeillaw.com',
  trailingSlash: 'always',
  integrations: [sitemap()],
  markdown: {
    // 본문은 한 줄 = 한 문장. 단일 줄바꿈을 실제 <br>로 렌더링합니다.
    remarkPlugins: [remarkBreaks],
  },
  build: {
    // 핵심 콘텐츠를 JavaScript 없이 읽을 수 있도록 정적 HTML로 빌드합니다.
    format: 'directory',
  },
});

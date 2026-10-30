import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE, CATEGORIES, type Category } from '../consts';

// llms.txt는 글 컬렉션에서 생성합니다. 글을 추가하면 자동으로 목록에 들어갑니다 (GEO: 안내서가 항상 최신).
export const GET: APIRoute = async ({ site }) => {
  const url = (path: string) => new URL(path, site).href;
  const posts = (await getCollection('posts', ({ data }) => !data.draft)).sort((a, b) =>
    a.data.title.localeCompare(b.data.title, 'ko'),
  );

  const sections = (Object.keys(CATEGORIES) as Category[])
    .map((key) => {
      const items = posts.filter((p) => p.data.category === key);
      if (!items.length) return '';
      const lines = items.map((p) => `- [${p.data.title}](${url(`/posts/${p.id}/`)}): ${p.data.description}`);
      return `### ${CATEGORIES[key]}\n${lines.join('\n')}`;
    })
    .filter(Boolean)
    .join('\n\n');

  const body = `# ${SITE.name}

> ${SITE.name}는 대한변호사협회 등록 형사법·손해배상 전문 변호사입니다(제51회 사법시험, 사법연수원 제41기, ${SITE.lawyer.firm} 구성원 변호사). 상담한 변호사가 경찰 조사 참여, 서면, 재판까지 직접 책임지고, 조세형사 사건은 공인회계사·세무사 출신 변호사와, 감정평가·손해사정·의료 자문이 필요한 사건은 협업 전문가와 함께 봅니다.

- 연락: ${SITE.phone} (전화 접수 후 변호사가 직접 상담)
- 주소: ${SITE.address.full}
- 주요 분야: ${Object.values(CATEGORIES).join(', ')}
- 첫 상담 순서: 실제 경위 → 인정 여부 → 진술의 신빙성 → 전과와 양형자료 → 목표 설정
- 글의 법령 근거는 각 글 하단에 국가법령정보센터 링크로 표시합니다.

## 소개

- [${SITE.name} — 형사사건, 어떤 변호사에게 맡겨야 할까요?](${url('/')}): 일하는 방식(직접 책임·협업), 첫 상담 5단계, 경찰 조사 원칙, 이력, 자주 묻는 질문

## 글

- [질문별 글 모음](${url('/posts/')}): 사건 유형별 전체 글 목록

${sections}
`;

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};

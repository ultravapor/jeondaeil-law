// 사이트 전역 상수 — 표기를 한 곳에서 관리 (LLMO: 엔티티 표기 일관성)
export const SITE = {
  name: '전대일 변호사',
  // 블로그 이름과 동일한 슬로건
  tagline: '지킬 수 없는 희망보다 지킬 수 있는 약속을 합니다',
  // 한 문장 설명 (llms.txt / og:description / WebSite.description 공용)
  description:
    '전대일 변호사는 대한변호사협회 등록 형사법·손해배상 전문 변호사입니다. 상담한 변호사가 경찰 조사 참여, 서면, 재판까지 직접 책임지고, 세무·회계 등 다른 전문성이 필요한 부분은 협업 전문가와 함께 봅니다.',
  locale: 'ko_KR',
  phone: '02-588-2900',
  phoneTel: '+82-2-588-2900',
  blog: 'https://blog.naver.com/wsportyih',
  lawyer: {
    name: '전대일',
    jobTitle: '변호사',
    specialties: ['형사법', '손해배상'],
    firm: '법무법인 양우',
    firmUrl: 'https://www.ywfirm.com',
  },
  address: {
    full: '서울 서초구 서초중앙로 117 제이앤제이타워 13층',
    street: '서초중앙로 117 제이앤제이타워 13층',
    locality: '서초구',
    region: '서울특별시',
    country: 'KR',
  },
  // 검색엔진 소유확인 코드 (HTML 태그 방식). 값이 있으면 <head>에 meta로 출력됩니다.
  verification: {
    naver: '',
    google: 'Aq4OqdhVfDl7t1iPCmNwrM67n-7pnICAgYvGA9oc4tU',
  },
} as const;

export const CATEGORIES = {
  sex: '성범죄',
  procedure: '수사·재판 절차',
  tax: '조세형사',
  damages: '손해배상',
} as const;

export type Category = keyof typeof CATEGORIES;

export const NAV = [
  { href: '/#way', label: '일하는 방식' },
  { href: '/#profile', label: '변호사 소개' },
  { href: '/posts/', label: '글' },
  { href: '/#contact', label: '상담' },
];

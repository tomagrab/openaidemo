'use client';

import { useOpenAIDemoContext } from '@/lib/context/openai-demo-context/openai-demo-context';

export default function HomePageContent() {
  const { homePageContent } = useOpenAIDemoContext();
  return <div dangerouslySetInnerHTML={{ __html: homePageContent }} />;
}

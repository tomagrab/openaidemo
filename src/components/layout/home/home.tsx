'use client';

import { useOpenAIDemoContext } from '@/lib/context/openai-demo-context/openai-demo-context';
import { MarkdownRenderer } from '@/components/layout/markdown/markdown-renderer/markdown-renderer';

export default function Home() {
  const { homePageContent } = useOpenAIDemoContext();
  return homePageContent ? (
    <MarkdownRenderer content={homePageContent} />
  ) : null;
}

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme/theme-provider/theme-provider';
import Header from '@/components/layout/header/header';
import { ScrollArea } from '@/components/ui/scroll-area';
import ClientProvider from '@/components/query-client/client-provider/client-provider';
import ChatWidget from '@/components/layout/openai/chat-widget/chat-widget';
import { OpenAIDemoProvider } from '@/lib/context/openai-demo-context/openai-demo-context';
import { Toaster } from '@/components/ui/sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'OpenAI Realtime Demo',
  description: 'OpenAI Realtime Demo',
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientProvider>
          <ThemeProvider
            attribute={`class`}
            defaultTheme={`system`}
            enableSystem={true}
            disableTransitionOnChange={true}
          >
            <OpenAIDemoProvider>
              <div className="flex flex-1 flex-col">
                <Header />
                <div id='root-div' className="flex h-[calc(100dvh-4rem)] flex-col">
                  <ScrollArea className="flex-1 p-4">
                    {children}
                    <Toaster />
                  </ScrollArea>
                </div>
                <ChatWidget />
              </div>
            </OpenAIDemoProvider>
          </ThemeProvider>
        </ClientProvider>
      </body>
    </html>
  );
}

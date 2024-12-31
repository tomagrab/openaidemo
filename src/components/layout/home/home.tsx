'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useOpenAIDemoContext } from '@/lib/context/openai-demo-context/openai-demo-context';

export default function HomePageContent() {
  const { homePageContent } = useOpenAIDemoContext();

  if (!homePageContent) {
    return (
      <div>
        <h1 className="mb-4 text-2xl font-bold">
          Welcome to the OpenAI Demo App
        </h1>

        <p>
          This application demonstrates advanced AI capabilities, from text
          generation to function calling, dynamic content updates, and more!
          We&apos;ve built an intuitive, user-friendly experience to showcase
          just how powerful modern AI can be.
        </p>

        <h2 className="mb-2 mt-8 text-xl font-semibold">Table of Contents</h2>

        <ol className="mb-8 ml-6 list-decimal">
          <li>
            <a href="#introduction" className="underline hover:text-blue-600">
              Introduction
            </a>
          </li>
          <li>
            <a href="#features" className="underline hover:text-blue-600">
              Key Features
            </a>
          </li>
          <li>
            <a href="#benefits" className="underline hover:text-blue-600">
              Benefits
            </a>
          </li>
          <li>
            <a href="#faq" className="underline hover:text-blue-600">
              Frequently Asked Questions
            </a>
          </li>
        </ol>

        <h2 id="introduction" className="mb-2 mt-4 text-xl font-semibold">
          Introduction
        </h2>

        <p>
          Our OpenAI Demo App showcases how you can integrate GPT-based models
          into a rich user experience. Interact with an AI assistant that can:
        </p>
        <ul className="mb-6 ml-6 list-disc">
          <li>Interpret text prompts and answer questions</li>
          <li>
            Call custom functions (like searching documents or setting a theme)
          </li>
          <li>Stream responses in real time</li>
          <li>Integrate with external data (embeddings & vector databases)</li>
        </ul>

        <h2 id="features" className="mb-2 mt-4 text-xl font-semibold">
          Key Features
        </h2>

        <p>
          Below, you&apos;ll find a quick look at some of our most exciting
          features. Expand each accordion item to learn more.
        </p>

        <Accordion type="single" collapsible className="mt-4">
          <AccordionItem value="item-1">
            <AccordionTrigger>File Upload & Content Embedding</AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardHeader>
                  <CardTitle>File Upload & Embeddings</CardTitle>
                  <CardDescription>
                    Easily upload .md or .txt files, then convert them into
                    vector embeddings for semantic search and retrieval.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-2">
                    This feature allows you to store documents as embeddings in
                    a Neon DB, so the AI can reference them later when answering
                    questions. Whether it’s product guides, troubleshooting
                    steps, or documentation, the AI can deliver contextual
                    responses based on your data.
                  </p>
                  <ul className="ml-4 list-disc">
                    <li>Works with Markdown and Text files</li>
                    <li>Stores vectors in a Postgres table (pgvector)</li>
                    <li>Allows semantic search via embeddings</li>
                  </ul>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>Real-Time AI Assistant</AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardHeader>
                  <CardTitle>Chat & Real-Time Responses</CardTitle>
                  <CardDescription>
                    Interact with an AI assistant that streams answers directly
                    to your screen.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    Our assistant is connected to a Realtime API, letting you
                    send messages and watch the AI’s response in real time. It’s
                    powered by GPT-based language models for incredibly
                    human-like answers.
                  </p>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>Functions & Theming</AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardHeader>
                  <CardTitle>Functions & App Theming</CardTitle>
                  <CardDescription>
                    Let the AI call your custom functions & adjust site
                    appearance.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    The AI can automatically decide to call certain functions,
                    such as
                    <strong> setTheme()</strong> to update the interface style,
                    or
                    <strong> provideFunctionOutput()</strong> to respond with
                    custom data.
                  </p>
                  <p className="mt-2">
                    You can define any function—like “Get Weather” or “Create a
                    new user” in your own app—and the AI will seamlessly
                    integrate these actions into its responses whenever it’s
                    relevant.
                  </p>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <h2 id="benefits" className="mb-2 mt-6 text-xl font-semibold">
          Why Use This Demo?
        </h2>
        <ul className="mb-6 ml-6 list-disc">
          <li>
            <strong>Non-technical friendly:</strong> Clear, intuitive UI built
            with modern React patterns.
          </li>
          <li>
            <strong>Powerful AI under the hood:</strong> GPT-based models for
            best-in-class generative text experiences.
          </li>
          <li>
            <strong>Real-time streaming:</strong> Quick responses as you type,
            making the AI feel more conversational.
          </li>
          <li>
            <strong>Embeddings + DB integration:</strong> Let the AI reference
            your own documents or knowledge base.
          </li>
        </ul>

        <h2 id="faq" className="mb-2 mt-6 text-xl font-semibold">
          Frequently Asked Questions
        </h2>

        <Accordion type="multiple">
          <AccordionItem value="faq-1">
            <AccordionTrigger>
              Q: Do I need coding skills to use it?
            </AccordionTrigger>
            <AccordionContent>
              <p>
                A: Not necessarily! Our demo app is designed for a user-friendly
                experience. Developers can explore under-the-hood code, but
                everyday users can simply upload documents, chat with the AI,
                and see the magic in action.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="faq-2">
            <AccordionTrigger>
              Q: Can the AI find answers in my custom docs?
            </AccordionTrigger>
            <AccordionContent>
              <p>
                A: Yes! Just upload your <code>.md</code> or <code>.txt</code>{' '}
                files. We embed them into a vector store, letting the AI recall
                that content when generating responses.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="faq-3">
            <AccordionTrigger>Q: How does theming work?</AccordionTrigger>
            <AccordionContent>
              <p>
                A: The AI can call a <strong>setTheme</strong> function. The
                system then updates the UI colors (e.g., dark/light mode). You
                can see this in real time if the AI decides a theme change is
                relevant.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <h3 className="text-md mt-8 font-semibold">
          Enjoy exploring our demo!
        </h3>
        <p>
          We hope you discover the potential of AI and how it can transform your
          workflows. If you have any questions, just ask the assistant!
        </p>
      </div>
    );
  }

  return <div dangerouslySetInnerHTML={{ __html: homePageContent }} />;
}

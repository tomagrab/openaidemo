'use client';

import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import DocumentsList from '@/components/layout/documents/documents-list/documents-list';
import { Progress } from '@/components/ui/progress';
import { searchDocuments } from '@/app/server/actions/documents/document-actions/document-actions';

type SearchResult = {
  id: string;
  title: string | null;
  content: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function SearchDocuments() {
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // For a dynamic progress bar
  const [progress, setProgress] = useState(0);

  // Track if user has searched at least once
  const [hasSearched, setHasSearched] = useState(false);

  // Store interval ID at component level
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout>();

  // Clean up any leftover intervals
  useEffect(() => {
    return () => {
      // If there's an interval running, we'd clear it here
      if (intervalId) clearInterval(intervalId);
    };
  }, [intervalId]);

  async function handleSearch() {
    setLoading(true);
    setHasSearched(true);
    setErrorMsg(null);
    setResults([]);

    // Create an interval that increments progress gradually until 90

    // Create an interval that increments progress gradually until 90
    const newIntervalId = setInterval(() => {
      setProgress(prev => {
        // If we're near 90, just stay there
        if (prev >= 90) return 90;
        return prev + 2; // speed up / slow down as you like
      });
    }, 100);
    setIntervalId(newIntervalId);

    try {
      const documents = await searchDocuments(query, limit);

      if (documents.status === 500 || !documents.documents) {
        setErrorMsg('No results found');
        setProgress(100);
        return;
      }

      setResults(documents.documents);

      // Jump to 100% on success
      setProgress(100);
    } catch (error) {
      setErrorMsg(`Error: ${String(error)}`);
      setProgress(100);
    } finally {
      if (newIntervalId) clearInterval(newIntervalId);
      setLoading(false);

      // Clear the interval so it doesn't keep incrementing
      clearInterval(intervalId);
    }
  }

  return (
    <div className="relative flex flex-1 flex-col gap-4 rounded border p-4">
      {/* Title */}
      <h3 className="text-lg font-semibold">Search Documents</h3>

      {/* Query input */}
      <div className="flex flex-col gap-1">
        <Label htmlFor="queryInput">Query</Label>
        <Input
          id="queryInput"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Example: 'How to add a user in V-Track'"
        />
      </div>

      {/* Limit input */}
      <div className="flex flex-col gap-1">
        <Label htmlFor="limitInput">Limit</Label>
        <Input
          id="limitInput"
          type="number"
          min={1}
          value={limit}
          onChange={e => setLimit(Number(e.target.value))}
          placeholder="Default: 10"
        />
      </div>

      {/* Search button */}
      <Button
        variant="default"
        onClick={handleSearch}
        disabled={loading || !query}
      >
        {loading ? 'Searching...' : 'Search'}
      </Button>

      {/* Error message */}
      {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

      {/* Results */}
      {results.length > 0 && <DocumentsList documents={results} />}

      {/* If nothing found */}
      {!loading && !errorMsg && hasSearched && results.length === 0 && (
        <p className="text-sm text-gray-500">No results found 🤪</p>
      )}

      {/* Only show progress bar while loading or until it resets */}
      <div className="flex flex-1">
        {progress > 0 && progress < 100 && (
          <Progress
            value={progress}
            className="self-end transition-all duration-200"
          />
        )}
      </div>
    </div>
  );
}

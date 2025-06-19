"use client";

import { useState } from "react";
import { Notebook } from "./types";

type Props = {
  initial: Notebook;
  onSave: (nb: Notebook) => Promise<void>;
};

export default function NotebookEditor({ initial, onSave }: Props) {
  const [rawJson, setRawJson] = useState(JSON.stringify(initial, null, 2));
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    try {
      const parsed = JSON.parse(rawJson);
      setError(null);
      onSave(parsed);
    } catch (e) {
      setError("❌ Invalid JSON. Please fix the format before saving.");
    }
  };

  return (
    <div className="space-y-4">
      <textarea
        value={rawJson}
        onChange={(e) => setRawJson(e.target.value)}
        className="w-full h-96 border rounded p-2 font-mono text-sm resize-y"
        spellCheck={false}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex space-x-2">
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={handleSave}
        >
          Save Notebook
        </button>
      </div>
    </div>
  );
}
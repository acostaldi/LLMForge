"use client";

import { useState } from "react";
import ReactJson from "react-json-view";
import { Notebook } from "./types";

type Props = {
  initial: Notebook;
  onSave: (nb: Notebook) => Promise<void>;
};

export default function NotebookEditor({ initial, onSave }: Props) {
  const [notebook, setNotebook] = useState<Notebook>(initial);

  const handleEdit = (edit: any) => {
    if (edit.updated_src) {
      setNotebook(edit.updated_src as Notebook);
    }
  };

  return (
    <div className="space-y-4">
      <ReactJson
        src={notebook}
        name={false}
        enableClipboard={false}
        onEdit={handleEdit}
        onAdd={handleEdit}
        onDelete={handleEdit}
      />

      <div className="flex space-x-2">
        <button
          className="px-4 py-2 bg-green-600 text-white rounded"
          onClick={() => onSave(notebook)}
        >
          Save Notebook
        </button>
      </div>
    </div>
  );
}
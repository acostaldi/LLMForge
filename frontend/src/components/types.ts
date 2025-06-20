export type NotebookCell = {
  cell_type: "markdown" | "code";
  source: string[];
  metadata: Record<string, unknown>;
  execution_count?: number | null;
  outputs?: unknown[];
};

export type NotebookMetadata = {
  kernelspec?: Record<string, unknown>;
  language_info?: Record<string, unknown>;
  [key: string]: unknown;
};

export type Notebook = {
  cells: NotebookCell[];
  metadata: NotebookMetadata;
  nbformat: number;
  nbformat_minor: number;
};
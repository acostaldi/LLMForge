export interface NotebookCell {
  cell_type: "markdown" | "code";
  metadata: Record<string, any>;
  source: string[];
  outputs?: any[];
}

export interface Notebook {
  cells: NotebookCell[];
  metadata: Record<string, any>;
  nbformat: number;
  nbformat_minor: number;
}
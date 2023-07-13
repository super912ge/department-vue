export interface Node {
  id: number;
  code: string;
  name: string;
  label: string;
  parent: Node[];
  children: Node[];
}

export interface SheetResult {
  roots: Node[];
  multipleParents: MultiParentItem[];
  multipleCodes: MultiCodeItem[];
  nameToCodes: Record<string, string[]>;
}

export interface MultiParentItem {
  code: string;
  name: string;
  parents: string[]
}

export interface MultiCodeItem {
  name: string;
  codes: string[];
}

export interface SameNameItem {
  name: string;
  code1: string[];
  code2: string[];
  identical: boolean;
}
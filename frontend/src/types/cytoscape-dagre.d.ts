// src/types/cytoscape-dagre.d.ts
import cytoscape from "cytoscape";

declare module "cytoscape-dagre" {
  const register: (cytoscape: typeof cytoscape) => void;
  export = register;
}

declare global {
  namespace cytoscape {
    interface LayoutOptions {
      name: string;
      nodeSep?: number;
      edgeSep?: number;
      rankSep?: number;
      rankDir?: "TB" | "LR" | "BT" | "RL";
      align?: "UL" | "UR" | "DL" | "DR";
      ranker?: "network-simplex" | "tight-tree" | "longest-path";
    }
  }
}

export {};

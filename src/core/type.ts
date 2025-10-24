import { type GridStackOptions, type GridStackNode } from "gridstack"

export interface GridOptions extends GridStackOptions { }

export interface GridInstanceSpec {
    readonly id: string;
}

export interface GridEngineConfig {
    maxInstances: number;
}

export interface GridItemOptions extends Partial<GridStackNode> { }

export interface GridItem extends GridItemOptions {
    element: HTMLElement;
}
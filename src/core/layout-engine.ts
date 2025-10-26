import { type GridEngine } from "./grid-engine";

export class LayoutEngine {
    public readonly grid: GridEngine;

    public constructor(grid: GridEngine) {
        this.grid = grid;
    }
}
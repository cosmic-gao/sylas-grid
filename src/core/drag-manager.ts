import { type GridEngine } from "./grid-engine";

export class DragManager {
  public readonly engine: GridEngine;

  public constructor(engine: GridEngine) {
    this.engine = engine
  }

  public destroy() { }
}
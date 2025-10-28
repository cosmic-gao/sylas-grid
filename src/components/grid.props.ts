import { type GridItemOptions, type GridEngineOptions } from "../core";

export interface GridProps {
  name: string;
  options?: GridEngineOptions;
}

export interface GridItemProps extends GridItemOptions {
  id: string;
}

export interface GridDragSourceProps {
  target: string;
  disabled?: boolean;
}
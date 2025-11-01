import { type GridItemOptions, type GridOptions } from "../core";

export interface GridProps extends GridOptions {
  name: string;
  options?: GridOptions;
}

export interface GridItemProps extends GridItemOptions {
}

export interface GridDragSourceProps extends GridItemProps {
  target: string;
}

export interface GridEmits {
  (e: 'update:modelValue', items: GridItemOptions[]): void
  (e: 'change', items: GridItemOptions[]): void
  (e: 'added', items: GridItemOptions[]): void
  (e: 'removed', item: GridItemOptions): void
  (e: 'dragstart', item: GridItemOptions): void
  (e: 'dragstop', item: GridItemOptions): void
  (e: 'resizestart', item: GridItemOptions): void
  (e: 'resizestop', item: GridItemOptions): void
  (e: 'dropped', data: any): void
}

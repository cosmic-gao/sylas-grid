import { type GridItemOptions, type GridOptions } from "../core";

export interface GridProps extends GridOptions {
  name: string;
}

export interface GridItemProps extends GridItemOptions {
  id: string;
}

export interface GridDragSourceProps {
  target: string;
  disabled?: boolean;
}

export interface GridEmits {
  (e: 'update:modelValue', items: GridItemOptions[]): void
  (e: 'change', items: GridItemOptions[]): void
  (e: 'added', item: GridItemOptions): void
  (e: 'removed', item: GridItemOptions): void
  (e: 'dragstart', item: GridItemOptions): void
  (e: 'dragstop', item: GridItemOptions): void
  (e: 'resizestart', item: GridItemOptions): void
  (e: 'resizestop', item: GridItemOptions): void
  (e: 'dropped', data: any): void
}

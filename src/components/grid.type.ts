import { type GridItemOptions, type GridOptions, type DragItemOptions } from "../core";

export interface GridItemProps extends GridItemOptions {
}

export interface GridDragSourceProps extends Omit<GridItemProps, 'x' | 'y'> {
  target: string;
}

export interface GridProps extends GridOptions {
  modelValue?: GridItemProps[];
  name: string;
  options?: GridOptions;
}


export interface GridEmits {
  (e: 'update:modelValue', items: GridItemProps[]): void
  (e: 'dropped', item: DragItemOptions<any>): void
}

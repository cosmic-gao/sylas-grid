import { nanoid } from "nanoid";

export const SCOPE_ALPHABET = "__sylas_grid__"

export const useId = (size: number = 12) => SCOPE_ALPHABET + nanoid(size)
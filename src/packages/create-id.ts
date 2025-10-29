import { nanoid } from "nanoid";

export const SCOPE_ALPHABET = "__sylas_grid__"

const factory = (scope: string) => (size: number = 12) => scope + nanoid(size);

export const createId = factory(SCOPE_ALPHABET)
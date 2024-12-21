// Import atom from jotai for state management
import { atom } from "jotai";

// Atom to store transaction hash state
// Can be string (when hash exists), null (when cleared), or undefined (initial state)
export const TransactionHashAtom = atom<string | null | undefined>(undefined);

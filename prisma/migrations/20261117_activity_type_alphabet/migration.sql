-- "Alfabeto" becomes its own category, separate from "Números"
-- (NUMBERS_AND_LETTERS). Additive: existing rows are unchanged.
ALTER TYPE "ActivityType" ADD VALUE 'ALPHABET';

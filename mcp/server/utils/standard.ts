import { createSearch } from "../../lib/search";
import type { Standard } from "../../lib/types";

let standard: Promise<Standard> | undefined;
let search: Promise<ReturnType<typeof createSearch>> | undefined;

/**
 * The standard, as modules/standard.ts bundles it, read once per Worker (or dev
 * server) rather than once per request.
 */
export function useStandard(): Promise<Standard> {
  standard ??= useStorage("assets:standard")
    .getItemRaw("standard.json")
    .then((data) => {
      if (!data) throw new Error("The standard isn't bundled: modules/standard.ts writes it when the server is built.");
      return (typeof data === "string" ? JSON.parse(data) : data instanceof Uint8Array ? JSON.parse(new TextDecoder().decode(data)) : data) as Standard;
    });
  standard.catch(() => (standard = undefined));
  return standard;
}

/** search-docs' index of every section and rule, built the first time it's searched. */
export function useSearch(): Promise<ReturnType<typeof createSearch>> {
  search ??= useStandard().then(createSearch);
  search.catch(() => (search = undefined));
  return search;
}

/** The hints a read-only tool gives clients: it changes nothing, and returns the same for the same input. */
export const READ_ONLY = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const;

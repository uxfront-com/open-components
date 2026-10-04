// @vitest-environment node
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { buildContract } from "./contract";

// The schema every contract names on its first line, which the site publishes at
// /schemas/contract.json.
const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(JSON.parse(readFileSync("public/schemas/contract.json", "utf8")));

function errors(contract: unknown) {
  validate(contract);
  return validate.errors ?? [];
}

// Every contract the docs publish at /raw/<path>.yaml, by page.
const contracts = readdirSync("content/docs", { recursive: true, encoding: "utf8" }).flatMap(
  (file): [string, any][] => {
    const contract = file.endsWith(".md") && buildContract(readFileSync(join("content/docs", file), "utf8"));
    return contract ? [[file, parse(contract)]] : [];
  },
);

describe("Contracts", () => {
  it.each(contracts)("%s's contract follows the schema", (_, contract) => {
    expect(errors(contract)).toEqual([]);
  });

  // The schema leaves the basis optional, for contracts written elsewhere, but every
  // checklist on this site has a Basis column.
  it.each(contracts)("%s's contract says where each rule comes from", (_, contract) => {
    expect(contract.rules.filter((rule: any) => !rule.basis)).toEqual([]);
  });

  // A schema that accepts anything would pass every contract above, so these break
  // the Button's contract one way at a time.
  const [, button] = contracts.find(([file]) => file.endsWith("button.md"))!;
  const withRule = (change: (rule: any) => unknown) => (contract: any) => ({
    ...contract,
    rules: [change(contract.rules[0])],
  });
  it.each<[string, (contract: any) => unknown]>([
    ["names neither a component nor a convention", ({ component, ...contract }) => contract],
    ["has a field the schema doesn't know", (contract) => ({ ...contract, colour: "primary" })],
    ["has a prop without a type", (contract) => ({ ...contract, props: { size: { default: "md" } } })],
    ["has a prop that isn't in camelCase", (contract) => ({ ...contract, props: { "icon-only": { type: "boolean" } } })],
    ["has a variable that isn't a token path", (contract) => ({ ...contract, tokens: { variables: ["--button-height"] } })],
    ["has a rule with a level other than must or should", withRule((rule) => ({ ...rule, level: "may" }))],
    ["has a rule without a scope", withRule(({ scope, ...rule }) => rule)],
    ["has a rule with an empty basis", withRule((rule) => ({ ...rule, basis: "" }))],
    ["has a rule with an ID that doesn't name its page", withRule((rule) => ({ ...rule, id: "keep-focus" }))],
  ])("rejects a contract that %s", (_, change) => {
    expect(errors(change(button))).not.toEqual([]);
  });
});

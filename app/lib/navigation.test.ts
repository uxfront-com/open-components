// @vitest-environment node
import type { ContentNavigationItem } from "@nuxt/content";
import { describe, expect, it } from "vitest";
import { findSurround, sortNavigation } from "./navigation";

// A page, and a folder split into an Overview and its parts, as Nuxt Content's
// navigation lists them.
const page = (path: string, title: string): ContentNavigationItem => ({ path, title, stem: path });
const folder = (path: string, title: string, ...parts: ContentNavigationItem[]): ContentNavigationItem => ({
  path,
  title,
  stem: path,
  children: [page(path, "Overview"), ...parts],
});
const section = (path: string, title: string, ...children: ContentNavigationItem[]): ContentNavigationItem => ({
  path,
  title,
  stem: path,
  page: false,
  children,
});

const checkbox = folder(
  "/docs/components/checkbox",
  "Checkbox",
  page("/docs/components/checkbox/ui", "User Interface"),
  page("/docs/components/checkbox/ax", "Agentic Experience"),
);

// The docs in Nuxt Content's order, by file path, which puts `checkbox-group`
// before `checkbox/index`, since `-` comes before `/`.
const docs = (checkboxGroup: ContentNavigationItem) => [
  section(
    "/docs",
    "Docs",
    section(
      "/docs/getting-started",
      "Getting started",
      page("/docs/getting-started/introduction", "Introduction"),
      page("/docs/getting-started/roadmap", "Roadmap"),
    ),
    section("/docs/foundations", "Foundations", page("/docs/foundations/design-tokens", "Design Tokens")),
    section(
      "/docs/components",
      "Components",
      folder("/docs/components/button", "Button", page("/docs/components/button/ui", "User Interface")),
      page("/docs/components/card", "Card"),
      checkboxGroup,
      checkbox,
      page("/docs/components/dialog", "Dialog"),
    ),
  ),
];

const titles = (items: ContentNavigationItem[] = []) => items.map(({ title }) => title);
const at = (navigation: ContentNavigationItem[], path: string): ContentNavigationItem | undefined =>
  navigation.reduce<ContentNavigationItem | undefined>(
    (found, item) => found ?? (item.path === path && item.children ? item : at(item.children ?? [], path)),
    undefined,
  );

describe("sortNavigation", () => {
  it.each([
    ["a page", page("/docs/components/checkbox-group", "Checkbox Group")],
    ["a folder", folder("/docs/components/checkbox-group", "Checkbox Group")],
  ])("lists the Checkbox before the Checkbox Group when the Checkbox is a folder and the group %s", (_, group) => {
    const navigation = sortNavigation(docs(group));

    expect(titles(at(navigation, "/docs/components")?.children)).toEqual([
      "Button",
      "Card",
      "Checkbox",
      "Checkbox Group",
      "Dialog",
    ]);
  });

  it("keeps the numbered sections and the parts of a folder in the order Nuxt Content gives them", () => {
    const navigation = sortNavigation(docs(page("/docs/components/checkbox-group", "Checkbox Group")));

    expect(titles(at(navigation, "/docs")?.children)).toEqual(["Getting started", "Foundations", "Components"]);
    expect(titles(at(navigation, "/docs/getting-started")?.children)).toEqual(["Introduction", "Roadmap"]);
    expect(titles(at(navigation, "/docs/components/checkbox")?.children)).toEqual([
      "Overview",
      "User Interface",
      "Agentic Experience",
    ]);
  });

  it("leaves the navigation it's given as it was", () => {
    const navigation = docs(page("/docs/components/checkbox-group", "Checkbox Group"));
    sortNavigation(navigation);

    expect(titles(at(navigation, "/docs/components")?.children)).toEqual([
      "Button",
      "Card",
      "Checkbox Group",
      "Checkbox",
      "Dialog",
    ]);
  });
});

describe("findSurround", () => {
  const navigation = sortNavigation(docs(page("/docs/components/checkbox-group", "Checkbox Group")));
  const paths = (path: string) => findSurround(navigation, path).map((item) => item?.path ?? null);

  it("goes from the Card to the Checkbox's Overview, and from its last part to the Checkbox Group", () => {
    expect(paths("/docs/components/card")).toEqual([
      "/docs/components/button/ui",
      "/docs/components/checkbox",
    ]);
    expect(paths("/docs/components/checkbox/ax")).toEqual([
      "/docs/components/checkbox/ui",
      "/docs/components/checkbox-group",
    ]);
  });

  it("crosses from one section to the next, and has nothing before the first page or after the last", () => {
    expect(paths("/docs/getting-started/introduction")).toEqual([null, "/docs/getting-started/roadmap"]);
    expect(paths("/docs/foundations/design-tokens")).toEqual([
      "/docs/getting-started/roadmap",
      "/docs/components/button",
    ]);
    expect(paths("/docs/components/dialog")).toEqual(["/docs/components/checkbox-group", null]);
  });
});

import { Comment, Text, type VNode } from "vue";

export interface Link {
  href: string;
  label: string;
}

/**
 * Reads a components hub card from its default slot, as the docs' markdown
 * renders it: a paragraph with the link to the component's Overview, then its
 * sentence, then a list of links to its layers' pages.
 *
 * The markdown can render a paragraph or a link as a plain element (`p`, `a`)
 * or as a prose component (`ProseP`, `ProseA`), so it goes by what each node
 * holds rather than what it is: a link is a node with an `href`, and the list is
 * the last node, the one that holds the layers' links.
 */
export function layout(nodes: VNode[]): { name: Link; sentence: VNode[]; layers: Link[] } {
  const blocks = nodes.filter((node) => node.type !== Comment && !(node.type === Text && !String(node.children).trim()));
  const name = links(blocks.slice(0, 1))[0];
  if (!name) throw new Error("A components hub card starts with a paragraph that links to the component's Overview");
  const layers = blocks.length > 2 ? links(blocks.slice(-1)) : [];
  // Whatever sits between the name and the layers, which is the sentence: the
  // inside of its paragraph, so the card can lay it out.
  const sentence = blocks.slice(1, layers.length ? -1 : undefined).flatMap((node) => children(node));
  return { name, sentence, layers };
}

// The links in these nodes, in order, with their text.
function links(nodes: VNode[]): Link[] {
  return nodes.flatMap((node) => {
    const href = node.props?.href ?? node.props?.to;
    return typeof href === "string" ? [{ href, label: text([node]).trim() }] : links(children(node));
  });
}

// The text in these nodes, without their markup. A slot can hold plain strings.
function text(nodes: (VNode | string)[]): string {
  return nodes
    .map((node) =>
      typeof node === "string" ? node : typeof node.children === "string" ? node.children : text(children(node)),
    )
    .join("");
}

// What a node holds: an element's children, or what a component's default slot renders.
function children(node: VNode): VNode[] {
  const content = node.children;
  if (Array.isArray(content)) return content as VNode[];
  if (content && typeof content === "object" && "default" in content && typeof content.default === "function") {
    return [content.default()].flat() as VNode[];
  }
  return [];
}

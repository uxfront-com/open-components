import names from "#standard/names";

export default defineMcpResource({
  title: "Contract schema",
  description:
    "The JSON Schema every contract follows, for validating them, and contracts of your own. The same file as https://opencomponents.dev/schemas/contract.json.",
  uri: `${names.site}/schemas/contract.json`,
  metadata: { mimeType: "application/schema+json", annotations: { audience: ["assistant"] } },
  handler: async (uri: URL) => {
    const standard = await useStandard();
    return { contents: [{ uri: uri.href, mimeType: "application/schema+json", text: standard.schema }] };
  },
});

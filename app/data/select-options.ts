import type { SelectItem } from "~/reference/select/Select.vue";

/** The list most of the Select page's examples pick from. */
export const countries: SelectItem[] = [
  { value: "fr", label: "France" },
  { value: "de", label: "Germany" },
  { value: "es", label: "Spain" },
  { value: "nz", label: "New Zealand" },
  { value: "pt", label: "Portugal" },
];

/** A list with groups and a separator, for the examples that show them. */
export const destinations: SelectItem[] = [
  {
    label: "Europe",
    options: [
      { value: "fr", label: "France" },
      { value: "es", label: "Spain" },
    ],
  },
  { separator: true },
  {
    label: "Oceania",
    options: [
      { value: "nz", label: "New Zealand" },
      { value: "au", label: "Australia", disabled: true },
    ],
  },
];

/** Issue labels, for the example that shows each option's icon. */
export const labels: SelectItem[] = [
  { value: "bug", label: "Bug" },
  { value: "feature", label: "Feature" },
  { value: "docs", label: "Docs" },
  { value: "question", label: "Question" },
];

/**
 * A longer list, with accents, for the Combobox page's examples, where people type to find
 * one: "cote" finds "Côte d'Ivoire".
 */
export const nations: SelectItem[] = [
  { value: "at", label: "Austria" },
  { value: "be", label: "Belgium" },
  { value: "ci", label: "Côte d'Ivoire" },
  { value: "cw", label: "Curaçao" },
  { value: "dk", label: "Denmark" },
  { value: "fi", label: "Finland" },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany" },
  { value: "is", label: "Iceland" },
  { value: "ie", label: "Ireland" },
  { value: "it", label: "Italy" },
  { value: "nl", label: "Netherlands" },
  { value: "nz", label: "New Zealand" },
  { value: "no", label: "Norway" },
  { value: "pt", label: "Portugal" },
  { value: "re", label: "Réunion" },
  { value: "st", label: "São Tomé and Príncipe" },
  { value: "es", label: "Spain" },
  { value: "se", label: "Sweden" },
  { value: "ch", label: "Switzerland" },
  { value: "tr", label: "Türkiye" },
  { value: "gb", label: "United Kingdom" },
];

/** Tags for an article, which the Combobox page's example of new values adds to. */
export const topics: SelectItem[] = [
  { value: "accessibility", label: "Accessibility" },
  { value: "css", label: "CSS" },
  { value: "design-tokens", label: "Design tokens" },
  { value: "forms", label: "Forms" },
  { value: "performance", label: "Performance" },
];

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

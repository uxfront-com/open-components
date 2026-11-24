/**
 * The success criteria of WCAG 2.2 (https://www.w3.org/TR/WCAG22/), by number:
 * each one's short name, its level and the slug of its Understanding page, like
 * https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html. The
 * accessibility checklists (checklists.ts) name and link every criterion a rule's
 * Basis cites from here.
 *
 * It holds nothing else from WCAG, since the guidelines are CC BY 4.0 and WCAG
 * isn't: a criterion's number and short name are how everyone cites it. 4.1.1
 * Parsing isn't here, since WCAG 2.2 removed it.
 *
 * Like raw.ts, it doesn't use Nitro's auto-imports.
 */

export type WcagLevel = "A" | "AA" | "AAA";

export interface Criterion {
  name: string;
  level: WcagLevel;
  slug: string;
}

export const WCAG: ReadonlyMap<string, Criterion> = new Map(Object.entries({
  "1.1.1": { name: "Non-text Content", level: "A", slug: "non-text-content" },
  "1.2.1": { name: "Audio-only and Video-only (Prerecorded)", level: "A", slug: "audio-only-and-video-only-prerecorded" },
  "1.2.2": { name: "Captions (Prerecorded)", level: "A", slug: "captions-prerecorded" },
  "1.2.3": {
    name: "Audio Description or Media Alternative (Prerecorded)",
    level: "A",
    slug: "audio-description-or-media-alternative-prerecorded",
  },
  "1.2.4": { name: "Captions (Live)", level: "AA", slug: "captions-live" },
  "1.2.5": { name: "Audio Description (Prerecorded)", level: "AA", slug: "audio-description-prerecorded" },
  "1.2.6": { name: "Sign Language (Prerecorded)", level: "AAA", slug: "sign-language-prerecorded" },
  "1.2.7": { name: "Extended Audio Description (Prerecorded)", level: "AAA", slug: "extended-audio-description-prerecorded" },
  "1.2.8": { name: "Media Alternative (Prerecorded)", level: "AAA", slug: "media-alternative-prerecorded" },
  "1.2.9": { name: "Audio-only (Live)", level: "AAA", slug: "audio-only-live" },
  "1.3.1": { name: "Info and Relationships", level: "A", slug: "info-and-relationships" },
  "1.3.2": { name: "Meaningful Sequence", level: "A", slug: "meaningful-sequence" },
  "1.3.3": { name: "Sensory Characteristics", level: "A", slug: "sensory-characteristics" },
  "1.3.4": { name: "Orientation", level: "AA", slug: "orientation" },
  "1.3.5": { name: "Identify Input Purpose", level: "AA", slug: "identify-input-purpose" },
  "1.3.6": { name: "Identify Purpose", level: "AAA", slug: "identify-purpose" },
  "1.4.1": { name: "Use of Color", level: "A", slug: "use-of-color" },
  "1.4.2": { name: "Audio Control", level: "A", slug: "audio-control" },
  "1.4.3": { name: "Contrast (Minimum)", level: "AA", slug: "contrast-minimum" },
  "1.4.4": { name: "Resize Text", level: "AA", slug: "resize-text" },
  "1.4.5": { name: "Images of Text", level: "AA", slug: "images-of-text" },
  "1.4.6": { name: "Contrast (Enhanced)", level: "AAA", slug: "contrast-enhanced" },
  "1.4.7": { name: "Low or No Background Audio", level: "AAA", slug: "low-or-no-background-audio" },
  "1.4.8": { name: "Visual Presentation", level: "AAA", slug: "visual-presentation" },
  "1.4.9": { name: "Images of Text (No Exception)", level: "AAA", slug: "images-of-text-no-exception" },
  "1.4.10": { name: "Reflow", level: "AA", slug: "reflow" },
  "1.4.11": { name: "Non-text Contrast", level: "AA", slug: "non-text-contrast" },
  "1.4.12": { name: "Text Spacing", level: "AA", slug: "text-spacing" },
  "1.4.13": { name: "Content on Hover or Focus", level: "AA", slug: "content-on-hover-or-focus" },
  "2.1.1": { name: "Keyboard", level: "A", slug: "keyboard" },
  "2.1.2": { name: "No Keyboard Trap", level: "A", slug: "no-keyboard-trap" },
  "2.1.3": { name: "Keyboard (No Exception)", level: "AAA", slug: "keyboard-no-exception" },
  "2.1.4": { name: "Character Key Shortcuts", level: "A", slug: "character-key-shortcuts" },
  "2.2.1": { name: "Timing Adjustable", level: "A", slug: "timing-adjustable" },
  "2.2.2": { name: "Pause, Stop, Hide", level: "A", slug: "pause-stop-hide" },
  "2.2.3": { name: "No Timing", level: "AAA", slug: "no-timing" },
  "2.2.4": { name: "Interruptions", level: "AAA", slug: "interruptions" },
  "2.2.5": { name: "Re-authenticating", level: "AAA", slug: "re-authenticating" },
  "2.2.6": { name: "Timeouts", level: "AAA", slug: "timeouts" },
  "2.3.1": { name: "Three Flashes or Below Threshold", level: "A", slug: "three-flashes-or-below-threshold" },
  "2.3.2": { name: "Three Flashes", level: "AAA", slug: "three-flashes" },
  "2.3.3": { name: "Animation from Interactions", level: "AAA", slug: "animation-from-interactions" },
  "2.4.1": { name: "Bypass Blocks", level: "A", slug: "bypass-blocks" },
  "2.4.2": { name: "Page Titled", level: "A", slug: "page-titled" },
  "2.4.3": { name: "Focus Order", level: "A", slug: "focus-order" },
  "2.4.4": { name: "Link Purpose (In Context)", level: "A", slug: "link-purpose-in-context" },
  "2.4.5": { name: "Multiple Ways", level: "AA", slug: "multiple-ways" },
  "2.4.6": { name: "Headings and Labels", level: "AA", slug: "headings-and-labels" },
  "2.4.7": { name: "Focus Visible", level: "AA", slug: "focus-visible" },
  "2.4.8": { name: "Location", level: "AAA", slug: "location" },
  "2.4.9": { name: "Link Purpose (Link Only)", level: "AAA", slug: "link-purpose-link-only" },
  "2.4.10": { name: "Section Headings", level: "AAA", slug: "section-headings" },
  "2.4.11": { name: "Focus Not Obscured (Minimum)", level: "AA", slug: "focus-not-obscured-minimum" },
  "2.4.12": { name: "Focus Not Obscured (Enhanced)", level: "AAA", slug: "focus-not-obscured-enhanced" },
  "2.4.13": { name: "Focus Appearance", level: "AAA", slug: "focus-appearance" },
  "2.5.1": { name: "Pointer Gestures", level: "A", slug: "pointer-gestures" },
  "2.5.2": { name: "Pointer Cancellation", level: "A", slug: "pointer-cancellation" },
  "2.5.3": { name: "Label in Name", level: "A", slug: "label-in-name" },
  "2.5.4": { name: "Motion Actuation", level: "A", slug: "motion-actuation" },
  "2.5.5": { name: "Target Size (Enhanced)", level: "AAA", slug: "target-size-enhanced" },
  "2.5.6": { name: "Concurrent Input Mechanisms", level: "AAA", slug: "concurrent-input-mechanisms" },
  "2.5.7": { name: "Dragging Movements", level: "AA", slug: "dragging-movements" },
  "2.5.8": { name: "Target Size (Minimum)", level: "AA", slug: "target-size-minimum" },
  "3.1.1": { name: "Language of Page", level: "A", slug: "language-of-page" },
  "3.1.2": { name: "Language of Parts", level: "AA", slug: "language-of-parts" },
  "3.1.3": { name: "Unusual Words", level: "AAA", slug: "unusual-words" },
  "3.1.4": { name: "Abbreviations", level: "AAA", slug: "abbreviations" },
  "3.1.5": { name: "Reading Level", level: "AAA", slug: "reading-level" },
  "3.1.6": { name: "Pronunciation", level: "AAA", slug: "pronunciation" },
  "3.2.1": { name: "On Focus", level: "A", slug: "on-focus" },
  "3.2.2": { name: "On Input", level: "A", slug: "on-input" },
  "3.2.3": { name: "Consistent Navigation", level: "AA", slug: "consistent-navigation" },
  "3.2.4": { name: "Consistent Identification", level: "AA", slug: "consistent-identification" },
  "3.2.5": { name: "Change on Request", level: "AAA", slug: "change-on-request" },
  "3.2.6": { name: "Consistent Help", level: "A", slug: "consistent-help" },
  "3.3.1": { name: "Error Identification", level: "A", slug: "error-identification" },
  "3.3.2": { name: "Labels or Instructions", level: "A", slug: "labels-or-instructions" },
  "3.3.3": { name: "Error Suggestion", level: "AA", slug: "error-suggestion" },
  "3.3.4": { name: "Error Prevention (Legal, Financial, Data)", level: "AA", slug: "error-prevention-legal-financial-data" },
  "3.3.5": { name: "Help", level: "AAA", slug: "help" },
  "3.3.6": { name: "Error Prevention (All)", level: "AAA", slug: "error-prevention-all" },
  "3.3.7": { name: "Redundant Entry", level: "A", slug: "redundant-entry" },
  "3.3.8": { name: "Accessible Authentication (Minimum)", level: "AA", slug: "accessible-authentication-minimum" },
  "3.3.9": { name: "Accessible Authentication (Enhanced)", level: "AAA", slug: "accessible-authentication-enhanced" },
  "4.1.2": { name: "Name, Role, Value", level: "A", slug: "name-role-value" },
  "4.1.3": { name: "Status Messages", level: "AA", slug: "status-messages" },
}));

/** The Understanding WCAG 2.2 page for a criterion, by its slug. */
export function understandingUrl(criterion: Criterion): string {
  return `https://www.w3.org/WAI/WCAG22/Understanding/${criterion.slug}.html`;
}

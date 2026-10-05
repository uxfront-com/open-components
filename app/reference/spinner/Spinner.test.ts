import { render } from "@testing-library/vue";
import { describe, expect, it } from "vitest";
import Spinner from "./Spinner.vue";

describe("Spinner", () => {
  it("is hidden from assistive technologies, with no role or name of its own", () => {
    const { container } = render(Spinner);

    const spinner = container.querySelector("svg");
    expect(spinner).toHaveAttribute("aria-hidden", "true");
    expect(spinner).not.toHaveAttribute("role");
    expect(spinner?.querySelector("title")).toBeNull();
  });

  it("renders the svg itself, so classes and attributes land on it", () => {
    const { container } = render(Spinner, { attrs: { class: "large", "data-slot": "spinner" } });

    const spinner = container.firstElementChild;
    expect(spinner?.tagName).toBe("svg");
    expect(spinner).toHaveClass("spinner", "large");
    expect(spinner).toHaveAttribute("data-slot", "spinner");
  });

  it("renders the same markup every time, with its parts in a fixed order", () => {
    const first = render(Spinner).container.innerHTML;
    const { container } = render(Spinner);

    expect(container.innerHTML).toBe(first);
    const parts = [...container.querySelector("svg")!.children].map((part) => part.getAttribute("data-slot"));
    expect(parts).toEqual(["track", "indicator"]);
  });
});

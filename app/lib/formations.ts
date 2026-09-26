import { glslFloat } from "@uxfront/scene";
import type { Formation, FormationProgress, FormationShader, Vec3 } from "@uxfront/scene";

/**
 * Wrappers that reuse a catalog formation in ways the catalog doesn't cover.
 * They only rely on the shader contract (`$main`, `$name` identifiers
 * namespaced to `key_name`, `setup()` for uniforms that never change).
 */

const MAIN = /\bParticle\s+\$main\s*\(/;
const UNIFORM = /^[ \t]*uniform\s+\w+\s+\$([A-Za-z][A-Za-z0-9_]*)\s*(?:\[[^\]]*\])?\s*;[ \t]*\n?/gm;
const PRIVATE = /\$([A-Za-z][A-Za-z0-9_]*)/g;

type ShaderEdit = (shader: FormationShader) => FormationShader;

const editShader = (formation: Formation, edit: ShaderEdit): Formation => ({
  ...formation,
  shader: () => formation.shader().then(edit),
});

/**
 * Renames the formation's `$main` to `$<inner>` and appends a new `$main`
 * with the given body, which calls `$<inner>(id, sel, f)`.
 */
const wrapMain = (formation: Formation, inner: string, body: string): Formation =>
  editShader(formation, (shader) => {
    if (!MAIN.test(shader.glsl)) {
      throw new Error(`Formation "${formation.key}" has no Particle $main() to wrap.`);
    }
    return {
      ...shader,
      glsl: `${shader.glsl.replace(MAIN, `Particle $${inner}(`)}
Particle $main(uint id, float sel, Frame f) {
${body}
}
`,
    };
  });

/**
 * Holds a formation at a fixed `local` progress, whatever the scroll.
 *
 * The scene hands formation `k` `local = 1` as soon as the stage passes `k`,
 * which a pinned section reaches smoothly as it is read. The hero isn't
 * pinned, so a formation that moves with `local`, like `plates`, would jump
 * to its end state the moment the page scrolls. Held, it stays put while it
 * morphs into the next formation. Anchors and `update()` see the same `local`.
 */
export function hold(formation: Formation, local: number): Formation {
  const at = <T extends FormationProgress>(progress: T): T => ({ ...progress, local });
  const held = wrapMain(
    formation,
    "held",
    `  f.local = ${glslFloat(local)};
  return $held(id, sel, f);`,
  );
  return {
    ...editShader(held, ({ update, ...shader }) => ({
      ...shader,
      ...(update && { update: (uniforms, frame) => update(uniforms, at(frame)) }),
    })),
    anchors: formation.anchors.map(({ place, render, ...anchor }) => ({
      ...anchor,
      place: (progress, out) => place(at(progress), out),
      ...(render && { render: (el, progress) => render(el, at(progress)) }),
    })),
  };
}

/**
 * Lights one plate of a `plates` formation and dims the other two, glass and
 * posts included. The plate is found through its anchor (`plates:<plate>`),
 * which sits at the plate's height, so hold the formation first: the plates
 * have to stay where the anchor was measured.
 */
export function spotlight(formation: Formation, plate: number): Formation {
  const anchor = formation.anchors[plate];
  if (!anchor) throw new Error(`Formation "${formation.key}" has no anchor for plate ${plate}.`);
  const at: Vec3 = [0, 0, 0];
  anchor.place({ stage: 0, local: 1, approach: 1, presence: 1, time: 0 }, at);
  return wrapMain(
    formation,
    "unlit",
    `  Particle P = $unlit(id, sel, f);
  float lit = 1.0 - smoothstep(0.2, 0.45, abs(P.pos.y - ${glslFloat(at[1])}));
  P.col *= mix(0.3, 1.3, lit);
  return P;`,
  );
}

/**
 * Makes a formation read its constant uniforms from `source`, another
 * instance of the same formation with the same options, instead of declaring
 * its own. `source` must come earlier in the scene.
 *
 * WebGL2 only guarantees 256 vertex uniform vectors, and many Android GPUs
 * stop there. A `plates` formation declares ~146 for its artwork, so a scene
 * with two of them already falls back to the static image on those devices.
 * Shared, every copy after the first is free.
 */
export function share(formation: Formation, source: Formation): Formation {
  return editShader(formation, ({ glsl, setup: _setup, update, ...shader }) => {
    if (update) {
      throw new Error(`Formation "${formation.key}" updates its uniforms every frame.`);
    }
    const names = new Set<string>();
    const body = glsl.replace(UNIFORM, (_, name: string) => {
      names.add(name);
      return "";
    });
    return {
      ...shader,
      glsl: body.replace(PRIVATE, (match, name: string) =>
        names.has(name) ? `${source.key}_${name}` : match,
      ),
    };
  });
}

import { editShader, glslFloat, wrapMain } from "@uxfront/scene";
import type { Formation, Vec3 } from "@uxfront/scene";

/**
 * Wrappers that reuse a catalog formation in ways the catalog doesn't cover.
 * They only rely on the shader contract (`$main`, `$name` identifiers
 * namespaced to `key_name`, `setup()` for uniforms that never change).
 */

const UNIFORM = /^[ \t]*uniform\s+\w+\s+\$([A-Za-z][A-Za-z0-9_]*)\s*(?:\[[^\]]*\])?\s*;[ \t]*\n?/gm;
const PRIVATE = /\$([A-Za-z][A-Za-z0-9_]*)/g;

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

/**
 * Radix MCP Types
 *
 * The shape of the data this server exposes to AI coding agents. The
 * `a11yContract` is the differentiator — props can be inferred from types,
 * but the accessibility contract (roles, keyboard, required structure, and
 * the misuse agents get wrong) is hand-authored knowledge.
 */

/** A single prop on a primitive part. */
export interface PropSpec {
  name: string
  type: string
  default?: string
  required?: boolean
  description?: string
}

/**
 * The accessibility contract for a primitive — what an agent must honor to
 * keep the component correct and accessible.
 */
export interface A11yContract {
  /** ARIA roles/attributes Radix applies and any the consumer must add. */
  roles: string
  /** Keyboard interactions the primitive supports out of the box. */
  keyboard: string[]
  /** Focus management behavior (trap, return, autofocus, etc.). */
  focus: string
  /** Structural requirements — e.g. a Provider or a required label part. */
  requires: string[]
  /** Common, real misuse that breaks accessibility or behavior. */
  commonMistakes: string[]
}

/** Full metadata for one Radix primitive. */
export interface PrimitiveMeta {
  /** Primitive name, e.g. "Tooltip". */
  name: string
  /** One-line description of what it is and when to reach for it. */
  description: string
  /** Recommended import statement. */
  import: string
  /** Composable parts, in typical authoring order. */
  parts: string[]
  /** Props keyed by part name. */
  props: Record<string, PropSpec[]>
  /** The accessibility contract — the heart of this server. */
  a11yContract: A11yContract
  /** A correct, minimal usage example. */
  correctExample: string
  /** Where the data is sourced from. */
  source: string
}

/** Summary entry returned by `list_primitives`. */
export interface PrimitiveSummary {
  name: string
  description: string
  parts: number
}

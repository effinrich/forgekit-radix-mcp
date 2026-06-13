/**
 * Radix MCP Tools
 *
 * Tool implementations. Pure functions over the primitives knowledge base —
 * no filesystem or network access, so they are fast and deterministic.
 */

import { PRIMITIVES, PRIMITIVE_NAMES } from './data/primitives.js'
import type { A11yContract, PrimitiveMeta, PrimitiveSummary } from './types.js'

function resolveName(name: string): string | undefined {
  if (!name) return undefined
  const wanted = name.trim().toLowerCase().replace(/[\s_-]/g, '')
  return PRIMITIVE_NAMES.find((n) => n.toLowerCase() === wanted)
}

/**
 * Tool: list_primitives
 * List every documented Radix primitive with a one-line description.
 */
export function listPrimitives(): {
  primitives: PrimitiveSummary[]
  total: number
  summary: string
} {
  const primitives = PRIMITIVE_NAMES.map((name) => {
    const p = PRIMITIVES[name]!
    return { name: p.name, description: p.description, parts: p.parts.length }
  })

  return {
    primitives,
    total: primitives.length,
    summary: `Documented Radix primitives: ${PRIMITIVE_NAMES.join(', ')}`,
  }
}

/**
 * Tool: get_primitive
 * Full metadata for a primitive — parts, props, a11y contract, and a correct example.
 */
export function getPrimitive(args: { name: string }): PrimitiveMeta {
  const resolved = resolveName(args?.name)
  if (!resolved) {
    throw new Error(
      `Unknown primitive "${args?.name}". Known primitives: ${PRIMITIVE_NAMES.join(', ')}.`
    )
  }
  return PRIMITIVES[resolved]!
}

/**
 * Tool: get_a11y_contract
 * Just the accessibility contract for a primitive — the highest-signal payload
 * for an agent about to wire the component.
 */
export function getA11yContract(args: { name: string }): {
  name: string
  a11yContract: A11yContract
} {
  const resolved = resolveName(args?.name)
  if (!resolved) {
    throw new Error(
      `Unknown primitive "${args?.name}". Known primitives: ${PRIMITIVE_NAMES.join(', ')}.`
    )
  }
  const p = PRIMITIVES[resolved]!
  return { name: p.name, a11yContract: p.a11yContract }
}

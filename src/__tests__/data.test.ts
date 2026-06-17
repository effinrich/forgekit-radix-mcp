/**
 * Data integrity — every primitive in the knowledge base must be complete and
 * well-formed. This is what keeps the server from shipping a half-filled entry.
 */

import { describe, expect, it } from 'vitest'

import { PRIMITIVES, PRIMITIVE_NAMES } from '../data/primitives.js'

describe('knowledge base integrity', () => {
  it('has a non-trivial number of primitives', () => {
    expect(PRIMITIVE_NAMES.length).toBeGreaterThanOrEqual(20)
  })

  it.each(PRIMITIVE_NAMES)('%s is complete and well-formed', (name) => {
    const p = PRIMITIVES[name]!
    // identity
    expect(p.name).toBe(name)
    expect(p.description.length).toBeGreaterThan(20)
    expect(p.import).toMatch(/import \{ \w+ \} from 'radix-ui';/)
    expect(p.source).toBeTruthy()

    // parts
    expect(p.parts.length).toBeGreaterThan(0)
    expect(new Set(p.parts).size).toBe(p.parts.length) // no dupes

    // props keyed by real parts, every spec has name + type
    for (const [part, specs] of Object.entries(p.props)) {
      expect(p.parts).toContain(part)
      expect(specs.length).toBeGreaterThan(0)
      for (const s of specs) {
        expect(s.name).toBeTruthy()
        expect(s.type).toBeTruthy()
      }
    }

    // a11y contract — the differentiator must never be empty
    const c = p.a11yContract
    expect(c.roles.length).toBeGreaterThan(0)
    expect(c.keyboard.length).toBeGreaterThan(0)
    expect(c.focus.length).toBeGreaterThan(0)
    expect(Array.isArray(c.requires)).toBe(true)
    expect(c.commonMistakes.length).toBeGreaterThan(0)
    for (const line of [...c.keyboard, ...c.requires, ...c.commonMistakes]) {
      expect(line.trim().length).toBeGreaterThan(0)
    }

    // example references the import namespace
    const ns = p.import.match(/import \{ (\w+) \}/)?.[1]
    expect(ns).toBeTruthy()
    expect(p.correctExample).toContain(`${ns}.`)
  })

  it('PRIMITIVE_NAMES matches the keys of PRIMITIVES', () => {
    expect(PRIMITIVE_NAMES).toEqual(Object.keys(PRIMITIVES))
  })
})

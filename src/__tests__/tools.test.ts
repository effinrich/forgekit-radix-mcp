import { describe, it, expect } from 'vitest'

import { PRIMITIVE_NAMES } from '../data/primitives.js'
import { getA11yContract, getPrimitive, listPrimitives } from '../tools.js'

describe('listPrimitives', () => {
  it('returns every documented primitive with parts count', () => {
    const result = listPrimitives()
    expect(result.total).toBe(PRIMITIVE_NAMES.length)
    expect(result.primitives.length).toBe(PRIMITIVE_NAMES.length)
    for (const p of result.primitives) {
      expect(p.name).toBeTruthy()
      expect(p.description).toBeTruthy()
      expect(p.parts).toBeGreaterThan(0)
    }
  })
})

describe('getPrimitive', () => {
  it('returns full metadata for a known primitive', () => {
    const tooltip = getPrimitive({ name: 'Tooltip' })
    expect(tooltip.name).toBe('Tooltip')
    expect(tooltip.parts).toContain('Provider')
    expect(tooltip.a11yContract.commonMistakes.length).toBeGreaterThan(0)
    expect(tooltip.correctExample).toContain('Tooltip.Provider')
  })

  it('is case- and separator-insensitive', () => {
    expect(getPrimitive({ name: 'dropdownmenu' }).name).toBe('DropdownMenu')
    expect(getPrimitive({ name: 'dropdown-menu' }).name).toBe('DropdownMenu')
    expect(getPrimitive({ name: '  Dialog  ' }).name).toBe('Dialog')
  })

  it('throws a helpful error for an unknown primitive', () => {
    expect(() => getPrimitive({ name: 'Accordionnn' })).toThrow(/Unknown primitive/)
  })
})

describe('getA11yContract', () => {
  it('returns only the accessibility contract', () => {
    const result = getA11yContract({ name: 'Select' })
    expect(result.name).toBe('Select')
    expect(result.a11yContract.keyboard.length).toBeGreaterThan(0)
    expect(result.a11yContract.requires.length).toBeGreaterThan(0)
    // It must NOT include the full props payload.
    expect(result as Record<string, unknown>).not.toHaveProperty('props')
  })
})

describe('knowledge base integrity', () => {
  it('every primitive has a non-empty contract and example', () => {
    for (const name of PRIMITIVE_NAMES) {
      const p = getPrimitive({ name })
      expect(p.import).toContain('radix-ui')
      expect(p.parts.length).toBeGreaterThan(0)
      expect(p.a11yContract.roles).toBeTruthy()
      expect(p.a11yContract.keyboard.length).toBeGreaterThan(0)
      expect(p.correctExample.length).toBeGreaterThan(0)
    }
  })
})

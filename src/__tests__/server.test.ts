/**
 * Integration tests — drive the real MCP server over an in-memory transport via a
 * real MCP Client, exactly as Claude Code / Cursor would. Covers the protocol
 * handshake, tool listing, every tool call (happy + error paths), and resources.
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { PRIMITIVE_NAMES } from '../data/primitives.js'
import { createRadixMCPServer } from '../index.js'

let client: Client

beforeEach(async () => {
  const server = createRadixMCPServer()
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
  client = new Client({ name: 'test', version: '1.0.0' }, { capabilities: {} })
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)])
})

afterEach(async () => {
  await client.close()
})

function parse(result: { content: Array<{ type: string; text?: string }> }) {
  const block = result.content[0]
  if (!block || block.type !== 'text' || !block.text) throw new Error('no text content')
  return JSON.parse(block.text)
}

describe('tools/list', () => {
  it('exposes exactly the three tools with input schemas', async () => {
    const { tools } = await client.listTools()
    const names = tools.map((t) => t.name).sort()
    expect(names).toEqual(['get_a11y_contract', 'get_primitive', 'list_primitives'])
    for (const t of tools) {
      expect(t.description).toBeTruthy()
      expect(t.inputSchema).toBeTruthy()
    }
  })
})

describe('list_primitives', () => {
  it('returns every primitive', async () => {
    const res = await client.callTool({ name: 'list_primitives', arguments: {} })
    const data = parse(res as never)
    expect(data.total).toBe(PRIMITIVE_NAMES.length)
    expect(data.primitives.map((p: { name: string }) => p.name)).toEqual(PRIMITIVE_NAMES)
  })
})

describe('get_primitive', () => {
  it('returns full metadata for a known primitive', async () => {
    const res = await client.callTool({ name: 'get_primitive', arguments: { name: 'Tooltip' } })
    const data = parse(res as never)
    expect(data.name).toBe('Tooltip')
    expect(data.parts).toContain('Provider')
    expect(data.a11yContract.commonMistakes.length).toBeGreaterThan(0)
  })

  it('is case- and separator-insensitive', async () => {
    const res = await client.callTool({ name: 'get_primitive', arguments: { name: 'dropdown-menu' } })
    expect(parse(res as never).name).toBe('DropdownMenu')
  })

  it('returns an MCP error for an unknown primitive', async () => {
    const res = (await client.callTool({ name: 'get_primitive', arguments: { name: 'Nope' } })) as {
      isError?: boolean
      content: Array<{ type: string; text?: string }>
    }
    expect(res.isError).toBe(true)
    expect(parse(res as never).error).toMatch(/Unknown primitive/)
  })

  it('errors cleanly when name is missing', async () => {
    const res = (await client.callTool({ name: 'get_primitive', arguments: {} })) as {
      isError?: boolean
    }
    expect(res.isError).toBe(true)
  })
})

describe('get_a11y_contract', () => {
  it('returns only the contract, no props payload', async () => {
    const res = await client.callTool({ name: 'get_a11y_contract', arguments: { name: 'dialog' } })
    const data = parse(res as never)
    expect(data.name).toBe('Dialog')
    expect(data.a11yContract.keyboard.length).toBeGreaterThan(0)
    expect(data).not.toHaveProperty('props')
  })
})

describe('unknown tool', () => {
  it('returns an error result', async () => {
    const res = (await client.callTool({ name: 'does_not_exist', arguments: {} })) as {
      isError?: boolean
    }
    expect(res.isError).toBe(true)
  })
})

describe('resources', () => {
  it('lists one resource per primitive', async () => {
    const { resources } = await client.listResources()
    expect(resources.length).toBe(PRIMITIVE_NAMES.length)
    expect(resources.every((r) => r.uri.startsWith('radix://primitives/'))).toBe(true)
  })

  it('reads a primitive resource as JSON', async () => {
    const res = await client.readResource({ uri: 'radix://primitives/tooltip' })
    const text = res.contents[0]?.text
    expect(typeof text).toBe('string')
    expect(JSON.parse(text as string).name).toBe('Tooltip')
  })

  it('rejects an unknown resource uri', async () => {
    await expect(client.readResource({ uri: 'radix://primitives/nope' })).rejects.toThrow()
  })
})

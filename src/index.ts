/**
 * Radix MCP Server
 *
 * A Model Context Protocol server that exposes Radix Primitives' public API
 * and — crucially — their accessibility contracts to AI coding agents, so the
 * generated code uses the right props, the right parts, and respects the
 * ARIA/keyboard expectations of each primitive.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

import { PRIMITIVES, PRIMITIVE_NAMES } from './data/primitives.js'
import { getA11yContract, getPrimitive, listPrimitives } from './tools.js'

export * from './types.js'
export { PRIMITIVES, PRIMITIVE_NAMES } from './data/primitives.js'
export { getA11yContract, getPrimitive, listPrimitives } from './tools.js'

const SERVER_VERSION = '0.1.0'

/**
 * Create and configure the MCP server.
 */
export function createRadixMCPServer() {
  const server = new Server(
    {
      name: 'radix-mcp',
      version: SERVER_VERSION,
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    }
  )

  // ===========================================
  // Tool Definitions
  // ===========================================

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'list_primitives',
        description:
          'List every documented Radix primitive with a one-line description. Call this first to discover what is available.',
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'get_primitive',
        description:
          'Get full metadata for a Radix primitive: composable parts, props by part, the accessibility contract, and a correct minimal example. Use before writing or editing any Radix component.',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Primitive name, e.g. "Tooltip", "Dialog", "Select" (case-insensitive).',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'get_a11y_contract',
        description:
          'Get just the accessibility contract for a primitive — roles, keyboard interactions, focus behavior, structural requirements, and the common mistakes to avoid. The highest-signal payload when wiring a component accessibly.',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Primitive name, e.g. "Tooltip" (case-insensitive).',
            },
          },
          required: ['name'],
        },
      },
    ],
  }))

  // ===========================================
  // Tool Execution
  // ===========================================

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params

    try {
      let result: unknown

      switch (name) {
        case 'list_primitives':
          result = listPrimitives()
          break

        case 'get_primitive':
          result = getPrimitive(args as { name: string })
          break

        case 'get_a11y_contract':
          result = getA11yContract(args as { name: string })
          break

        default:
          throw new Error(`Unknown tool: ${name}`)
      }

      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        content: [{ type: 'text', text: JSON.stringify({ error: message }) }],
        isError: true,
      }
    }
  })

  // ===========================================
  // Resources
  // ===========================================

  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: PRIMITIVE_NAMES.map((name) => ({
      uri: `radix://primitives/${name.toLowerCase()}`,
      name: `${name} primitive`,
      description: `API + accessibility contract for Radix ${name}`,
      mimeType: 'application/json',
    })),
  }))

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params
    const match = /^radix:\/\/primitives\/(.+)$/.exec(uri)
    const key = match?.[1]?.toLowerCase()
    const found = key && PRIMITIVE_NAMES.find((n) => n.toLowerCase() === key)

    if (!found) {
      throw new Error(`Unknown resource: ${uri}`)
    }

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(PRIMITIVES[found], null, 2),
        },
      ],
    }
  })

  return server
}

/**
 * Run the MCP server with stdio transport.
 */
export async function runServer() {
  const server = createRadixMCPServer()
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

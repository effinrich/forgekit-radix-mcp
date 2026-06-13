#!/usr/bin/env node
/**
 * Radix MCP CLI
 *
 * Starts the Radix Primitives MCP server over stdio. No project configuration
 * needed — the knowledge base ships with the server.
 *
 * Usage:
 *   npx forgekit-radix-mcp
 *
 * Register with an MCP client (e.g. Claude Code / Cursor) by pointing it at
 * this command as a stdio server.
 */

import { runServer } from './index.js'

function showHelp(): void {
  console.log(`
forgekit-radix-mcp - Radix Primitives APIs + accessibility contracts for AI coding agents

USAGE:
  npx forgekit-radix-mcp        Start the MCP server (stdio)
  npx forgekit-radix-mcp --help Show this help

TOOLS EXPOSED:
  list_primitives     List documented Radix primitives
  get_primitive       Parts, props, a11y contract, and a correct example
  get_a11y_contract   Just the accessibility contract for a primitive

MORE INFO:
  https://npmjs.com/package/forgekit-radix-mcp
`)
}

async function main() {
  const args = process.argv.slice(2)
  if (args.includes('--help') || args.includes('-h')) {
    showHelp()
    process.exit(0)
  }

  console.error('[radix-mcp] Starting MCP server...')
  await runServer()
}

main().catch((error) => {
  console.error('[radix-mcp] Fatal error:', error)
  process.exit(1)
})

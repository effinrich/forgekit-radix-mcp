# forgekit-radix-mcp

**Radix Primitives' APIs and accessibility contracts, exposed to AI coding agents.**

Coding agents (Claude Code, Cursor) routinely hallucinate Radix prop names, drop required parts, and miss the ARIA/keyboard contract of a primitive. There's no machine-readable source of truth for *how to use Radix correctly* — only prose docs an agent has to guess from.

`forgekit-radix-mcp` is an MCP server that gives an agent the real thing: each primitive's parts, props, and — the part nobody else ships — its **accessibility contract** and the common mistakes to avoid.

> My coding agent stopped hallucinating Radix props — and now it knows a tooltip isn't a label.

Part of [ForgeKit](https://forgekit.cloud). MIT licensed.

## Why

Props can be inferred from types. The accessibility contract can't — that's hand-authored knowledge: which Provider is required, which part supplies the accessible name, what the keyboard model is, and the misuse that quietly breaks a11y (a Tooltip used as a label, a Popover that auto-opens a nested Tooltip, a Select with an empty-string item value). This server encodes that so agents generate correct, accessible Radix code on the first try.

## Install

```bash
npm i -g forgekit-radix-mcp
# or run on demand
npx forgekit-radix-mcp
```

## Register with an MCP client

Claude Code / Cursor (stdio server):

```jsonc
{
  "mcpServers": {
    "radix": {
      "command": "npx",
      "args": ["-y", "forgekit-radix-mcp"]
    }
  }
}
```

## Tools

| Tool | Returns |
| --- | --- |
| `list_primitives` | Every documented primitive + one-line description |
| `get_primitive` | Parts, props by part, a11y contract, and a correct example |
| `get_a11y_contract` | Just the accessibility contract — highest-signal payload |

### Example

Agent call:

```
get_primitive  { "name": "Tooltip" }
```

Returns (abridged):

```jsonc
{
  "name": "Tooltip",
  "import": "import { Tooltip } from 'radix-ui';",
  "parts": ["Provider", "Root", "Trigger", "Portal", "Content", "Arrow"],
  "a11yContract": {
    "roles": "Content renders role=\"tooltip\"; Trigger gets aria-describedby when open",
    "keyboard": ["Tab: focus the trigger → opens instantly", "Escape: closes"],
    "focus": "Opens on focus AND hover; focus never moves into the tooltip",
    "requires": ["Tooltip.Provider must wrap the app once"],
    "commonMistakes": [
      "Using a tooltip for essential/interactive content (use Popover/HoverCard)",
      "Wrapping a disabled button directly — it fires no focus/hover events",
      "Using a tooltip as the only label for an icon button"
    ]
  },
  "correctExample": "<Tooltip.Provider> ... </Tooltip.Provider>"
}
```

## Coverage

**26 primitives.** Dialog · AlertDialog · Popover · Tooltip · HoverCard · DropdownMenu · ContextMenu · Menubar · NavigationMenu · Select · Tabs · Accordion · Collapsible · Checkbox · RadioGroup · Switch · Toggle · ToggleGroup · Slider · Toast · Progress · Avatar · Label · Separator · AspectRatio · ScrollArea.

Data reflects the `radix-ui` public API and the WAI-ARIA Authoring Practices.

## Pairs with WorkOS AuthKit MCP

For agents that act on behalf of a user, [AuthKit MCP](https://workos.com/docs/authkit/mcp) handles secured, tool-scoped access — `forgekit-radix-mcp` is a read-only knowledge server that slots cleanly behind it.

## Development

```bash
npm install
npm run build
npm test
```

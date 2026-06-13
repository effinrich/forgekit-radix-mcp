/**
 * Radix Primitives knowledge base.
 *
 * Props reflect the public API of `radix-ui` (the unified package). The
 * accessibility contracts are hand-authored from the Radix docs and the
 * WAI-ARIA Authoring Practices — this is the layer AI agents otherwise get
 * wrong (missing Providers, treating tooltips as labels, dropping required
 * labelling parts, etc.).
 */

import type { PrimitiveMeta } from '../types.js'

const SOURCE = 'radix-ui primitives (public API) + WAI-ARIA Authoring Practices'

export const PRIMITIVES: Record<string, PrimitiveMeta> = {
  Tooltip: {
    name: 'Tooltip',
    description:
      'A popup that displays information related to an element when it receives keyboard focus or the mouse hovers over it. For sighted users only — never for essential or interactive content.',
    import: "import { Tooltip } from 'radix-ui';",
    parts: ['Provider', 'Root', 'Trigger', 'Portal', 'Content', 'Arrow'],
    props: {
      Provider: [
        { name: 'delayDuration', type: 'number', default: '700', description: 'Duration from pointer enter until open.' },
        { name: 'skipDelayDuration', type: 'number', default: '300', description: 'How long after closing a tooltip the next one opens instantly.' },
        { name: 'disableHoverableContent', type: 'boolean', description: 'Prevent the content from staying open when hovered.' },
      ],
      Root: [
        { name: 'open', type: 'boolean', description: 'Controlled open state.' },
        { name: 'defaultOpen', type: 'boolean', description: 'Initial open state when uncontrolled.' },
        { name: 'onOpenChange', type: '(open: boolean) => void' },
        { name: 'delayDuration', type: 'number', default: '700' },
        { name: 'disableHoverableContent', type: 'boolean' },
      ],
      Content: [
        { name: 'side', type: '"top" | "right" | "bottom" | "left"', default: '"top"' },
        { name: 'sideOffset', type: 'number', default: '0' },
        { name: 'align', type: '"start" | "center" | "end"', default: '"center"' },
        { name: 'avoidCollisions', type: 'boolean', default: 'true' },
      ],
    },
    a11yContract: {
      roles: 'Content renders with role="tooltip". The Trigger receives aria-describedby pointing at the Content while open.',
      keyboard: [
        'Tab / Shift+Tab: focus the trigger — opens the tooltip instantly (no hover delay).',
        'Escape: closes an open tooltip.',
      ],
      focus: 'Opens on trigger focus and on pointer hover; closes on blur or pointer leave. Focus never moves into the tooltip — it is non-interactive.',
      requires: [
        'Tooltip.Provider must wrap the app (or subtree) once — it governs delay/skip behavior.',
        'Content must be rendered inside Tooltip.Portal for correct layering.',
      ],
      commonMistakes: [
        'Putting essential or interactive content in a tooltip — it is described via aria-describedby and is not reliably reachable. Use Popover or HoverCard instead.',
        'Wrapping a disabled button directly — disabled elements fire neither focus nor pointer events, so the tooltip never opens. Wrap in a focusable span or use aria-disabled.',
        'Omitting Tooltip.Provider — delay/skip behavior silently breaks.',
        'Using a tooltip as the only label for an icon button — provide an aria-label as well; a tooltip is supplementary, not a name.',
      ],
    },
    correctExample: [
      '<Tooltip.Provider>',
      '  <Tooltip.Root>',
      '    <Tooltip.Trigger asChild>',
      '      <button aria-label="Save">💾</button>',
      '    </Tooltip.Trigger>',
      '    <Tooltip.Portal>',
      '      <Tooltip.Content sideOffset={4}>',
      '        Save your changes',
      '        <Tooltip.Arrow />',
      '      </Tooltip.Content>',
      '    </Tooltip.Portal>',
      '  </Tooltip.Root>',
      '</Tooltip.Provider>',
    ].join('\n'),
    source: SOURCE,
  },

  Dialog: {
    name: 'Dialog',
    description:
      'A modal window overlaid on the page, trapping focus until dismissed. Use for content that requires the user to interact before continuing.',
    import: "import { Dialog } from 'radix-ui';",
    parts: ['Root', 'Trigger', 'Portal', 'Overlay', 'Content', 'Title', 'Description', 'Close'],
    props: {
      Root: [
        { name: 'open', type: 'boolean', description: 'Controlled open state.' },
        { name: 'defaultOpen', type: 'boolean' },
        { name: 'onOpenChange', type: '(open: boolean) => void' },
        { name: 'modal', type: 'boolean', default: 'true', description: 'When true, traps focus and blocks outside interaction.' },
      ],
      Content: [
        { name: 'onOpenAutoFocus', type: '(event: Event) => void', description: 'Customize the element focused on open.' },
        { name: 'onCloseAutoFocus', type: '(event: Event) => void', description: 'Customize the element focused on close.' },
        { name: 'onEscapeKeyDown', type: '(event: KeyboardEvent) => void' },
        { name: 'onPointerDownOutside', type: '(event: PointerDownOutsideEvent) => void' },
      ],
    },
    a11yContract: {
      roles: 'Content renders role="dialog" with aria-modal="true", aria-labelledby (the Title) and aria-describedby (the Description).',
      keyboard: [
        'Escape: closes the dialog.',
        'Tab / Shift+Tab: cycles focus within the dialog only (focus is trapped while modal).',
      ],
      focus: 'On open, focus moves into the Content (first focusable element). On close, focus returns to the Trigger. Focus is trapped while modal.',
      requires: [
        'Dialog.Title is required for an accessible name — Radix warns in dev if it is missing. Use Dialog.Title + VisuallyHidden if you do not want it shown.',
        'Dialog.Description is recommended (aria-describedby). Pass aria-describedby={undefined} on Content to opt out intentionally.',
        'Content must be inside Dialog.Portal.',
      ],
      commonMistakes: [
        'Omitting Dialog.Title — produces a dev warning and an unnamed dialog for screen readers.',
        'Using Dialog for non-modal, transient UI — reach for Popover instead.',
        'Removing the Overlay while modal — the overlay backs the outside-click and scroll-lock behavior.',
      ],
    },
    correctExample: [
      '<Dialog.Root>',
      '  <Dialog.Trigger asChild><button>Edit profile</button></Dialog.Trigger>',
      '  <Dialog.Portal>',
      '    <Dialog.Overlay />',
      '    <Dialog.Content>',
      '      <Dialog.Title>Edit profile</Dialog.Title>',
      '      <Dialog.Description>Make changes and save.</Dialog.Description>',
      '      {/* form */}',
      '      <Dialog.Close asChild><button>Save</button></Dialog.Close>',
      '    </Dialog.Content>',
      '  </Dialog.Portal>',
      '</Dialog.Root>',
    ].join('\n'),
    source: SOURCE,
  },

  Popover: {
    name: 'Popover',
    description:
      'A non-modal floating panel anchored to a trigger. Use for rich, interactive content (forms, menus of controls). Not for hover hints (Tooltip) or read-only previews (HoverCard).',
    import: "import { Popover } from 'radix-ui';",
    parts: ['Root', 'Trigger', 'Anchor', 'Portal', 'Content', 'Close', 'Arrow'],
    props: {
      Root: [
        { name: 'open', type: 'boolean' },
        { name: 'defaultOpen', type: 'boolean' },
        { name: 'onOpenChange', type: '(open: boolean) => void' },
        { name: 'modal', type: 'boolean', default: 'false', description: 'When true, traps focus and blocks outside interaction.' },
      ],
      Content: [
        { name: 'side', type: '"top" | "right" | "bottom" | "left"', default: '"bottom"' },
        { name: 'sideOffset', type: 'number', default: '0' },
        { name: 'align', type: '"start" | "center" | "end"', default: '"center"' },
        { name: 'onOpenAutoFocus', type: '(event: Event) => void' },
        { name: 'collisionPadding', type: 'number | Partial<Record<Side, number>>', default: '0' },
      ],
    },
    a11yContract: {
      roles: 'Content renders role="dialog". The Trigger gets aria-expanded and aria-controls.',
      keyboard: [
        'Space / Enter on the Trigger: toggles the popover.',
        'Escape: closes the popover and returns focus to the Trigger.',
        'Tab: moves through the focusable elements inside the content.',
      ],
      focus: 'On open, focus moves to the Content (or first focusable child). On close, focus returns to the Trigger. Non-modal by default, so outside interaction is allowed.',
      requires: ['Content must be inside Popover.Portal when used over other stacking contexts.'],
      commonMistakes: [
        'Nesting a Tooltip whose trigger is the first focusable child — Popover autofocuses content on open, which fires focus on that trigger and opens the tooltip. preventDefault on onOpenAutoFocus, or place a non-tooltip element first.',
        'Using Popover where a Tooltip belongs (hover hints) or where a Dialog belongs (must-act-now modals).',
        'Forgetting role expectations — do not override role="dialog" with a menu role; use DropdownMenu for menus.',
      ],
    },
    correctExample: [
      '<Popover.Root>',
      '  <Popover.Trigger asChild><button>Filters</button></Popover.Trigger>',
      '  <Popover.Portal>',
      '    <Popover.Content sideOffset={6}>',
      '      {/* interactive controls */}',
      '      <Popover.Close>Done</Popover.Close>',
      '      <Popover.Arrow />',
      '    </Popover.Content>',
      '  </Popover.Portal>',
      '</Popover.Root>',
    ].join('\n'),
    source: SOURCE,
  },

  Select: {
    name: 'Select',
    description:
      'A control for choosing one value from a list, with full keyboard and typeahead support. Prefer a native <select> for simple cases; use this when you need custom styling/markup.',
    import: "import { Select } from 'radix-ui';",
    parts: [
      'Root',
      'Trigger',
      'Value',
      'Icon',
      'Portal',
      'Content',
      'Viewport',
      'Item',
      'ItemText',
      'ItemIndicator',
      'Group',
      'Label',
      'Separator',
      'ScrollUpButton',
      'ScrollDownButton',
    ],
    props: {
      Root: [
        { name: 'value', type: 'string', description: 'Controlled value.' },
        { name: 'defaultValue', type: 'string' },
        { name: 'onValueChange', type: '(value: string) => void' },
        { name: 'open', type: 'boolean' },
        { name: 'onOpenChange', type: '(open: boolean) => void' },
        { name: 'dir', type: '"ltr" | "rtl"' },
        { name: 'name', type: 'string', description: 'Form field name; renders a hidden native select for form submission.' },
        { name: 'disabled', type: 'boolean' },
        { name: 'required', type: 'boolean' },
      ],
      Item: [
        { name: 'value', type: 'string', required: true, description: 'Must be a non-empty unique string.' },
        { name: 'disabled', type: 'boolean' },
        { name: 'textValue', type: 'string', description: 'Override the text used for typeahead matching.' },
      ],
    },
    a11yContract: {
      roles: 'Trigger is a combobox/button; Content acts as a listbox; each Item is an option with aria-selected. ItemText provides the option label.',
      keyboard: [
        'Space / Enter / ArrowUp / ArrowDown on Trigger: opens the list.',
        'ArrowUp / ArrowDown: move between items; Home / End jump to first/last.',
        'Typeahead: typing focuses the matching item (uses textValue when provided).',
        'Enter: selects the focused item. Escape: closes without changing the value.',
      ],
      focus: 'On open, focus moves to the selected item (or first item). On close, focus returns to the Trigger.',
      requires: [
        'Every Select.Item needs a unique, non-empty value.',
        'Each Item must contain a Select.ItemText for its accessible label.',
        'The Trigger needs an accessible name — wrap in a label or add aria-label.',
      ],
      commonMistakes: [
        'Using an empty-string Item value to represent "no selection" — not allowed; model the cleared state via the Root value instead.',
        'Omitting Select.ItemText — leaves options without a reliable label.',
        'Styling the Trigger as a div without an accessible name.',
      ],
    },
    correctExample: [
      '<Select.Root>',
      '  <Select.Trigger aria-label="Fruit">',
      '    <Select.Value placeholder="Pick a fruit" />',
      '    <Select.Icon />',
      '  </Select.Trigger>',
      '  <Select.Portal>',
      '    <Select.Content>',
      '      <Select.Viewport>',
      '        <Select.Item value="apple"><Select.ItemText>Apple</Select.ItemText></Select.Item>',
      '        <Select.Item value="banana"><Select.ItemText>Banana</Select.ItemText></Select.Item>',
      '      </Select.Viewport>',
      '    </Select.Content>',
      '  </Select.Portal>',
      '</Select.Root>',
    ].join('\n'),
    source: SOURCE,
  },

  DropdownMenu: {
    name: 'DropdownMenu',
    description:
      'A menu of actions or commands triggered by a button. Use for commands — not for selecting a form value (use Select) or for arbitrary interactive content (use Popover).',
    import: "import { DropdownMenu } from 'radix-ui';",
    parts: [
      'Root',
      'Trigger',
      'Portal',
      'Content',
      'Item',
      'Group',
      'Label',
      'CheckboxItem',
      'RadioGroup',
      'RadioItem',
      'ItemIndicator',
      'Separator',
      'Sub',
      'SubTrigger',
      'SubContent',
      'Arrow',
    ],
    props: {
      Root: [
        { name: 'open', type: 'boolean' },
        { name: 'defaultOpen', type: 'boolean' },
        { name: 'onOpenChange', type: '(open: boolean) => void' },
        { name: 'modal', type: 'boolean', default: 'true' },
        { name: 'dir', type: '"ltr" | "rtl"' },
      ],
      Item: [
        { name: 'disabled', type: 'boolean' },
        { name: 'onSelect', type: '(event: Event) => void', description: 'Call event.preventDefault() to keep the menu open.' },
        { name: 'textValue', type: 'string', description: 'Override typeahead text.' },
      ],
    },
    a11yContract: {
      roles: 'Trigger is a button with aria-haspopup="menu" and aria-expanded. Content is role="menu"; Items are role="menuitem" (or menuitemcheckbox / menuitemradio).',
      keyboard: [
        'Space / Enter / ArrowDown on Trigger: opens the menu and focuses the first item.',
        'ArrowUp / ArrowDown: move between items; Home / End jump to ends.',
        'ArrowRight / ArrowLeft: open / close submenus.',
        'Typeahead: type to focus a matching item. Escape: closes and returns focus to the Trigger.',
      ],
      focus: 'Focus moves into the menu on open and returns to the Trigger on close. Submenus manage their own roving focus.',
      requires: [
        'Use CheckboxItem / RadioItem (not Item) for toggle/selection semantics so the right role is applied.',
        'Provide an accessible name on the Trigger (text or aria-label).',
      ],
      commonMistakes: [
        'Using DropdownMenu to pick a form value — that is Select; menus are for commands.',
        'Putting arbitrary interactive form controls inside menu items — breaks menu keyboard semantics; use Popover.',
        'Forgetting event.preventDefault() in onSelect when an item should keep the menu open (e.g. a toggle).',
      ],
    },
    correctExample: [
      '<DropdownMenu.Root>',
      '  <DropdownMenu.Trigger aria-label="Actions">⋯</DropdownMenu.Trigger>',
      '  <DropdownMenu.Portal>',
      '    <DropdownMenu.Content>',
      '      <DropdownMenu.Item onSelect={() => edit()}>Edit</DropdownMenu.Item>',
      '      <DropdownMenu.Separator />',
      '      <DropdownMenu.Item onSelect={() => remove()}>Delete</DropdownMenu.Item>',
      '    </DropdownMenu.Content>',
      '  </DropdownMenu.Portal>',
      '</DropdownMenu.Root>',
    ].join('\n'),
    source: SOURCE,
  },

  AlertDialog: {
    name: 'AlertDialog',
    description:
      'A modal dialog that interrupts the user with an important confirmation and expects a response. Use for destructive or irreversible actions, not for general content (use Dialog).',
    import: "import { AlertDialog } from 'radix-ui';",
    parts: ['Root', 'Trigger', 'Portal', 'Overlay', 'Content', 'Title', 'Description', 'Cancel', 'Action'],
    props: {
      Root: [
        { name: 'open', type: 'boolean' },
        { name: 'defaultOpen', type: 'boolean' },
        { name: 'onOpenChange', type: '(open: boolean) => void' },
      ],
    },
    a11yContract: {
      roles: 'Content renders role="alertdialog" with aria-labelledby (Title) and aria-describedby (Description).',
      keyboard: ['Escape: closes (equivalent to Cancel).', 'Tab / Shift+Tab: focus is trapped within the dialog.'],
      focus: 'On open, focus moves to AlertDialog.Cancel by default (the safe choice). On close, focus returns to the Trigger.',
      requires: [
        'Title and Description are required for an accessible alertdialog.',
        'Must include an AlertDialog.Cancel and an AlertDialog.Action.',
      ],
      commonMistakes: [
        'Using AlertDialog for non-critical content — use Dialog.',
        'Autofocusing the destructive Action instead of Cancel — keep the default (Cancel) so a stray Enter is safe.',
      ],
    },
    correctExample: [
      '<AlertDialog.Root>',
      '  <AlertDialog.Trigger asChild><button>Delete</button></AlertDialog.Trigger>',
      '  <AlertDialog.Portal>',
      '    <AlertDialog.Overlay />',
      '    <AlertDialog.Content>',
      '      <AlertDialog.Title>Delete this item?</AlertDialog.Title>',
      '      <AlertDialog.Description>This cannot be undone.</AlertDialog.Description>',
      '      <AlertDialog.Cancel asChild><button>Cancel</button></AlertDialog.Cancel>',
      '      <AlertDialog.Action asChild><button>Delete</button></AlertDialog.Action>',
      '    </AlertDialog.Content>',
      '  </AlertDialog.Portal>',
      '</AlertDialog.Root>',
    ].join('\n'),
    source: SOURCE,
  },

  Accordion: {
    name: 'Accordion',
    description: 'A vertically stacked set of headers that each reveal a section of content.',
    import: "import { Accordion } from 'radix-ui';",
    parts: ['Root', 'Item', 'Header', 'Trigger', 'Content'],
    props: {
      Root: [
        { name: 'type', type: '"single" | "multiple"', required: true, description: 'Whether one or many items can be open.' },
        { name: 'value', type: 'string | string[]', description: 'Controlled open item(s); string for single, array for multiple.' },
        { name: 'defaultValue', type: 'string | string[]' },
        { name: 'onValueChange', type: '(value: string | string[]) => void' },
        { name: 'collapsible', type: 'boolean', default: 'false', description: 'For type="single", allow closing the open item.' },
        { name: 'disabled', type: 'boolean' },
      ],
      Item: [{ name: 'value', type: 'string', required: true }, { name: 'disabled', type: 'boolean' }],
    },
    a11yContract: {
      roles: 'Each Trigger is a button inside a Header (rendered as a heading); Trigger has aria-expanded and aria-controls; Content has role="region" labelled by its trigger.',
      keyboard: [
        'Enter / Space: toggle the focused item.',
        'ArrowDown / ArrowUp: move focus between triggers; Home / End jump to ends.',
      ],
      focus: 'Roving focus across triggers. Content is not focus-trapped.',
      requires: [
        'Always wrap the Trigger in Accordion.Header so a heading is emitted — set the heading level via the Header.',
        'Provide a unique value per Item.',
      ],
      commonMistakes: [
        'Omitting Accordion.Header — loses the heading semantics screen readers rely on.',
        'Using type="single" without collapsible when users should be able to close the open panel.',
      ],
    },
    correctExample: [
      '<Accordion.Root type="single" collapsible>',
      '  <Accordion.Item value="a">',
      '    <Accordion.Header><Accordion.Trigger>Section A</Accordion.Trigger></Accordion.Header>',
      '    <Accordion.Content>Content A</Accordion.Content>',
      '  </Accordion.Item>',
      '</Accordion.Root>',
    ].join('\n'),
    source: SOURCE,
  },

  Tabs: {
    name: 'Tabs',
    description: 'A set of layered sections of content (tab panels) shown one at a time.',
    import: "import { Tabs } from 'radix-ui';",
    parts: ['Root', 'List', 'Trigger', 'Content'],
    props: {
      Root: [
        { name: 'value', type: 'string', description: 'Controlled active tab.' },
        { name: 'defaultValue', type: 'string' },
        { name: 'onValueChange', type: '(value: string) => void' },
        { name: 'orientation', type: '"horizontal" | "vertical"', default: '"horizontal"' },
        { name: 'activationMode', type: '"automatic" | "manual"', default: '"automatic"' },
      ],
      Trigger: [{ name: 'value', type: 'string', required: true }, { name: 'disabled', type: 'boolean' }],
      Content: [{ name: 'value', type: 'string', required: true }],
    },
    a11yContract: {
      roles: 'List is role="tablist", each Trigger is role="tab" with aria-selected, each Content is role="tabpanel" labelled by its trigger.',
      keyboard: [
        'ArrowLeft / ArrowRight (or Up/Down when vertical): move between tabs.',
        'Home / End: first / last tab.',
        'With activationMode="manual", Enter/Space activates the focused tab.',
      ],
      focus: 'Roving focus across tabs; the active tabpanel is focusable as a group.',
      requires: ['Trigger.value must match its Content.value.'],
      commonMistakes: [
        'Using automatic activation for tabs whose panels are expensive to mount — prefer activationMode="manual".',
        'Building tabs out of buttons + conditional rendering instead of the primitive, losing tablist/tab/tabpanel semantics.',
      ],
    },
    correctExample: [
      '<Tabs.Root defaultValue="overview">',
      '  <Tabs.List>',
      '    <Tabs.Trigger value="overview">Overview</Tabs.Trigger>',
      '    <Tabs.Trigger value="settings">Settings</Tabs.Trigger>',
      '  </Tabs.List>',
      '  <Tabs.Content value="overview">…</Tabs.Content>',
      '  <Tabs.Content value="settings">…</Tabs.Content>',
      '</Tabs.Root>',
    ].join('\n'),
    source: SOURCE,
  },

  Checkbox: {
    name: 'Checkbox',
    description: 'A control that toggles between checked, unchecked, and (optionally) indeterminate.',
    import: "import { Checkbox } from 'radix-ui';",
    parts: ['Root', 'Indicator'],
    props: {
      Root: [
        { name: 'checked', type: 'boolean | "indeterminate"', description: 'Controlled state.' },
        { name: 'defaultChecked', type: 'boolean | "indeterminate"' },
        { name: 'onCheckedChange', type: '(checked: boolean | "indeterminate") => void' },
        { name: 'disabled', type: 'boolean' },
        { name: 'required', type: 'boolean' },
        { name: 'name', type: 'string', description: 'Form field name; renders a hidden native checkbox.' },
        { name: 'value', type: 'string', default: '"on"' },
      ],
    },
    a11yContract: {
      roles: 'Root renders role="checkbox" with aria-checked (true/false/mixed). Indicator only renders when checked/indeterminate.',
      keyboard: ['Space: toggles the checkbox.'],
      focus: 'The Root is the focusable element.',
      requires: ['Associate a label — wrap with a <label> or use htmlFor + id; the Root is not a native input.'],
      commonMistakes: [
        'Forgetting an associated label, leaving the checkbox unnamed.',
        'Representing indeterminate with a separate visual hack instead of checked="indeterminate".',
      ],
    },
    correctExample: [
      '<label>',
      '  <Checkbox.Root defaultChecked><Checkbox.Indicator>✓</Checkbox.Indicator></Checkbox.Root>',
      '  Accept terms',
      '</label>',
    ].join('\n'),
    source: SOURCE,
  },

  RadioGroup: {
    name: 'RadioGroup',
    description: 'A set of checkable buttons where no more than one can be checked at a time.',
    import: "import { RadioGroup } from 'radix-ui';",
    parts: ['Root', 'Item', 'Indicator'],
    props: {
      Root: [
        { name: 'value', type: 'string' },
        { name: 'defaultValue', type: 'string' },
        { name: 'onValueChange', type: '(value: string) => void' },
        { name: 'disabled', type: 'boolean' },
        { name: 'required', type: 'boolean' },
        { name: 'orientation', type: '"horizontal" | "vertical"' },
        { name: 'name', type: 'string' },
      ],
      Item: [{ name: 'value', type: 'string', required: true }, { name: 'disabled', type: 'boolean' }],
    },
    a11yContract: {
      roles: 'Root is role="radiogroup"; each Item is role="radio" with aria-checked.',
      keyboard: [
        'Arrow keys: move between and check items (roving).',
        'Tab: enters/leaves the group as a single stop, landing on the checked item.',
      ],
      focus: 'Single tab stop; arrow keys move + select within the group.',
      requires: ['Give the group an accessible name (aria-label or aria-labelledby).', 'Each Item needs a unique value.'],
      commonMistakes: [
        'Leaving the radiogroup unnamed.',
        'Using RadioGroup where multiple selections are allowed — use checkboxes instead.',
      ],
    },
    correctExample: [
      '<RadioGroup.Root defaultValue="card" aria-label="Payment">',
      '  <label><RadioGroup.Item value="card"><RadioGroup.Indicator /></RadioGroup.Item> Card</label>',
      '  <label><RadioGroup.Item value="paypal"><RadioGroup.Indicator /></RadioGroup.Item> PayPal</label>',
      '</RadioGroup.Root>',
    ].join('\n'),
    source: SOURCE,
  },

  Switch: {
    name: 'Switch',
    description: 'A control that toggles an on/off state — like a physical switch.',
    import: "import { Switch } from 'radix-ui';",
    parts: ['Root', 'Thumb'],
    props: {
      Root: [
        { name: 'checked', type: 'boolean' },
        { name: 'defaultChecked', type: 'boolean' },
        { name: 'onCheckedChange', type: '(checked: boolean) => void' },
        { name: 'disabled', type: 'boolean' },
        { name: 'required', type: 'boolean' },
        { name: 'name', type: 'string' },
      ],
    },
    a11yContract: {
      roles: 'Root renders role="switch" with aria-checked.',
      keyboard: ['Space / Enter: toggles the switch.'],
      focus: 'The Root is the focusable element.',
      requires: ['Provide an accessible name via an associated label or aria-label.'],
      commonMistakes: [
        'Using a Switch where a Checkbox is expected (e.g. inside a form list of options) — switches imply immediate effect.',
        'Leaving the switch unlabeled.',
      ],
    },
    correctExample: [
      '<label>',
      '  <Switch.Root><Switch.Thumb /></Switch.Root>',
      '  Airplane mode',
      '</label>',
    ].join('\n'),
    source: SOURCE,
  },

  Toast: {
    name: 'Toast',
    description: 'A succinct, time-based message that appears and dismisses itself, announced politely to assistive tech.',
    import: "import { Toast } from 'radix-ui';",
    parts: ['Provider', 'Root', 'Title', 'Description', 'Action', 'Close', 'Viewport'],
    props: {
      Provider: [
        { name: 'duration', type: 'number', default: '5000', description: 'Default auto-dismiss time (ms).' },
        { name: 'swipeDirection', type: '"right" | "left" | "up" | "down"', default: '"right"' },
        { name: 'label', type: 'string', default: '"Notification"', description: 'Accessible label for the region.' },
      ],
      Root: [
        { name: 'open', type: 'boolean' },
        { name: 'onOpenChange', type: '(open: boolean) => void' },
        { name: 'duration', type: 'number', description: 'Override the provider duration.' },
        { name: 'type', type: '"foreground" | "background"', default: '"foreground"' },
      ],
    },
    a11yContract: {
      roles: 'Viewport is an aria-live region; each Root is role="status" (and the live announcement is governed by type). Pausing on hover/focus is built in.',
      keyboard: ['F8: focus the toast viewport.', 'Escape / focus + Tab: reach the Close and Action controls.'],
      focus: 'Toasts do not steal focus. Sensitive/interactive toasts should use type="foreground" so they are announced assertively.',
      requires: [
        'Toast.Provider must wrap the app and a single Toast.Viewport must be rendered.',
        'Provide a Title (and Description for detail).',
      ],
      commonMistakes: [
        'Putting essential, must-act content in a toast — it auto-dismisses; use a Dialog/AlertDialog.',
        'Rendering multiple Viewports or forgetting the Provider.',
      ],
    },
    correctExample: [
      '<Toast.Provider>',
      '  <Toast.Root open={open} onOpenChange={setOpen}>',
      '    <Toast.Title>Saved</Toast.Title>',
      '    <Toast.Description>Your changes are live.</Toast.Description>',
      '    <Toast.Close>Dismiss</Toast.Close>',
      '  </Toast.Root>',
      '  <Toast.Viewport />',
      '</Toast.Provider>',
    ].join('\n'),
    source: SOURCE,
  },

  HoverCard: {
    name: 'HoverCard',
    description: 'A rich preview shown when a link/element is hovered or focused. Sighted, pointer-first — supplementary, not essential.',
    import: "import { HoverCard } from 'radix-ui';",
    parts: ['Root', 'Trigger', 'Portal', 'Content', 'Arrow'],
    props: {
      Root: [
        { name: 'open', type: 'boolean' },
        { name: 'defaultOpen', type: 'boolean' },
        { name: 'onOpenChange', type: '(open: boolean) => void' },
        { name: 'openDelay', type: 'number', default: '700' },
        { name: 'closeDelay', type: 'number', default: '300' },
      ],
    },
    a11yContract: {
      roles: 'Content is a non-modal popup. The trigger is typically a link.',
      keyboard: ['Opens on focus; Escape closes. Content is reachable for sighted keyboard users but is not a substitute for inline info.'],
      focus: 'Opens on hover and on trigger focus; focus is not trapped.',
      requires: ['Trigger should be a genuinely interactive element (link/button).'],
      commonMistakes: [
        'Putting essential or interactive-only-here content in a HoverCard — touch and some AT users may never see it.',
        'Using HoverCard where a Tooltip (short hint) or Popover (interactive) is the right tool.',
      ],
    },
    correctExample: [
      '<HoverCard.Root>',
      '  <HoverCard.Trigger asChild><a href="/u/rich">@rich</a></HoverCard.Trigger>',
      '  <HoverCard.Portal><HoverCard.Content>Profile preview…</HoverCard.Content></HoverCard.Portal>',
      '</HoverCard.Root>',
    ].join('\n'),
    source: SOURCE,
  },

  ContextMenu: {
    name: 'ContextMenu',
    description: 'A menu of actions triggered by right-click (or long-press) on an element.',
    import: "import { ContextMenu } from 'radix-ui';",
    parts: ['Root', 'Trigger', 'Portal', 'Content', 'Item', 'CheckboxItem', 'RadioGroup', 'RadioItem', 'ItemIndicator', 'Label', 'Separator', 'Sub', 'SubTrigger', 'SubContent', 'Group'],
    props: {
      Root: [{ name: 'onOpenChange', type: '(open: boolean) => void' }, { name: 'modal', type: 'boolean', default: 'true' }, { name: 'dir', type: '"ltr" | "rtl"' }],
      Item: [{ name: 'disabled', type: 'boolean' }, { name: 'onSelect', type: '(event: Event) => void' }, { name: 'textValue', type: 'string' }],
    },
    a11yContract: {
      roles: 'Content is role="menu"; Items are role="menuitem"/menuitemcheckbox/menuitemradio.',
      keyboard: [
        'Shift+F10 / the Menu key: open the context menu via keyboard.',
        'Arrow keys move; Right/Left open/close submenus; Escape closes; typeahead supported.',
      ],
      focus: 'Focus moves into the menu on open and returns to the trigger area on close.',
      requires: ['Ensure the action is also reachable without right-click (keyboard/another affordance) — context menus are not discoverable on their own.'],
      commonMistakes: [
        'Making an action available ONLY via context menu — not keyboard/touch accessible.',
        'Using Item for toggles instead of CheckboxItem/RadioItem.',
      ],
    },
    correctExample: [
      '<ContextMenu.Root>',
      '  <ContextMenu.Trigger>Right-click me</ContextMenu.Trigger>',
      '  <ContextMenu.Portal>',
      '    <ContextMenu.Content>',
      '      <ContextMenu.Item onSelect={copy}>Copy</ContextMenu.Item>',
      '    </ContextMenu.Content>',
      '  </ContextMenu.Portal>',
      '</ContextMenu.Root>',
    ].join('\n'),
    source: SOURCE,
  },

  Menubar: {
    name: 'Menubar',
    description: 'A horizontal bar of menus, like a desktop application menu bar (File, Edit, View…).',
    import: "import { Menubar } from 'radix-ui';",
    parts: ['Root', 'Menu', 'Trigger', 'Portal', 'Content', 'Item', 'Separator', 'Sub', 'SubTrigger', 'SubContent', 'CheckboxItem', 'RadioGroup', 'RadioItem', 'ItemIndicator', 'Label', 'Group'],
    props: {
      Root: [{ name: 'value', type: 'string' }, { name: 'onValueChange', type: '(value: string) => void' }, { name: 'dir', type: '"ltr" | "rtl"' }, { name: 'loop', type: 'boolean', default: 'true' }],
    },
    a11yContract: {
      roles: 'Root is role="menubar"; each Menu.Trigger is a menuitem that opens a role="menu".',
      keyboard: [
        'ArrowLeft / ArrowRight: move between top-level menus.',
        'ArrowDown / Enter / Space: open the focused menu; Arrow keys navigate items; Escape closes.',
      ],
      focus: 'Roving focus across the bar; opening a menu moves focus into it.',
      requires: ['Use for app-style command menus, not for site navigation (use NavigationMenu).'],
      commonMistakes: ['Using Menubar for website nav links — that is NavigationMenu.'],
    },
    correctExample: [
      '<Menubar.Root>',
      '  <Menubar.Menu>',
      '    <Menubar.Trigger>File</Menubar.Trigger>',
      '    <Menubar.Portal><Menubar.Content>',
      '      <Menubar.Item onSelect={newFile}>New</Menubar.Item>',
      '    </Menubar.Content></Menubar.Portal>',
      '  </Menubar.Menu>',
      '</Menubar.Root>',
    ].join('\n'),
    source: SOURCE,
  },

  NavigationMenu: {
    name: 'NavigationMenu',
    description: 'A collection of links and disclosure menus for navigating a site, with full keyboard support.',
    import: "import { NavigationMenu } from 'radix-ui';",
    parts: ['Root', 'List', 'Item', 'Trigger', 'Content', 'Link', 'Indicator', 'Viewport', 'Sub'],
    props: {
      Root: [
        { name: 'value', type: 'string' },
        { name: 'defaultValue', type: 'string' },
        { name: 'onValueChange', type: '(value: string) => void' },
        { name: 'delayDuration', type: 'number', default: '200' },
        { name: 'orientation', type: '"horizontal" | "vertical"', default: '"horizontal"' },
      ],
    },
    a11yContract: {
      roles: 'Rendered within a <nav>; uses a list of items. Triggers expose aria-expanded; the active link should set aria-current.',
      keyboard: [
        'Tab moves through triggers/links; Enter/Space opens a disclosure.',
        'Arrow keys move within an open content panel; Escape closes it.',
      ],
      focus: 'Focus is not trapped — this is navigation, not a modal menu.',
      requires: ['Use NavigationMenu.Link (not a raw <a>) for items so active state and keyboard handling are wired.', 'Mark the current page with aria-current on its Link.'],
      commonMistakes: [
        'Using DropdownMenu/Menubar (role="menu") for site nav — assistive tech announces it as an application menu, not navigation.',
        'Forgetting aria-current on the active link.',
      ],
    },
    correctExample: [
      '<NavigationMenu.Root>',
      '  <NavigationMenu.List>',
      '    <NavigationMenu.Item>',
      '      <NavigationMenu.Trigger>Products</NavigationMenu.Trigger>',
      '      <NavigationMenu.Content>',
      '        <NavigationMenu.Link href="/a">Product A</NavigationMenu.Link>',
      '      </NavigationMenu.Content>',
      '    </NavigationMenu.Item>',
      '  </NavigationMenu.List>',
      '  <NavigationMenu.Viewport />',
      '</NavigationMenu.Root>',
    ].join('\n'),
    source: SOURCE,
  },

  Slider: {
    name: 'Slider',
    description: 'An input for selecting a value (or range) from within a given range by dragging a thumb.',
    import: "import { Slider } from 'radix-ui';",
    parts: ['Root', 'Track', 'Range', 'Thumb'],
    props: {
      Root: [
        { name: 'value', type: 'number[]', description: 'Controlled value(s); one entry per thumb.' },
        { name: 'defaultValue', type: 'number[]' },
        { name: 'onValueChange', type: '(value: number[]) => void' },
        { name: 'onValueCommit', type: '(value: number[]) => void' },
        { name: 'min', type: 'number', default: '0' },
        { name: 'max', type: 'number', default: '100' },
        { name: 'step', type: 'number', default: '1' },
        { name: 'orientation', type: '"horizontal" | "vertical"', default: '"horizontal"' },
        { name: 'disabled', type: 'boolean' },
      ],
    },
    a11yContract: {
      roles: 'Each Thumb is role="slider" with aria-valuemin/max/now.',
      keyboard: [
        'Arrow keys: step the value; PageUp/PageDown: larger steps; Home/End: min/max.',
      ],
      focus: 'Each thumb is individually focusable; render one Slider.Thumb per value entry.',
      requires: [
        'Give each thumb an accessible name via aria-label (e.g. "Minimum", "Maximum") for range sliders.',
        'Render exactly as many Thumbs as entries in value/defaultValue.',
      ],
      commonMistakes: [
        'Range slider with a single Thumb (or mismatched thumb count vs values).',
        'Unlabeled thumbs on a range slider.',
      ],
    },
    correctExample: [
      '<Slider.Root defaultValue={[40]} max={100} step={1}>',
      '  <Slider.Track><Slider.Range /></Slider.Track>',
      '  <Slider.Thumb aria-label="Volume" />',
      '</Slider.Root>',
    ].join('\n'),
    source: SOURCE,
  },

  Toggle: {
    name: 'Toggle',
    description: 'A two-state button that can be on or off.',
    import: "import { Toggle } from 'radix-ui';",
    parts: ['Root'],
    props: {
      Root: [
        { name: 'pressed', type: 'boolean' },
        { name: 'defaultPressed', type: 'boolean' },
        { name: 'onPressedChange', type: '(pressed: boolean) => void' },
        { name: 'disabled', type: 'boolean' },
      ],
    },
    a11yContract: {
      roles: 'Renders a button with aria-pressed.',
      keyboard: ['Enter / Space: toggles pressed state.'],
      focus: 'Standard button focus.',
      requires: ['Provide an accessible name (text content or aria-label for icon-only toggles).'],
      commonMistakes: ['Icon-only toggle with no aria-label.', 'Using Toggle where a Switch (on/off setting) or Checkbox (form value) is more appropriate.'],
    },
    correctExample: '<Toggle.Root aria-label="Bold"><b>B</b></Toggle.Root>',
    source: SOURCE,
  },

  ToggleGroup: {
    name: 'ToggleGroup',
    description: 'A set of two-state buttons that can be toggled on or off, single- or multiple-select.',
    import: "import { ToggleGroup } from 'radix-ui';",
    parts: ['Root', 'Item'],
    props: {
      Root: [
        { name: 'type', type: '"single" | "multiple"', required: true },
        { name: 'value', type: 'string | string[]' },
        { name: 'defaultValue', type: 'string | string[]' },
        { name: 'onValueChange', type: '(value: string | string[]) => void' },
        { name: 'disabled', type: 'boolean' },
        { name: 'orientation', type: '"horizontal" | "vertical"' },
        { name: 'rovingFocus', type: 'boolean', default: 'true' },
      ],
      Item: [{ name: 'value', type: 'string', required: true }, { name: 'disabled', type: 'boolean' }],
    },
    a11yContract: {
      roles: 'For type="single" the group behaves like a radiogroup; items expose aria-pressed/selected as appropriate.',
      keyboard: ['Arrow keys move between items (roving focus); Enter/Space toggles.'],
      focus: 'Single tab stop with roving focus across items.',
      requires: ['Give the group an accessible name (aria-label).', 'Unique value per Item.'],
      commonMistakes: ['Unlabeled group.', 'Using type="multiple" when only one choice should be active.'],
    },
    correctExample: [
      '<ToggleGroup.Root type="single" defaultValue="left" aria-label="Align">',
      '  <ToggleGroup.Item value="left">L</ToggleGroup.Item>',
      '  <ToggleGroup.Item value="center">C</ToggleGroup.Item>',
      '</ToggleGroup.Root>',
    ].join('\n'),
    source: SOURCE,
  },

  Collapsible: {
    name: 'Collapsible',
    description: 'An interactive component that expands/collapses a single panel of content.',
    import: "import { Collapsible } from 'radix-ui';",
    parts: ['Root', 'Trigger', 'Content'],
    props: {
      Root: [
        { name: 'open', type: 'boolean' },
        { name: 'defaultOpen', type: 'boolean' },
        { name: 'onOpenChange', type: '(open: boolean) => void' },
        { name: 'disabled', type: 'boolean' },
      ],
    },
    a11yContract: {
      roles: 'Trigger is a button with aria-expanded and aria-controls pointing at the Content.',
      keyboard: ['Enter / Space: toggles the panel.'],
      focus: 'Standard button focus; content is not trapped.',
      requires: ['Trigger needs an accessible name.'],
      commonMistakes: ['Reaching for Collapsible when multiple coordinated sections are needed — use Accordion.'],
    },
    correctExample: [
      '<Collapsible.Root>',
      '  <Collapsible.Trigger>Toggle details</Collapsible.Trigger>',
      '  <Collapsible.Content>Details…</Collapsible.Content>',
      '</Collapsible.Root>',
    ].join('\n'),
    source: SOURCE,
  },

  Avatar: {
    name: 'Avatar',
    description: "An image element with a graceful text fallback for representing a user.",
    import: "import { Avatar } from 'radix-ui';",
    parts: ['Root', 'Image', 'Fallback'],
    props: {
      Image: [{ name: 'onLoadingStatusChange', type: '(status: "idle" | "loading" | "loaded" | "error") => void' }],
      Fallback: [{ name: 'delayMs', type: 'number', description: 'Delay before showing the fallback, to avoid a flash.' }],
    },
    a11yContract: {
      roles: 'Decorative wrapper. The Image needs meaningful alt text (or empty alt if purely decorative). Fallback shows when the image fails or is loading.',
      keyboard: ['None — not interactive.'],
      focus: 'Not focusable.',
      requires: ['Provide alt on Avatar.Image. Fallback text (initials) is visual only — the alt carries the name.'],
      commonMistakes: ['Relying on initials in Fallback as the accessible name — set alt on the Image.'],
    },
    correctExample: [
      '<Avatar.Root>',
      '  <Avatar.Image src="/rich.jpg" alt="Rich Tillman" />',
      '  <Avatar.Fallback delayMs={300}>RT</Avatar.Fallback>',
      '</Avatar.Root>',
    ].join('\n'),
    source: SOURCE,
  },

  Progress: {
    name: 'Progress',
    description: 'Displays an indicator showing the completion progress of a task.',
    import: "import { Progress } from 'radix-ui';",
    parts: ['Root', 'Indicator'],
    props: {
      Root: [
        { name: 'value', type: 'number | null', description: 'Current value; null = indeterminate.' },
        { name: 'max', type: 'number', default: '100' },
        { name: 'getValueLabel', type: '(value: number, max: number) => string', description: 'Human-readable value text for AT.' },
      ],
    },
    a11yContract: {
      roles: 'Root renders role="progressbar" with aria-valuemin/max/now (omitted when indeterminate).',
      keyboard: ['None — not interactive.'],
      focus: 'Not focusable.',
      requires: ['Provide an accessible name (aria-label) and, for non-percentage scales, getValueLabel.'],
      commonMistakes: ['Unlabeled progressbar.', 'Setting value during an indeterminate state (use null).'],
    },
    correctExample: [
      '<Progress.Root value={66} aria-label="Upload">',
      '  <Progress.Indicator style={{ transform: `translateX(-${100 - 66}%)` }} />',
      '</Progress.Root>',
    ].join('\n'),
    source: SOURCE,
  },

  Label: {
    name: 'Label',
    description: 'An accessible label associated with a control.',
    import: "import { Label } from 'radix-ui';",
    parts: ['Root'],
    props: {
      Root: [{ name: 'htmlFor', type: 'string', description: 'id of the control this labels.' }],
    },
    a11yContract: {
      roles: 'Renders a <label>; prevents text selection on double-click and forwards clicks to the control.',
      keyboard: ['None.'],
      focus: 'Clicking the label focuses/activates the associated control.',
      requires: ['Associate via htmlFor + the control id, or by wrapping the control.'],
      commonMistakes: ['Using Label without htmlFor and without wrapping a control — it then labels nothing.'],
    },
    correctExample: '<Label.Root htmlFor="email">Email</Label.Root>\n<input id="email" type="email" />',
    source: SOURCE,
  },

  Separator: {
    name: 'Separator',
    description: 'Visually or semantically separates content.',
    import: "import { Separator } from 'radix-ui';",
    parts: ['Root'],
    props: {
      Root: [
        { name: 'orientation', type: '"horizontal" | "vertical"', default: '"horizontal"' },
        { name: 'decorative', type: 'boolean', default: 'false', description: 'When true, removed from the a11y tree.' },
      ],
    },
    a11yContract: {
      roles: 'role="separator" with aria-orientation when semantic; when decorative, it is hidden from AT (role="none").',
      keyboard: ['None.'],
      focus: 'Not focusable.',
      requires: ['Set decorative when the line is purely visual, so screen readers do not announce a meaningless separator.'],
      commonMistakes: ['Leaving purely visual dividers as semantic separators (noise for AT).'],
    },
    correctExample: '<Separator.Root decorative orientation="horizontal" />',
    source: SOURCE,
  },

  AspectRatio: {
    name: 'AspectRatio',
    description: 'Constrains content to a desired width/height ratio.',
    import: "import { AspectRatio } from 'radix-ui';",
    parts: ['Root'],
    props: {
      Root: [{ name: 'ratio', type: 'number', default: '1', description: 'Width / height, e.g. 16 / 9.' }],
    },
    a11yContract: {
      roles: 'Purely a layout wrapper; no role of its own.',
      keyboard: ['None.'],
      focus: 'Not focusable.',
      requires: ['Accessibility comes from the wrapped content (e.g. alt text on an image).'],
      commonMistakes: ['Assuming AspectRatio adds semantics — it is layout only.'],
    },
    correctExample: '<AspectRatio.Root ratio={16 / 9}><img src="/cover.jpg" alt="Cover" /></AspectRatio.Root>',
    source: SOURCE,
  },

  ScrollArea: {
    name: 'ScrollArea',
    description: 'Augments native scroll with custom, cross-browser styled scrollbars while preserving native scrolling behavior.',
    import: "import { ScrollArea } from 'radix-ui';",
    parts: ['Root', 'Viewport', 'Scrollbar', 'Thumb', 'Corner'],
    props: {
      Root: [
        { name: 'type', type: '"auto" | "always" | "scroll" | "hover"', default: '"hover"' },
        { name: 'scrollHideDelay', type: 'number', default: '600' },
        { name: 'dir', type: '"ltr" | "rtl"' },
      ],
    },
    a11yContract: {
      roles: 'Preserves native scroll semantics; the Viewport remains keyboard-scrollable. Custom scrollbars are supplementary.',
      keyboard: ['Native: Arrow keys / PageUp / PageDown scroll the viewport when focused.'],
      focus: 'Keep the scrollable Viewport reachable (tabindex) when content can overflow, so keyboard users can scroll.',
      requires: ['Do not disable native scrolling — ScrollArea styles it, it does not replace it.'],
      commonMistakes: ['Making a scroll region unreachable by keyboard.', 'Using ScrollArea to hide overflow that should be reachable.'],
    },
    correctExample: [
      '<ScrollArea.Root>',
      '  <ScrollArea.Viewport>{/* long content */}</ScrollArea.Viewport>',
      '  <ScrollArea.Scrollbar orientation="vertical"><ScrollArea.Thumb /></ScrollArea.Scrollbar>',
      '</ScrollArea.Root>',
    ].join('\n'),
    source: SOURCE,
  },
}

export const PRIMITIVE_NAMES = Object.keys(PRIMITIVES)

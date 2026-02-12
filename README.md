# SSH Terminal Website

An SSH-accessible personal website with a terminal UI. Users connect via `ssh yoursite.com` and interact with a TUI.

## Features

- **Loading screen**: Animated spinner on connection
- **About page**: Dotted British Isles map + bio text with typewriter animation
- **Links page**: Transparent single-panel list with selectable links
- **Navigation**: `Tab` to switch pages
- **Quit**: 'q' key disconnects
- **Animated text**: Scrolling character in top-right
- **Blinking cursor**: Orange cursor on bio text

## Quick Start

```bash
# Install dependencies
bun install

# Generate SSH host key (first time only)
bun run generate-key

# Start the server
bun run start

# Connect to it
ssh -p 2222 localhost
```

## Configuration

Environment variables:

- `PORT` - Server port (default: 2222)

## Development

```bash
# Run with auto-reload
bun run dev

# Type check
bun run typecheck

# Lint and format
bun run lint:fix

# Run tests
bun test
```

## Customization

Edit content in `src/content/`:

- `bio.ts` - Your bio text
- `links.ts` - Your links (Website, Twitter, LinkedIn, GitHub)
- `ascii-maps.ts` - ASCII art map

## Keyboard Shortcuts

| Key               | Action                        |
| ----------------- | ----------------------------- |
| `Tab`             | Navigate between pages        |
| `↑` / `↓`         | Select links on Links page    |
| `Enter` / `Space` | Open selected link in browser |
| `q` / `Esc`       | Quit                          |

## Tech Stack

- **ssh2** - SSH server
- **blessed** - TUI framework
- **bun** - Runtime and package manager
- **TypeScript** - Strict mode

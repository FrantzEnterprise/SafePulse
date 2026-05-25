# Compatibility Notes

The React demo imports:
- `@/components/ui/card`
- `@/components/ui/button`

If your OpenClaw/Vite project does not have shadcn/ui installed, replace those imports with your local button/card components or create simple wrappers.

For a standalone Vite app, install and configure Tailwind + shadcn/ui, or adapt the UI components to plain HTML.

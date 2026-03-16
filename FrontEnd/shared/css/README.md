# Styles Architecture

## Structure

- `app.css`: import manifest (single entry consumed by `FrontEnd/style.css`).
- `polish.css`: isolated UI refinements and utility classes added during recent refactors.
- `base/`: shared styles used by multiple pages.
  - `tokens.css`: variables, reset, body background/noise.
  - `shell.css`: app chrome (sidebar, wrapper, topbar, overlay).
  - `shared.css`: reusable components (buttons, modal/form, feedback, toast, shared dashboard primitives).
- Page styles are now co-located under `FrontEnd/pages/<page>/<page>.css`.

## Why This Layout

- Keeps one stable entrypoint for the app (`style.css` -> `shared/css/app.css`).
- Splits maintenance by domain/page, reducing merge conflicts and file size per edit.
- Co-locates html/js/css by page for faster navigation in the editor.
- Preserves runtime behavior while allowing page and shared assets to evolve independently.

## Next Step (Optional)

Current structure already follows feature folders (`pages/<page>/{html,js,css}`).

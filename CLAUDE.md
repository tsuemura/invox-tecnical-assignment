## development

- USE `pnpm` as a package manager. Don't use `npm`.
- Use `pnpx` to run a command.

## test

- Test files are usually located in the same folder with the implementation.

Example:
- src/ai-client.ts
- src/ai-client.spec.ts

- Test should have a name that illustrates the target's behavior.
  - Good: When AI client gives a valid image URL, then the API returns a successful analysis result.
  - Bad: Test for a successful image URL



# Downstream branch `downstream/v2026.1012`

This branch is the `v2026.1012.0` release plus a small set of fixes for one self-hosted instance.
Each fix is an upstream fix, a fix proposed upstream, or a packaging fix for git-ref installs.

| Change | Upstream |
|---|---|
| Restore wheel and touch scrolling in task selectors | Backport of #15374 |
| Sync `pnpm-lock.yaml` with `server/package.json` (`light-my-request`) | Not needed on master |
| Git-ref installs write the root pnpm overrides as npm overrides in the payload, so the Claude ACP bridge gets `@anthropic-ai/claude-agent-sdk` 0.3.286 | Refs #13889. Master fixes it with #15912 |
| Hide the adapter execution timeout notice in nice transcripts | Proposed upstream (refs #716, #11262) |
| `build-npm.sh` stages `server/ui-dist` and the skills for git-ref installs | Refs #17063, #13928 |
| Staged bundled manifests drop `prepack`, `postpack`, and `prepare`, because git-ref installs run `npm pack` on them without `--ignore-scripts` | Not reported upstream yet |
| Staged bundled manifests pin each workspace dependency to its own version (`@paperclipai/plugin-sdk` is 1.0.0, not the server version) | Not reported upstream yet |

## Install

The first install runs the published installer, which does not apply the override fix.
Install a second, later commit with the managed CLI to apply it:

```sh
npx --registry https://registry.npmjs.org paperclipai@2026.1012.0 install --repo DragonNameLeo/paperclip --ref <sha> --yes
~/.local/bin/paperclipai install --repo DragonNameLeo/paperclip --ref <later-sha> --yes
```

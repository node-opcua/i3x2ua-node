import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

describe('release configuration', () => {
  it('only fixed-versions publishable packages', () => {
    const changesetConfig = readJson<{
      fixed: string[][];
      ignore: string[];
    }>('.changeset/config.json');

    expect(changesetConfig.fixed).toEqual([
      [
        '@node-i3x/core',
        '@node-i3x/opcua-connector',
        '@node-i3x/pseudo-session-connector',
        '@node-i3x/rest-server',
      ],
    ]);
    expect(changesetConfig.ignore).toEqual(['@node-i3x/app', '@node-i3x/demo-embedded']);
  });

  it('marks non-publishable workspaces as private', () => {
    const appPackage = readJson<{ private?: boolean }>('packages/app/package.json');
    const demoPackage = readJson<{ private?: boolean }>(
      'packages/demo-embedded/package.json',
    );

    expect(appPackage.private).toBe(true);
    expect(demoPackage.private).toBe(true);
  });
});

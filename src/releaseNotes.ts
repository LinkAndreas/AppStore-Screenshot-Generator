import changelog from '../CHANGELOG.md?raw';

export interface Release {
  version: string;
  date: string;
  summary?: string;
  notes: string[];
}

/** Releases from CHANGELOG.md, newest first. "Unreleased" changes are not shown in the app. */
export const RELEASES: Release[] = changelog
  .split(/^## /m)
  .slice(1)
  .map(section => {
    const [heading, ...lines] = section.trim().split('\n');
    const match = heading.match(/^\[(.+?)\](?: - (\d{4}-\d{2}-\d{2}))?/);
    const notes = lines.filter(l => l.startsWith('- ')).map(l => l.slice(2).trim());
    const summary = lines.find(l => l.trim() && !l.startsWith('- '))?.trim();
    return { version: match?.[1] ?? '', date: match?.[2] ?? '', summary, notes };
  })
  .filter(r => r.version && r.version !== 'Unreleased');

export const CURRENT_VERSION = RELEASES[0]?.version ?? '';

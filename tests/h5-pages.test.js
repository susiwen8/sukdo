import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const desktopIndexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const desktopSolverHtml = readFileSync(new URL('../solver.html', import.meta.url), 'utf8');

test('h5/index.html exists and exposes the mobile game anchors', () => {
  const pagePath = new URL('../h5/index.html', import.meta.url);

  assert.equal(existsSync(pagePath), true);

  const html = readFileSync(pagePath, 'utf8');

  assert.match(html, /id="h5-game-board"/);
  assert.match(html, /id="h5-game-keypad"/);
  assert.match(html, /id="h5-difficulty-buttons"/);
  assert.match(html, /id="h5-game-message"/);
  assert.match(html, /id="h5-new-game-dialog"/);
  assert.match(html, /src="\.\.\/src\/h5\/game-page\.js"/);
});

test('h5/solver.html exists and exposes the solver anchors', () => {
  const pagePath = new URL('../h5/solver.html', import.meta.url);

  assert.equal(existsSync(pagePath), true);

  const html = readFileSync(pagePath, 'utf8');

  assert.match(html, /id="h5-solver-board"/);
  assert.match(html, /id="h5-solver-input"/);
  assert.match(html, /id="h5-solver-import"/);
  assert.match(html, /id="h5-solver-solve"/);
  assert.match(html, /id="h5-solver-steps"/);
  assert.match(html, /id="h5-solver-message"/);
  assert.match(html, /src="\.\.\/src\/h5\/solver-page\.js"/);
});

test('existing desktop pages link to the H5 experience for discovery', () => {
  assert.match(desktopIndexHtml, /href="\.\/h5\/index\.html"/);
  assert.match(desktopSolverHtml, /href="\.\/h5\/solver\.html"/);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// Exercise the actual controller with browser event targets. Layout dimensions
// are explicit because these are event-contract tests, not rendering tests.
function setup() {
  const window = new EventTarget();
  window.innerHeight = 800;
  class Element extends EventTarget {
    parentElement = null;
    scrollTop = 0;
    scrollLeft = 0;
    scrollHeight = 0;
    clientHeight = 0;
    scrollWidth = 0;
    clientWidth = 0;
    style = { overflowY: 'visible', overflowX: 'visible' };
    interactive = false;
    closest() { return this.interactive ? this : this.parentElement?.closest() ?? null; }
  }
  let forward = 0;
  let backward = 0;
  let cleanup;
  let time = 1000;
  const exports = {};
  const context = {
    exports, window, Element, HTMLElement: Element,
    getComputedStyle: element => element.style,
    performance: { now: () => time },
    require: name => name === 'react' ? {
      useRef: initial => ({ current: initial }),
      useEffect: effect => { cleanup = effect(); },
    } : { usePortfolio: () => ({
      nextSection: () => forward++, prevSection: () => backward++,
      inspectingProject: null, isTransitioning: false,
    }) },
  };
  const source = readFileSync(new URL('../src/components/scene/ScrollController.tsx', import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  vm.runInNewContext(outputText, context);
  exports.ScrollController();
  function emit(type, target, properties = {}) {
    const event = new Event(type, { cancelable: true });
    Object.defineProperty(event, 'target', { value: target });
    Object.assign(event, properties);
    window.dispatchEvent(event);
    return event;
  }
  const wheel = (target, properties = {}) => emit('wheel', target, { deltaY: 100, deltaX: 0, deltaMode: 0, ...properties });
  return { Element, emit, wheel, cleanup: () => cleanup(), counts: () => [forward, backward], advance: () => { time += 250; } };
}

test('nested panel scroll is native and only a fresh gesture at its edge changes sections', () => {
  const s = setup(); const outer = new s.Element(); const inner = new s.Element();
  inner.parentElement = outer;
  outer.style.overflowY = 'auto'; outer.scrollHeight = 1000; outer.clientHeight = 100;
  assert.equal(s.wheel(inner).defaultPrevented, false);
  outer.scrollTop = 900;
  s.wheel(inner);
  assert.deepEqual(s.counts(), [0, 0]);
  s.advance(); s.wheel(inner);
  assert.deepEqual(s.counts(), [1, 0]);
  s.cleanup();
});

test('a swipe beginning within scrollable content cannot navigate when native scroll reaches the edge', () => {
  const s = setup(); const panel = new s.Element();
  panel.style.overflowY = 'auto'; panel.scrollHeight = 1000; panel.clientHeight = 100;
  s.emit('touchstart', panel, { touches: [{ clientX: 100, clientY: 500 }] });
  panel.scrollTop = 900;
  s.emit('touchend', panel, { touches: [], changedTouches: [{ clientX: 100, clientY: 100 }] });
  assert.deepEqual(s.counts(), [0, 0]); s.cleanup();
});

test('zoom, horizontal wheel and subthreshold movement remain native', () => {
  const s = setup(); const target = new s.Element();
  for (const props of [{ ctrlKey: true }, { deltaX: 200 }, { deltaY: 5 }]) {
    assert.equal(s.wheel(target, props).defaultPrevented, false);
  }
  assert.deepEqual(s.counts(), [0, 0]); s.cleanup();
});

test('line-mode wheels navigate and momentum cannot advance twice', () => {
  const s = setup(); const target = new s.Element();
  s.wheel(target, { deltaMode: 1, deltaY: 2 }); s.wheel(target, { deltaMode: 1, deltaY: 2 });
  assert.deepEqual(s.counts(), [1, 0]); s.cleanup();
});

test('Space on controls stays native and Shift+Space on the stage moves backward', () => {
  const s = setup(); const control = new s.Element(); control.interactive = true;
  assert.equal(s.emit('keydown', control, { key: ' ' }).defaultPrevented, false);
  s.emit('keydown', new s.Element(), { key: ' ', shiftKey: true });
  assert.deepEqual(s.counts(), [0, 1]); s.cleanup();
});

test('cancelled touches and multi-touch gestures do not navigate', () => {
  const s = setup(); const target = new s.Element();
  s.emit('touchstart', target, { touches: [{ clientX: 100, clientY: 500 }] });
  s.emit('touchcancel', target);
  s.emit('touchend', target, { touches: [], changedTouches: [{ clientX: 100, clientY: 100 }] });
  s.emit('touchstart', target, { touches: [{}, {}] });
  s.emit('touchend', target, { touches: [], changedTouches: [{ clientX: 100, clientY: 100 }] });
  assert.deepEqual(s.counts(), [0, 0]); s.cleanup();
});

test('unmount removes global listeners', () => {
  const s = setup(); s.cleanup(); s.wheel(new s.Element());
  assert.deepEqual(s.counts(), [0, 0]);
});

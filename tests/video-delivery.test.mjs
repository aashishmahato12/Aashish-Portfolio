import test from 'node:test';
import assert from 'node:assert/strict';
import { loadVideoSource, webmVideoSource } from '../src/video-sources.js';

const original = 'https://res.cloudinary.com/ghmgpvvn/video/upload/v1791543451/hero.mp4';
class Player extends EventTarget {
  paused = false;
  muted = false;
  autoplay = false;
  loads = 0;
  plays = 0;
  constructor(supported) { super(); this.supported = supported; }
  canPlayType() { return this.supported ? 'probably' : ''; }
  load() { this.loads++; }
  play() { this.plays++; return Promise.resolve(); }
}

test('unsupported browsers keep the original MP4 and audio state', () => {
  const player = new Player(false);
  loadVideoSource(player, original);
  assert.equal(player.src, original);
  assert.equal(player.muted, false);
});

test('failed WebM delivery falls back once to the original and resumes playback', () => {
  const player = new Player(true);
  loadVideoSource(player, original);
  assert.equal(player.src, webmVideoSource(original));
  player.dispatchEvent(new Event('error'));
  assert.equal(player.src, original);
  assert.equal(player.loads, 1);
  assert.equal(player.plays, 1);
  assert.equal(player.muted, false);
  player.dispatchEvent(new Event('error'));
  assert.equal(player.loads, 1);
});

test('local and non-MP4 media are not rewritten', () => {
  assert.equal(webmVideoSource('/videos/example.mp4'), null);
  assert.equal(webmVideoSource(original.replace('.mp4', '.webm')), null);
  assert.equal(webmVideoSource(original.replace('v1791543451/hero', 'v1791546684/Manange')), null);
});

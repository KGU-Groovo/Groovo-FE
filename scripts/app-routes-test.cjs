const assert = require('node:assert/strict');
const { existsSync, readFileSync } = require('node:fs');

for (const route of ['app/(tabs)/index.tsx', 'app/(tabs)/basics.tsx', 'app/(tabs)/feed.tsx', 'app/(tabs)/profile.tsx', 'app/result.tsx']) {
  assert.equal(existsSync(route), true, `${route} route is missing`);
}
assert.equal(existsSync('app/preview.tsx'), false, 'preview must be a bottom sheet, not a route');
assert.equal(readFileSync('app/(tabs)/index.tsx', 'utf8').includes('animationType="slide"'), false, 'bottom sheet must not slide the backdrop');
assert.equal(readFileSync('components/live-feedback/VideoBackground.tsx', 'utf8').includes('p.loop = true'), false, 'feedback video must not loop');
assert.equal(readFileSync('components/live-feedback/VideoBackground.tsx', 'utf8').includes("player.addListener('playToEnd'"), true, 'feedback video must report playback end');
assert.equal(readFileSync('app/live-feedback/index.tsx', 'utf8').includes("router.replace('/result')"), true, 'feedback end must open the result screen');
assert.equal(readFileSync('components/live-feedback/MediaControls.tsx', 'utf8').includes('구간반복하기'), true, 'segment repeat control must remain available');
assert.equal(readFileSync('components/live-feedback/VideoBackground.tsx', 'utf8').includes('repeatStart'), true, 'player must support segment repeat');
assert.equal(readFileSync('app/(tabs)/basics.tsx', 'utf8').includes('setSelectedCategory'), true, 'basic category tabs must update the selected filter');
assert.equal(existsSync('data/songs.ts'), true, 'song mock data must be stored separately');
assert.equal(readFileSync('data/songs.ts', 'utf8').includes('albumCover'), true, 'song mock data must include album cover locations');
assert.equal(readFileSync('data/songs.ts', 'utf8').includes('videoSource'), true, 'song mock data must include mp4 locations');
assert.equal(readFileSync('app/(tabs)/feed.tsx', 'utf8').includes("from '../../data/songs'"), true, 'feed must use the shared song mock data');
assert.equal(readFileSync('app/(tabs)/_layout.tsx', 'utf8').includes('NativeTabs'), true, 'tab bar must use the native glass surface');
assert.equal(existsSync('hooks/use-ai-feedback-socket.ts'), true, 'AI feedback WebSocket hook must exist');
assert.equal(readFileSync('hooks/use-ai-feedback-socket.ts', 'utf8').includes('new WebSocket'), true, 'AI feedback hook must create a WebSocket connection');
assert.equal(readFileSync('app/(tabs)/profile.tsx', 'utf8').includes('setSelectedSection'), true, 'profile must switch between content sections');
assert.equal(readFileSync('app/(tabs)/profile.tsx', 'utf8').includes('featuredVideo'), true, 'profile must feature the latest dance video');
assert.equal(readFileSync('app/(tabs)/profile.tsx', 'utf8').includes('<Modal'), true, 'profile videos must open a preview sheet');

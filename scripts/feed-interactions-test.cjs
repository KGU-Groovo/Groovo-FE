const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');

const screen = readFileSync('app/(tabs)/feed.tsx', 'utf8');

assert.match(screen, /\bModal\b/);
assert.match(screen, /\bTextInput\b/);
assert.match(screen, /\bShare\b/);
assert.match(screen, /const \[likedReels, setLikedReels\] = useState<Record<string, boolean>>\(\{\}\)/);
assert.match(screen, /await Share\.share\(/);
assert.match(screen, /const trimmedComment = commentDraft\.trim\(\)/);
assert.match(screen, /if \(!commentReelId \|\| !trimmedComment\) return/);
assert.match(screen, /commentsByReel\[item\.song\.id\]\?\.length \?\? 0/);

console.log('feed interaction contract verified');

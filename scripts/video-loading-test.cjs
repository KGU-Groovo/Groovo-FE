const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');

const video = readFileSync('components/live-feedback/VideoBackground.tsx', 'utf8');

assert.match(video, /const \[isLoading, setIsLoading\] = useState\(true\)/);
assert.match(video, /useEffect\(\(\) => setIsLoading\(true\), \[source\]\)/);
assert.match(video, /onFirstFrameRender=\{\(\) => setIsLoading\(false\)\}/);
assert.match(video, /<ActivityIndicator size="large" color="#FF43BD"/);

console.log('video loading indicator contract verified');

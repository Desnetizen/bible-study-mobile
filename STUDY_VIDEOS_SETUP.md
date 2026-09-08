# Study Videos feature — setup

## 1. Extract this zip into your repo root
It will merge into your existing `app/` and `src/` folders:

- `app/_layout.tsx` (modified — registers 2 new routes)
- `src/components/DanielStudyPage.jsx` (modified — adds the section)
- `app/daniel-study/videos/index.jsx` (new — library screen)
- `app/daniel-study/videos/[id].jsx` (new — player screen)
- `src/components/daniel-study/StudyVideosSection.jsx` (new — home section)
- `src/components/daniel-study/VideoPlayer.jsx` (new — player component)
- `src/data/danielStudyVideos.js` (new — video catalog, 45 videos)
- `src/lib/video-progress.ts` (new — local watch-progress store)

## 2. Install the two new native dependencies
```
npx expo install expo-video react-native-webview
```
Neither was in your `package.json` before this. The app will crash on the
video player screen without them.

## 3. Add real video sources
Every entry in `src/data/danielStudyVideos.js` currently has `source: null`
on purpose — the player shows a calm "video coming soon" placeholder instead
of crashing. As footage becomes available, fill in per video:

```js
source: { type: 'youtube', videoId: 'dQw4w9WgXcQ' }
// or
source: { type: 'hosted', uri: 'https://your-cdn.com/daniel-7.mp4' }
```

## 4. Verify
```
npx tsc --noEmit
npx expo start
```
Then open the Daniel Study tab and scroll to "Study Videos" at the bottom.

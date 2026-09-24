import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Film } from 'lucide-react-native';

import { supabase } from '@/lib/supabase';
import { VIDEO_BUCKET } from '@/constants/video-files';

/**
 * Renders playback for a STUDY_VIDEOS entry.
 *
 * - source.type === 'youtube' embeds the video with react-native-webview.
 * - source.type === 'hosted' plays a direct mp4/HLS url with expo-video.
 * - source.bucketFile streams from the Supabase `video-files` bucket using a
 *   signed URL generated on demand.
 * - no source yet shows a calm "video coming soon" state on the thumbnail,
 *   so the library works end-to-end before every video is recorded.
 *
 * Requires (not yet in package.json): `npx expo install expo-video react-native-webview`
 */
export default function VideoPlayer({ video }) {
  if (!video?.source) {
    return <ComingSoonPlayer video={video} />;
  }

  if (video.source.type === 'youtube') {
    return <YouTubePlayer videoId={video.source.videoId} title={video.title} />;
  }

  if (video.source.type === 'hosted') {
    return <HostedPlayer uri={video.source.uri} />;
  }

  if (video.source.bucketFile) {
    return <BucketPlayer key={video.source.bucketFile} bucketFile={video.source.bucketFile} />;
  }

  return <ComingSoonPlayer video={video} />;
}

function ComingSoonPlayer({ video }) {
  return (
    <View style={styles.wrap}>
      {video?.thumbnail ? (
        <Image source={video.thumbnail} style={StyleSheet.absoluteFillObject} contentFit="cover" />
      ) : null}
      <View style={styles.dimOverlay} />
      <View style={styles.centerContent}>
        <View style={styles.filmBadge}>
          <Film size={22} color="#E8A838" />
        </View>
        <Text style={styles.comingSoonText}>Video coming soon</Text>
        <Text style={styles.comingSoonSubtext}>This lesson hasn{'\u2019'}t been recorded yet.</Text>
      </View>
    </View>
  );
}

function YouTubePlayer({ videoId, title }) {
  const [loading, setLoading] = useState(true);

  // Lazily required so the module only needs to exist once react-native-webview
  // is installed; the ComingSoon/hosted paths work without it.
  const { WebView } = require('react-native-webview');
  const embedUrl = `https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0`;

  return (
    <View style={styles.wrap}>
      <WebView
        source={{ uri: embedUrl }}
        style={styles.webview}
        allowsFullscreenVideo
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        onLoadEnd={() => setLoading(false)}
        accessibilityLabel={title}
      />
      {loading && (
        <View style={[StyleSheet.absoluteFillObject, styles.centerContent]}>
          <ActivityIndicator color="#E8A838" />
        </View>
      )}
    </View>
  );
}

function HostedPlayer({ uri }) {
  // Imported lazily for the same reason as WebView above.
  const { useVideoPlayer, VideoView } = require('expo-video');
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
  });

  return (
    <View style={styles.wrap}>
      <VideoView style={StyleSheet.absoluteFillObject} player={player} allowsFullscreen nativeControls />
    </View>
  );
}

const SIGNED_URL_TTL_SECONDS = 3600;

/**
 * Streams a private-bucket video by requesting a fresh signed URL from
 * Supabase, since the `video-files` bucket is not public.
 */
function BucketPlayer({ bucketFile }) {
  const [uri, setUri] = useState(null);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    if (!supabase) {
      return;
    }

    supabase.storage
      .from(VIDEO_BUCKET)
      .createSignedUrl(bucketFile, SIGNED_URL_TTL_SECONDS)
      .then(({ data, error: signError }) => {
        if (cancelled) return;
        if (signError || !data?.signedUrl) {
          setError('Could not load the video.');
          return;
        }
        setUri(data.signedUrl);
      });

    return () => {
      cancelled = true;
    };
  }, [bucketFile, retryKey]);

  const activeError = !supabase ? 'Supabase is not configured.' : error;

  if (activeError) {
    return (
      <View style={styles.wrap}>
        <View style={styles.dimOverlay} />
        <View style={styles.centerContent}>
          <Text style={styles.comingSoonSubtext}>{activeError}</Text>
          <TouchableOpacity
            onPress={() => {
              setError(null);
              setUri(null);
              setRetryKey((k) => k + 1);
            }}
            style={styles.retryBtn}
            accessibilityRole="button"
          >
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!uri) {
    return (
      <View style={styles.wrap}>
        <View style={styles.dimOverlay} />
        <View style={styles.centerContent}>
          <ActivityIndicator color="#E8A838" />
          <Text style={styles.comingSoonSubtext}>{'Loading video\u2026'}</Text>
        </View>
      </View>
    );
  }

  return <HostedPlayer uri={uri} />;
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#07111F',
    overflow: 'hidden',
  },
  webview: { flex: 1, backgroundColor: '#07111F' },
  dimOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(4, 15, 45, 0.72)' },
  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  filmBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(232, 168, 56, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(232, 168, 56, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  comingSoonText: { color: '#FFFFFF', fontFamily: 'Inter', fontSize: 14, fontWeight: '700' },
  comingSoonSubtext: { color: '#94A3B8', fontFamily: 'Inter', fontSize: 12 },
  retryBtn: {
    marginTop: 10,
    backgroundColor: '#E8A838',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  retryBtnText: { color: '#040f2d', fontFamily: 'Inter', fontSize: 13, fontWeight: '700' },
});

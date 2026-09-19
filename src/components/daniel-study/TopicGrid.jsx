import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Crown, User, Compass, ScrollText, Landmark } from 'lucide-react-native';
import { BuildingIcon } from '@/components/BuildingIcon';

const ICONS = { Crown, User, Compass, ScrollText, Landmark, Castle: BuildingIcon };

function TopicCard({ topic }) {
  const Icon = ICONS[topic.icon] ?? Crown;

  const handlePress = () => {
    if (topic.routeParams) {
      router.setParams(topic.routeParams);
    } else {
      router.push(topic.route);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`${topic.label}, ${topic.meta}`}
    >
      <View style={[styles.iconWrap, { borderColor: `${topic.color}40`, backgroundColor: `${topic.color}14` }]}>
        <Icon size={22} color={topic.color} />
      </View>
      <Text style={styles.label} numberOfLines={1}>{topic.label}</Text>
      <Text style={styles.meta}>{topic.meta}</Text>
    </TouchableOpacity>
  );
}

export default function TopicGrid({ topics }) {
  return (
    <ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  style={{ flexGrow: 0 }}
  contentContainerStyle={styles.row}
>
      {topics.map((topic) => (
        <TopicCard key={topic.id} topic={topic} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 10, paddingHorizontal: 16, paddingVertical: 4, alignItems: 'flex-start' },
  card: {
    width: 96,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.15)',
    backgroundColor: '#0A1324',
    paddingVertical: 14,
    alignItems: 'center',
    gap: 6,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { color: '#FFFFFF', fontFamily: 'Inter', fontSize: 12, fontWeight: '700', textAlign: 'center' },
  meta: { color: '#64748B', fontFamily: 'Inter', fontSize: 10, fontWeight: '500', textAlign: 'center' },
});

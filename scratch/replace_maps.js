const fs = require('fs');
const files = [
  'app/babylon-detail.tsx',
  'app/greek-detail.tsx',
  'app/medo-persian-detail.tsx',
  'app/pre-exilic-detail.tsx',
  'app/roman-detail.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // 1. Change state definition
  content = content.replace(
    /const \[activeTab, setActiveTab\] = useState\<'overview' \| 'map' \| 'read'\>\('overview'\);/g,
    `const [activeTab, setActiveTab] = useState<'overview' | 'places' | 'read'>('overview');`
  );
  
  // 2. Change the subNavTab onPress and label
  content = content.replace(
    /onPress=\{\(\) =\> setActiveTab\('map'\)\}\s*style=\{styles\.subNavTab\}\s*\>\s*\<Text style=\{\[styles\.subNavText, activeTab === 'map' && styles\.activeSubNavText\]\}\>Map\<\/Text\>\s*\{activeTab === 'map' && \<View style=\{styles\.activeTabIndicator\} \/\>\}\s*\<\/Pressable\>/g,
    `onPress={() => setActiveTab('places')}
            style={styles.subNavTab}
          >
            <Text style={[styles.subNavText, activeTab === 'places' && styles.activeSubNavText]}>Places</Text>
            {activeTab === 'places' && <View style={styles.activeTabIndicator} />}
          </Pressable>`
  );
  
  // 3. Change the conditional render
  content = content.replace(
    /\{activeTab === 'map' && \(/g,
    `{activeTab === 'places' && (`
  );
  
  fs.writeFileSync(file, content);
  console.log('Updated ' + file);
});

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PHRASES, CATEGORIES, Phrase } from '@/constants/PhrasesData';
import { BottomTabInset, Spacing } from '@/constants/theme';

export default function PhrasesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (phrase: Phrase) => {
    // Boşnakça çevirisini panoya kopyalayalım çünkü yerel dilde göstermek/okutmak isteyebilir
    await Clipboard.setStringAsync(phrase.bs);
    setCopiedId(phrase.id);
    setTimeout(() => {
      setCopiedId(null);
    }, 1500);
  };

  const filteredPhrases = PHRASES.filter((phrase) => {
    const matchesCategory =
      selectedCategory === 'Tümü' || phrase.category === selectedCategory;

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === '' ||
      phrase.tr.toLowerCase().includes(query) ||
      phrase.en.toLowerCase().includes(query) ||
      phrase.bs.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  const renderPhraseCard = ({ item }: { item: Phrase }) => {
    const isCopied = copiedId === item.id;

    return (
      <ThemedView type="backgroundElement" style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.categoryBadge}>
            <ThemedText type="code" style={styles.categoryBadgeText}>
              {item.category}
            </ThemedText>
          </View>
          <TouchableOpacity
            style={[styles.copyButton, isCopied && styles.copyButtonActive]}
            onPress={() => handleCopy(item)}
          >
            <MaterialCommunityIcons
              name={isCopied ? 'check' : 'content-copy'}
              size={16}
              color={isCopied ? '#10B981' : '#94A3B8'}
            />
            <ThemedText
              type="code"
              style={[
                styles.copyText,
                { color: isCopied ? '#10B981' : '#94A3B8' },
              ]}
            >
              {isCopied ? 'Kopyalandı' : 'Kopyala'}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.phraseContent}>
          {/* Türkçe */}
          <ThemedText type="smallBold" style={styles.trText}>
            {item.tr}
          </ThemedText>

          {/* İngilizce */}
          <ThemedText type="small" style={styles.enText}>
            {item.en}
          </ThemedText>

          {/* Boşnakça */}
          <View style={styles.bsContainer}>
            <ThemedText type="code" style={styles.bsLabel}>
              Boşnakça:
            </ThemedText>
            <ThemedText type="default" style={styles.bsText}>
              {item.bs}
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Başlık */}
        <View style={styles.header}>
          <ThemedText type="subtitle" style={styles.headerTitle}>
            Pratik Cümleler
          </ThemedText>
          <ThemedText type="small" style={styles.headerSubtitle}>
            Türkçe - İngilizce - Boşnakça Rehber
          </ThemedText>
        </View>

        {/* Arama Çubuğu */}
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons
            name="magnify"
            size={22}
            color="#64748B"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Kelime veya cümle ara..."
            placeholderTextColor="#64748B"
            clearButtonMode="while-editing"
            returnKeyType="search"
            onSubmitEditing={Keyboard.dismiss}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons
                name="close-circle"
                size={18}
                color="#64748B"
                style={styles.clearIcon}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Kategori Seçici */}
        <View style={styles.categoriesWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.chip,
                    isSelected && styles.chipActive,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <ThemedText
                    type="smallBold"
                    style={[
                      styles.chipText,
                      isSelected && styles.chipTextActive,
                    ]}
                  >
                    {category}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Liste */}
        <FlatList
          data={filteredPhrases}
          keyExtractor={(item) => item.id}
          renderItem={renderPhraseCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="clipboard-alert-outline"
                size={48}
                color="#475569"
              />
              <ThemedText style={styles.emptyText}>
                Aradığınız kriterde cümle bulunamadı.
              </ThemedText>
            </View>
          }
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFD700',
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#94A3B8',
    marginTop: Spacing.half,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    marginHorizontal: Spacing.four,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    height: 48,
    borderWidth: 1.5,
    borderColor: '#1E293B',
    marginBottom: Spacing.three,
  },
  searchIcon: {
    marginRight: Spacing.two,
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 16,
    height: '100%',
  },
  clearIcon: {
    marginLeft: Spacing.two,
  },
  categoriesWrapper: {
    marginBottom: Spacing.three,
  },
  categoriesContainer: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  chip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + Spacing.half,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipActive: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  chipText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  chipTextActive: {
    color: '#0F172A',
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.three,
  },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: '#2E3135',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: '#2E3135',
    paddingBottom: Spacing.one,
  },
  categoryBadge: {
    backgroundColor: '#1E1B4B',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half / 2,
    borderRadius: Spacing.one,
    borderWidth: 0.5,
    borderColor: '#4338CA',
  },
  categoryBadgeText: {
    color: '#FFD700',
    fontSize: 10,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.half,
    paddingHorizontal: Spacing.two,
  },
  copyButtonActive: {
    opacity: 0.8,
  },
  copyText: {
    fontSize: 11,
  },
  phraseContent: {
    gap: Spacing.one,
  },
  trText: {
    color: '#F8FAFC',
    fontSize: 16,
  },
  enText: {
    color: '#94A3B8',
    fontStyle: 'italic',
    fontSize: 13,
  },
  bsContainer: {
    backgroundColor: '#0F172A',
    padding: Spacing.two,
    borderRadius: Spacing.two,
    marginTop: Spacing.one,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  bsLabel: {
    color: '#10B981',
    fontSize: 10,
    textTransform: 'uppercase',
    marginBottom: Spacing.half / 2,
  },
  bsText: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six,
    gap: Spacing.two,
  },
  emptyText: {
    color: '#64748B',
    textAlign: 'center',
  },
});

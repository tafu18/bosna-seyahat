import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { StatusBar } from 'expo-status-bar';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PHRASES, CATEGORIES, Phrase } from '@/constants/PhrasesData';
import { useTheme } from '@/hooks/use-theme';
import { BottomTabInset, Spacing } from '@/constants/theme';

// Kategorilere özel renkler (soft pastel)
const CATEGORY_COLORS: Record<string, { primary: string; lightBg: string }> = {
  'Genel': { primary: '#3B82F6', lightBg: '#EFF6FF' },       // Soft Blue
  'Yemek': { primary: '#F59E0B', lightBg: '#FEF3C7' },       // Soft Orange
  'Ulaşım': { primary: '#06B6D4', lightBg: '#ECFEFF' },      // Soft Teal
  'Alışveriş': { primary: '#8B5CF6', lightBg: '#F5F3FF' },   // Soft Purple
  'Bebek': { primary: '#10B981', lightBg: '#ECFDF5' },       // Soft Emerald/Mint
  'Acil Durum': { primary: '#EF4444', lightBg: '#FEE2E2' },  // Soft Red
};

export default function PhrasesScreen() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (phrase: Phrase) => {
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
    const catColor = CATEGORY_COLORS[item.category] || { primary: '#64748B', lightBg: '#F1F5F9' };

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: theme.backgroundSelected,
            borderLeftColor: catColor.primary,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: catColor.lightBg, borderColor: catColor.primary }]}>
            <ThemedText type="code" style={[styles.categoryBadgeText, { color: catColor.primary }]}>
              {item.category}
            </ThemedText>
          </View>
          <TouchableOpacity
            style={[styles.copyButton, isCopied && styles.copyButtonActive]}
            onPress={() => handleCopy(item)}
          >
            <MaterialCommunityIcons
              name={isCopied ? 'check-circle' : 'content-copy'}
              size={15}
              color={isCopied ? '#10B981' : '#64748B'}
            />
            <ThemedText
              type="code"
              style={[
                styles.copyText,
                { color: isCopied ? '#10B981' : '#64748B' },
              ]}
            >
              {isCopied ? 'Kopyalandı' : 'Kopyala'}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.phraseContent}>
          {/* Türkçe */}
          <ThemedText type="smallBold" style={[styles.trText, { color: theme.text }]}>
            {item.tr}
          </ThemedText>

          {/* İngilizce */}
          <ThemedText type="small" style={[styles.enText, { color: theme.textSecondary }]}>
            {item.en}
          </ThemedText>

          {/* Boşnakça (Renkli Kutu) */}
          <View style={[styles.bsContainer, { backgroundColor: catColor.lightBg }]}>
            <ThemedText type="code" style={[styles.bsLabel, { color: catColor.primary }]}>
              Boşnakça
            </ThemedText>
            <ThemedText type="default" style={[styles.bsText, { color: theme.text }]}>
              {item.bs}
            </ThemedText>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="auto" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Başlık */}
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <ThemedText type="subtitle" style={styles.headerTitle}>
            Pratik Cümleler
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.half }}>
            Türkçe - İngilizce - Boşnakça Rehber
          </ThemedText>
        </View>

        {/* Arama Çubuğu */}
        <View style={[styles.searchContainer, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
          <MaterialCommunityIcons
            name="magnify"
            size={22}
            color={theme.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Kelime veya cümle ara..."
            placeholderTextColor={theme.textSecondary}
            clearButtonMode="while-editing"
            returnKeyType="search"
            onSubmitEditing={Keyboard.dismiss}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons
                name="close-circle"
                size={18}
                color={theme.textSecondary}
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
            keyboardShouldPersistTaps="handled"
          >
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.chip,
                    { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
                    isSelected && styles.chipActive,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <ThemedText
                    type="smallBold"
                    style={[
                      styles.chipText,
                      { color: theme.textSecondary },
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
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="clipboard-alert-outline"
                size={48}
                color={theme.textSecondary}
              />
              <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
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
  logo: {
    width: 72,
    height: 72,
    borderRadius: 18,
    marginBottom: Spacing.two,
  },
  headerTitle: {
    color: '#0D9488', // Soft Turquoise
    fontWeight: '800',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.four,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    height: 48,
    borderWidth: 1.5,
    marginBottom: Spacing.three,
    shadowColor: '#64748B',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  searchIcon: {
    marginRight: Spacing.two,
  },
  searchInput: {
    flex: 1,
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
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + Spacing.half,
    borderRadius: Spacing.two,
    borderWidth: 1.5,
  },
  chipActive: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  chipText: {
    fontSize: 13,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.three,
  },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    borderWidth: 1.5,
    borderLeftWidth: 5,
    shadowColor: '#64748B',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
    paddingBottom: Spacing.one,
  },
  categoryBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half / 2,
    borderRadius: Spacing.one,
    borderWidth: 1,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
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
    fontWeight: '700',
  },
  phraseContent: {
    gap: Spacing.one,
  },
  trText: {
    fontSize: 16,
  },
  enText: {
    fontStyle: 'italic',
    fontSize: 13,
  },
  bsContainer: {
    padding: Spacing.two,
    borderRadius: Spacing.two,
    marginTop: Spacing.two,
  },
  bsLabel: {
    fontSize: 9,
    textTransform: 'uppercase',
    fontWeight: '800',
    marginBottom: Spacing.half / 2,
  },
  bsText: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six,
    gap: Spacing.two,
  },
  emptyText: {
    textAlign: 'center',
  },
});

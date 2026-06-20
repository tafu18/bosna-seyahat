import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Image,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRates } from '@/hooks/use-rates';
import { useTheme } from '@/hooks/use-theme';
import { BottomTabInset, Spacing } from '@/constants/theme';

const STORAGE_KEY = 'BOSNA_REHBERI_EXPENSES_DATA';

export interface Expense {
  id: string;
  title: string; // Ne aldım
  place: string; // Nereden
  amount: number; // Tutar
  currency: 'TRY' | 'BAM' | 'EUR';
  paymentMethod: 'Nakit' | 'Kredi Kartı';
  date: string; // Tarih
}

export default function ExpensesScreen() {
  const theme = useTheme();
  const { eurToTry, eurToBam, refresh } = useRates();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Form durumları
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [place, setPlace] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [currency, setCurrency] = useState<'TRY' | 'BAM' | 'EUR'>('BAM');
  const [paymentMethod, setPaymentMethod] = useState<'Nakit' | 'Kredi Kartı'>('Nakit');

  // Modal scroll and keyboard focus logic
  const modalScrollViewRef = useRef<ScrollView>(null);
  const [modalInputLayouts, setModalInputLayouts] = useState<Record<string, number>>({});

  const scrollToModalInput = (key: string) => {
    const y = modalInputLayouts[key];
    if (y !== undefined) {
      setTimeout(() => {
        modalScrollViewRef.current?.scrollTo({
          y: Math.max(0, y - 10),
          animated: true,
        });
      }, 100);
    }
  };

  // Sayfa odağa geldiğinde verileri ve kurları yenile
  useFocusEffect(
    useCallback(() => {
      refresh();
      loadExpenses();
    }, [])
  );

  const loadExpenses = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setExpenses(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading expenses:', e);
    } finally {
      setLoading(false);
    }
  };

  const saveExpenses = async (updated: Expense[]) => {
    try {
      setExpenses(updated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving expenses:', e);
    }
  };

  const handleAddExpense = () => {
    if (!title.trim() || !amountInput.trim()) {
      Alert.alert('Hata', 'Lütfen ne aldığınızı ve tutarını girin.');
      return;
    }

    const cleanAmount = amountInput.replace(',', '.');
    const parsedAmount = parseFloat(cleanAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Hata', 'Lütfen geçerli bir tutar girin.');
      return;
    }

    const now = new Date();
    const dateString = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newExpense: Expense = {
      id: `expense_${Date.now()}`,
      title: title.trim(),
      place: place.trim() || 'Bilinmiyor',
      amount: parsedAmount,
      currency,
      paymentMethod,
      date: dateString,
    };

    const updated = [newExpense, ...expenses];
    saveExpenses(updated);

    // Form temizliği
    setTitle('');
    setPlace('');
    setAmountInput('');
    setCurrency('BAM');
    setPaymentMethod('Nakit');
    setModalVisible(false);
  };

  const handleDeleteExpense = (id: string) => {
    Alert.alert('Harcamayı Sil', 'Bu harcama kaydını silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => {
          const updated = expenses.filter((item) => item.id !== id);
          saveExpenses(updated);
        },
      },
    ]);
  };

  // Harcama Hesaplamaları
  const totals = expenses.reduce(
    (acc, curr) => {
      acc[curr.currency] += curr.amount;
      return acc;
    },
    { TRY: 0, BAM: 0, EUR: 0 }
  );

  // Kurlara göre toplam TL harcaması hesabı
  const calculateTotalInTL = () => {
    let total = 0;
    
    // TRY kısmı zaten TL
    total += totals.TRY;
    
    // EUR kısmı
    total += totals.EUR * eurToTry;
    
    // BAM kısmı (BAM -> EUR -> TRY)
    if (eurToBam > 0) {
      total += totals.BAM * (eurToTry / eurToBam);
    }
    
    return total;
  };

  const totalInTL = calculateTotalInTL();

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0D9488" />
        <ThemedText style={{ marginTop: Spacing.two }}>Defter yükleniyor...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ThemedView style={styles.container}>
        <StatusBar style="auto" />
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTitleRow}>
                <Image
                  source={require('@/assets/images/logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <View style={styles.headerTextWrapper}>
                  <ThemedText type="subtitle" style={styles.headerTitle}>
                    Harcama Defteri
                  </ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    Nerede, ne harcadım?
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Harcama Özeti Kartı */}
            <View style={[styles.summaryCard, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
              <ThemedText type="code" style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                TOPLAM HARCAMA (TL Karşılığı)
              </ThemedText>
              <ThemedText type="subtitle" style={styles.totalTLText}>
                ₺ {totalInTL.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </ThemedText>

              <View style={[styles.summaryDivider, { backgroundColor: theme.backgroundSelected }]} />

              <View style={styles.currenciesSummaryRow}>
                <View style={styles.currencySummaryItem}>
                  <ThemedText type="code" style={{ color: theme.textSecondary }}>BAM</ThemedText>
                  <ThemedText type="smallBold" style={{ color: '#10B981' }}>
                    KM {totals.BAM.toFixed(2)}
                  </ThemedText>
                </View>
                <View style={[styles.verticalDivider, { backgroundColor: theme.backgroundSelected }]} />
                <View style={styles.currencySummaryItem}>
                  <ThemedText type="code" style={{ color: theme.textSecondary }}>EUR</ThemedText>
                  <ThemedText type="smallBold" style={{ color: '#D97706' }}>
                    € {totals.EUR.toFixed(2)}
                  </ThemedText>
                </View>
                <View style={[styles.verticalDivider, { backgroundColor: theme.backgroundSelected }]} />
                <View style={styles.currencySummaryItem}>
                  <ThemedText type="code" style={{ color: theme.textSecondary }}>TRY</ThemedText>
                  <ThemedText type="smallBold" style={{ color: '#0D9488' }}>
                    ₺ {totals.TRY.toFixed(2)}
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Harcama Listesi */}
            <FlatList
              data={expenses}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              renderItem={({ item }) => {
                const isCard = item.paymentMethod === 'Kredi Kartı';
                const currencySymbols = { BAM: 'KM', EUR: '€', TRY: '₺' };
                const currencyColors = { BAM: '#10B981', EUR: '#D97706', TRY: '#0D9488' };

                return (
                  <View style={[styles.expenseCard, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
                    <View style={styles.expenseInfoCol}>
                      <ThemedText type="smallBold" style={{ color: theme.text }}>
                        {item.title}
                      </ThemedText>
                      <View style={styles.expenseSubDetails}>
                        <MaterialCommunityIcons name="store-outline" size={13} color={theme.textSecondary} />
                        <ThemedText type="code" style={{ color: theme.textSecondary, marginRight: Spacing.two }}>
                          {item.place}
                        </ThemedText>
                        <MaterialCommunityIcons name="clock-outline" size={13} color={theme.textSecondary} />
                        <ThemedText type="code" style={{ color: theme.textSecondary }}>
                          {item.date}
                        </ThemedText>
                      </View>
                    </View>

                    <View style={styles.expenseAmountCol}>
                      <ThemedText type="smallBold" style={{ color: currencyColors[item.currency], fontSize: 16 }}>
                        {currencySymbols[item.currency]} {item.amount.toFixed(2)}
                      </ThemedText>
                      <View style={styles.paymentMethodBadge}>
                        <MaterialCommunityIcons
                          name={isCard ? 'credit-card-outline' : 'cash'}
                          size={12}
                          color={theme.textSecondary}
                        />
                        <ThemedText type="code" style={{ color: theme.textSecondary, fontSize: 10 }}>
                          {item.paymentMethod}
                        </ThemedText>
                      </View>
                    </View>

                    {/* Silme Butonu */}
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteExpense(item.id)}
                    >
                      <MaterialCommunityIcons name="trash-can-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons name="notebook-outline" size={48} color={theme.textSecondary} />
                  <ThemedText style={{ color: theme.textSecondary, textAlign: 'center', marginTop: Spacing.two }}>
                    Henüz harcama eklenmemiş. Girdiğiniz alışverişler burada listelenecektir!
                  </ThemedText>
                </View>
              }
              ListFooterComponent={
                <TouchableOpacity
                  style={[styles.addExpenseButton, { borderColor: '#0D9488' }]}
                  onPress={() => setModalVisible(true)}
                >
                  <MaterialCommunityIcons name="plus-circle-outline" size={20} color="#0D9488" />
                  <ThemedText type="smallBold" style={{ color: '#0D9488' }}>
                    Yeni Harcama Ekle
                  </ThemedText>
                </TouchableOpacity>
              }
            />

            {/* Harcama Ekleme Modalı */}
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalContainer}
              >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                  <View style={[styles.modalContent, { backgroundColor: theme.backgroundElement }]}>
                    
                    <View style={styles.modalHeader}>
                      <ThemedText type="smallBold" style={{ fontSize: 16 }}>Yeni Harcama Ekle</ThemedText>
                      <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <MaterialCommunityIcons name="close" size={22} color={theme.text} />
                      </TouchableOpacity>
                    </View>

                    <ScrollView
                      ref={modalScrollViewRef}
                      style={styles.modalForm}
                      showsVerticalScrollIndicator={false}
                      keyboardShouldPersistTaps="handled"
                    >
                      
                      {/* Ne Aldım */}
                      <View
                        style={styles.formGroup}
                        onLayout={(e) => {
                          const y = e.nativeEvent.layout.y;
                          setModalInputLayouts((prev) => ({ ...prev, title: y }));
                        }}
                      >
                        <ThemedText type="code" style={styles.formLabel}>Ne Aldım? *</ThemedText>
                        <TextInput
                          style={[styles.formInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
                          placeholder="Örn: Boşnak Böreği, Magnet, Taksi"
                          placeholderTextColor={theme.textSecondary}
                          value={title}
                          onChangeText={setTitle}
                          onFocus={() => scrollToModalInput('title')}
                        />
                      </View>

                      {/* Nereden */}
                      <View
                        style={styles.formGroup}
                        onLayout={(e) => {
                          const y = e.nativeEvent.layout.y;
                          setModalInputLayouts((prev) => ({ ...prev, place: y }));
                        }}
                      >
                        <ThemedText type="code" style={styles.formLabel}>Nereden / Mağaza Adı</ThemedText>
                        <TextInput
                          style={[styles.formInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
                          placeholder="Örn: Sac Börekçisi, Başçarşı"
                          placeholderTextColor={theme.textSecondary}
                          value={place}
                          onChangeText={setPlace}
                          onFocus={() => scrollToModalInput('place')}
                        />
                      </View>

                      {/* Tutar & Para Birimi */}
                      <View
                        style={styles.formRow}
                        onLayout={(e) => {
                          const y = e.nativeEvent.layout.y;
                          setModalInputLayouts((prev) => ({ ...prev, amount: y }));
                        }}
                      >
                        <View style={[styles.formGroup, { flex: 1.5 }]}>
                          <ThemedText type="code" style={styles.formLabel}>Tutar *</ThemedText>
                          <TextInput
                            style={[styles.formInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
                            placeholder="0.00"
                            keyboardType="numeric"
                            placeholderTextColor={theme.textSecondary}
                            value={amountInput}
                            onChangeText={setAmountInput}
                            onFocus={() => scrollToModalInput('amount')}
                          />
                        </View>

                        <View style={[styles.formGroup, { flex: 1, marginLeft: Spacing.two }]}>
                          <ThemedText type="code" style={styles.formLabel}>Para Birimi</ThemedText>
                          <View style={styles.currencySelectRow}>
                            {(['BAM', 'EUR', 'TRY'] as const).map((curr) => (
                              <TouchableOpacity
                                key={curr}
                                style={[
                                  styles.currencyButton,
                                  { borderColor: theme.backgroundSelected },
                                  currency === curr && styles.currencyButtonActive,
                                ]}
                                onPress={() => setCurrency(curr)}
                              >
                                <ThemedText
                                  type="code"
                                  style={[
                                    styles.currencyButtonText,
                                    { color: theme.textSecondary },
                                    currency === curr && styles.currencyButtonTextActive,
                                  ]}
                                >
                                  {curr === 'TRY' ? 'TL' : curr}
                                </ThemedText>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      </View>

                      {/* Ödeme Yöntemi */}
                      <View style={styles.formGroup}>
                        <ThemedText type="code" style={styles.formLabel}>Ödeme Yöntemi</ThemedText>
                        <View style={styles.payMethodRow}>
                          {(['Nakit', 'Kredi Kartı'] as const).map((method) => {
                            const isSelected = paymentMethod === method;
                            return (
                              <TouchableOpacity
                                key={method}
                                style={[
                                  styles.payMethodButton,
                                  { borderColor: theme.backgroundSelected },
                                  isSelected && styles.payMethodButtonActive,
                                ]}
                                onPress={() => setPaymentMethod(method)}
                              >
                                <MaterialCommunityIcons
                                  name={method === 'Nakit' ? 'cash' : 'credit-card-outline'}
                                  size={16}
                                  color={isSelected ? '#FFFFFF' : theme.textSecondary}
                                />
                                <ThemedText
                                  type="smallBold"
                                  style={[
                                    styles.payMethodText,
                                    { color: theme.textSecondary },
                                    isSelected && styles.payMethodTextActive,
                                  ]}
                                >
                                  {method}
                                </ThemedText>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>

                      {/* Kaydet Butonu */}
                      <TouchableOpacity style={styles.submitButton} onPress={handleAddExpense}>
                        <ThemedText type="smallBold" style={{ color: '#fff' }}>Harcamayı Kaydet</ThemedText>
                      </TouchableOpacity>

                    </ScrollView>
                  </View>
                </TouchableWithoutFeedback>
              </KeyboardAvoidingView>
            </Modal>

          </SafeAreaView>
        </ThemedView>
      </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: Spacing.two,
  },
  headerTextWrapper: {
    flex: 1,
  },
  headerTitle: {
    color: '#0D9488', // Soft Turquoise
    fontWeight: '800',
  },
  summaryCard: {
    marginHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    padding: Spacing.four,
    borderWidth: 1.5,
    marginBottom: Spacing.four,
    shadowColor: '#64748B',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: Spacing.one,
  },
  totalTLText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0D9488',
  },
  summaryDivider: {
    width: '100%',
    height: 1.5,
    marginVertical: Spacing.three,
  },
  currenciesSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: Spacing.two,
  },
  currencySummaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  verticalDivider: {
    width: 1.5,
    height: '100%',
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.three,
  },
  expenseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1.5,
    shadowColor: '#64748B',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  expenseInfoCol: {
    flex: 1,
    gap: 4,
  },
  expenseSubDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  expenseAmountCol: {
    alignItems: 'flex-end',
    marginRight: Spacing.three,
    gap: 4,
  },
  paymentMethodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  deleteButton: {
    padding: Spacing.one,
  },
  addExpenseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.six,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContent: {
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    padding: Spacing.four,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: Spacing.two,
    marginBottom: Spacing.three,
  },
  modalForm: {
    marginBottom: Spacing.four,
  },
  formGroup: {
    marginBottom: Spacing.three,
  },
  formRow: {
    flexDirection: 'row',
  },
  formLabel: {
    color: '#475569',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: Spacing.one,
  },
  formInput: {
    borderWidth: 1.5,
    borderRadius: Spacing.two,
    height: 44,
    paddingHorizontal: Spacing.three,
    fontSize: 15,
  },
  currencySelectRow: {
    flexDirection: 'row',
    gap: 4,
    height: 44,
  },
  currencyButton: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: Spacing.two,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currencyButtonActive: {
    backgroundColor: '#CCFBF1',
    borderColor: '#0D9488',
  },
  currencyButtonText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  currencyButtonTextActive: {
    color: '#0F766E',
  },
  payMethodRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  payMethodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: Spacing.two,
    height: 44,
    gap: Spacing.two,
  },
  payMethodButtonActive: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  payMethodText: {
    fontSize: 13,
  },
  payMethodTextActive: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#0D9488',
    height: 48,
    borderRadius: Spacing.two,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.two,
    shadowColor: '#0D9488',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
});

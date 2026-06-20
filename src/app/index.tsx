import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRates } from '@/hooks/use-rates';
import { BottomTabInset, Spacing } from '@/constants/theme';

type CurrencyType = 'TRY' | 'BAM' | 'EUR';

export default function CurrencyConverterScreen() {
  const { eurToTry, eurToBam, loading, refresh } = useRates();
  
  const [tryVal, setTryVal] = useState('');
  const [bamVal, setBamVal] = useState('');
  const [eurVal, setEurVal] = useState('');
  const [activeCurrency, setActiveCurrency] = useState<CurrencyType>('BAM');

  // Sayfa her odağa geldiğinde güncel kurları yükle
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [])
  );

  const calculate = (text: string, source: CurrencyType) => {
    if (!text) {
      setTryVal('');
      setBamVal('');
      setEurVal('');
      return;
    }

    // Türkçe klavyeler için virgülü noktaya çevir
    const cleanText = text.replace(',', '.');
    const num = parseFloat(cleanText);
    
    if (isNaN(num)) {
      if (source === 'TRY') setTryVal(text);
      else if (source === 'BAM') setBamVal(text);
      else if (source === 'EUR') setEurVal(text);
      return;
    }

    if (source === 'TRY') {
      setTryVal(text);
      const eur = num / eurToTry;
      setEurVal(eur.toFixed(2));
      setBamVal((eur * eurToBam).toFixed(2));
    } else if (source === 'BAM') {
      setBamVal(text);
      const eur = num / eurToBam;
      setEurVal(eur.toFixed(2));
      setTryVal((eur * eurToTry).toFixed(2));
    } else if (source === 'EUR') {
      setEurVal(text);
      setTryVal((num * eurToTry).toFixed(2));
      setBamVal((num * eurToBam).toFixed(2));
    }
  };

  const addPreset = (amount: number) => {
    let currentVal = 0;
    if (activeCurrency === 'TRY') {
      currentVal = parseFloat(tryVal.replace(',', '.')) || 0;
      const newVal = (currentVal + amount).toString();
      calculate(newVal, 'TRY');
    } else if (activeCurrency === 'BAM') {
      currentVal = parseFloat(bamVal.replace(',', '.')) || 0;
      const newVal = (currentVal + amount).toString();
      calculate(newVal, 'BAM');
    } else if (activeCurrency === 'EUR') {
      currentVal = parseFloat(eurVal.replace(',', '.')) || 0;
      const newVal = (currentVal + amount).toString();
      calculate(newVal, 'EUR');
    }
  };

  const handleClear = () => {
    setTryVal('');
    setBamVal('');
    setEurVal('');
  };

  const tryToBamRate = eurToTry > 0 ? (eurToBam / eurToTry) : 0;
  const bamToTryRate = eurToBam > 0 ? (eurToTry / eurToBam) : 0;

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
        <ThemedText style={{ marginTop: Spacing.two }}>Kurlar yükleniyor...</ThemedText>
      </ThemedView>
    );
  }

  const presets = {
    TRY: [10, 50, 100, 500],
    BAM: [5, 10, 20, 50],
    EUR: [5, 10, 20, 50],
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ThemedView style={styles.container}>
          <SafeAreaView style={styles.safeArea}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Header */}
              <View style={styles.header}>
                <ThemedText type="subtitle" style={styles.brandTitle}>
                  BOSNA REHBERİ
                </ThemedText>
                <ThemedText type="small" style={styles.brandSubtitle}>
                  Kur Çevirici
                </ThemedText>
              </View>

              {/* Kurs Bilgisi Kartı */}
              <View style={styles.ratesCard}>
                <View style={styles.rateRow}>
                  <MaterialCommunityIcons name="currency-eur" size={18} color="#FFD700" />
                  <ThemedText type="small" style={styles.rateText}>
                    1 EUR = {eurToTry.toFixed(2)} TL
                  </ThemedText>
                  <View style={styles.dividerDot} />
                  <ThemedText type="small" style={styles.rateText}>
                    1 EUR = {eurToBam.toFixed(2)} BAM
                  </ThemedText>
                </View>
                <View style={[styles.rateRow, { marginTop: Spacing.one }]}>
                  <MaterialCommunityIcons name="currency-try" size={18} color="#10B981" />
                  <ThemedText type="small" style={styles.rateText}>
                    1 BAM = {bamToTryRate.toFixed(2)} TL
                  </ThemedText>
                  <View style={styles.dividerDot} />
                  <ThemedText type="small" style={styles.rateText}>
                    100 TL = {(100 * tryToBamRate).toFixed(2)} BAM
                  </ThemedText>
                </View>
              </View>

              {/* Kur Giriş Alanları */}
              <View style={styles.inputsContainer}>
                
                {/* BAM Card */}
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={[
                    styles.currencyCard,
                    activeCurrency === 'BAM' && styles.activeCard,
                  ]}
                  onPress={() => setActiveCurrency('BAM')}
                >
                  <View style={styles.currencyMeta}>
                    <ThemedText style={styles.flag}>🇧🇦</ThemedText>
                    <View>
                      <ThemedText type="smallBold">BAM</ThemedText>
                      <ThemedText type="small" style={styles.currencySub}>
                        Bosna Markı (KM)
                      </ThemedText>
                    </View>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={bamVal}
                    onChangeText={(t) => calculate(t, 'BAM')}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor="#666"
                    onFocus={() => setActiveCurrency('BAM')}
                  />
                </TouchableOpacity>

                {/* TRY Card */}
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={[
                    styles.currencyCard,
                    activeCurrency === 'TRY' && styles.activeCard,
                  ]}
                  onPress={() => setActiveCurrency('TRY')}
                >
                  <View style={styles.currencyMeta}>
                    <ThemedText style={styles.flag}>🇹🇷</ThemedText>
                    <View>
                      <ThemedText type="smallBold">TRY</ThemedText>
                      <ThemedText type="small" style={styles.currencySub}>
                        Türk Lirası (₺)
                      </ThemedText>
                    </View>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={tryVal}
                    onChangeText={(t) => calculate(t, 'TRY')}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor="#666"
                    onFocus={() => setActiveCurrency('TRY')}
                  />
                </TouchableOpacity>

                {/* EUR Card */}
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={[
                    styles.currencyCard,
                    activeCurrency === 'EUR' && styles.activeCard,
                  ]}
                  onPress={() => setActiveCurrency('EUR')}
                >
                  <View style={styles.currencyMeta}>
                    <ThemedText style={styles.flag}>🇪🇺</ThemedText>
                    <View>
                      <ThemedText type="smallBold">EUR</ThemedText>
                      <ThemedText type="small" style={styles.currencySub}>
                        Avro (€)
                      </ThemedText>
                    </View>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={eurVal}
                    onChangeText={(t) => calculate(t, 'EUR')}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor="#666"
                    onFocus={() => setActiveCurrency('EUR')}
                  />
                </TouchableOpacity>
              </View>

              {/* Hızlı Ekleme Butonları */}
              <View style={styles.actionContainer}>
                <ThemedText type="small" style={styles.sectionLabel}>
                  Hızlı Miktar Ekle ({activeCurrency})
                </ThemedText>
                <View style={styles.presetRow}>
                  {presets[activeCurrency].map((amount) => (
                    <TouchableOpacity
                      key={amount}
                      style={styles.presetButton}
                      onPress={() => addPreset(amount)}
                    >
                      <ThemedText type="smallBold" style={styles.presetText}>
                        +{amount}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Temizle Butonu */}
              <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
                <MaterialCommunityIcons name="delete-sweep" size={20} color="#fff" />
                <ThemedText type="smallBold" style={styles.clearButtonText}>
                  Tümünü Temizle
                </ThemedText>
              </TouchableOpacity>

            </ScrollView>
          </SafeAreaView>
        </ThemedView>
      </TouchableWithoutFeedback>
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
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.four,
  },
  header: {
    alignItems: 'center',
    marginVertical: Spacing.two,
  },
  brandTitle: {
    fontWeight: '800',
    color: '#FFD700',
    letterSpacing: 2,
  },
  brandSubtitle: {
    color: '#10B981',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: Spacing.half,
  },
  ratesCard: {
    backgroundColor: '#1E293B',
    borderRadius: Spacing.three,
    padding: Spacing.three,
    marginBottom: Spacing.four,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rateText: {
    color: '#94A3B8',
    marginLeft: Spacing.one,
  },
  dividerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#475569',
    marginHorizontal: Spacing.three,
  },
  inputsContainer: {
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  currencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderWidth: 1.5,
    borderColor: '#1E293B',
  },
  activeCard: {
    borderColor: '#FFD700',
    backgroundColor: '#1E1B4B',
  },
  currencyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  flag: {
    fontSize: 32,
  },
  currencySub: {
    color: '#64748B',
    marginTop: Spacing.half / 2,
  },
  input: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F8FAFC',
    textAlign: 'right',
    flex: 1,
    marginLeft: Spacing.three,
    paddingVertical: 5,
  },
  actionContainer: {
    marginBottom: Spacing.four,
  },
  sectionLabel: {
    color: '#94A3B8',
    marginBottom: Spacing.two,
  },
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  presetButton: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  presetText: {
    color: '#FFD700',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
    shadowColor: '#EF4444',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  clearButtonText: {
    color: '#ffffff',
  },
});

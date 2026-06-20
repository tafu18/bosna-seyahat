import React, { useState, useCallback, useRef, useEffect } from 'react';
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
  Image,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRates } from '@/hooks/use-rates';
import { useTheme } from '@/hooks/use-theme';
import { BottomTabInset, Spacing } from '@/constants/theme';

type CurrencyType = 'TRY' | 'BAM' | 'EUR';

export default function CurrencyConverterScreen() {
  const { eurToTry, eurToBam, loading, refresh } = useRates();
  const theme = useTheme();
  
  const [tryVal, setTryVal] = useState('');
  const [bamVal, setBamVal] = useState('');
  const [eurVal, setEurVal] = useState('');
  const [activeCurrency, setActiveCurrency] = useState<CurrencyType>('BAM');

  // Keyboard scrolling refs and values
  const scrollViewRef = useRef<ScrollView>(null);
  const { height: screenHeight } = useWindowDimensions();
  const [containerY, setContainerY] = useState(0);
  const [inputLayouts, setInputLayouts] = useState<Record<string, number>>({});
  const [keyboardHeight, setKeyboardHeight] = useState(280);
  const [focusedInputKey, setFocusedInputKey] = useState<string | null>(null);

  const scrollToCenter = useCallback((absoluteY: number, kh: number) => {
    const visibleHeight = screenHeight - kh;
    const cardHeight = 80;
    const targetScrollY = absoluteY - (visibleHeight / 2) + (cardHeight / 2);
    
    scrollViewRef.current?.scrollTo({
      y: Math.max(0, targetScrollY),
      animated: true,
    });
  }, [screenHeight]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        const kh = e.endCoordinates.height;
        setKeyboardHeight(kh);
        
        if (focusedInputKey) {
          const cardY = inputLayouts[focusedInputKey];
          if (cardY !== undefined) {
            scrollToCenter(containerY + cardY, kh);
          }
        }
      }
    );
    
    return () => {
      showSubscription.remove();
    };
  }, [focusedInputKey, inputLayouts, containerY, scrollToCenter]);

  const handleFocus = (key: string) => {
    setFocusedInputKey(key);
    const cardY = inputLayouts[key];
    if (cardY !== undefined) {
      scrollToCenter(containerY + cardY, keyboardHeight);
    }
  };

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
        <ActivityIndicator size="large" color="#0D9488" />
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
      <ThemedView style={styles.container}>
        <StatusBar style="auto" />
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
              {/* Header */}
              <View style={styles.header}>
                <Image
                  source={require('@/assets/images/logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <ThemedText type="subtitle" style={styles.brandTitle}>
                  BOSNA REHBERİ
                </ThemedText>
                <ThemedText type="small" style={styles.brandSubtitle}>
                  Kur Çevirici
                </ThemedText>
              </View>

              {/* Kurs Bilgisi Kartı */}
              <View style={[styles.ratesCard, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
                <View style={styles.rateRow}>
                  <MaterialCommunityIcons name="currency-eur" size={18} color="#D97706" />
                  <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: Spacing.one }}>
                    1 EUR = <ThemedText type="smallBold">{eurToTry.toFixed(2)} TL</ThemedText>
                  </ThemedText>
                  <View style={[styles.dividerDot, { backgroundColor: theme.backgroundSelected }]} />
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    1 EUR = <ThemedText type="smallBold">{eurToBam.toFixed(2)} BAM</ThemedText>
                  </ThemedText>
                </View>
                <View style={[styles.rateRow, { marginTop: Spacing.two }]}>
                  <MaterialCommunityIcons name="currency-try" size={18} color="#059669" />
                  <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: Spacing.one }}>
                    1 BAM = <ThemedText type="smallBold">{bamToTryRate.toFixed(2)} TL</ThemedText>
                  </ThemedText>
                  <View style={[styles.dividerDot, { backgroundColor: theme.backgroundSelected }]} />
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    100 TL = <ThemedText type="smallBold">{(100 * tryToBamRate).toFixed(2)} BAM</ThemedText>
                  </ThemedText>
                </View>
              </View>

              {/* Kur Giriş Alanları */}
              <View
                style={styles.inputsContainer}
                onLayout={(e) => setContainerY(e.nativeEvent.layout.y)}
              >
                
                {/* BAM Card */}
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={[
                    styles.currencyCard,
                    { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
                    activeCurrency === 'BAM' && styles.activeCard,
                  ]}
                  onPress={() => setActiveCurrency('BAM')}
                  onLayout={(e) => {
                    const y = e.nativeEvent.layout.y;
                    setInputLayouts((prev) => ({ ...prev, BAM: y }));
                  }}
                >
                  <View style={styles.currencyMeta}>
                    <ThemedText style={styles.flag}>🇧🇦</ThemedText>
                    <View>
                      <ThemedText type="smallBold" style={{ color: theme.text }}>BAM</ThemedText>
                      <ThemedText type="small" style={{ color: theme.textSecondary }}>
                        Bosna Markı (KM)
                      </ThemedText>
                    </View>
                  </View>
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    value={bamVal}
                    onChangeText={(t) => calculate(t, 'BAM')}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor={theme.textSecondary}
                    onFocus={() => {
                      setActiveCurrency('BAM');
                      handleFocus('BAM');
                    }}
                    onBlur={() => setFocusedInputKey(null)}
                  />
                </TouchableOpacity>

                {/* TRY Card */}
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={[
                    styles.currencyCard,
                    { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
                    activeCurrency === 'TRY' && styles.activeCard,
                  ]}
                  onPress={() => setActiveCurrency('TRY')}
                  onLayout={(e) => {
                    const y = e.nativeEvent.layout.y;
                    setInputLayouts((prev) => ({ ...prev, TRY: y }));
                  }}
                >
                  <View style={styles.currencyMeta}>
                    <ThemedText style={styles.flag}>🇹🇷</ThemedText>
                    <View>
                      <ThemedText type="smallBold" style={{ color: theme.text }}>TRY</ThemedText>
                      <ThemedText type="small" style={{ color: theme.textSecondary }}>
                        Türk Lirası (₺)
                      </ThemedText>
                    </View>
                  </View>
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    value={tryVal}
                    onChangeText={(t) => calculate(t, 'TRY')}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor={theme.textSecondary}
                    onFocus={() => {
                      setActiveCurrency('TRY');
                      handleFocus('TRY');
                    }}
                    onBlur={() => setFocusedInputKey(null)}
                  />
                </TouchableOpacity>

                {/* EUR Card */}
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={[
                    styles.currencyCard,
                    { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
                    activeCurrency === 'EUR' && styles.activeCard,
                  ]}
                  onPress={() => setActiveCurrency('EUR')}
                  onLayout={(e) => {
                    const y = e.nativeEvent.layout.y;
                    setInputLayouts((prev) => ({ ...prev, EUR: y }));
                  }}
                >
                  <View style={styles.currencyMeta}>
                    <ThemedText style={styles.flag}>🇪🇺</ThemedText>
                    <View>
                      <ThemedText type="smallBold" style={{ color: theme.text }}>EUR</ThemedText>
                      <ThemedText type="small" style={{ color: theme.textSecondary }}>
                        Avro (€)
                      </ThemedText>
                    </View>
                  </View>
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    value={eurVal}
                    onChangeText={(t) => calculate(t, 'EUR')}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor={theme.textSecondary}
                    onFocus={() => {
                      setActiveCurrency('EUR');
                      handleFocus('EUR');
                    }}
                    onBlur={() => setFocusedInputKey(null)}
                  />
                </TouchableOpacity>
              </View>

              {/* Hızlı Ekleme Butonları */}
              <View style={styles.actionContainer}>
                <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.two }}>
                  Hızlı Miktar Ekle ({activeCurrency})
                </ThemedText>
                <View style={styles.presetRow}>
                  {presets[activeCurrency].map((amount) => (
                    <TouchableOpacity
                      key={amount}
                      style={[styles.presetButton, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}
                      onPress={() => addPreset(amount)}
                    >
                      <ThemedText type="smallBold" style={{ color: '#0D9488' }}>
                        +{amount}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Temizle Butonu */}
              <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
                <MaterialCommunityIcons name="delete-sweep" size={20} color="#EF4444" />
                <ThemedText type="smallBold" style={{ color: '#EF4444' }}>
                  Tümünü Temizle
                </ThemedText>
              </TouchableOpacity>

            </ScrollView>
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
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.four,
  },
  header: {
    alignItems: 'center',
    marginVertical: Spacing.two,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 18,
    marginBottom: Spacing.two,
  },
  brandTitle: {
    fontWeight: '800',
    color: '#0D9488', // Soft Turquoise
    letterSpacing: 2,
  },
  brandSubtitle: {
    color: '#10B981', // Soft Light Green
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: Spacing.half,
  },
  ratesCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    marginBottom: Spacing.four,
    borderWidth: 1.5,
    shadowColor: '#64748B',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
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
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderWidth: 1.5,
  },
  activeCard: {
    borderColor: '#0D9488', // Turquoise border
    shadowColor: '#0D9488',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  currencyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  flag: {
    fontSize: 32,
  },
  input: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'right',
    flex: 1,
    marginLeft: Spacing.three,
    paddingVertical: 5,
  },
  actionContainer: {
    marginBottom: Spacing.four,
  },
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  presetButton: {
    flex: 1,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2', // Soft Coral Red Background
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
  },
});

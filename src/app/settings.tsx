import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRates } from '@/hooks/use-rates';
import { useTheme } from '@/hooks/use-theme';
import { BottomTabInset, Spacing } from '@/constants/theme';

export default function SettingsScreen() {
  const { eurToTry, eurToBam, saveRates, resetRates } = useRates();
  const theme = useTheme();
  
  const [eurToTryInput, setEurToTryInput] = useState('');
  const [eurToBamInput, setEurToBamInput] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Scroll logic
  const scrollViewRef = useRef<ScrollView>(null);
  const [sectionY, setSectionY] = useState(0);

  const handleFocus = () => {
    if (sectionY > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, sectionY - 20),
          animated: true,
        });
      }, 100);
    }
  };

  // Kurlar değiştikçe inputları güncelle
  useEffect(() => {
    setEurToTryInput(eurToTry.toString());
    setEurToBamInput(eurToBam.toString());
  }, [eurToTry, eurToBam]);

  const handleSave = async () => {
    Keyboard.dismiss();
    
    const tryRate = parseFloat(eurToTryInput.replace(',', '.'));
    const bamRate = parseFloat(eurToBamInput.replace(',', '.'));

    if (isNaN(tryRate) || tryRate <= 0 || isNaN(bamRate) || bamRate <= 0) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      return;
    }

    const success = await saveRates(tryRate, bamRate);
    if (success) {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } else {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleReset = async () => {
    Keyboard.dismiss();
    const success = await resetRates();
    if (success) {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
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
              {/* Başlık */}
              <View style={styles.header}>
                <Image
                  source={require('@/assets/images/logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <ThemedText type="subtitle" style={styles.headerTitle}>
                  Ayarlar & Rehber
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.half }}>
                  Kur Oranları ve Seyahat Bilgileri
                </ThemedText>
              </View>

              {/* Kur Ayarları Bölümü */}
              <View
                style={styles.section}
                onLayout={(e) => setSectionY(e.nativeEvent.layout.y)}
              >
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="currency-usd-off" size={20} color="#D97706" />
                  <ThemedText type="smallBold" style={[styles.sectionTitle, { color: theme.text }]}>
                    Manuel Kur Ayarları
                  </ThemedText>
                </View>

                <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
                  <View style={styles.inputGroup}>
                    <ThemedText type="smallBold" style={{ color: theme.textSecondary, marginBottom: Spacing.one }}>
                      1 Avro (EUR) kaç TL?
                    </ThemedText>
                    <View style={[styles.inputWrapper, { backgroundColor: theme.background, borderColor: theme.backgroundSelected }]}>
                      <ThemedText style={styles.currencyPrefix}>₺</ThemedText>
                      <TextInput
                        style={[styles.textInput, { color: theme.text }]}
                        value={eurToTryInput}
                        onChangeText={setEurToTryInput}
                        keyboardType="numeric"
                        placeholder="Örn: 36.20"
                        placeholderTextColor={theme.textSecondary}
                        onFocus={handleFocus}
                      />
                    </View>
                  </View>

                  <View style={[styles.inputGroup, { marginTop: Spacing.three }]}>
                    <ThemedText type="smallBold" style={{ color: theme.textSecondary, marginBottom: Spacing.one }}>
                      1 Avro (EUR) kaç Bosna Markı (BAM)?
                    </ThemedText>
                    <View style={[styles.inputWrapper, { backgroundColor: theme.background, borderColor: theme.backgroundSelected }]}>
                      <ThemedText style={styles.currencyPrefix}>KM</ThemedText>
                      <TextInput
                        style={[styles.textInput, { color: theme.text }]}
                        value={eurToBamInput}
                        onChangeText={setEurToBamInput}
                        keyboardType="numeric"
                        placeholder="Örn: 1.95583"
                        placeholderTextColor={theme.textSecondary}
                        onFocus={handleFocus}
                      />
                    </View>
                    <ThemedText type="code" style={{ color: theme.textSecondary, fontSize: 11, marginTop: Spacing.one }}>
                      * Bosna Markı Euro'ya sabittir (1 EUR = 1.95583 BAM).
                    </ThemedText>
                  </View>

                  {/* Kaydet / Sıfırla Butonları */}
                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={[styles.resetButton, { backgroundColor: theme.background, borderColor: theme.backgroundSelected }]}
                      onPress={handleReset}
                    >
                      <ThemedText type="smallBold" style={{ color: theme.textSecondary }}>
                        Varsayılana Dön
                      </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={handleSave}
                    >
                      <ThemedText type="smallBold" style={styles.saveButtonText}>
                        Kurları Güncelle
                      </ThemedText>
                    </TouchableOpacity>
                  </View>

                  {saveStatus === 'success' && (
                    <View style={[styles.statusContainer, styles.statusSuccess]}>
                      <MaterialCommunityIcons name="check-circle" size={16} color="#10B981" />
                      <ThemedText type="smallBold" style={styles.successText}>
                        Kurlar başarıyla kaydedildi!
                      </ThemedText>
                    </View>
                  )}

                  {saveStatus === 'error' && (
                    <View style={[styles.statusContainer, styles.statusError]}>
                      <MaterialCommunityIcons name="alert-circle" size={16} color="#EF4444" />
                      <ThemedText type="smallBold" style={styles.errorText}>
                        Lütfen geçerli kur değerleri girin!
                      </ThemedText>
                    </View>
                  )}
                </View>
              </View>

              {/* Bosna Seyahat Notları */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="map-marker-outline" size={20} color="#10B981" />
                  <ThemedText type="smallBold" style={[styles.sectionTitle, { color: theme.text }]}>
                    Bosna-Hersek Seyahat Notları
                  </ThemedText>
                </View>

                <View style={[styles.infoCard, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="passport" size={20} color="#10B981" />
                    <View style={styles.infoTextContainer}>
                      <ThemedText type="smallBold" style={{ color: theme.text, marginBottom: Spacing.half }}>
                        Vize Durumu
                      </ThemedText>
                      <ThemedText type="small" style={{ color: theme.textSecondary, lineHeight: 18 }}>
                        Türk vatandaşları 180 gün içinde 90 günü aşmayan turistik seyahatlerinde vizeden muaftır. Girişte pasaportunuzun en az 3 ay geçerliliği olması önerilir.
                      </ThemedText>
                    </View>
                  </View>

                  <View style={[styles.infoRow, { marginTop: Spacing.three }]}>
                    <MaterialCommunityIcons name="cash" size={20} color="#10B981" />
                    <View style={styles.infoTextContainer}>
                      <ThemedText type="smallBold" style={{ color: theme.text, marginBottom: Spacing.half }}>
                        Para Birimi & Ödemeler
                      </ThemedText>
                      <ThemedText type="small" style={{ color: theme.textSecondary, lineHeight: 18 }}>
                        Bosna-Hersek Markı (BAM / KM) kullanılır. Euro ile kur oranı sabittir. Birçok dükkanda nakit Euro da kabul edilir fakat para üstü yerel para (KM) olarak verilebilir. Kredi kartı büyük yerlerde geçerlidir ancak küçük esnaflarda nakit KM taşımak şarttır.
                      </ThemedText>
                    </View>
                  </View>

                  <View style={[styles.infoRow, { marginTop: Spacing.three }]}>
                    <MaterialCommunityIcons name="comment-text-outline" size={20} color="#10B981" />
                    <View style={styles.infoTextContainer}>
                      <ThemedText type="smallBold" style={{ color: theme.text, marginBottom: Spacing.half }}>
                        Dil
                      </ThemedText>
                      <ThemedText type="small" style={{ color: theme.textSecondary, lineHeight: 18 }}>
                        Boşnakça, Hırvatça ve Sırpça resmi dillerdir. Turistik bölgelerde İngilizce yaygındır. Tarihi bağlardan dolayı Türkçe bilen kişilere de sıkça rastlayabilirsiniz.
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </View>

              {/* Acil Durum Numaraları */}
              <View style={[styles.section, { marginBottom: Spacing.four }]}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="phone-alert" size={20} color="#EF4444" />
                  <ThemedText type="smallBold" style={[styles.sectionTitle, { color: theme.text }]}>
                    Acil Durum Numaraları
                  </ThemedText>
                </View>

                <View style={[styles.infoCard, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}>
                  <View style={styles.emergencyRow}>
                    <View style={styles.emergencyItem}>
                      <MaterialCommunityIcons name="police-badge" size={24} color="#EF4444" />
                      <ThemedText type="smallBold" style={{ color: '#EF4444', fontSize: 12 }}>
                        Polis
                      </ThemedText>
                      <ThemedText type="subtitle" style={{ color: '#EF4444', fontWeight: 'bold' }}>
                        122
                      </ThemedText>
                    </View>

                    <View style={[styles.emergencyDivider, { backgroundColor: '#FCA5A5' }]} />

                    <View style={styles.emergencyItem}>
                      <MaterialCommunityIcons name="fire" size={24} color="#EF4444" />
                      <ThemedText type="smallBold" style={{ color: '#EF4444', fontSize: 12 }}>
                        İtfaiye
                      </ThemedText>
                      <ThemedText type="subtitle" style={{ color: '#EF4444', fontWeight: 'bold' }}>
                        123
                      </ThemedText>
                    </View>

                    <View style={[styles.emergencyDivider, { backgroundColor: '#FCA5A5' }]} />

                    <View style={styles.emergencyItem}>
                      <MaterialCommunityIcons name="ambulance" size={24} color="#EF4444" />
                      <ThemedText type="smallBold" style={{ color: '#EF4444', fontSize: 12 }}>
                        Ambulans
                      </ThemedText>
                      <ThemedText type="subtitle" style={{ color: '#EF4444', fontWeight: 'bold' }}>
                        124
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </View>

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
  headerTitle: {
    color: '#0D9488', // Soft Turquoise
    fontWeight: '800',
  },
  section: {
    marginTop: Spacing.four,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    borderWidth: 1.5,
    shadowColor: '#64748B',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  inputGroup: {
    alignSelf: 'stretch',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Spacing.two,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.three,
    height: 48,
  },
  currencyPrefix: {
    color: '#0D9488',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: Spacing.two,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.four,
    gap: Spacing.three,
  },
  resetButton: {
    flex: 1,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#0D9488',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    marginTop: Spacing.three,
    borderWidth: 1.5,
  },
  statusSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  successText: {
    color: '#065F46',
    fontSize: 12,
  },
  statusError: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  errorText: {
    color: '#991B1B',
    fontSize: 12,
  },
  infoCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    borderWidth: 1.5,
    shadowColor: '#64748B',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  infoRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  infoTextContainer: {
    flex: 1,
  },
  emergencyCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    borderWidth: 1.5,
  },
  emergencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.one,
  },
  emergencyItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
  },
  emergencyDivider: {
    width: 1,
    height: 48,
  },
});

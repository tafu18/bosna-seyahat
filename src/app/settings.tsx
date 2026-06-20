import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRates } from '@/hooks/use-rates';
import { BottomTabInset, Spacing } from '@/constants/theme';

export default function SettingsScreen() {
  const { eurToTry, eurToBam, saveRates, resetRates } = useRates();
  
  const [eurToTryInput, setEurToTryInput] = useState('');
  const [eurToBamInput, setEurToBamInput] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Kurlar değiştikçe inputları güncelle
  useEffect(() => {
    setEurToTryInput(eurToTry.toString());
    setEurToBamInput(eurToBam.toString());
  }, [eurToTry, eurToBam]);

  const handleSave = async () => {
    Keyboard.dismiss();
    
    // Virgülleri noktaya çevirip parse et
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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ThemedView style={styles.container}>
          <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Başlık */}
              <View style={styles.header}>
                <ThemedText type="subtitle" style={styles.headerTitle}>
                  Ayarlar & Rehber
                </ThemedText>
                <ThemedText type="small" style={styles.headerSubtitle}>
                  Kur Oranları ve Seyahat Bilgileri
                </ThemedText>
              </View>

              {/* Kur Ayarları Bölümü */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="currency-usd-off" size={20} color="#FFD700" />
                  <ThemedText type="smallBold" style={styles.sectionTitle}>
                    Manuel Kur Ayarları
                  </ThemedText>
                </View>

                <ThemedView type="backgroundElement" style={styles.card}>
                  <View style={styles.inputGroup}>
                    <ThemedText type="smallBold" style={styles.inputLabel}>
                      1 Avro (EUR) kaç TL?
                    </ThemedText>
                    <View style={styles.inputWrapper}>
                      <ThemedText style={styles.currencyPrefix}>₺</ThemedText>
                      <TextInput
                        style={styles.textInput}
                        value={eurToTryInput}
                        onChangeText={setEurToTryInput}
                        keyboardType="numeric"
                        placeholder="Örn: 36.20"
                        placeholderTextColor="#475569"
                      />
                    </View>
                  </View>

                  <View style={[styles.inputGroup, { marginTop: Spacing.three }]}>
                    <ThemedText type="smallBold" style={styles.inputLabel}>
                      1 Avro (EUR) kaç Bosna Markı (BAM)?
                    </ThemedText>
                    <View style={styles.inputWrapper}>
                      <ThemedText style={styles.currencyPrefix}>KM</ThemedText>
                      <TextInput
                        style={styles.textInput}
                        value={eurToBamInput}
                        onChangeText={setEurToBamInput}
                        keyboardType="numeric"
                        placeholder="Örn: 1.95583"
                        placeholderTextColor="#475569"
                      />
                    </View>
                    <ThemedText type="code" style={styles.helperText}>
                      * Bosna Markı Euro'ya sabittir (1 EUR = 1.95583 BAM).
                    </ThemedText>
                  </View>

                  {/* Kaydet / Sıfırla Butonları */}
                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={styles.resetButton}
                      onPress={handleReset}
                    >
                      <ThemedText type="smallBold" style={styles.resetButtonText}>
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
                </ThemedView>
              </View>

              {/* Bosna Seyahat Notları */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="map-marker-outline" size={20} color="#10B981" />
                  <ThemedText type="smallBold" style={styles.sectionTitle}>
                    Bosna-Hersek Seyahat Notları
                  </ThemedText>
                </View>

                <ThemedView type="backgroundElement" style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="passport" size={20} color="#10B981" />
                    <View style={styles.infoTextContainer}>
                      <ThemedText type="smallBold" style={styles.infoTitle}>
                        Vize Durumu
                      </ThemedText>
                      <ThemedText type="small" style={styles.infoDesc}>
                        Türk vatandaşları 180 gün içinde 90 günü aşmayan turistik seyahatlerinde vizeden muaftır. Girişte pasaportunuzun en az 3 ay geçerliliği olması önerilir.
                      </ThemedText>
                    </View>
                  </View>

                  <View style={[styles.infoRow, { marginTop: Spacing.three }]}>
                    <MaterialCommunityIcons name="cash" size={20} color="#10B981" />
                    <View style={styles.infoTextContainer}>
                      <ThemedText type="smallBold" style={styles.infoTitle}>
                        Para Birimi & Ödemeler
                      </ThemedText>
                      <ThemedText type="small" style={styles.infoDesc}>
                        Bosna-Hersek Markı (BAM / KM) kullanılır. Euro ile kur oranı sabittir. Birçok dükkanda nakit Euro da kabul edilir fakat para üstü yerel para (KM) olarak verilebilir. Kredi kartı büyük yerlerde geçerlidir ancak küçük esnaflarda nakit KM taşımak şarttır.
                      </ThemedText>
                    </View>
                  </View>

                  <View style={[styles.infoRow, { marginTop: Spacing.three }]}>
                    <MaterialCommunityIcons name="comment-text-outline" size={20} color="#10B981" />
                    <View style={styles.infoTextContainer}>
                      <ThemedText type="smallBold" style={styles.infoTitle}>
                        Dil
                      </ThemedText>
                      <ThemedText type="small" style={styles.infoDesc}>
                        Boşnakça, Hırvatça ve Sırpça resmi dillerdir. Turistik bölgelerde İngilizce yaygındır. Tarihi bağlardan dolayı Türkçe bilen kişilere de sıkça rastlayabilirsiniz.
                      </ThemedText>
                    </View>
                  </View>
                </ThemedView>
              </View>

              {/* Acil Durum Numaraları */}
              <View style={[styles.section, { marginBottom: Spacing.four }]}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="phone-alert" size={20} color="#EF4444" />
                  <ThemedText type="smallBold" style={styles.sectionTitle}>
                    Acil Durum Numaraları
                  </ThemedText>
                </View>

                <ThemedView type="backgroundElement" style={styles.infoCard}>
                  <View style={styles.emergencyRow}>
                    <View style={styles.emergencyItem}>
                      <MaterialCommunityIcons name="police-badge" size={24} color="#EF4444" />
                      <ThemedText type="smallBold" style={styles.emergencyLabel}>
                        Polis
                      </ThemedText>
                      <ThemedText type="subtitle" style={styles.emergencyNumber}>
                        122
                      </ThemedText>
                    </View>

                    <View style={styles.emergencyDivider} />

                    <View style={styles.emergencyItem}>
                      <MaterialCommunityIcons name="fire" size={24} color="#EF4444" />
                      <ThemedText type="smallBold" style={styles.emergencyLabel}>
                        İtfaiye
                      </ThemedText>
                      <ThemedText type="subtitle" style={styles.emergencyNumber}>
                        123
                      </ThemedText>
                    </View>

                    <View style={styles.emergencyDivider} />

                    <View style={styles.emergencyItem}>
                      <MaterialCommunityIcons name="ambulance" size={24} color="#EF4444" />
                      <ThemedText type="smallBold" style={styles.emergencyLabel}>
                        Ambulans
                      </ThemedText>
                      <ThemedText type="subtitle" style={styles.emergencyNumber}>
                        124
                      </ThemedText>
                    </View>
                  </View>
                </ThemedView>
              </View>

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
  headerTitle: {
    color: '#FFD700',
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#94A3B8',
    marginTop: Spacing.half,
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
    color: '#F8FAFC',
  },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: '#2E3135',
  },
  inputGroup: {
    alignSelf: 'stretch',
  },
  inputLabel: {
    color: '#94A3B8',
    marginBottom: Spacing.one,
    fontSize: 13,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: Spacing.three,
    height: 48,
  },
  currencyPrefix: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: Spacing.two,
  },
  textInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 16,
    height: '100%',
  },
  helperText: {
    color: '#64748B',
    fontSize: 11,
    marginTop: Spacing.one,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.four,
    gap: Spacing.two,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  resetButtonText: {
    color: '#94A3B8',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#FFD700',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#0F172A',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    marginTop: Spacing.three,
    borderWidth: 1,
  },
  statusSuccess: {
    backgroundColor: '#064E3B',
    borderColor: '#065F46',
  },
  successText: {
    color: '#10B981',
    fontSize: 12,
  },
  statusError: {
    backgroundColor: '#7F1D1D',
    borderColor: '#991B1B',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
  },
  infoCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: '#2E3135',
  },
  infoRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    color: '#F8FAFC',
    marginBottom: Spacing.half,
  },
  infoDesc: {
    color: '#94A3B8',
    lineHeight: 18,
    fontSize: 13,
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
  emergencyLabel: {
    color: '#94A3B8',
    fontSize: 12,
  },
  emergencyNumber: {
    color: '#EF4444',
    fontWeight: 'bold',
  },
  emergencyDivider: {
    width: 1,
    height: 48,
    backgroundColor: '#334155',
  },
});

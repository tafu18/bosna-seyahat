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
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PLANNERS, Planner, ItineraryDay, Activity } from '@/constants/plannerData';
import { useTheme } from '@/hooks/use-theme';
import { BottomTabInset, Spacing } from '@/constants/theme';

const STORAGE_KEY = 'BOSNA_REHBERI_PLANNER_DATA';

export default function PlannerScreen() {
  const theme = useTheme();
  const [planner, setPlanner] = useState<Planner | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  
  // Yeni aktivite form durumları
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newMobility, setNewMobility] = useState('');

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

  // Veriyi Yükleme
  const loadPlannerData = async () => {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedData) {
        setPlanner(JSON.parse(storedData));
      } else {
        // Varsayılan veriyi ilk kez yükleme
        const defaultData = PLANNERS[0];
        setPlanner(defaultData);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
      }
    } catch (e) {
      console.error('Planner data load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlannerData();
  }, []);

  // Değişiklikleri AsyncStorage'a Kaydetme
  const savePlanner = async (updatedPlanner: Planner) => {
    try {
      setPlanner(updatedPlanner);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlanner));
    } catch (e) {
      console.error('Planner data save error:', e);
    }
  };

  // Aktivite Tamamlandı / Tamamlanmadı Değişimi (Tik Atma)
  const toggleActivityComplete = (dayIndex: number, activityId: string) => {
    if (!planner) return;

    const updatedItinerary = [...planner.trip.itinerary];
    const day = updatedItinerary[dayIndex];
    
    day.activities = day.activities.map((act) => {
      if (act.id === activityId) {
        return { ...act, completed: !act.completed };
      }
      return act;
    });

    savePlanner({
      ...planner,
      trip: {
        ...planner.trip,
        itinerary: updatedItinerary,
      },
    });
  };

  // Aktivite Silme
  const deleteActivity = (dayIndex: number, activityId: string) => {
    if (!planner) return;

    const updatedItinerary = [...planner.trip.itinerary];
    const day = updatedItinerary[dayIndex];

    day.activities = day.activities.filter((act) => act.id !== activityId);

    savePlanner({
      ...planner,
      trip: {
        ...planner.trip,
        itinerary: updatedItinerary,
      },
    });
  };

  // Yeni Aktivite Ekleme
  const handleAddActivity = () => {
    if (!planner) return;
    if (!newTitle.trim() || !newStartTime.trim()) {
      Alert.alert('Hata', 'Lütfen en azından Başlık ve Başlangıç Saati alanlarını doldurun.');
      return;
    }

    const updatedItinerary = [...planner.trip.itinerary];
    const day = updatedItinerary[selectedDayIndex];

    const newAct: Activity = {
      id: `custom_${Date.now()}`,
      title: newTitle.trim(),
      startTime: newStartTime.trim(),
      endTime: newEndTime.trim() || newStartTime.trim(),
      description: newDesc.trim(),
      location: {
        province: 'Saraybosna',
        city: newCity.trim() || 'Merkez',
      },
      mobilityNote: newMobility.trim() || 'Puset uygun',
      completed: false,
    };

    // Yeni aktiviteyi ekle ve saat sırasına göre sırala
    day.activities.push(newAct);
    day.activities.sort((a, b) => a.startTime.localeCompare(b.startTime));

    savePlanner({
      ...planner,
      trip: {
        ...planner.trip,
        itinerary: updatedItinerary,
      },
    });

    // Formu temizle ve kapat
    setNewTitle('');
    setNewStartTime('');
    setNewEndTime('');
    setNewDesc('');
    setNewCity('');
    setNewMobility('');
    setModalVisible(false);
  };

  // Planı Varsayılana Sıfırlama
  const resetToDefault = () => {
    Alert.alert(
      'Planı Sıfırla',
      'Yolculuk planını ilk haline döndürmek istediğinize emin misiniz? Yaptığınız tüm değişiklikler silinecektir.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sıfırla',
          style: 'destructive',
          onPress: async () => {
            const defaultData = PLANNERS[0];
            setPlanner(defaultData);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
          },
        },
      ]
    );
  };

  if (loading || !planner) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0D9488" />
        <ThemedText style={{ marginTop: Spacing.two }}>Plan yükleniyor...</ThemedText>
      </ThemedView>
    );
  }

  const activeDay = planner.trip.itinerary[selectedDayIndex];

  return (
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
                Yolculuk Planı
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Günlük Seyahat Zaman Akışı
              </ThemedText>
            </View>
            <TouchableOpacity style={styles.resetButton} onPress={resetToDefault}>
              <MaterialCommunityIcons name="restore" size={22} color="#0D9488" />
              <ThemedText type="code" style={styles.resetText}>Sıfırla</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Gün Seçim Çubuğu (Chips) */}
        <View style={styles.daySelectorWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.daySelectorContainer}
            keyboardShouldPersistTaps="handled"
          >
            {planner.trip.itinerary.map((day, index) => {
              const isSelected = selectedDayIndex === index;
              return (
                <TouchableOpacity
                  key={day.day}
                  style={[
                    styles.dayChip,
                    { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
                    isSelected && styles.dayChipActive,
                  ]}
                  onPress={() => setSelectedDayIndex(index)}
                >
                  <ThemedText
                    type="smallBold"
                    style={[
                      styles.dayChipText,
                      { color: theme.textSecondary },
                      isSelected && styles.dayChipTextActive,
                    ]}
                  >
                    {day.day}. Gün
                  </ThemedText>
                  <ThemedText
                    type="code"
                    style={[
                      styles.dayChipSub,
                      { color: theme.textSecondary },
                      isSelected && styles.dayChipSubActive,
                    ]}
                  >
                    {day.date.split('-')[2]}/{day.date.split('-')[1]}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Günün Başlığı */}
        <View style={styles.dayHeader}>
          <MaterialCommunityIcons name="calendar-star" size={20} color="#0D9488" />
          <ThemedText type="smallBold" style={{ color: theme.text, flex: 1 }}>
            {activeDay.title}
          </ThemedText>
        </View>

        {/* Zaman Akışı Listesi */}
        <FlatList
          data={activeDay.activities}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          renderItem={({ item }: { item: Activity }) => {
            const isCompleted = item.completed;
            const isStroller = item.mobilityNote.toLowerCase().includes('puset');
            const isCarrier = item.mobilityNote.toLowerCase().includes('kanguru');

            return (
              <View style={[styles.timelineItemWrapper]}>
                
                {/* Sol Zaman Çizgisi Sütunu */}
                <View style={styles.timeLineCol}>
                  <ThemedText type="code" style={[styles.timeText, isCompleted && styles.completedTextLine]}>
                    {item.startTime}
                  </ThemedText>
                  <View style={[styles.timelineDot, { backgroundColor: isCompleted ? '#10B981' : '#0D9488' }]} />
                  <View style={[styles.timelineLine, { backgroundColor: theme.backgroundSelected }]} />
                </View>

                {/* Sağ Kart Sütunu */}
                <View
                  style={[
                    styles.activityCard,
                    {
                      backgroundColor: theme.backgroundElement,
                      borderColor: isCompleted ? '#A7F3D0' : theme.backgroundSelected,
                    },
                    isCompleted && styles.completedCard,
                  ]}
                >
                  <View style={styles.cardHeader}>
                    {/* Tik Atma Kutusu */}
                    <TouchableOpacity
                      style={styles.checkbox}
                      onPress={() => toggleActivityComplete(selectedDayIndex, item.id)}
                    >
                      <MaterialCommunityIcons
                        name={isCompleted ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                        size={22}
                        color={isCompleted ? '#10B981' : '#64748B'}
                      />
                    </TouchableOpacity>

                    <View style={styles.titleContainer}>
                      <ThemedText
                        type="smallBold"
                        style={[
                          styles.activityTitle,
                          { color: theme.text },
                          isCompleted && styles.completedTextLine,
                        ]}
                      >
                        {item.title}
                      </ThemedText>
                      <ThemedText type="code" style={styles.activityTime}>
                        {item.startTime} - {item.endTime}
                      </ThemedText>
                    </View>

                    {/* Silme Butonu */}
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteActivity(selectedDayIndex, item.id)}
                    >
                      <MaterialCommunityIcons name="trash-can-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>

                  <ThemedText type="small" style={[styles.activityDesc, { color: theme.textSecondary }]}>
                    {item.description}
                  </ThemedText>

                  <View style={styles.cardFooter}>
                    <View style={styles.locationBadge}>
                      <MaterialCommunityIcons name="map-marker" size={12} color="#0D9488" />
                      <ThemedText type="code" style={styles.footerBadgeText}>
                        {item.location.city}
                      </ThemedText>
                    </View>

                    {/* Bebek İhtiyaç İkonları */}
                    {(isStroller || isCarrier) && (
                      <View style={[styles.babyBadge, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                        <MaterialCommunityIcons
                          name={isStroller ? 'baby-carriage' : 'baby'}
                          size={12}
                          color="#10B981"
                        />
                        <ThemedText type="code" style={[styles.footerBadgeText, { color: '#065F46' }]}>
                          {item.mobilityNote}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="clipboard-text-play-outline" size={48} color={theme.textSecondary} />
              <ThemedText style={{ color: theme.textSecondary, textAlign: 'center', marginTop: Spacing.two }}>
                Bu gün için henüz bir etkinlik eklenmemiş. Aşağıdaki butondan yeni bir yer ekleyebilirsiniz!
              </ThemedText>
            </View>
          }
          ListFooterComponent={
            <TouchableOpacity
              style={[styles.addActivityButton, { borderColor: '#0D9488' }]}
              onPress={() => setModalVisible(true)}
            >
              <MaterialCommunityIcons name="plus-circle-outline" size={20} color="#0D9488" />
              <ThemedText type="smallBold" style={{ color: '#0D9488' }}>
                Yeni Aktivite / Yer Ekle
              </ThemedText>
            </TouchableOpacity>
          }
        />

        {/* Aktivite Ekleme Modalı */}
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
                  <ThemedText type="smallBold" style={{ fontSize: 16 }}>Yeni Aktivite Ekle</ThemedText>
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
                  {/* Başlık */}
                  <View
                    style={styles.formGroup}
                    onLayout={(e) => {
                      const y = e.nativeEvent.layout.y;
                      setModalInputLayouts((prev) => ({ ...prev, title: y }));
                    }}
                  >
                    <ThemedText type="code" style={styles.formLabel}>Aktivite / Yer Başlığı *</ThemedText>
                    <TextInput
                      style={[styles.formInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
                      placeholder="Örn: Gazi Hüsrev Bey Kütüphanesi"
                      placeholderTextColor={theme.textSecondary}
                      value={newTitle}
                      onChangeText={setNewTitle}
                      onFocus={() => scrollToModalInput('title')}
                    />
                  </View>

                  {/* Saatler */}
                  <View
                    style={styles.formRow}
                    onLayout={(e) => {
                      const y = e.nativeEvent.layout.y;
                      setModalInputLayouts((prev) => ({ ...prev, time: y }));
                    }}
                  >
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <ThemedText type="code" style={styles.formLabel}>Başlangıç Saati *</ThemedText>
                      <TextInput
                        style={[styles.formInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
                        placeholder="Örn: 10:30"
                        placeholderTextColor={theme.textSecondary}
                        value={newStartTime}
                        onChangeText={setNewStartTime}
                        onFocus={() => scrollToModalInput('time')}
                      />
                    </View>
                    <View style={[styles.formGroup, { flex: 1, marginLeft: Spacing.two }]}>
                      <ThemedText type="code" style={styles.formLabel}>Bitiş Saati</ThemedText>
                      <TextInput
                        style={[styles.formInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
                        placeholder="Örn: 11:30"
                        placeholderTextColor={theme.textSecondary}
                        value={newEndTime}
                        onChangeText={setNewEndTime}
                        onFocus={() => scrollToModalInput('time')}
                      />
                    </View>
                  </View>

                  {/* Konum */}
                  <View
                    style={styles.formGroup}
                    onLayout={(e) => {
                      const y = e.nativeEvent.layout.y;
                      setModalInputLayouts((prev) => ({ ...prev, city: y }));
                    }}
                  >
                    <ThemedText type="code" style={styles.formLabel}>Şehir / Bölge</ThemedText>
                    <TextInput
                      style={[styles.formInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
                      placeholder="Örn: Başçarşı"
                      placeholderTextColor={theme.textSecondary}
                      value={newCity}
                      onChangeText={setNewCity}
                      onFocus={() => scrollToModalInput('city')}
                    />
                  </View>

                  {/* Bebek Durumu */}
                  <View
                    style={styles.formGroup}
                    onLayout={(e) => {
                      const y = e.nativeEvent.layout.y;
                      setModalInputLayouts((prev) => ({ ...prev, mobility: y }));
                    }}
                  >
                    <ThemedText type="code" style={styles.formLabel}>Bebek Durumu (Puset / Kanguru)</ThemedText>
                    <TextInput
                      style={[styles.formInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
                      placeholder="Örn: Puset uygun veya Kanguru zorunlu"
                      placeholderTextColor={theme.textSecondary}
                      value={newMobility}
                      onChangeText={setNewMobility}
                      onFocus={() => scrollToModalInput('mobility')}
                    />
                  </View>

                  {/* Açıklama */}
                  <View
                    style={styles.formGroup}
                    onLayout={(e) => {
                      const y = e.nativeEvent.layout.y;
                      setModalInputLayouts((prev) => ({ ...prev, desc: y }));
                    }}
                  >
                    <ThemedText type="code" style={styles.formLabel}>Açıklama</ThemedText>
                    <TextInput
                      style={[
                        styles.formInput,
                        styles.formInputArea,
                        { color: theme.text, borderColor: theme.backgroundSelected },
                      ]}
                      placeholder="Gezilecek yer detayları veya notlar..."
                      placeholderTextColor={theme.textSecondary}
                      multiline
                      numberOfLines={3}
                      value={newDesc}
                      onChangeText={setNewDesc}
                      onFocus={() => scrollToModalInput('desc')}
                    />
                  </View>

                  {/* Ekle Butonu */}
                  <TouchableOpacity style={styles.submitButton} onPress={handleAddActivity}>
                    <ThemedText type="smallBold" style={{ color: '#fff' }}>Aktiviteyi Plana Ekle</ThemedText>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Modal>

      </SafeAreaView>
    </ThemedView>
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
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.one,
    backgroundColor: '#E6F4EA',
    gap: Spacing.half,
  },
  resetText: {
    color: '#0D9488',
    fontWeight: 'bold',
  },
  daySelectorWrapper: {
    marginBottom: Spacing.two,
  },
  daySelectorContainer: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  dayChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
    borderWidth: 1.5,
    alignItems: 'center',
    minWidth: 70,
  },
  dayChipActive: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  dayChipText: {
    fontSize: 13,
  },
  dayChipTextActive: {
    color: '#FFFFFF',
  },
  dayChipSub: {
    fontSize: 10,
    marginTop: 2,
  },
  dayChipSubActive: {
    color: '#CCFBF1',
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4EA',
    marginHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
  },
  timelineItemWrapper: {
    flexDirection: 'row',
    minHeight: 110,
  },
  timeLineCol: {
    width: 60,
    alignItems: 'center',
    paddingTop: Spacing.two,
  },
  timeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0D9488',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginVertical: Spacing.one,
    zIndex: 2,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    marginVertical: -5,
  },
  activityCard: {
    flex: 1,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    borderWidth: 1.5,
    marginBottom: Spacing.three,
    shadowColor: '#64748B',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  completedCard: {
    opacity: 0.6,
    backgroundColor: '#F3F4F6',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    marginBottom: Spacing.one,
  },
  checkbox: {
    paddingTop: 2,
  },
  titleContainer: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
  },
  activityTime: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  completedTextLine: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  deleteButton: {
    padding: Spacing.half,
  },
  activityDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.two,
    marginLeft: Spacing.four + Spacing.two,
  },
  cardFooter: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: Spacing.one,
    marginLeft: Spacing.four + Spacing.two,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFEFF',
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Spacing.one,
    borderWidth: 0.5,
    borderColor: '#A5F3FC',
    gap: 4,
  },
  babyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Spacing.one,
    borderWidth: 0.5,
    gap: 4,
  },
  footerBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0F766E',
  },
  addActivityButton: {
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
  formInputArea: {
    height: 80,
    paddingTop: Spacing.two,
    textAlignVertical: 'top',
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

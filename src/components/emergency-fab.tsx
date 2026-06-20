import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Animated,
  Linking,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from './themed-text';
import { Spacing } from '@/constants/theme';

export default function EmergencyFAB() {
  const [open, setOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    Keyboard.dismiss();
    const toValue = open ? 0 : 1;

    Animated.spring(animation, {
      toValue,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();

    setOpen(!open);
  };

  const makeCall = (number: string) => {
    const url = `tel:${number}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          console.warn(`Calling not supported on this platform for url: ${url}`);
        }
      })
      .catch((err) => console.error('An error occurred', err));
  };

  // Alt butonların animasyon haritaları
  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const scale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  // Animasyonla yukarı kayma mesafeleri
  const getTranslateY = (index: number) => {
    return animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -index * 60], // Her buton 60px yukarı kayar
    });
  };

  // Ana buton rotasyonu (artı veya çarpı işareti gibi dönme efekti)
  const rotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '135deg'],
  });

  const animatedStyles = (index: number) => ({
    opacity,
    transform: [
      { scale },
      { translateY: getTranslateY(index) },
    ],
  });

  const mainButtonRotationStyle = {
    transform: [{ rotate: rotation }],
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Arka plan karartması (Menü açıkken tıklanırsa kapatır) */}
      {open && (
        <TouchableWithoutFeedback onPress={toggleMenu}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}

      {/* Ambulans (En üst) */}
      <Animated.View style={[styles.subButtonRow, animatedStyles(3)]}>
        <View style={[styles.labelContainer, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}>
          <ThemedText style={[styles.labelText, { color: '#991B1B' }]}>Ambulans (124)</ThemedText>
        </View>
        <TouchableOpacity
          style={[styles.subButton, { backgroundColor: '#EF4444' }]}
          onPress={() => {
            makeCall('124');
            toggleMenu();
          }}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="ambulance" size={20} color="#FFF" />
        </TouchableOpacity>
      </Animated.View>

      {/* İtfaiye (Orta) */}
      <Animated.View style={[styles.subButtonRow, animatedStyles(2)]}>
        <View style={[styles.labelContainer, { backgroundColor: '#FFEDD5', borderColor: '#FDBA74' }]}>
          <ThemedText style={[styles.labelText, { color: '#C2410C' }]}>İtfaiye (123)</ThemedText>
        </View>
        <TouchableOpacity
          style={[styles.subButton, { backgroundColor: '#F97316' }]}
          onPress={() => {
            makeCall('123');
            toggleMenu();
          }}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="fire" size={20} color="#FFF" />
        </TouchableOpacity>
      </Animated.View>

      {/* Polis (En alt) */}
      <Animated.View style={[styles.subButtonRow, animatedStyles(1)]}>
        <View style={[styles.labelContainer, { backgroundColor: '#DBEAFE', borderColor: '#93C5FD' }]}>
          <ThemedText style={[styles.labelText, { color: '#1E40AF' }]}>Polis (122)</ThemedText>
        </View>
        <TouchableOpacity
          style={[styles.subButton, { backgroundColor: '#3B82F6' }]}
          onPress={() => {
            makeCall('122');
            toggleMenu();
          }}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="police-badge" size={20} color="#FFF" />
        </TouchableOpacity>
      </Animated.View>

      {/* Ana FAB Butonu */}
      <TouchableOpacity
        style={[styles.mainButton, open && styles.mainButtonActive]}
        onPress={toggleMenu}
        activeOpacity={0.9}
      >
        <Animated.View style={mainButtonRotationStyle}>
          <MaterialCommunityIcons name={open ? 'close' : 'phone-alert'} size={24} color="#FFF" />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    bottom: 85, // Sekme çubuğunun hemen üzerinde durur
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    zIndex: 9999,
  },
  overlay: {
    position: 'absolute',
    right: -100,
    bottom: -100,
    width: 2000,
    height: 2000,
    backgroundColor: 'rgba(0,0,0,0.15)',
    zIndex: -1,
  },
  mainButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  mainButtonActive: {
    backgroundColor: '#374151', // Kapatıldığında gri olur
    shadowColor: '#374151',
  },
  subButtonRow: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    right: 6,
    bottom: 6,
    zIndex: -1,
    width: 250, // Etiket yazılarının tek satırda düzgün görünmesi için genişletildi
  },
  subButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  labelContainer: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.one,
    marginRight: Spacing.two,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  labelText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

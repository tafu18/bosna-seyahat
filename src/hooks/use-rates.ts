import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const DEFAULT_EUR_TO_TRY = 53.24;
export const DEFAULT_EUR_TO_BAM = 1.96;

const STORAGE_KEYS = {
  EUR_TO_TRY: 'BOSNA_REHBERI_EUR_TO_TRY_V2',
  EUR_TO_BAM: 'BOSNA_REHBERI_EUR_TO_BAM_V2',
};

export function useRates() {
  const [eurToTry, setEurToTryState] = useState<number>(DEFAULT_EUR_TO_TRY);
  const [eurToBam, setEurToBamState] = useState<number>(DEFAULT_EUR_TO_BAM);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadRates() {
      try {
        const storedEurToTry = await AsyncStorage.getItem(STORAGE_KEYS.EUR_TO_TRY);
        const storedEurToBam = await AsyncStorage.getItem(STORAGE_KEYS.EUR_TO_BAM);

        if (storedEurToTry !== null) {
          setEurToTryState(parseFloat(storedEurToTry));
        }
        if (storedEurToBam !== null) {
          setEurToBamState(parseFloat(storedEurToBam));
        }
      } catch (error) {
        console.error('Error loading exchange rates:', error);
      } finally {
        setLoading(false);
      }
    }
    loadRates();
  }, []);

  const saveRates = async (newEurToTry: number, newEurToBam: number) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.EUR_TO_TRY, newEurToTry.toString());
      await AsyncStorage.setItem(STORAGE_KEYS.EUR_TO_BAM, newEurToBam.toString());
      setEurToTryState(newEurToTry);
      setEurToBamState(newEurToBam);
      return true;
    } catch (error) {
      console.error('Error saving exchange rates:', error);
      return false;
    }
  };

  const refresh = async () => {
    try {
      const storedEurToTry = await AsyncStorage.getItem(STORAGE_KEYS.EUR_TO_TRY);
      const storedEurToBam = await AsyncStorage.getItem(STORAGE_KEYS.EUR_TO_BAM);
      if (storedEurToTry !== null) {
        setEurToTryState(parseFloat(storedEurToTry));
      } else {
        setEurToTryState(DEFAULT_EUR_TO_TRY);
      }
      if (storedEurToBam !== null) {
        setEurToBamState(parseFloat(storedEurToBam));
      } else {
        setEurToBamState(DEFAULT_EUR_TO_BAM);
      }
    } catch (error) {
      console.error('Error refreshing rates:', error);
    }
  };

  const resetRates = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.EUR_TO_TRY);
      await AsyncStorage.removeItem(STORAGE_KEYS.EUR_TO_BAM);
      setEurToTryState(DEFAULT_EUR_TO_TRY);
      setEurToBamState(DEFAULT_EUR_TO_BAM);
      return true;
    } catch (error) {
      console.error('Error resetting exchange rates:', error);
      return false;
    }
  };

  return {
    eurToTry,
    eurToBam,
    loading,
    saveRates,
    resetRates,
    refresh,
  };
}

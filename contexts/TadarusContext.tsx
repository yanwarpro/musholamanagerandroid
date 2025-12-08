import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { DailyTadarusEntry, TadarusProgress } from '@/types';

interface TadarusContextType {
  progress: TadarusProgress;
  addDailyEntry: (ramadanDay: number, maleJuz: number, femaleJuz: number, enteredBy: string) => void;
  updateDailyEntry: (ramadanDay: number, maleJuz: number, femaleJuz: number) => void;
  getDailyEntry: (ramadanDay: number) => DailyTadarusEntry | undefined;
  getChartData: () => { day: number; male: number; female: number; total: number }[];
}

const TadarusContext = createContext<TadarusContextType | undefined>(undefined);

// Ramadan 1446 H dimulai sekitar 1 Maret 2025
const RAMADAN_START_DATE = new Date(2025, 2, 1); // 1 Maret 2025

const generateInitialEntries = (): DailyTadarusEntry[] => {
  const entries: DailyTadarusEntry[] = [];
  // Generate 30 days of Ramadan with empty data
  for (let i = 1; i <= 30; i++) {
    const date = new Date(RAMADAN_START_DATE);
    date.setDate(date.getDate() + i - 1);
    entries.push({
      id: i.toString(),
      ramadanDay: i,
      date,
      maleJuzRead: 0,
      femaleJuzRead: 0,
      totalJuzRead: 0,
      enteredBy: '',
      createdAt: new Date(),
    });
  }
  return entries;
};

export function TadarusProvider({ children }: { children: ReactNode }) {
  const [dailyEntries, setDailyEntries] = useState<DailyTadarusEntry[]>(generateInitialEntries());

  const progress = useMemo<TadarusProgress>(() => {
    const totalMaleJuz = dailyEntries.reduce((sum, entry) => sum + entry.maleJuzRead, 0);
    const totalFemaleJuz = dailyEntries.reduce((sum, entry) => sum + entry.femaleJuzRead, 0);
    const totalJuz = totalMaleJuz + totalFemaleJuz;
    // Khatam dihitung per jamaah (laki-laki dan wanita terpisah)
    const maleKhatamCount = Math.floor(totalMaleJuz / 30);
    const femaleKhatamCount = Math.floor(totalFemaleJuz / 30);

    return {
      year: 2025,
      ramadanStartDate: RAMADAN_START_DATE,
      dailyEntries,
      totalMaleJuz,
      totalFemaleJuz,
      totalJuz,
      khatamCount: 0, // Tidak digunakan lagi
      maleKhatamCount,
      femaleKhatamCount,
    };
  }, [dailyEntries]);

  const addDailyEntry = (ramadanDay: number, maleJuz: number, femaleJuz: number, enteredBy: string) => {
    setDailyEntries((prev) =>
      prev.map((entry) => {
        if (entry.ramadanDay === ramadanDay) {
          return {
            ...entry,
            maleJuzRead: entry.maleJuzRead + maleJuz,
            femaleJuzRead: entry.femaleJuzRead + femaleJuz,
            totalJuzRead: entry.maleJuzRead + maleJuz + entry.femaleJuzRead + femaleJuz,
            enteredBy,
            createdAt: new Date(),
          };
        }
        return entry;
      })
    );
  };

  const updateDailyEntry = (ramadanDay: number, maleJuz: number, femaleJuz: number) => {
    setDailyEntries((prev) =>
      prev.map((entry) => {
        if (entry.ramadanDay === ramadanDay) {
          return {
            ...entry,
            maleJuzRead: maleJuz,
            femaleJuzRead: femaleJuz,
            totalJuzRead: maleJuz + femaleJuz,
          };
        }
        return entry;
      })
    );
  };

  const getDailyEntry = (ramadanDay: number) => {
    return dailyEntries.find((entry) => entry.ramadanDay === ramadanDay);
  };

  const getChartData = () => {
    return dailyEntries.map((entry) => ({
      day: entry.ramadanDay,
      male: entry.maleJuzRead,
      female: entry.femaleJuzRead,
      total: entry.totalJuzRead,
    }));
  };

  return (
    <TadarusContext.Provider
      value={{
        progress,
        addDailyEntry,
        updateDailyEntry,
        getDailyEntry,
        getChartData,
      }}
    >
      {children}
    </TadarusContext.Provider>
  );
}

export function useTadarus() {
  const context = useContext(TadarusContext);
  if (context === undefined) {
    throw new Error('useTadarus must be used within a TadarusProvider');
  }
  return context;
}

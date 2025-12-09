// TadarusContext - Manages Tadarus (Quran reading) schedules for Ramadan
// Firebase Firestore integration for auto-sync across devices
import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { DailyTadarusEntry, TadarusProgress, TadarusYearlySchedule } from '@/types';
import { tadarusService } from '@/services/firebaseService';
import { auth } from '@/config/firebase';

// Ramadan start dates (approximate)
const RAMADAN_START_DATES: { [year: number]: Date } = {
  2024: new Date(2024, 2, 11), // 11 Maret 2024
  2025: new Date(2025, 2, 1),  // 1 Maret 2025
  2026: new Date(2026, 1, 18), // 18 Februari 2026
  2027: new Date(2027, 1, 8),  // 8 Februari 2027
  2028: new Date(2028, 0, 28), // 28 Januari 2028
  2029: new Date(2029, 0, 17), // 17 Januari 2029
  2030: new Date(2030, 0, 6),  // 6 Januari 2030
};

interface TadarusContextType {
  currentYear: number;
  setCurrentYear: (year: number) => void;
  yearlySchedules: { [year: number]: TadarusYearlySchedule };
  getScheduleForYear: (year: number) => TadarusYearlySchedule;
  addDailyEntry: (year: number, ramadanDay: number, maleJuz: number, femaleJuz: number, enteredBy: string) => void;
  updateDailyEntry: (year: number, ramadanDay: number, maleJuz: number, femaleJuz: number) => void;
  getDailyEntry: (year: number, ramadanDay: number) => DailyTadarusEntry | undefined;
  getChartData: (year: number) => { day: number; male: number; female: number; total: number }[];
  availableYears: number[];
  loading: boolean;
}

const TadarusContext = createContext<TadarusContextType | undefined>(undefined);

const generateInitialEntries = (year: number): DailyTadarusEntry[] => {
  const entries: DailyTadarusEntry[] = [];
  const startDate = RAMADAN_START_DATES[year] || new Date(year, 2, 1);
  // Generate 30 days of Ramadan with empty data
  for (let i = 1; i <= 30; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i - 1);
    entries.push({
      id: `${year}-${i}`,
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

const generateEmptySchedule = (year: number): TadarusYearlySchedule => {
  const startDate = RAMADAN_START_DATES[year] || new Date(year, 2, 1);
  const dailyEntries = generateInitialEntries(year);
  
  return {
    year,
    ramadanStartDate: startDate,
    dailyEntries,
    progress: {
      year,
      ramadanStartDate: startDate,
      totalMaleJuz: 0,
      totalFemaleJuz: 0,
      totalJuz: 0,
      maleKhatamCount: 0,
      femaleKhatamCount: 0,
      totalKhatamCount: 0,
      completionPercentage: 0,
      daysCompleted: 0,
      daysRemaining: 30,
    },
  };
};

const generateInitialData = (): { [year: number]: TadarusYearlySchedule } => {
  return {
    2024: generateEmptySchedule(2024),
    2025: generateEmptySchedule(2025),
    2026: generateEmptySchedule(2026),
    2027: generateEmptySchedule(2027),
    2028: generateEmptySchedule(2028),
    2029: generateEmptySchedule(2029),
    2030: generateEmptySchedule(2030),
  };
};

export function TadarusProvider({ children }: { children: ReactNode }) {
  const [currentYear, setCurrentYear] = useState(2025);
  const [yearlySchedules, setYearlySchedules] = useState<{ [year: number]: TadarusYearlySchedule }>(generateInitialData());
  const [loading, setLoading] = useState(true);

  const availableYears = useMemo(() => Object.keys(yearlySchedules).map(Number).sort(), [yearlySchedules]);

  // Load data from Firebase on mount - only when authenticated
  useEffect(() => {
    // Wait for auth to be ready
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        // Not authenticated, use local data only
        setLoading(false);
        return;
      }

      const loadAllYears = async () => {
        setLoading(true);
        const years = [2024, 2025, 2026, 2027, 2028, 2029, 2030];
        const schedules: { [year: number]: TadarusYearlySchedule } = {};
        
        for (const year of years) {
          try {
            const schedule = await tadarusService.getScheduleForYear(year);
            if (schedule) {
              schedules[year] = schedule;
            } else {
              // Create empty schedule if not exists in Firebase
              const emptySchedule = generateEmptySchedule(year);
              schedules[year] = emptySchedule;
              // Save to Firebase
              await tadarusService.saveSchedule(emptySchedule);
            }
          } catch (error) {
            console.error(`Error loading tadarus for year ${year}:`, error);
            schedules[year] = generateEmptySchedule(year);
          }
        }
        
        setYearlySchedules(schedules);
        setLoading(false);
      };

      loadAllYears();
    });

    return () => unsubscribeAuth();
  }, []);

  // Subscribe to current year changes - only when authenticated
  useEffect(() => {
    if (!auth.currentUser) return;
    
    const unsubscribe = tadarusService.subscribe(currentYear, (schedule) => {
      if (schedule) {
        setYearlySchedules(prev => ({ ...prev, [currentYear]: schedule }));
      }
    });
    return () => unsubscribe();
  }, [currentYear]);

  const getScheduleForYear = (year: number): TadarusYearlySchedule => {
    if (!yearlySchedules[year]) {
      const newSchedule = generateEmptySchedule(year);
      setYearlySchedules(prev => ({ ...prev, [year]: newSchedule }));
      return newSchedule;
    }
    return yearlySchedules[year];
  };

  const calculateProgress = (dailyEntries: DailyTadarusEntry[], year: number): TadarusProgress => {
    const totalMaleJuz = dailyEntries.reduce((sum, entry) => sum + entry.maleJuzRead, 0);
    const totalFemaleJuz = dailyEntries.reduce((sum, entry) => sum + entry.femaleJuzRead, 0);
    const totalJuz = totalMaleJuz + totalFemaleJuz;
    const maleKhatamCount = Math.floor(totalMaleJuz / 30);
    const femaleKhatamCount = Math.floor(totalFemaleJuz / 30);
    const startDate = RAMADAN_START_DATES[year] || new Date(year, 2, 1);

    return {
      year,
      ramadanStartDate: startDate,
      totalMaleJuz,
      totalFemaleJuz,
      totalJuz,
      maleKhatamCount,
      femaleKhatamCount,
      totalKhatamCount: maleKhatamCount + femaleKhatamCount,
      completionPercentage: Math.round((totalJuz / 60) * 100),
      daysCompleted: dailyEntries.filter(e => e.totalJuzRead > 0).length,
      daysRemaining: 30 - dailyEntries.filter(e => e.totalJuzRead > 0).length,
    };
  };

  const addDailyEntry = async (year: number, ramadanDay: number, maleJuz: number, femaleJuz: number, enteredBy: string) => {
    // Update local state first for immediate UI feedback
    setYearlySchedules(prev => {
      const schedule = prev[year];
      const updatedEntries = schedule.dailyEntries.map((entry) => {
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
      });
      
      const newSchedule = {
        ...prev,
        [year]: {
          ...schedule,
          dailyEntries: updatedEntries,
          progress: calculateProgress(updatedEntries, year),
        },
      };
      
      // Save to Firebase
      tadarusService.saveSchedule(newSchedule[year]).catch(console.error);
      
      return newSchedule;
    });
  };

  const updateDailyEntry = async (year: number, ramadanDay: number, maleJuz: number, femaleJuz: number) => {
    setYearlySchedules(prev => {
      const schedule = prev[year];
      const updatedEntries = schedule.dailyEntries.map((entry) => {
        if (entry.ramadanDay === ramadanDay) {
          return {
            ...entry,
            maleJuzRead: maleJuz,
            femaleJuzRead: femaleJuz,
            totalJuzRead: maleJuz + femaleJuz,
          };
        }
        return entry;
      });
      
      const newSchedule = {
        ...prev,
        [year]: {
          ...schedule,
          dailyEntries: updatedEntries,
          progress: calculateProgress(updatedEntries, year),
        },
      };
      
      // Save to Firebase
      tadarusService.saveSchedule(newSchedule[year]).catch(console.error);
      
      return newSchedule;
    });
  };

  const getDailyEntry = (year: number, ramadanDay: number) => {
    const schedule = yearlySchedules[year];
    return schedule?.dailyEntries.find((entry) => entry.ramadanDay === ramadanDay);
  };

  const getChartData = (year: number) => {
    const schedule = yearlySchedules[year];
    return schedule?.dailyEntries.map((entry) => ({
      day: entry.ramadanDay,
      male: entry.maleJuzRead,
      female: entry.femaleJuzRead,
      total: entry.totalJuzRead,
    })) || [];
  };

  return (
    <TadarusContext.Provider
      value={{
        currentYear,
        setCurrentYear,
        yearlySchedules,
        getScheduleForYear,
        addDailyEntry,
        updateDailyEntry,
        getDailyEntry,
        getChartData,
        availableYears,
        loading,
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

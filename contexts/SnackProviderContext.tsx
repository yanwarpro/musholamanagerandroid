import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { SnackProvider, DailySnackProvider, SnackProviderYearlySchedule } from '@/types';
import { snackProviderService } from '@/services/firebaseService';
import { auth } from '@/config/firebase';

const DAYS_OF_WEEK = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Ahad'];

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

// Generate initial weekly schedule with empty slots
const generateEmptyWeek = (): DailySnackProvider[] => {
  return DAYS_OF_WEEK.map((day) => ({
    day,
    date: new Date(),
    provider1: null,
    provider2: null,
  }));
};

const generateEmptySchedule = (year: number): SnackProviderYearlySchedule => {
  const startDate = RAMADAN_START_DATES[year] || new Date(year, 2, 1);
  return {
    year,
    ramadanStartDate: startDate,
    providers: [],
    weeklySchedules: {
      1: generateEmptyWeek(),
      2: generateEmptyWeek(),
      3: generateEmptyWeek(),
      4: generateEmptyWeek(),
    },
  };
};

interface SnackProviderContextType {
  currentYear: number;
  setCurrentYear: (year: number) => void;
  yearlySchedules: { [year: number]: SnackProviderYearlySchedule };
  getScheduleForYear: (year: number) => SnackProviderYearlySchedule;
  addProvider: (year: number, provider: SnackProvider) => void;
  removeProvider: (year: number, providerId: string) => void;
  assignProvider: (year: number, week: number, day: string, slot: 1 | 2, provider: SnackProvider) => void;
  removeAssignment: (year: number, week: number, day: string, slot: 1 | 2) => void;
  resetWeek: (year: number, week: number) => void;
  availableYears: number[];
  loading: boolean;
}

const SnackProviderContext = createContext<SnackProviderContextType | undefined>(undefined);

const generateInitialData = (): { [year: number]: SnackProviderYearlySchedule } => {
  // Default data for 2025
  const schedule2025 = generateEmptySchedule(2025);
  schedule2025.providers = [
    { id: '1', name: 'Ibu Siti', contact: '0812-3456-7890', notes: 'Kurma dan air' },
    { id: '2', name: 'Pak Ahmad', contact: '0813-9876-5432', notes: 'Kolak' },
    { id: '3', name: 'Ibu Fatimah', contact: '0815-1234-5678', notes: 'Gorengan' },
    { id: '4', name: 'Pak Umar', contact: '0816-2345-6789', notes: 'Es buah' },
    { id: '5', name: 'Ibu Khadijah', contact: '0817-3456-7890', notes: 'Kue basah' },
    { id: '6', name: 'Pak Ali', contact: '0818-4567-8901', notes: 'Takjil campur' },
  ];

  return {
    2024: generateEmptySchedule(2024),
    2025: schedule2025,
    2026: generateEmptySchedule(2026),
    2027: generateEmptySchedule(2027),
    2028: generateEmptySchedule(2028),
    2029: generateEmptySchedule(2029),
    2030: generateEmptySchedule(2030),
  };
};

export function SnackProviderProvider({ children }: { children: ReactNode }) {
  const [currentYear, setCurrentYear] = useState(2025);
  const [yearlySchedules, setYearlySchedules] = useState<{ [year: number]: SnackProviderYearlySchedule }>(generateInitialData());
  const [loading, setLoading] = useState(true);

  const availableYears = useMemo(() => Object.keys(yearlySchedules).map(Number).sort(), [yearlySchedules]);

  // Load data from Firebase on mount - only when authenticated
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      const loadAllYears = async () => {
        setLoading(true);
        const years = [2024, 2025, 2026, 2027, 2028, 2029, 2030];
        const schedules: { [year: number]: SnackProviderYearlySchedule } = {};
        
        for (const year of years) {
          try {
            const schedule = await snackProviderService.getScheduleForYear(year);
            if (schedule) {
              schedules[year] = schedule;
            } else {
              const emptySchedule = generateEmptySchedule(year);
              schedules[year] = emptySchedule;
              await snackProviderService.saveSchedule(emptySchedule);
            }
          } catch (error) {
            console.error(`Error loading snack provider for year ${year}:`, error);
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
    
    const unsubscribe = snackProviderService.subscribe(currentYear, (schedule) => {
      if (schedule) {
        setYearlySchedules(prev => ({ ...prev, [currentYear]: schedule }));
      }
    });
    return () => unsubscribe();
  }, [currentYear]);

  const saveToFirebase = (year: number, schedule: SnackProviderYearlySchedule) => {
    snackProviderService.saveSchedule(schedule).catch(console.error);
  };

  const getScheduleForYear = (year: number): SnackProviderYearlySchedule => {
    if (!yearlySchedules[year]) {
      const newSchedule = generateEmptySchedule(year);
      setYearlySchedules(prev => ({ ...prev, [year]: newSchedule }));
      return newSchedule;
    }
    return yearlySchedules[year];
  };

  const addProvider = (year: number, provider: SnackProvider) => {
    setYearlySchedules(prev => {
      const newSchedule = {
        ...prev[year],
        providers: [...prev[year].providers, provider],
      };
      saveToFirebase(year, newSchedule);
      return { ...prev, [year]: newSchedule };
    });
  };

  const removeProvider = (year: number, providerId: string) => {
    setYearlySchedules(prev => {
      const newSchedule = {
        ...prev[year],
        providers: prev[year].providers.filter(p => p.id !== providerId),
        weeklySchedules: Object.fromEntries(
          Object.entries(prev[year].weeklySchedules).map(([week, days]) => [
            week,
            days.map(d => ({
              ...d,
              provider1: d.provider1?.id === providerId ? null : d.provider1,
              provider2: d.provider2?.id === providerId ? null : d.provider2,
            })),
          ])
        ),
      };
      saveToFirebase(year, newSchedule);
      return { ...prev, [year]: newSchedule };
    });
  };

  const assignProvider = (year: number, week: number, day: string, slot: 1 | 2, provider: SnackProvider) => {
    setYearlySchedules(prev => {
      const newSchedule = {
        ...prev[year],
        weeklySchedules: {
          ...prev[year].weeklySchedules,
          [week]: prev[year].weeklySchedules[week].map(d => {
            if (d.day === day) {
              return {
                ...d,
                [slot === 1 ? 'provider1' : 'provider2']: provider,
              };
            }
            return d;
          }),
        },
      };
      saveToFirebase(year, newSchedule);
      return { ...prev, [year]: newSchedule };
    });
  };

  const removeAssignment = (year: number, week: number, day: string, slot: 1 | 2) => {
    setYearlySchedules(prev => {
      const newSchedule = {
        ...prev[year],
        weeklySchedules: {
          ...prev[year].weeklySchedules,
          [week]: prev[year].weeklySchedules[week].map(d => {
            if (d.day === day) {
              return {
                ...d,
                [slot === 1 ? 'provider1' : 'provider2']: null,
              };
            }
            return d;
          }),
        },
      };
      saveToFirebase(year, newSchedule);
      return { ...prev, [year]: newSchedule };
    });
  };

  const resetWeek = (year: number, week: number) => {
    setYearlySchedules(prev => {
      const newSchedule = {
        ...prev[year],
        weeklySchedules: {
          ...prev[year].weeklySchedules,
          [week]: generateEmptyWeek(),
        },
      };
      saveToFirebase(year, newSchedule);
      return { ...prev, [year]: newSchedule };
    });
  };

  return (
    <SnackProviderContext.Provider
      value={{
        currentYear,
        setCurrentYear,
        yearlySchedules,
        getScheduleForYear,
        addProvider,
        removeProvider,
        assignProvider,
        removeAssignment,
        resetWeek,
        availableYears,
        loading,
      }}
    >
      {children}
    </SnackProviderContext.Provider>
  );
}

export function useSnackProvider() {
  const context = useContext(SnackProviderContext);
  if (context === undefined) {
    throw new Error('useSnackProvider must be used within a SnackProviderProvider');
  }
  return context;
}

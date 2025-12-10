import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { TarawihPerson, DailyTarawihSchedule, TarawihYearlySchedule } from '@/types';
import { tarawihService } from '@/services/firebaseService';
import { auth } from '@/config/firebase';

interface TarawihContextType {
  currentYear: number;
  setCurrentYear: (year: number) => void;
  yearlySchedules: { [year: number]: TarawihYearlySchedule };
  getScheduleForYear: (year: number) => TarawihYearlySchedule;
  addImam: (year: number, imam: TarawihPerson) => void;
  removeImam: (year: number, imamId: string) => void;
  addBilal: (year: number, bilal: TarawihPerson) => void;
  removeBilal: (year: number, bilalId: string) => void;
  updateDailySchedule: (year: number, day: number, imamId: string, bilalId: string) => void;
  generateSchedule: (year: number) => void;
  availableYears: number[];
  loading: boolean;
}

const TarawihContext = createContext<TarawihContextType | undefined>(undefined);

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

const generateEmptySchedule = (year: number): TarawihYearlySchedule => {
  const startDate = RAMADAN_START_DATES[year] || new Date(year, 2, 1);
  const dailySchedules: DailyTarawihSchedule[] = [];
  
  for (let i = 1; i <= 30; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i - 1);
    dailySchedules.push({
      id: `${year}-${i}`,
      ramadanDay: i,
      date,
      imamId: '',
      imamName: '',
      bilalId: '',
      bilalName: '',
    });
  }

  return {
    year,
    ramadanStartDate: startDate,
    imams: [],
    bilals: [],
    dailySchedules,
  };
};

const generateInitialData = (): { [year: number]: TarawihYearlySchedule } => {
  // Default data for 2025
  const schedule2025 = generateEmptySchedule(2025);
  
  // Default imams
  schedule2025.imams = [
    { id: 'imam-1', name: 'Ustadz Ahmad', contact: '0812-1111-1111', role: 'imam', isActive: true },
    { id: 'imam-2', name: 'Ustadz Budi', contact: '0812-2222-2222', role: 'imam', isActive: true },
  ];
  
  // Default bilals
  schedule2025.bilals = [
    { id: 'bilal-1', name: 'Pak Hasan', contact: '0813-1111-1111', role: 'bilal', isActive: true },
    { id: 'bilal-2', name: 'Pak Umar', contact: '0813-2222-2222', role: 'bilal', isActive: true },
    { id: 'bilal-3', name: 'Pak Ali', contact: '0813-3333-3333', role: 'bilal', isActive: true },
    { id: 'bilal-4', name: 'Pak Zaid', contact: '0813-4444-4444', role: 'bilal', isActive: true },
  ];

  // Auto-generate schedule
  const imams = schedule2025.imams.filter(i => i.isActive);
  const bilals = schedule2025.bilals.filter(b => b.isActive);
  
  if (imams.length > 0 && bilals.length > 0) {
    const daysPerImam = Math.ceil(30 / imams.length);
    const daysPerBilal = Math.ceil(30 / bilals.length);
    
    schedule2025.dailySchedules = schedule2025.dailySchedules.map((day, index) => {
      const imamIndex = Math.floor(index / daysPerImam) % imams.length;
      const bilalIndex = Math.floor(index / daysPerBilal) % bilals.length;
      
      return {
        ...day,
        imamId: imams[imamIndex].id,
        imamName: imams[imamIndex].name,
        bilalId: bilals[bilalIndex].id,
        bilalName: bilals[bilalIndex].name,
      };
    });
  }

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

export function TarawihProvider({ children }: { children: ReactNode }) {
  const [currentYear, setCurrentYear] = useState(2025);
  const [yearlySchedules, setYearlySchedules] = useState<{ [year: number]: TarawihYearlySchedule }>(generateInitialData());
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
        const schedules: { [year: number]: TarawihYearlySchedule } = {};
        
        for (const year of years) {
          try {
            const schedule = await tarawihService.getScheduleForYear(year);
            if (schedule) {
              schedules[year] = schedule;
            } else {
              const emptySchedule = generateEmptySchedule(year);
              schedules[year] = emptySchedule;
              await tarawihService.saveSchedule(emptySchedule);
            }
          } catch (error) {
            console.error(`Error loading tarawih for year ${year}:`, error);
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
    
    const unsubscribe = tarawihService.subscribe(currentYear, (schedule) => {
      if (schedule) {
        setYearlySchedules(prev => ({ ...prev, [currentYear]: schedule }));
      }
    });
    return () => unsubscribe();
  }, [currentYear]);

  const getScheduleForYear = (year: number): TarawihYearlySchedule => {
    if (!yearlySchedules[year]) {
      const newSchedule = generateEmptySchedule(year);
      setYearlySchedules(prev => ({ ...prev, [year]: newSchedule }));
      return newSchedule;
    }
    return yearlySchedules[year];
  };

  const saveToFirebase = (year: number, schedule: TarawihYearlySchedule) => {
    tarawihService.saveSchedule(schedule).catch(console.error);
  };

  const addImam = (year: number, imam: TarawihPerson) => {
    setYearlySchedules(prev => {
      const newSchedule = {
        ...prev[year],
        imams: [...prev[year].imams, imam],
      };
      saveToFirebase(year, newSchedule);
      return { ...prev, [year]: newSchedule };
    });
  };

  const removeImam = (year: number, imamId: string) => {
    setYearlySchedules(prev => {
      const newSchedule = {
        ...prev[year],
        imams: prev[year].imams.filter(i => i.id !== imamId),
        dailySchedules: prev[year].dailySchedules.map(d => 
          d.imamId === imamId ? { ...d, imamId: '', imamName: '' } : d
        ),
      };
      saveToFirebase(year, newSchedule);
      return { ...prev, [year]: newSchedule };
    });
  };

  const addBilal = (year: number, bilal: TarawihPerson) => {
    setYearlySchedules(prev => {
      const newSchedule = {
        ...prev[year],
        bilals: [...prev[year].bilals, bilal],
      };
      saveToFirebase(year, newSchedule);
      return { ...prev, [year]: newSchedule };
    });
  };

  const removeBilal = (year: number, bilalId: string) => {
    setYearlySchedules(prev => {
      const newSchedule = {
        ...prev[year],
        bilals: prev[year].bilals.filter(b => b.id !== bilalId),
        dailySchedules: prev[year].dailySchedules.map(d => 
          d.bilalId === bilalId ? { ...d, bilalId: '', bilalName: '' } : d
        ),
      };
      saveToFirebase(year, newSchedule);
      return { ...prev, [year]: newSchedule };
    });
  };

  const updateDailySchedule = (year: number, day: number, imamId: string, bilalId: string) => {
    const schedule = yearlySchedules[year];
    const imam = schedule.imams.find(i => i.id === imamId);
    const bilal = schedule.bilals.find(b => b.id === bilalId);

    setYearlySchedules(prev => {
      const newSchedule = {
        ...prev[year],
        dailySchedules: prev[year].dailySchedules.map(d =>
          d.ramadanDay === day
            ? {
                ...d,
                imamId,
                imamName: imam?.name || '',
                bilalId,
                bilalName: bilal?.name || '',
              }
            : d
        ),
      };
      saveToFirebase(year, newSchedule);
      return { ...prev, [year]: newSchedule };
    });
  };

  const generateSchedule = (year: number) => {
    const schedule = yearlySchedules[year];
    const imams = schedule.imams.filter(i => i.isActive);
    const bilals = schedule.bilals.filter(b => b.isActive);

    if (imams.length === 0 || bilals.length === 0) return;

    const daysPerImam = Math.ceil(30 / imams.length);
    const daysPerBilal = Math.ceil(30 / bilals.length);

    setYearlySchedules(prev => {
      const newSchedule = {
        ...prev[year],
        dailySchedules: prev[year].dailySchedules.map((day, index) => {
          const imamIndex = Math.floor(index / daysPerImam) % imams.length;
          const bilalIndex = Math.floor(index / daysPerBilal) % bilals.length;

          return {
            ...day,
            imamId: imams[imamIndex].id,
            imamName: imams[imamIndex].name,
            bilalId: bilals[bilalIndex].id,
            bilalName: bilals[bilalIndex].name,
          };
        }),
      };
      saveToFirebase(year, newSchedule);
      return { ...prev, [year]: newSchedule };
    });
  };

  return (
    <TarawihContext.Provider
      value={{
        currentYear,
        setCurrentYear,
        yearlySchedules,
        getScheduleForYear,
        addImam,
        removeImam,
        addBilal,
        removeBilal,
        updateDailySchedule,
        generateSchedule,
        availableYears,
        loading,
      }}
    >
      {children}
    </TarawihContext.Provider>
  );
}

export function useTarawih() {
  const context = useContext(TarawihContext);
  if (context === undefined) {
    throw new Error('useTarawih must be used within a TarawihProvider');
  }
  return context;
}

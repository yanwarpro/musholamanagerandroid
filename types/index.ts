export type UserRole = 'admin' | 'takmir';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  notes: string;
  date: Date;
  createdBy: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  lastUpdated: Date;
}

export interface TadarusSchedule {
  id: string;
  date: Date;
  readerId: string;
  readerName: string;
  quranSection: string;
  completed: boolean;
}

export interface DailyTadarusEntry {
  id: string;
  ramadanDay: number; // Hari ke-1, ke-2, dst
  date: Date;
  maleJuzRead: number; // Jumlah juz yang dibaca jamaah laki-laki
  femaleJuzRead: number; // Jumlah juz yang dibaca jamaah wanita
  totalJuzRead: number; // Total juz hari itu
  enteredBy: string; // admin/takmir yang input
  createdAt: Date;
}

export interface TadarusProgress {
  year: number;
  ramadanStartDate: Date;
  dailyEntries: DailyTadarusEntry[];
  totalMaleJuz: number;
  totalFemaleJuz: number;
  totalJuz: number;
  khatamCount: number; // Deprecated - tidak digunakan
  maleKhatamCount: number; // Jumlah khatam jamaah laki-laki
  femaleKhatamCount: number; // Jumlah khatam jamaah wanita
}

export interface SnackProvider {
  id: string;
  name: string;
  contact: string;
  notes?: string;
}

export interface WeeklySnackSchedule {
  id: string;
  weekNumber: number; // Week 1, 2, 3, 4 of Ramadan
  year: number;
  startDate: Date;
  endDate: Date;
  dailyProviders: DailySnackProvider[];
}

export interface DailySnackProvider {
  day: string; // 'Senin', 'Selasa', etc.
  date: Date;
  provider1: SnackProvider | null;
  provider2: SnackProvider | null;
}

export interface SnackProviderYearlySchedule {
  year: number;
  ramadanStartDate: Date;
  providers: SnackProvider[];
  weeklySchedules: { [week: number]: DailySnackProvider[] };
}

export interface TarawihSchedule {
  id: string;
  date: Date;
  time: string;
  imamId: string;
  imamName: string;
  capacity: number;
  attendees: number;
}

export interface TarawihPerson {
  id: string;
  name: string;
  contact: string;
  role: 'imam' | 'bilal';
  isActive: boolean;
}

export interface DailyTarawihSchedule {
  id: string;
  ramadanDay: number; // Hari ke-1 sampai ke-30
  date: Date;
  imamId: string;
  imamName: string;
  bilalId: string;
  bilalName: string;
}

export interface TarawihYearlySchedule {
  year: number;
  ramadanStartDate: Date;
  imams: TarawihPerson[];
  bilals: TarawihPerson[];
  dailySchedules: DailyTarawihSchedule[];
}

export interface PrayerTime {
  name: string;
  time: string;
  isNext: boolean;
}

export interface KajianSchedule {
  id: string;
  title: string;
  ustadName: string;
  date: Date;
  time: string;
  topic: string;
  youtubeLink: string;
  year: number;
  isRecurring: boolean;
  recurringDay?: string; // e.g., 'Senin', 'Jumat'
}

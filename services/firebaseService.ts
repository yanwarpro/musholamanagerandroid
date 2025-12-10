// Firebase Firestore Service - Centralized database operations
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import {
  Transaction,
  InventoryItem,
  User,
  DailyTadarusEntry,
  TadarusYearlySchedule,
  TarawihPerson,
  DailyTarawihSchedule,
  TarawihYearlySchedule,
  SnackProvider,
  DailySnackProvider,
  SnackProviderYearlySchedule,
  KajianSchedule,
} from '@/types';

// Helper to convert Firestore Timestamp to Date
const toDate = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date(timestamp);
};

// Helper to convert Date to Firestore Timestamp
const toTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

// ==================== TRANSACTIONS ====================
export const transactionsService = {
  async getAll(): Promise<Transaction[]> {
    try {
      const snapshot = await getDocs(
        query(collection(db, 'transactions'), orderBy('date', 'desc'))
      );
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: toDate(doc.data().date),
      })) as Transaction[];
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  },

  async add(transaction: Omit<Transaction, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'transactions'), {
        ...transaction,
        date: toTimestamp(transaction.date),
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding transaction to Firestore:', error);
      throw error;
    }
  },

  async update(id: string, data: Partial<Transaction>): Promise<void> {
    try {
      const updateData: any = { ...data };
      if (data.date) {
        updateData.date = toTimestamp(data.date);
      }
      await updateDoc(doc(db, 'transactions', id), updateData);
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'transactions', id));
    } catch (error) {
      // Error logged silently
      throw error;
    }
  },

  subscribe(callback: (transactions: Transaction[]) => void): () => void {
    try {
      return onSnapshot(
        query(collection(db, 'transactions'), orderBy('date', 'desc')),
        (snapshot) => {
          const transactions = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            date: toDate(doc.data().date),
          })) as Transaction[];
          callback(transactions);
        },
        (error) => {
          console.error('Error in transactions subscription:', error);
          callback([]);
        }
      );
    } catch (error) {
      console.error('Error setting up transactions subscription:', error);
      callback([]);
      return () => {};
    }
  },
};

// ==================== INVENTORY ====================
export const inventoryService = {
  async getAll(): Promise<InventoryItem[]> {
    try {
      const snapshot = await getDocs(
        query(collection(db, 'inventory'), orderBy('name'))
      );
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        lastUpdated: toDate(doc.data().lastUpdated),
      })) as InventoryItem[];
    } catch (error) {
      console.error('Error getting inventory:', error);
      return [];
    }
  },

  async add(item: Omit<InventoryItem, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'inventory'), {
        ...item,
        lastUpdated: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding inventory item:', error);
      throw error;
    }
  },

  async update(id: string, data: Partial<InventoryItem>): Promise<void> {
    try {
      await updateDoc(doc(db, 'inventory', id), {
        ...data,
        lastUpdated: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating inventory item:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'inventory', id));
    } catch (error) {
      // Error logged silently
      throw error;
    }
  },

  subscribe(callback: (items: InventoryItem[]) => void): () => void {
    try {
      return onSnapshot(
        query(collection(db, 'inventory'), orderBy('name')),
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            lastUpdated: toDate(doc.data().lastUpdated),
          })) as InventoryItem[];
          callback(items);
        },
        (error) => {
          console.error('Error in inventory subscription:', error);
          callback([]);
        }
      );
    } catch (error) {
      console.error('Error setting up inventory subscription:', error);
      callback([]);
      return () => {};
    }
  },
};

// ==================== USERS ====================
export const usersService = {
  async getAll(): Promise<User[]> {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: toDate(doc.data().createdAt),
      })) as User[];
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  },

  async getById(id: string): Promise<User | null> {
    try {
      const docSnap = await getDoc(doc(db, 'users', id));
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: toDate(docSnap.data().createdAt),
        } as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting user by id:', error);
      return null;
    }
  },

  async update(id: string, data: Partial<User>): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', id), data);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  subscribe(callback: (users: User[]) => void): () => void {
    try {
      return onSnapshot(
        collection(db, 'users'),
        (snapshot) => {
          const users = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: toDate(doc.data().createdAt),
          })) as User[];
          callback(users);
        },
        (error) => {
          console.error('Error in users subscription:', error);
          callback([]);
        }
      );
    } catch (error) {
      console.error('Error setting up users subscription:', error);
      callback([]);
      return () => {};
    }
  },
};

// ==================== TADARUS ====================
export const tadarusService = {
  async getScheduleForYear(year: number): Promise<TadarusYearlySchedule | null> {
    try {
      const docSnap = await getDoc(doc(db, 'tadarus', year.toString()));
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          ramadanStartDate: toDate(data.ramadanStartDate),
          dailyEntries: data.dailyEntries?.map((entry: any) => ({
            ...entry,
            date: toDate(entry.date),
            createdAt: toDate(entry.createdAt),
          })) || [],
          progress: {
            ...data.progress,
            ramadanStartDate: toDate(data.progress?.ramadanStartDate),
          },
        } as TadarusYearlySchedule;
      }
      return null;
    } catch (error) {
      console.error('Error getting tadarus schedule:', error);
      return null;
    }
  },

  async saveSchedule(schedule: TadarusYearlySchedule): Promise<void> {
    try {
      await setDoc(doc(db, 'tadarus', schedule.year.toString()), {
        ...schedule,
        ramadanStartDate: toTimestamp(schedule.ramadanStartDate),
        dailyEntries: schedule.dailyEntries.map((entry) => ({
          ...entry,
          date: toTimestamp(entry.date),
          createdAt: toTimestamp(entry.createdAt),
        })),
        progress: {
          ...schedule.progress,
          ramadanStartDate: toTimestamp(schedule.progress.ramadanStartDate),
        },
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error saving tadarus schedule:', error);
      throw error;
    }
  },

  async updateDailyEntry(
    year: number,
    ramadanDay: number,
    maleJuz: number,
    femaleJuz: number,
    enteredBy: string
  ): Promise<void> {
    try {
      const schedule = await this.getScheduleForYear(year);
      if (schedule) {
        const updatedEntries = schedule.dailyEntries.map((entry) => {
          if (entry.ramadanDay === ramadanDay) {
            return {
              ...entry,
              maleJuzRead: maleJuz,
              femaleJuzRead: femaleJuz,
              totalJuzRead: maleJuz + femaleJuz,
              enteredBy,
              createdAt: new Date(),
            };
          }
          return entry;
        });
        schedule.dailyEntries = updatedEntries;
        
        // Recalculate progress
        const totalMaleJuz = updatedEntries.reduce((sum, e) => sum + e.maleJuzRead, 0);
        const totalFemaleJuz = updatedEntries.reduce((sum, e) => sum + e.femaleJuzRead, 0);
        schedule.progress = {
          ...schedule.progress,
          totalMaleJuz,
          totalFemaleJuz,
          totalJuz: totalMaleJuz + totalFemaleJuz,
          maleKhatamCount: Math.floor(totalMaleJuz / 30),
          femaleKhatamCount: Math.floor(totalFemaleJuz / 30),
          totalKhatamCount: Math.floor(totalMaleJuz / 30) + Math.floor(totalFemaleJuz / 30),
          completionPercentage: Math.round(((totalMaleJuz + totalFemaleJuz) / 60) * 100),
          daysCompleted: updatedEntries.filter((e) => e.totalJuzRead > 0).length,
          daysRemaining: 30 - updatedEntries.filter((e) => e.totalJuzRead > 0).length,
        };
        
        await this.saveSchedule(schedule);
      }
    } catch (error) {
      console.error('Error updating tadarus daily entry:', error);
      throw error;
    }
  },

  subscribe(year: number, callback: (schedule: TadarusYearlySchedule | null) => void): () => void {
    try {
      return onSnapshot(
        doc(db, 'tadarus', year.toString()),
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            callback({
              ...data,
              ramadanStartDate: toDate(data.ramadanStartDate),
              dailyEntries: data.dailyEntries?.map((entry: any) => ({
                ...entry,
                date: toDate(entry.date),
                createdAt: toDate(entry.createdAt),
              })) || [],
              progress: {
                ...data.progress,
                ramadanStartDate: toDate(data.progress?.ramadanStartDate),
              },
            } as TadarusYearlySchedule);
          } else {
            callback(null);
          }
        },
        (error) => {
          console.error('Error in tadarus subscription:', error);
          callback(null);
        }
      );
    } catch (error) {
      console.error('Error setting up tadarus subscription:', error);
      callback(null);
      return () => {};
    }
  },
};

// ==================== TARAWIH ====================
export const tarawihService = {
  async getScheduleForYear(year: number): Promise<TarawihYearlySchedule | null> {
    try {
      const docSnap = await getDoc(doc(db, 'tarawih', year.toString()));
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          ramadanStartDate: toDate(data.ramadanStartDate),
          dailySchedules: data.dailySchedules?.map((schedule: any) => ({
            ...schedule,
            date: toDate(schedule.date),
          })) || [],
        } as TarawihYearlySchedule;
      }
      return null;
    } catch (error) {
      console.error('Error getting tarawih schedule:', error);
      return null;
    }
  },

  async saveSchedule(schedule: TarawihYearlySchedule): Promise<void> {
    try {
      await setDoc(doc(db, 'tarawih', schedule.year.toString()), {
        ...schedule,
        ramadanStartDate: toTimestamp(schedule.ramadanStartDate),
        dailySchedules: schedule.dailySchedules.map((s) => ({
          ...s,
          date: toTimestamp(s.date),
        })),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error saving tarawih schedule:', error);
      throw error;
    }
  },

  subscribe(year: number, callback: (schedule: TarawihYearlySchedule | null) => void): () => void {
    try {
      return onSnapshot(
        doc(db, 'tarawih', year.toString()),
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            callback({
              ...data,
              ramadanStartDate: toDate(data.ramadanStartDate),
              dailySchedules: data.dailySchedules?.map((schedule: any) => ({
                ...schedule,
                date: toDate(schedule.date),
              })) || [],
            } as TarawihYearlySchedule);
          } else {
            callback(null);
          }
        },
        (error) => {
          console.error('Error in tarawih subscription:', error);
          callback(null);
        }
      );
    } catch (error) {
      console.error('Error setting up tarawih subscription:', error);
      callback(null);
      return () => {};
    }
  },
};

// ==================== SNACK PROVIDERS ====================
export const snackProviderService = {
  async getScheduleForYear(year: number): Promise<SnackProviderYearlySchedule | null> {
    try {
      const docSnap = await getDoc(doc(db, 'snackProviders', year.toString()));
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          ramadanStartDate: toDate(data.ramadanStartDate),
          weeklySchedules: data.weeklySchedules || {},
        } as SnackProviderYearlySchedule;
      }
      return null;
    } catch (error) {
      console.error('Error getting snack provider schedule:', error);
      return null;
    }
  },

  async saveSchedule(schedule: SnackProviderYearlySchedule): Promise<void> {
    try {
      await setDoc(doc(db, 'snackProviders', schedule.year.toString()), {
        ...schedule,
        ramadanStartDate: toTimestamp(schedule.ramadanStartDate),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error saving snack provider schedule:', error);
      throw error;
    }
  },

  subscribe(year: number, callback: (schedule: SnackProviderYearlySchedule | null) => void): () => void {
    try {
      return onSnapshot(
        doc(db, 'snackProviders', year.toString()),
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            callback({
              ...data,
              ramadanStartDate: toDate(data.ramadanStartDate),
              weeklySchedules: data.weeklySchedules || {},
            } as SnackProviderYearlySchedule);
          } else {
            callback(null);
          }
        },
        (error) => {
          console.error('Error in snack provider subscription:', error);
          callback(null);
        }
      );
    } catch (error) {
      console.error('Error setting up snack provider subscription:', error);
      callback(null);
      return () => {};
    }
  },
};

// ==================== KAJIAN ====================
export const kajianService = {
  async getAll(): Promise<KajianSchedule[]> {
    try {
      const snapshot = await getDocs(
        query(collection(db, 'kajian'), orderBy('date', 'desc'))
      );
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: toDate(doc.data().date),
      })) as KajianSchedule[];
    } catch (error) {
      console.error('Error getting kajian:', error);
      return [];
    }
  },

  async getByYear(year: number): Promise<KajianSchedule[]> {
    try {
      const snapshot = await getDocs(
        query(collection(db, 'kajian'), where('year', '==', year), orderBy('date', 'desc'))
      );
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: toDate(doc.data().date),
      })) as KajianSchedule[];
    } catch (error) {
      console.error('Error getting kajian by year:', error);
      return [];
    }
  },

  async add(kajian: Omit<KajianSchedule, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'kajian'), {
        ...kajian,
        date: toTimestamp(kajian.date),
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding kajian:', error);
      throw error;
    }
  },

  async update(id: string, data: Partial<KajianSchedule>): Promise<void> {
    try {
      const updateData: any = { ...data };
      if (data.date) {
        updateData.date = toTimestamp(data.date);
      }
      await updateDoc(doc(db, 'kajian', id), updateData);
    } catch (error) {
      console.error('Error updating kajian:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'kajian', id));
    } catch (error) {
      // Error logged silently
      throw error;
    }
  },

  subscribe(callback: (kajian: KajianSchedule[]) => void): () => void {
    try {
      return onSnapshot(
        query(collection(db, 'kajian'), orderBy('date', 'desc')),
        (snapshot) => {
          const kajian = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            date: toDate(doc.data().date),
          })) as KajianSchedule[];
          callback(kajian);
        },
        (error) => {
          console.error('Error in kajian subscription:', error);
          callback([]);
        }
      );
    } catch (error) {
      console.error('Error setting up kajian subscription:', error);
      callback([]);
      return () => {};
    }
  },
};

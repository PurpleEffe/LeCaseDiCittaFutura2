import { House, Booking, BookingStatus, Holiday, User, Role } from '../types';
import { loadDataFile, saveDataFile } from './githubClient';

const HOUSES_FILE = 'houses.json';
const BOOKINGS_FILE = 'bookings.json';
const HOLIDAYS_FILE = 'holidays.json';
const USERS_FILE = 'users.json';

const slugify = (value: string): string => value
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-');

const generateId = (prefix: string): string => `${prefix}-${Date.now().toString(36)}`;

const ensureHouseUpdatedAt = (house: House): House => ({
  ...house,
  updatedAt: new Date().toISOString(),
});

const sortBookingsByDateDesc = (bookings: Booking[]): Booking[] => [...bookings]
  .sort((a, b) => new Date(b.from).getTime() - new Date(a.from).getTime());

export const api = {
  getHouses: async (): Promise<House[]> => {
    const { data } = await loadDataFile<House[]>(HOUSES_FILE);
    return data.filter(house => house.active);
  },

  getHouse: async (id: string): Promise<House | undefined> => {
    const { data } = await loadDataFile<House[]>(HOUSES_FILE);
    return data.find(house => house.id === id);
  },

  createBooking: async (bookingData: Omit<Booking, 'id' | 'status'>): Promise<{ success: boolean; issueUrl?: string; error?: string }> => {
    const { data: bookings } = await loadDataFile<Booking[]>(BOOKINGS_FILE);
    const newBooking: Booking = {
      ...bookingData,
      id: generateId('b'),
      status: BookingStatus.PENDING,
    };

    const updatedBookings = [...bookings, newBooking];
    try {
      const { commitUrl } = await saveDataFile(BOOKINGS_FILE, updatedBookings);
      return {
        success: true,
        issueUrl: commitUrl,
      };
    } catch (error) {
      console.error('[api] Errore durante la creazione della prenotazione:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore sconosciuto durante il salvataggio su GitHub.',
      };
    }
  },

  getBookingsForHouse: async (houseId: string): Promise<Booking[]> => {
    const { data } = await loadDataFile<Booking[]>(BOOKINGS_FILE);
    return data.filter(booking => booking.houseId === houseId && booking.status === BookingStatus.APPROVED);
  },

  getHolidaysForHouse: async (houseId: string): Promise<Holiday[]> => {
    const { data } = await loadDataFile<Holiday[]>(HOLIDAYS_FILE);
    return data.filter(holiday => holiday.houseId === houseId);
  },

  login: async (email: string, password: string): Promise<User | null> => {
    const { data: users } = await loadDataFile<User[]>(USERS_FILE);
    const user = users.find(candidate => candidate.email.toLowerCase() === email.toLowerCase());
    if (user && user.password === password) {
      const { password: _password, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    }
    return null;
  },

  register: async (name: string, email: string, password: string): Promise<{ user: User | null; error?: string }> => {
    const { data: users } = await loadDataFile<User[]>(USERS_FILE);
    const existingUser = users.find(candidate => candidate.email.toLowerCase() === email.toLowerCase());

    if (existingUser) {
      return { user: null, error: 'Un utente con questa email esiste già.' };
    }

    const newUser: User = {
      id: generateId('user'),
      name,
      email,
      password,
      role: Role.GUEST,
    };

    const updatedUsers = [...users, newUser];
    await saveDataFile(USERS_FILE, updatedUsers);
    const { password: _password, ...userWithoutPassword } = newUser;

    return {
      user: userWithoutPassword as User,
      error: undefined,
    };
  },

  // --- Manager Functions ---
  getAllHouses: async (): Promise<House[]> => {
    const { data } = await loadDataFile<House[]>(HOUSES_FILE);
    return data;
  },

  updateHouse: async (houseToUpdate: House): Promise<House> => {
    const { data: houses } = await loadDataFile<House[]>(HOUSES_FILE);
    const index = houses.findIndex(house => house.id === houseToUpdate.id);

    if (index === -1) {
      throw new Error(`Impossibile trovare la casa con id ${houseToUpdate.id}`);
    }

    houses[index] = ensureHouseUpdatedAt(houseToUpdate);
    await saveDataFile(HOUSES_FILE, houses);
    return houses[index];
  },

  createHouse: async (newHouseData: Omit<House, 'id' | 'updatedAt'>): Promise<House> => {
    const { data: houses } = await loadDataFile<House[]>(HOUSES_FILE);
    const baseId = slugify(newHouseData.title);
    const uniqueId = houses.some(house => house.id === baseId) ? generateId(baseId) : baseId;

    const newHouse: House = ensureHouseUpdatedAt({
      ...newHouseData,
      id: uniqueId,
    });

    const updatedHouses = [...houses, newHouse];
    await saveDataFile(HOUSES_FILE, updatedHouses);
    return newHouse;
  },

  deleteHouse: async (id: string): Promise<{ success: boolean }> => {
    const { data: houses } = await loadDataFile<House[]>(HOUSES_FILE);
    const filtered = houses.filter(house => house.id !== id);

    if (filtered.length === houses.length) {
      return { success: false };
    }

    await saveDataFile(HOUSES_FILE, filtered);
    return { success: true };
  },

  getAllBookings: async (): Promise<Booking[]> => {
    const { data } = await loadDataFile<Booking[]>(BOOKINGS_FILE);
    return sortBookingsByDateDesc(data);
  },

  updateBookingStatus: async (bookingId: string, status: BookingStatus): Promise<{ success: boolean }> => {
    const { data: bookings } = await loadDataFile<Booking[]>(BOOKINGS_FILE);
    const index = bookings.findIndex(booking => booking.id === bookingId);

    if (index === -1) {
      return { success: false };
    }

    bookings[index] = { ...bookings[index], status };
    await saveDataFile(BOOKINGS_FILE, bookings);
    return { success: true };
  },
};

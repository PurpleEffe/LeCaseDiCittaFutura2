
import { House, Amenity, Booking, BookingStatus, Holiday, User, Role } from '../types';

const housesData: House[] = [
  {
    id: "casa-ulivo",
    title: "Casa dell'Ulivo",
    summary: "Un'accogliente dimora nel cuore del borgo antico, perfetta per famiglie.",
    description: "Immersa nella quiete del centro storico di Riace, la Casa dell'Ulivo offre un'autentica esperienza di vita comunitaria. Con le sue spesse mura in pietra e l'arredamento semplice ma curato, è il rifugio ideale per chi cerca pace e ispirazione. Dispone di un piccolo patio interno dove rilassarsi all'ombra dell'antico ulivo che le dà il nome.",
    capacity: 4,
    bedrooms: 2,
    bathrooms: 1,
    amenities: ["cucina", "wi-fi", "aria-condizionata"],
    images: [
      "https://picsum.photos/seed/ulivo1/800/600",
      "https://picsum.photos/seed/ulivo2/800/600",
      "https://picsum.photos/seed/ulivo3/800/600",
    ],
    location: { lat: 38.4183, lng: 16.4833, address: "Via Garibaldi, Riace (RC)" },
    active: true,
    updatedAt: "2024-09-26T00:00:00Z",
  },
  {
    id: "la-terrazza-sul-mare",
    title: "La Terrazza sul Mare",
    summary: "Appartamento luminoso con una vista mozzafiato sulla costa ionica.",
    description: "Svegliarsi con il rumore delle onde e ammirare l'alba sul Mar Ionio: questo è ciò che offre La Terrazza sul Mare. Questo appartamento moderno e luminoso è dotato di un'ampia terrazza attrezzata, ideale per cene all'aperto e momenti di relax. La sua posizione privilegiata lo rende perfetto per esplorare sia il borgo che le spiagge vicine.",
    capacity: 5,
    bedrooms: 2,
    bathrooms: 2,
    amenities: ["cucina", "wi-fi", "aria-condizionata", "vista-mare", "accessibile"],
    images: [
      "https://picsum.photos/seed/mare1/800/600",
      "https://picsum.photos/seed/mare2/800/600",
      "https://picsum.photos/seed/mare3/800/600",
    ],
    location: { lat: 38.4195, lng: 16.4850, address: "Vico Ionio, Riace (RC)" },
    active: true,
    updatedAt: "2024-09-26T00:00:00Z",
  },
  {
    id: "il-rifugio-del-poeta",
    title: "Il Rifugio del Poeta",
    summary: "Un piccolo e intimo monolocale, ideale per coppie o viaggiatori solitari.",
    description: "Ricavato da un'antica bottega artigiana, Il Rifugio del Poeta è un nido romantico e suggestivo. L'ambiente unico, con travi a vista e dettagli in terracotta, crea un'atmosfera calda e accogliente. È il luogo perfetto per chi cerca un soggiorno intimo e l'ispirazione per scrivere, leggere o semplicemente staccare dalla routine quotidiana.",
    capacity: 2,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ["cucina", "wi-fi", "parcheggio"],
    images: [
      "https://picsum.photos/seed/poeta1/800/600",
      "https://picsum.photos/seed/poeta2/800/600",
    ],
    location: { lat: 38.4179, lng: 16.4821, address: "Piazza dei Sogni, Riace (RC)" },
    active: true,
    updatedAt: "2024-09-26T00:00:00Z",
  },
    {
    id: "la-casa-grande",
    title: "La Casa Grande",
    summary: "Spaziosa e confortevole, ideale per gruppi e grandi famiglie.",
    description: "La Casa Grande è pensata per l'ospitalità comunitaria. Con i suoi ampi spazi comuni, una cucina attrezzata per grandi numeri e diverse camere da letto, è perfetta per gruppi di amici, famiglie numerose o workshop residenziali. Il grande giardino condiviso è uno spazio di incontro e socialità, in pieno spirito Città Futura.",
    capacity: 8,
    bedrooms: 4,
    bathrooms: 3,
    amenities: ["cucina", "wi-fi", "parcheggio", "accessibile"],
    images: [
      "https://picsum.photos/seed/grande1/800/600",
      "https://picsum.photos/seed/grande2/800/600",
      "https://picsum.photos/seed/grande3/800/600",
      "https://picsum.photos/seed/grande4/800/600",
    ],
    location: { lat: 38.4200, lng: 16.4800, address: "Via della Comunità, Riace (RC)" },
    active: true,
    updatedAt: "2024-09-26T00:00:00Z",
  }
];

let bookingsData: Booking[] = [
  // NOTE: Assuming current month is around Oct/Nov 2024 for visibility
  { 
    id: 'b1', houseId: 'casa-ulivo', houseTitle: "Casa dell'Ulivo", from: '2024-11-10', to: '2024-11-15', guests: 2,
    requester: { name: 'Maria Bianchi', email: 'maria@example.com', userId: 'guest-1' }, notes: '',
    status: BookingStatus.APPROVED 
  },
  { 
    id: 'b2', houseId: 'casa-ulivo', houseTitle: "Casa dell'Ulivo", from: '2024-11-25', to: '2024-11-28', guests: 4,
    requester: { name: 'Famiglia Verdi', email: 'verdi@example.com', userId: 'guest-2' }, notes: 'Viaggiamo con due bambini piccoli.',
    status: BookingStatus.APPROVED 
  },
  { 
    id: 'b3', houseId: 'la-terrazza-sul-mare', houseTitle: "La Terrazza sul Mare", from: '2024-12-01', to: '2024-12-08', guests: 3,
    requester: { name: 'Luca Rossi', email: 'luca@example.com', userId: 'guest-3' }, notes: '',
    status: BookingStatus.APPROVED 
  },
  { 
    id: 'b4', houseId: 'il-rifugio-del-poeta', houseTitle: "Il Rifugio del Poeta", from: '2024-11-18', to: '2024-11-22', guests: 1,
    requester: { name: 'Giulia Neri', email: 'giulia@example.com', userId: 'guest-4' }, notes: 'Vengo per un ritiro di scrittura.',
    status: BookingStatus.APPROVED 
  },
  { 
    id: 'b5', houseId: 'la-casa-grande', houseTitle: "La Casa Grande", from: '2024-12-10', to: '2024-12-15', guests: 6,
    requester: { name: 'Gruppo Amici', email: 'amici@example.com', userId: 'guest-5' }, notes: 'Siamo un gruppo di studenti universitari.',
    status: BookingStatus.PENDING 
  },
  { 
    id: 'b6', houseId: 'la-terrazza-sul-mare', houseTitle: "La Terrazza sul Mare", from: '2024-12-20', to: '2024-12-27', guests: 2,
    requester: { name: 'Marco Gialli', email: 'marco@example.com', userId: 'guest-6' }, notes: 'Vorremmo passare il Natale da voi.',
    status: BookingStatus.PENDING 
  },
  { 
    id: 'b7', houseId: 'casa-ulivo', houseTitle: "Casa dell'Ulivo", from: '2025-02-01', to: '2025-02-03', guests: 2,
    requester: { name: 'Anna Blu', email: 'anna@example.com', userId: 'guest-7' }, notes: '',
    status: BookingStatus.DENIED 
  },
];

const holidaysData: Holiday[] = [
  { id: 'h1', houseId: 'casa-ulivo', from: '2024-12-24', to: '2024-12-26' },
  { id: 'h2', houseId: 'la-terrazza-sul-mare', from: '2025-01-01', to: '2025-01-01' },
];

let usersData: User[] = [
    {
        id: "1",
        name: "Gestore",
        email: "gestore@cittafutura.it",
        password: "Gestore123",
        role: Role.MANAGER
    }
];

// In a real app, this would use the GitHub API.
// We simulate it here with a mutable array for the demo.
let currentHouses: House[] = [...housesData];

export const api = {
  getHouses: async (): Promise<House[]> => {
    // Simulate network delay
    await new Promise(res => setTimeout(res, 300));
    return currentHouses.filter(h => h.active);
  },

  getHouse: async (id: string): Promise<House | undefined> => {
    await new Promise(res => setTimeout(res, 200));
    return currentHouses.find(house => house.id === id);
  },

  createBooking: async (bookingData: Omit<Booking, 'id' | 'status'>): Promise<{ success: boolean; issueUrl: string }> => {
    const newBooking: Booking = {
      ...bookingData,
      id: `b${Date.now()}`,
      status: BookingStatus.PENDING,
    };
    
    bookingsData.push(newBooking);
    
    console.log("--- NUOVA PRENOTAZIONE (SIMULATA) ---");
    console.log(newBooking);
    console.log("-----------------------------------------");
    
    await new Promise(res => setTimeout(res, 1000));
    const mockIssueUrl = `https://github.com/user/repo/issues/${Math.floor(Math.random() * 1000) + 1}`;
    return { success: true, issueUrl: mockIssueUrl };
  },

  getBookingsForHouse: async (houseId: string): Promise<Booking[]> => {
    await new Promise(res => setTimeout(res, 250));
    return bookingsData.filter(b => b.houseId === houseId && b.status === BookingStatus.APPROVED);
  },

  getHolidaysForHouse: async (houseId: string): Promise<Holiday[]> => {
    await new Promise(res => setTimeout(res, 250));
    return holidaysData.filter(h => h.houseId === houseId);
  },
  
  login: async (email: string, password: string): Promise<User | null> => {
      await new Promise(res => setTimeout(res, 300));
      const user = usersData.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user && user.password === password) {
          const { password: P, ...userWithoutPassword } = user;
          return userWithoutPassword as User;
      }
      return null;
  },

  register: async (userData: Omit<User, 'id' | 'role'>): Promise<{user: User | null; error?: string}> => {
      await new Promise(res => setTimeout(res, 500));
      const existingUser = usersData.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
      if (existingUser) {
          return { user: null, error: 'Un utente con questa email esiste già.' };
      }

      const newUser: User = {
          ...userData,
          id: `user-${Date.now()}`,
          role: Role.GUEST
      };

      usersData.push(newUser);
      console.log("New user registered:", newUser);
      
      const { password, ...userWithoutPassword } = newUser;
      return { user: userWithoutPassword as User };
  },

  // --- Manager Functions (Simulated) ---
  getAllHouses: async (): Promise<House[]> => {
     await new Promise(res => setTimeout(res, 300));
     return currentHouses;
  },

  updateHouse: async (houseToUpdate: House): Promise<House> => {
    console.log("Updating house:", houseToUpdate);
    currentHouses = currentHouses.map(h => h.id === houseToUpdate.id ? houseToUpdate : h);
    return houseToUpdate;
  },
  
  createHouse: async (newHouseData: Omit<House, 'id' | 'updatedAt'>): Promise<House> => {
    const newHouse: House = {
        ...newHouseData,
        id: newHouseData.title.toLowerCase().replace(/\s+/g, '-'),
        updatedAt: new Date().toISOString(),
    };
    console.log("Creating house:", newHouse);
    currentHouses.push(newHouse);
    return newHouse;
  },

  deleteHouse: async (id: string): Promise<{ success: boolean }> => {
    console.log("Deleting house with id:", id);
    currentHouses = currentHouses.filter(h => h.id !== id);
    return { success: true };
  },

  getAllBookings: async (): Promise<Booking[]> => {
    await new Promise(res => setTimeout(res, 400));
    // return a copy sorted by date
    return [...bookingsData].sort((a, b) => new Date(b.from).getTime() - new Date(a.from).getTime());
  },

  updateBookingStatus: async (bookingId: string, status: BookingStatus): Promise<{ success: boolean }> => {
    console.log(`Updating booking ${bookingId} to status ${status}`);
    const bookingIndex = bookingsData.findIndex(b => b.id === bookingId);
    if (bookingIndex !== -1) {
      bookingsData[bookingIndex].status = status;
       // When a booking is approved, let's make sure it's reflected in calendar views
      if (status === BookingStatus.APPROVED) {
        // This is handled client-side in the calendar component's fetch logic.
        // In a real backend, you might trigger other actions here.
      }
      return { success: true };
    }
    return { success: false };
  }
};

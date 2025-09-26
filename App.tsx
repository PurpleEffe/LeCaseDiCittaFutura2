

import React, { useState, useEffect, createContext, useContext, useCallback, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home as HomeIcon, Building2, Calendar as CalendarIcon, Users, Mail, User as UserIcon, LogIn, LogOut, Menu, X, Plus, Trash2, Edit, Check, AlertTriangle, ArrowLeft, CheckCircle, ChevronLeft, ChevronRight, Clock, ThumbsUp, ThumbsDown, UploadCloud } from 'lucide-react';

import { api } from './services/api';
import { House, User, Role, Amenity, Booking, Holiday, BookingStatus } from './types';

// Helper function for timezone-safe date formatting
const toYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// --- AUTH MODAL ---
const AuthModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const { login, register } = useAuth();
    const [view, setView] = useState<'login' | 'register'>('login');
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleClose = () => {
        setEmail('');
        setPassword('');
        setName('');
        setConfirmPassword('');
        setError('');
        setLoading(false);
        setView('login');
        onClose();
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError('Email e password sono obbligatori.');
            return;
        }
        setLoading(true);
        const loggedInUser = await login(email, password);
        setLoading(false);

        if (loggedInUser) {
            if (loggedInUser.role === Role.MANAGER) {
                navigate('/manager');
            }
            handleClose();
        } else {
            setError('Credenziali non valide. Riprova.');
        }
    };
    
    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name || !email || !password || !confirmPassword) {
            setError('Tutti i campi sono obbligatori.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Le password non coincidono.');
            return;
        }
        setLoading(true);
        const { user: newUser, error: registerError } = await register(name, email, password);
        setLoading(false);

        if (newUser) {
            handleClose();
        } else {
            setError(registerError || 'Si è verificato un errore durante la registrazione.');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 relative"
                        onClick={e => e.stopPropagation()}
                    >
                        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-serif text-center mb-6">{view === 'login' ? 'Accedi' : 'Registrati'}</h2>
                        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm" role="alert">{error}</div>}
                        
                        {view === 'login' ? (
                            <form onSubmit={handleLoginSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="email-login" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input type="email" id="email-login" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 bg-white text-brand-dark border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue" required />
                                </div>
                                <div>
                                    <label htmlFor="password-login" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <input type="password" id="password-login" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 bg-white text-brand-dark border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue" required />
                                </div>
                                <button type="submit" disabled={loading} className="w-full bg-brand-blue text-white font-bold py-3 rounded-lg hover:bg-opacity-90 transition-colors disabled:bg-gray-400">
                                    {loading ? 'Accesso...' : 'Accedi'}
                                </button>
                                <p className="text-center text-sm text-gray-600 pt-2">
                                    Non hai un account?{' '}
                                    <button type="button" onClick={() => { setView('register'); setError('') }} className="font-medium text-brand-blue hover:underline">
                                        Registrati
                                    </button>
                                </p>
                            </form>
                        ) : (
                            <form onSubmit={handleRegisterSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="name-reg" className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
                                    <input type="text" id="name-reg" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 bg-white text-brand-dark border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue" required />
                                </div>
                                <div>
                                    <label htmlFor="email-reg" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input type="email" id="email-reg" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 bg-white text-brand-dark border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue" required />
                                </div>
                                <div>
                                    <label htmlFor="password-reg" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <input type="password" id="password-reg" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 bg-white text-brand-dark border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue" required />
                                </div>
                                <div>
                                    <label htmlFor="confirm-password-reg" className="block text-sm font-medium text-gray-700 mb-1">Conferma Password</label>
                                    <input type="password" id="confirm-password-reg" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 bg-white text-brand-dark border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue" required />
                                </div>
                                <button type="submit" disabled={loading} className="w-full bg-brand-ochre text-white font-bold py-3 rounded-lg hover:bg-brand-terracotta transition-colors disabled:bg-gray-400">
                                    {loading ? 'Registrazione...' : 'Registrati'}
                                </button>
                                <p className="text-center text-sm text-gray-600 pt-2">
                                    Hai già un account?{' '}
                                    <button type="button" onClick={() => { setView('login'); setError('') }} className="font-medium text-brand-blue hover:underline">
                                        Accedi
                                    </button>
                                </p>
                            </form>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};


// --- AUTH CONTEXT ---
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  register: (name: string, email: string, password: string) => Promise<{ user: User | null; error?: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for an existing session
    try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
    } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('user');
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    const loggedInUser = await api.login(email, password);
    if (loggedInUser) {
        localStorage.setItem('user', JSON.stringify(loggedInUser));
        setUser(loggedInUser);
    }
    return loggedInUser;
  };
  
  const register = async (name: string, email: string, password: string): Promise<{ user: User | null; error?: string }> => {
        const { user: newUser, error } = await api.register({ name, email, password });
        if (newUser) {
            localStorage.setItem('user', JSON.stringify(newUser));
            setUser(newUser);
        }
        return { user: newUser, error };
    };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, register, logout, loading }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// --- SCROLL TO TOP ---
const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
};


// --- UI COMPONENTS ---
const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8 md:py-16"
    >
        {children}
    </motion.div>
);

const amenityIcons: Record<Amenity, React.ReactNode> = {
    "cucina": <HomeIcon size={16} className="inline mr-2" />,
    "wi-fi": <HomeIcon size={16} className="inline mr-2" />,
    "accessibile": <HomeIcon size={16} className="inline mr-2" />,
    "aria-condizionata": <HomeIcon size={16} className="inline mr-2" />,
    "parcheggio": <HomeIcon size={16} className="inline mr-2" />,
    "vista-mare": <HomeIcon size={16} className="inline mr-2" />,
};

const amenityLabels: Record<Amenity, string> = {
  "cucina": "Cucina Attrezzata",
  "wi-fi": "Wi-Fi",
  "accessibile": "Accessibile",
  "aria-condizionata": "Aria Condizionata",
  "parcheggio": "Parcheggio",
  "vista-mare": "Vista Mare",
};

// --- HEADER & FOOTER ---
const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const NavLink: React.FC<{ to: string, children: React.ReactNode, onClick?: () => void }> = ({ to, children, onClick }) => (
    <Link to={to} onClick={onClick} className="text-gray-600 hover:text-brand-blue transition-colors duration-300 py-2 block md:py-0">{children}</Link>
  );

  const navLinks = (
      <>
        <NavLink to="/" onClick={() => setIsMenuOpen(false)}>Home</NavLink>
        <NavLink to="/case" onClick={() => setIsMenuOpen(false)}>Le Case</NavLink>
        <NavLink to="/chi-siamo" onClick={() => setIsMenuOpen(false)}>Chi Siamo</NavLink>
        {user?.role === Role.MANAGER && <NavLink to="/manager" onClick={() => setIsMenuOpen(false)}>Dashboard</NavLink>}
      </>
  );

  return (
    <>
    <header className="bg-brand-light/80 backdrop-blur-md sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-serif font-bold text-brand-blue">
          Le Case di Città Futura
        </Link>
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks}
        </nav>
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Ciao, {user.name}</span>
              <button onClick={logout} className="p-2 rounded-full hover:bg-red-100 transition-colors">
                <LogOut className="h-5 w-5 text-red-500" />
              </button>
            </div>
          ) : (
            <button onClick={() => setIsAuthModalOpen(true)} className="flex items-center space-x-2 text-gray-600 hover:text-brand-blue transition-colors duration-300">
                <LogIn className="h-5 w-5" />
                <span>Accedi</span>
            </button>
          )}
        </div>
        <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
        </div>
      </div>
      <AnimatePresence>
      {isMenuOpen && (
        <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-brand-light border-t border-gray-200"
        >
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            {navLinks}
            <hr/>
             {user ? (
                <div className="flex flex-col space-y-2">
                  <span className="text-sm text-gray-700 px-4">Ciao, {user.name}</span>
                  <button onClick={() => { logout(); setIsMenuOpen(false);}} className="flex items-center space-x-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-md">
                    <LogOut className="h-5 w-5" />
                    <span>Esci</span>
                  </button>
                </div>
              ) : (
                <button onClick={() => { setIsAuthModalOpen(true); setIsMenuOpen(false); }} className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-md">
                    <LogIn className="h-5 w-5" />
                    <span>Accedi / Registrati</span>
                </button>
              )}
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </header>
    <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};

const Footer: React.FC = () => (
  <footer className="bg-brand-dark text-brand-light mt-16">
    <div className="container mx-auto px-4 py-8 text-center">
      <p>&copy; {new Date().getFullYear()} Associazione Città Futura - Riace. Tutti i diritti riservati.</p>
      <p className="text-sm mt-2">Un progetto di ospitalità e accoglienza solidale.</p>
       <div className="mt-4">
        <a href="http://www.riacecittafutura.org/" target="_blank" rel="noopener noreferrer" className="text-brand-ochre hover:underline">
          Scopri di più sull'associazione
        </a>
      </div>
    </div>
  </footer>
);


// --- PAGE COMPONENTS ---
const HomePage: React.FC = () => {
    const [houses, setHouses] = useState<House[]>([]);

    useEffect(() => {
        api.getHouses().then(data => setHouses(data.slice(0, 3))); // Show 3 featured houses
    }, []);

    return (
        <PageWrapper>
            {/* Hero Section */}
            <motion.section 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="text-center py-20 bg-cover bg-center rounded-lg" 
                style={{backgroundImage: "url('https://picsum.photos/seed/riace-hero/1200/400')"}}
            >
                <div className="bg-black/50 p-10 rounded-lg inline-block">
                    <h1 className="text-4xl md:text-6xl font-serif font-bold text-white">Ospitalità che costruisce futuro</h1>
                    <p className="text-lg md:text-xl text-white/90 mt-4 max-w-2xl mx-auto">
                        Soggiorna in una delle nostre case e sostieni il progetto di accoglienza e rinascita di Riace.
                    </p>
                    <Link to="/case" className="mt-8 inline-block bg-brand-ochre text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-brand-terracotta transition-all duration-300 transform hover:scale-105">
                        Scopri le case
                    </Link>
                </div>
            </motion.section>

            {/* Mission Section */}
            <motion.section 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.7 }}
                className="my-20 text-center"
            >
                <h2 className="text-3xl font-serif text-brand-dark">La nostra Missione</h2>
                <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-700">
                    "Le Case di Città Futura" non è solo un posto dove dormire. È un'esperienza di immersione in un modello di accoglienza unico. Ogni soggiorno contribuisce direttamente a sostenere i nostri progetti sociali, culturali e di integrazione, aiutando a mantenere vivo il sogno di Riace come "paese dell'accoglienza".
                </p>
                <Link to="/chi-siamo" className="mt-6 inline-block text-brand-blue font-semibold hover:underline">
                    Scopri l'associazione &rarr;
                </Link>
            </motion.section>

            {/* Featured Houses */}
            <section className="my-20">
                <h2 className="text-3xl font-serif text-center text-brand-dark mb-10">Le nostre case</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {houses.map((house, index) => (
                        <motion.div
                            key={house.id}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <HouseCard house={house} />
                        </motion.div>
                    ))}
                </div>
            </section>
        </PageWrapper>
    );
};

const HouseCard: React.FC<{ house: House }> = ({ house }) => (
    <Link to={`/case/${house.id}`} className="block group">
        <div className="bg-white rounded-lg shadow-md overflow-hidden h-full transform group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300">
            <img src={house.images[0]} alt={house.title} className="w-full h-56 object-cover" />
            <div className="p-6">
                <h3 className="text-xl font-serif font-bold text-brand-dark">{house.title}</h3>
                <p className="text-gray-600 mt-2">{house.summary}</p>
                <div className="flex items-center text-sm text-gray-500 mt-4 space-x-4">
                    <span className="flex items-center"><Users className="mr-1.5 h-4 w-4 text-brand-green" /> {house.capacity} ospiti</span>
                    <span className="flex items-center"><Building2 className="mr-1.5 h-4 w-4 text-brand-green" /> {house.bedrooms} camere</span>
                </div>
            </div>
        </div>
    </Link>
);


const HousesPage: React.FC = () => {
    const [houses, setHouses] = useState<House[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.getHouses().then(data => {
            setHouses(data);
            setLoading(false);
        });
    }, []);

    if (loading) return <PageWrapper><div className="text-center">Caricamento delle case...</div></PageWrapper>;

    return (
        <PageWrapper>
            <h1 className="text-4xl font-serif text-center mb-12">Tutte le Nostre Case</h1>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {houses.map((house, index) => (
                     <motion.div
                        key={house.id}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                    >
                        <HouseCard house={house} />
                    </motion.div>
                ))}
            </div>
        </PageWrapper>
    );
};

// --- CALENDAR COMPONENT ---
interface CalendarProps {
    houseId: string;
    interactive?: boolean;
    selectedFrom?: string | null;
    selectedTo?: string | null;
    onDateChange?: (dates: { from: string | null; to: string | null }) => void;
}

const Calendar: React.FC<CalendarProps> = ({ houseId, interactive = false, selectedFrom, selectedTo, onDateChange }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [bookedDays, setBookedDays] = useState<Set<string>>(new Set());
    const [holidayDays, setHolidayDays] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    const getDaysSet = (items: (Booking | Holiday)[]) => {
        const days = new Set<string>();
        items.forEach(item => {
            let current = new Date(item.from + 'T00:00:00');
            const end = new Date(item.to + 'T00:00:00');
            while (current <= end) {
                days.add(toYYYYMMDD(current));
                current.setDate(current.getDate() + 1);
            }
        });
        return days;
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [bookings, holidays] = await Promise.all([
                api.getBookingsForHouse(houseId),
                api.getHolidaysForHouse(houseId),
            ]);
            setBookedDays(getDaysSet(bookings));
            setHolidayDays(getDaysSet(holidays));
            setLoading(false);
        };
        fetchData();
    }, [houseId]);

    const handleDayClick = (date: Date) => {
        if (!interactive || !onDateChange) return;

        const dateString = toYYYYMMDD(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const isUnavailable = date < today || bookedDays.has(dateString) || holidayDays.has(dateString);
        if (isUnavailable) return;

        const fromDate = selectedFrom ? new Date(selectedFrom + 'T00:00:00') : null;

        if (!fromDate || (selectedFrom && selectedTo)) {
            onDateChange({ from: dateString, to: null });
        } else if (date < fromDate) {
            onDateChange({ from: dateString, to: null });
        } else {
            let current = new Date(fromDate);
            current.setDate(current.getDate() + 1);
            let conflict = false;
            while (current < date) {
                const currentString = toYYYYMMDD(current);
                if (bookedDays.has(currentString) || holidayDays.has(currentString)) {
                    conflict = true;
                    break;
                }
                current.setDate(current.getDate() + 1);
            }

            if (conflict) {
                onDateChange({ from: dateString, to: null });
            } else {
                onDateChange({ from: selectedFrom, to: dateString });
            }
        }
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const goToPrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    
    const today = new Date();
    today.setHours(0,0,0,0);

    const renderDays = () => {
        const days = [];
        const dayOfWeekOffset = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;

        for (let i = 0; i < dayOfWeekOffset; i++) {
            days.push(<div key={`empty-start-${i}`} className="h-10"></div>);
        }
        
        const fromDate = selectedFrom ? new Date(selectedFrom + 'T00:00:00') : null;
        const toDate = selectedTo ? new Date(selectedTo + 'T00:00:00') : null;

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateString = toYYYYMMDD(date);
            const isPast = date < today;
            const isBooked = bookedDays.has(dateString);
            const isHoliday = holidayDays.has(dateString);
            const isUnavailable = isPast || isBooked || isHoliday;
            
            const isStart = fromDate ? date.getTime() === fromDate.getTime() : false;
            const isEnd = toDate ? date.getTime() === toDate.getTime() : false;
            const isInRange = fromDate && toDate ? (date > fromDate && date < toDate) : false;
            
            let dayClass = 'text-center w-10 h-10 flex items-center justify-center text-sm';
            let wrapperClass = 'flex justify-center items-center';

            if (isUnavailable) {
                 if (isBooked) dayClass += ' bg-red-300 text-red-800 line-through rounded-full';
                 else if (isHoliday) dayClass += ' bg-gray-300 text-gray-600 line-through rounded-full';
                 else dayClass += ' text-gray-400';
            } else { // Available
                 if (isStart && isEnd) { // One-day selection
                    dayClass += ' bg-brand-blue text-white rounded-full font-bold';
                 } else if (isStart) {
                    dayClass += ' bg-brand-blue text-white rounded-full font-bold';
                    if (toDate) {
                        wrapperClass += ' bg-brand-blue/20 rounded-l-full';
                    }
                 } else if (isEnd) {
                    dayClass += ' bg-brand-blue text-white rounded-full font-bold';
                    wrapperClass += ' bg-brand-blue/20 rounded-r-full';
                 }
                 else if(isInRange) {
                    dayClass += ' text-brand-dark';
                    wrapperClass += ' bg-brand-blue/20';
                 } else {
                     dayClass += ' bg-green-200 text-green-800 font-semibold rounded-full';
                     if(interactive) dayClass += ' cursor-pointer hover:bg-green-300';
                 }
            }
            if(date.getTime() === today.getTime() && !isStart && !isEnd){
                 dayClass += ' ring-2 ring-brand-blue';
            }

            days.push(
              <div key={day} className={wrapperClass} onClick={() => handleDayClick(date)}>
                <div className={dayClass}>{day}</div>
              </div>
            );
        }
        return days;
    };
    
    if (loading) return <div className="text-center py-4">Caricamento calendario...</div>;

    const LegendItem: React.FC<{color: string; label: string}> = ({color, label}) => (
        <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full mr-2 ${color}`}></div>
            <span className="text-sm text-gray-600">{label}</span>
        </div>
    );
    
    return (
        <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <button onClick={goToPrevMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft/></button>
                <h3 className="text-lg font-semibold font-serif">
                    {currentDate.toLocaleString('it-IT', { month: 'long', year: 'numeric' })}
                </h3>
                <button onClick={goToNextMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronRight/></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-500 mb-2">
                {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-y-1">
                {renderDays()}
            </div>
            <div className="flex justify-center space-x-4 mt-4 pt-4 border-t">
                <LegendItem color="bg-green-200" label="Libero"/>
                <LegendItem color="bg-red-300" label="Occupato"/>
                <LegendItem color="bg-gray-300" label="Non disponibile"/>
            </div>
        </div>
    );
};


const HouseDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [house, setHouse] = useState<House | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);

    useEffect(() => {
        if (id) {
            setLoading(true);
            api.getHouse(id).then(data => {
                if(data) setHouse(data);
                setLoading(false);
            });
        }
    }, [id]);

    if (loading) return <PageWrapper><div className="text-center">Caricamento...</div></PageWrapper>;
    if (!house) return <PageWrapper><div className="text-center">Casa non trovata.</div></PageWrapper>;

    return (
        <PageWrapper>
            <Link to="/case" className="inline-flex items-center text-brand-blue hover:underline mb-8">
                <ArrowLeft className="mr-2 h-4 w-4"/> Torna a tutte le case
            </Link>
            <div className="grid lg:grid-cols-5 gap-12">
                {/* Image Gallery */}
                <div className="lg:col-span-3">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="relative h-80 md:h-[450px] w-full mb-4 rounded-lg overflow-hidden shadow-lg">
                        <AnimatePresence mode="wait">
                            <motion.img 
                                key={selectedImage}
                                src={house.images[selectedImage]} 
                                alt={`${house.title} - Immagine ${selectedImage + 1}`} 
                                className="w-full h-full object-cover"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            />
                        </AnimatePresence>
                        <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/70 to-transparent rounded-b-lg">
                            <h1 className="text-4xl font-serif font-bold text-white drop-shadow-lg">{house.title}</h1>
                        </div>
                    </motion.div>
                    <div className="grid grid-cols-5 gap-2">
                        {house.images.map((img, index) => (
                            <button key={index} onClick={() => setSelectedImage(index)} className={`rounded overflow-hidden transition-all duration-200 ${selectedImage === index ? 'ring-2 ring-brand-blue ring-offset-2' : 'opacity-70 hover:opacity-100'}`}>
                                <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-20 object-cover" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* House Info */}
                <div className="lg:col-span-2">
                    <p className="text-lg text-gray-700 mt-8 lg:mt-0">{house.description}</p>
                    
                    <div className="mt-8 border-t pt-6">
                        <h3 className="text-xl font-semibold mb-4">Dettagli</h3>
                        <div className="grid grid-cols-2 gap-4 text-gray-800">
                           <span className="flex items-center"><Users className="mr-2 h-5 w-5 text-brand-green" /> {house.capacity} ospiti</span>
                           <span className="flex items-center"><Building2 className="mr-2 h-5 w-5 text-brand-green" /> {house.bedrooms} camere</span>
                           <span className="flex items-center col-span-2"><HomeIcon className="mr-2 h-5 w-5 text-brand-green" /> {house.bathrooms} bagni</span>
                        </div>
                    </div>
                    
                    <div className="mt-8 border-t pt-6">
                        <h3 className="text-xl font-semibold mb-4">Servizi</h3>
                        <ul className="grid grid-cols-2 gap-2">
                            {house.amenities.map(amenity => (
                                <li key={amenity} className="flex items-center text-gray-800">
                                    <Check className="h-4 w-4 text-brand-green mr-2"/> {amenityLabels[amenity]}
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="mt-8 border-t pt-6">
                        <h3 className="text-xl font-semibold mb-4 flex items-center">
                            <CalendarIcon className="mr-2 h-5 w-5 text-brand-green"/> Disponibilità
                        </h3>
                        <Calendar houseId={house.id} />
                    </div>


                    <div className="mt-10">
                        <Link to={`/prenota/${house.id}`} className="w-full text-center bg-brand-ochre text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-brand-terracotta transition-all duration-300 transform hover:scale-105 inline-block">
                            Richiedi prenotazione
                        </Link>
                        <p className="text-sm text-gray-500 mt-2 text-center">Nessun costo. La tua richiesta sarà valutata dalla nostra associazione.</p>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

const BookingPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [house, setHouse] = useState<House | null>(null);
    const [step, setStep] = useState(1);
    const [bookingDetails, setBookingDetails] = useState<{ from: string; to: string; guests: number }>({ from: '', to: '', guests: 1 });
    const [personalDetails, setPersonalDetails] = useState({ name: user?.name || '', email: user?.email || '', notes: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) api.getHouse(id).then(data => { if(data) setHouse(data) });
    }, [id]);

    useEffect(() => {
        if (user) {
            setPersonalDetails(prev => ({ ...prev, name: user.name, email: user.email }));
        }
    }, [user]);
    
    const handleDateChange = ({ from, to }: { from: string | null; to: string | null }) => {
        setBookingDetails(prev => ({ ...prev, from: from || '', to: to || '' }));
        setError('');
    };

    const handleStep1Submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!bookingDetails.from || !bookingDetails.to) {
            setError('Per favore, seleziona le date di arrivo e partenza dal calendario.');
            return;
        }
        if (new Date(bookingDetails.from) >= new Date(bookingDetails.to)) {
            setError('La data di partenza deve essere successiva a quella di arrivo.');
            return;
        }
        setError('');
        setStep(2);
    };

    const handleFinalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!personalDetails.name || !personalDetails.email) {
            setError('Nome e email sono obbligatori.');
            return;
        }
        setError('');
        setIsSubmitting(true);
        
        const bookingRequest: Omit<Booking, 'id' | 'status'> = {
            houseId: house!.id,
            houseTitle: house!.title,
            from: bookingDetails.from,
            to: bookingDetails.to,
            guests: bookingDetails.guests,
            requester: {
                name: personalDetails.name,
                email: personalDetails.email,
                userId: user?.id || null,
            },
            notes: personalDetails.notes
        };
        
        const result = await api.createBooking(bookingRequest);
        setIsSubmitting(false);

        if (result.success) {
            navigate('/conferma-prenotazione');
        } else {
            setError('Si è verificato un errore. Riprova più tardi.');
        }
    };

    if (!house) return <PageWrapper>Caricamento...</PageWrapper>;
    
    return (
        <PageWrapper>
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
                <h1 className="text-3xl font-serif text-center mb-2">Richiesta di Prenotazione</h1>
                <p className="text-center text-lg text-gray-600 mb-8">per <span className="font-bold">{house.title}</span></p>

                {/* Stepper */}
                <div className="flex justify-center items-center mb-8">
                    <div className={`flex items-center ${step >= 1 ? 'text-brand-blue' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${step >= 1 ? 'border-brand-blue bg-brand-blue text-white' : 'border-gray-400'}`}>1</div>
                        <span className="ml-2 font-semibold">Date</span>
                    </div>
                    <div className={`flex-1 h-0.5 mx-4 ${step >= 2 ? 'bg-brand-blue' : 'bg-gray-300'}`}></div>
                    <div className={`flex items-center ${step >= 2 ? 'text-brand-blue' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${step >= 2 ? 'border-brand-blue bg-brand-blue text-white' : 'border-gray-400'}`}>2</div>
                        <span className="ml-2 font-semibold">Dati</span>
                    </div>
                </div>

                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm" role="alert">{error}</div>}

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <h3 className="text-lg font-semibold text-center mb-4 text-gray-800">Seleziona le date del tuo soggiorno</h3>
                            <Calendar
                                houseId={house.id}
                                interactive={true}
                                selectedFrom={bookingDetails.from}
                                selectedTo={bookingDetails.to}
                                onDateChange={handleDateChange}
                            />
                            <form onSubmit={handleStep1Submit} className="mt-6">
                                <div className="mb-6">
                                    <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-1">Numero di ospiti (max: {house.capacity})</label>
                                    <input type="number" id="guests" value={bookingDetails.guests} onChange={e => setBookingDetails({...bookingDetails, guests: Math.max(1, parseInt(e.target.value))})} min="1" max={house.capacity} className="w-full px-3 py-2 bg-white text-brand-dark border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue" />
                                </div>
                                <button type="submit" className="w-full bg-brand-blue text-white font-bold py-3 rounded-lg hover:bg-opacity-90 transition-colors">Continua</button>
                            </form>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.form key="step2" onSubmit={handleFinalSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                             <div className="mb-6 bg-gray-50 p-4 rounded-md border">
                                <h4 className="font-semibold text-gray-800">Riepilogo Soggiorno</h4>
                                <p className="text-sm text-gray-600">
                                    Dal <span className="font-bold">{new Date(bookingDetails.from + 'T00:00:00').toLocaleDateString('it-IT', {day: 'numeric', month: 'long'})}</span>
                                    {' '} al <span className="font-bold">{new Date(bookingDetails.to + 'T00:00:00').toLocaleDateString('it-IT', {day: 'numeric', month: 'long', year: 'numeric'})}</span>
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-bold">{bookingDetails.guests}</span> {bookingDetails.guests > 1 ? 'ospiti' : 'ospite'}
                                </p>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
                                <input type="text" id="name" value={personalDetails.name} onChange={e => setPersonalDetails({...personalDetails, name: e.target.value})} className="w-full px-3 py-2 bg-white text-brand-dark border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue" />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" id="email" value={personalDetails.email} onChange={e => setPersonalDetails({...personalDetails, email: e.target.value})} className="w-full px-3 py-2 bg-white text-brand-dark border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue" />
                            </div>
                            <div className="mb-6">
                                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Note o esigenze particolari (opzionale)</label>
                                <textarea id="notes" rows={4} value={personalDetails.notes} onChange={e => setPersonalDetails({...personalDetails, notes: e.target.value})} className="w-full px-3 py-2 bg-white text-brand-dark border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue"></textarea>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button type="button" onClick={() => setStep(1)} className="w-1/3 bg-gray-200 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-300 transition-colors">Indietro</button>
                                <button type="submit" disabled={isSubmitting} className="w-2/3 bg-brand-ochre text-white font-bold py-3 rounded-lg hover:bg-brand-terracotta transition-colors disabled:bg-gray-400">
                                    {isSubmitting ? 'Invio in corso...' : 'Invia Richiesta'}
                                </button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>
        </PageWrapper>
    );
};

const BookingConfirmationPage: React.FC = () => (
    <PageWrapper>
        <div className="max-w-2xl mx-auto text-center bg-white p-10 rounded-xl shadow-lg">
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
                <Check className="mx-auto h-24 w-24 text-white bg-brand-green rounded-full p-4"/>
            </motion.div>
            <h1 className="text-3xl font-serif mt-6">Richiesta Inviata!</h1>
            <p className="text-lg text-gray-700 mt-4">
                Grazie! Abbiamo ricevuto la tua richiesta di prenotazione. <br/>
                Un membro della nostra associazione ti contatterà via email il prima possibile per confermare la disponibilità e i dettagli del soggiorno.
            </p>
            <Link to="/" className="mt-8 inline-block bg-brand-blue text-white font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-colors">
                Torna alla Home
            </Link>
        </div>
    </PageWrapper>
);

const AboutPage: React.FC = () => (
    <PageWrapper>
        <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-serif text-center mb-10">Chi Siamo</h1>
            <div className="prose lg:prose-lg mx-auto text-gray-800">
                <p>
                    L'associazione <strong>"Città Futura"</strong> è il cuore pulsante del "modello Riace". Nata per promuovere l'accoglienza e l'integrazione di rifugiati e richiedenti asilo, ha trasformato un borgo spopolato in un laboratorio globale di umanità e speranza.
                </p>
                <p>
                    "Le Case di Città Futura" è il nostro progetto di ospitalità diffusa. Non si tratta di un'attività commerciale, ma di un modo per sostenere l'associazione e offrire ai visitatori un'esperienza autentica. Soggiornando in una delle case recuperate del centro storico, diventi parte della nostra comunità e contribuisci a finanziare le nostre attività sociali: laboratori artigianali, corsi di lingua, assistenza legale e molto altro.
                </p>
                <blockquote>
                    "Un'utopia della normalità, dove l'accoglienza non è un'emergenza, ma la base per costruire insieme una società migliore."
                </blockquote>
                <p>
                    La tua visita è più di una vacanza: è un gesto di solidarietà, un'occasione di incontro e uno sguardo su un futuro possibile.
                </p>
                 <div className="text-center mt-12">
                     <a href="http://www.riacecittafutura.org/" target="_blank" rel="noopener noreferrer" className="bg-brand-green text-white font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-colors no-underline">
                        Visita il sito dell'Associazione
                    </a>
                </div>
            </div>
        </div>
    </PageWrapper>
);

// --- MANAGER DASHBOARD ---
const ManagerDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [houses, setHouses] = useState<House[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(() => {
        setLoading(true);
        Promise.all([
            api.getAllHouses(),
            api.getAllBookings()
        ]).then(([houseData, bookingData]) => {
            setHouses(houseData);
            setBookings(bookingData);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        if (user?.role !== Role.MANAGER) {
            navigate('/');
        } else {
            loadData();
        }
    }, [user, navigate, loadData]);

    const handleDelete = async (id: string) => {
        if (window.confirm("Sei sicuro di voler eliminare questa casa? L'azione è irreversibile.")) {
            await api.deleteHouse(id);
            loadData();
        }
    };
    
    if (loading) return <PageWrapper>Caricamento dashboard...</PageWrapper>;

    const totalHouses = houses.length;
    const activeHouses = houses.filter(h => h.active).length;
    const totalCapacity = houses.filter(h => h.active).reduce((sum, h) => sum + h.capacity, 0);
    const pendingRequests = bookings.filter(b => b.status === BookingStatus.PENDING).length;

    // FIX: Refined the `icon` prop's type to be `React.ReactElement<React.SVGAttributes<SVGSVGElement>>`.
    // This makes the type specific enough for TypeScript to validate the `className` prop in `React.cloneElement`.
    const StatCard: React.FC<{ icon: React.ReactElement<React.SVGAttributes<SVGSVGElement>>, label: string, value: string | number, colorClass?: string }> = ({ icon, label, value, colorClass = 'text-brand-blue' }) => (
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
            <div className={`p-3 rounded-full mr-4 ${colorClass}/10`}>
                {React.cloneElement(icon, { className: `h-6 w-6 ${colorClass}` })}
            </div>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-brand-dark">{value}</p>
            </div>
        </div>
    );
    
    return (
        <PageWrapper>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-serif">Dashboard Gestore</h1>
                 <Link to="/manager/case/nuova" className="flex items-center bg-brand-green text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors">
                    <Plus className="mr-2 h-5 w-5"/> Aggiungi Casa
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard icon={<Building2 />} label="Case Totali" value={totalHouses} />
                <StatCard icon={<CheckCircle />} label="Case Attive" value={activeHouses} colorClass="text-brand-green" />
                <StatCard icon={<Users />} label="Capacità Totale" value={`${totalCapacity} Ospiti`} colorClass="text-brand-terracotta" />
                <StatCard icon={<Clock />} label="Richieste in Attesa" value={pendingRequests} colorClass="text-brand-ochre" />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md mb-10">
                <h2 className="text-2xl font-semibold mb-4">Gestione Prenotazioni</h2>
                <p className="text-gray-600 mb-4">
                    Hai {pendingRequests} {pendingRequests === 1 ? 'nuova richiesta' : 'nuove richieste'} da revisionare.
                </p>
                <Link to="/manager/prenotazioni" className="inline-block bg-brand-blue text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-90 transition-colors">
                    Vai alle Prenotazioni
                </Link>
            </div>


            {/* Houses Grid */}
            <h2 className="text-2xl font-semibold mb-6">Gestione Case</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {houses.map(house => (
                    <div key={house.id} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
                        <div className="relative">
                           <img src={house.images[0]} alt={house.title} className="w-full h-48 object-cover" />
                            <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded-full ${house.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {house.active ? 'Attiva' : 'Non Attiva'}
                            </span>
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                            <h3 className="text-lg font-bold font-serif text-brand-dark">{house.title}</h3>
                            <div className="flex items-center text-sm text-gray-500 mt-2 space-x-4">
                                <span className="flex items-center"><Users className="mr-1.5 h-4 w-4 text-brand-green" /> {house.capacity} ospiti</span>
                                <span className="flex items-center"><Building2 className="mr-1.5 h-4 w-4 text-brand-green" /> {house.bedrooms} camere</span>
                            </div>
                            <div className="mt-auto pt-4 flex justify-end space-x-2 border-t border-gray-100 mt-4">
                                <Link to={`/manager/case/modifica/${house.id}`} className="flex items-center bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors py-2 px-3 rounded-md text-sm font-semibold">
                                    <Edit className="h-4 w-4 mr-1.5"/> Modifica
                                </Link>
                                <button onClick={() => handleDelete(house.id)} className="flex items-center bg-red-50 text-red-600 hover:bg-red-100 transition-colors py-2 px-3 rounded-md text-sm font-semibold">
                                    <Trash2 className="h-4 w-4 mr-1.5"/> Elimina
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </PageWrapper>
    );
};

const ManagerBookingsPage: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    
    const loadBookings = useCallback(() => {
        setLoading(true);
        api.getAllBookings().then(data => {
            setBookings(data);
            setLoading(false);
        });
    }, []);

    useEffect(loadBookings, [loadBookings]);
    
    const handleStatusChange = async (bookingId: string, status: BookingStatus) => {
        await api.updateBookingStatus(bookingId, status);
        loadBookings();
    };

    const bookingsByStatus = useMemo(() => ({
        pending: bookings.filter(b => b.status === BookingStatus.PENDING),
        approved: bookings.filter(b => b.status === BookingStatus.APPROVED),
        denied: bookings.filter(b => b.status === BookingStatus.DENIED),
    }), [bookings]);

    const BookingCard: React.FC<{ booking: Booking }> = ({ booking }) => {
        const statusConfig = {
            [BookingStatus.PENDING]: { color: 'border-yellow-500', icon: <Clock className="text-yellow-500"/>, label: 'In Attesa' },
            [BookingStatus.APPROVED]: { color: 'border-green-500', icon: <CheckCircle className="text-green-500"/>, label: 'Approvata' },
            [BookingStatus.DENIED]: { color: 'border-red-500', icon: <X className="text-red-500"/>, label: 'Rifiutata' },
        };
        const { color, icon, label } = statusConfig[booking.status];
        
        return (
            <div className={`bg-white rounded-lg shadow-md border-l-4 ${color} p-4`}>
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="font-bold text-lg">{booking.houseTitle}</h4>
                        <p className="text-sm text-gray-600">
                            dal {new Date(booking.from + 'T00:00:00').toLocaleDateString('it-IT')} al {new Date(booking.to + 'T00:00:00').toLocaleDateString('it-IT')}
                        </p>
                    </div>
                    <div className="flex items-center text-sm font-semibold">
                        {icon}
                        <span className="ml-1.5">{label}</span>
                    </div>
                </div>
                <div className="border-t my-3"></div>
                <div>
                    <p><strong>Richiedente:</strong> {booking.requester.name} ({booking.requester.email})</p>
                    <p><strong>Ospiti:</strong> {booking.guests}</p>
                    {booking.notes && <p className="mt-2 text-sm bg-gray-50 p-2 rounded-md"><strong>Note:</strong> <em>{booking.notes}</em></p>}
                </div>
                {booking.status === BookingStatus.PENDING && (
                    <div className="flex justify-end space-x-2 mt-4">
                        <button onClick={() => handleStatusChange(booking.id, BookingStatus.DENIED)} className="flex items-center bg-red-50 text-red-600 hover:bg-red-100 transition-colors py-2 px-3 rounded-md text-sm font-semibold">
                           <ThumbsDown className="h-4 w-4 mr-1.5"/> Rifiuta
                        </button>
                         <button onClick={() => handleStatusChange(booking.id, BookingStatus.APPROVED)} className="flex items-center bg-green-50 text-green-600 hover:bg-green-100 transition-colors py-2 px-3 rounded-md text-sm font-semibold">
                           <ThumbsUp className="h-4 w-4 mr-1.5"/> Approva
                        </button>
                    </div>
                )}
            </div>
        );
    };
    
    const BookingSection: React.FC<{title: string; bookings: Booking[]}> = ({title, bookings}) => (
        <section className="mb-12">
            <h3 className="text-2xl font-serif mb-4">{title} ({bookings.length})</h3>
            {bookings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {bookings.map(b => <BookingCard key={b.id} booking={b} />)}
                </div>
            ) : (
                <p className="text-gray-500">Nessuna prenotazione in questa categoria.</p>
            )}
        </section>
    );

    if (loading) return <PageWrapper>Caricamento prenotazioni...</PageWrapper>;
    
    return (
        <PageWrapper>
            <Link to="/manager" className="inline-flex items-center text-brand-blue hover:underline mb-8">
                <ArrowLeft className="mr-2 h-4 w-4"/> Torna alla Dashboard
            </Link>
            <h1 className="text-4xl font-serif mb-10">Gestione Prenotazioni</h1>

            <BookingSection title="Richieste in Attesa" bookings={bookingsByStatus.pending} />
            <BookingSection title="Prenotazioni Approvate" bookings={bookingsByStatus.approved} />
            <BookingSection title="Prenotazioni Rifiutate" bookings={bookingsByStatus.denied} />
        </PageWrapper>
    );
};

const HouseEditorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditing = Boolean(id);
    const [house, setHouse] = useState<Omit<House, 'id' | 'updatedAt'>>({
        title: '', summary: '', description: '', capacity: 2, bedrooms: 1, bathrooms: 1,
        amenities: [], images: [], location: { lat: 0, lng: 0, address: '' }, active: true
    });
    const [loading, setLoading] = useState(isEditing);
    const [isDragging, setIsDragging] = useState(false);
    
    useEffect(() => {
        if (isEditing && id) {
            api.getHouse(id).then(data => {
                if (data) {
                    setHouse(data);
                }
                setLoading(false);
            });
        }
    }, [id, isEditing]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'number') {
            setHouse(prev => ({...prev, [name]: parseInt(value) || 0 }));
        } else {
            setHouse(prev => ({...prev, [name]: value }));
        }
    };

    const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setHouse(prev => ({...prev, location: {...prev.location, [name]: value }}));
    };
    
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHouse(prev => ({...prev, active: e.target.checked }));
    };

    const handleAmenityChange = (amenity: Amenity) => {
        setHouse(prev => {
            const newAmenities = prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity];
            return {...prev, amenities: newAmenities };
        });
    };

    const processFiles = (files: File[]) => {
        const imageFiles = files.filter(file => file.type.startsWith('image/'));

        imageFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setHouse(prev => ({
                    ...prev,
                    images: [...prev.images, reader.result as string]
                }));
            };
            reader.readAsDataURL(file);
        });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            processFiles(Array.from(e.target.files));
        }
        e.target.value = '';
    };

    const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(Array.from(e.dataTransfer.files));
            e.dataTransfer.clearData();
        }
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setHouse(prev => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove)
        }));
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            const dataToSave = { ...house, updatedAt: new Date().toISOString() };
            await api.updateHouse(dataToSave as House);
        } else {
            await api.createHouse(house as Omit<House, 'id' | 'updatedAt'>);
        }
        navigate('/manager');
    };

    if (loading) return <PageWrapper>Caricamento dati casa...</PageWrapper>;

    return (
        <PageWrapper>
            <h1 className="text-4xl font-serif mb-10">{isEditing ? 'Modifica Casa' : 'Crea Nuova Casa'}</h1>
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Titolo</label>
                        <input type="text" name="title" value={house.title} onChange={handleInputChange} className="mt-1 block w-full bg-white text-brand-dark border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue" required />
                    </div>
                    <div>
                        <label htmlFor="summary" className="block text-sm font-medium text-gray-700">Sommario (testo breve per card)</label>
                        <textarea name="summary" value={house.summary} onChange={handleInputChange} rows={2} className="mt-1 block w-full bg-white text-brand-dark border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue" required></textarea>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrizione Completa</label>
                        <textarea name="description" value={house.description} onChange={handleInputChange} rows={5} className="mt-1 block w-full bg-white text-brand-dark border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue" required></textarea>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <div>
                            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">Capacità (ospiti)</label>
                            <input type="number" name="capacity" value={house.capacity} onChange={handleInputChange} className="mt-1 block w-full bg-white text-brand-dark border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue" required />
                        </div>
                        <div>
                            <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">Camere da letto</label>
                            <input type="number" name="bedrooms" value={house.bedrooms} onChange={handleInputChange} className="mt-1 block w-full bg-white text-brand-dark border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue" required />
                        </div>
                        <div>
                            <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">Bagni</label>
                            <input type="number" name="bathrooms" value={house.bathrooms} onChange={handleInputChange} className="mt-1 block w-full bg-white text-brand-dark border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue" required />
                        </div>
                    </div>
                    
                    {/* Amenities */}
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Servizi</label>
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                            {Object.entries(amenityLabels).map(([key, label]) => (
                                <label key={key} className="flex items-center">
                                    <input type="checkbox" checked={house.amenities.includes(key as Amenity)} onChange={() => handleAmenityChange(key as Amenity)} className="h-4 w-4 text-brand-blue border-gray-300 rounded" />
                                    <span className="ml-2 text-sm text-gray-700">{label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    
                    {/* Images */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Immagini</label>
                        <div
                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                            onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                            onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
                            onDrop={handleImageDrop}
                            className={`mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md transition-colors ${isDragging ? 'border-brand-blue bg-blue-50' : ''}`}
                        >
                            <div className="space-y-1 text-center">
                                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-brand-blue hover:text-brand-ochre focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-blue">
                                        <span>Carica i file</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handleImageUpload} />
                                    </label>
                                    <p className="pl-1">o trascinali qui</p>
                                </div>
                                <p className="text-xs text-gray-500">File PNG, JPG, GIF</p>
                            </div>
                        </div>

                        {house.images.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {house.images.map((image, index) => (
                                <div key={index} className="relative group aspect-w-1 aspect-h-1">
                                <img src={image} alt={`Anteprima ${index + 1}`} className="h-full w-full object-cover rounded-md shadow-sm" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-md">
                                    <button type="button" onClick={() => handleRemoveImage(index)} className="text-white p-2 bg-red-600 rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/50 focus:ring-red-500">
                                        <Trash2 className="h-5 w-5" />
                                        <span className="sr-only">Rimuovi immagine</span>
                                    </button>
                                </div>
                                </div>
                            ))}
                            </div>
                        )}
                    </div>

                    {/* Location */}
                    <fieldset className="border p-4 rounded-md">
                        <legend className="text-sm font-medium text-gray-700 px-2">Posizione</legend>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div>
                                <label htmlFor="address" className="block text-xs font-medium text-gray-600">Indirizzo</label>
                                <input type="text" name="address" value={house.location.address} onChange={handleLocationChange} className="mt-1 block w-full bg-white text-brand-dark border-gray-300 rounded-md shadow-sm text-sm focus:ring-brand-blue focus:border-brand-blue" />
                            </div>
                            <div>
                                <label htmlFor="lat" className="block text-xs font-medium text-gray-600">Latitudine</label>
                                <input type="number" step="any" name="lat" value={house.location.lat} onChange={handleLocationChange} className="mt-1 block w-full bg-white text-brand-dark border-gray-300 rounded-md shadow-sm text-sm focus:ring-brand-blue focus:border-brand-blue" />
                            </div>
                            <div>
                                <label htmlFor="lng" className="block text-xs font-medium text-gray-600">Longitudine</label>
                                <input type="number" step="any" name="lng" value={house.location.lng} onChange={handleLocationChange} className="mt-1 block w-full bg-white text-brand-dark border-gray-300 rounded-md shadow-sm text-sm focus:ring-brand-blue focus:border-brand-blue" />
                            </div>
                        </div>
                    </fieldset>

                    {/* Status */}
                    <div className="flex items-center">
                        <input type="checkbox" name="active" checked={house.active} onChange={handleCheckboxChange} className="h-4 w-4 text-brand-blue border-gray-300 rounded" />
                        <label htmlFor="active" className="ml-2 block text-sm font-medium text-gray-900">Casa Attiva (visibile sul sito)</label>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-4 pt-4 border-t">
                        <button type="button" onClick={() => navigate('/manager')} className="bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors">Annulla</button>
                        <button type="submit" className="bg-brand-blue text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-90 transition-colors">{isEditing ? 'Salva Modifiche' : 'Crea Casa'}</button>
                    </div>
                </form>
            </div>
        </PageWrapper>
    );
};


// --- MAIN APP ---
const App: React.FC = () => {
  return (
    <AuthProvider>
        <HashRouter>
            <ScrollToTop />
            <Header />
            <main className="flex-grow">
                <AnimatePresence mode="wait">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/case" element={<HousesPage />} />
                        <Route path="/case/:id" element={<HouseDetailPage />} />
                        <Route path="/prenota/:id" element={<BookingPage />} />
                        <Route path="/conferma-prenotazione" element={<BookingConfirmationPage />} />
                        <Route path="/chi-siamo" element={<AboutPage />} />
                        
                        {/* Manager Routes */}
                        <Route path="/manager" element={<ManagerDashboardPage />} />
                        <Route path="/manager/prenotazioni" element={<ManagerBookingsPage />} />
                        <Route path="/manager/case/nuova" element={<HouseEditorPage />} />
                        <Route path="/manager/case/modifica/:id" element={<HouseEditorPage />} />
                    </Routes>
                </AnimatePresence>
            </main>
            <Footer />
        </HashRouter>
    </AuthProvider>
  );
};

// Fix: Removed extraneous text from the end of the file that was causing syntax errors.
export default App;

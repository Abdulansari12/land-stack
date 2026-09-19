import { create } from "zustand";
import type { LandParcelProperties } from "@/data/parcels";
import type { StateDataSource } from "@/lib/schemaAdapter";
import type { Language } from "@/lib/translations";
import type { Theme } from "@/context/ThemeContext";

export type UserRole = "citizen" | "officer" | "bank";

export interface CadastralNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  createdAt: number;
  type: "mutation" | "encroachment" | "ror" | "tax" | "dispute";
  ulpin: string;
  khasraNo: string;
  isRead: boolean;
}

// Pool of authentic simulated government activities mapped to actual parcel ULPINs
export const SIMULATION_EVENTS_POOL = [
  {
    title: "New mutation approved for Parcel #245/2",
    message: "Tehsildar Sadar approved agricultural mutation application for Rameshwar Prasad Sharma.",
    type: "mutation" as const,
    ulpin: "UP26A8941B",
    khasraNo: "Khasra No. 245/2",
  },
  {
    title: "Encroachment flagged near Sector 12",
    message: "Automated Sentinel-2 satellite change detection flagged boundary deviation on Commercial plot.",
    type: "encroachment" as const,
    ulpin: "UP80B3184X",
    khasraNo: "Khasra No. 318/4-Min",
  },
  {
    title: "RoR updated & Aadhaar e-KYC linked",
    message: "Digital title deed updated with Biometric e-Sign confirmation for Sunita Devi Verma.",
    type: "ror" as const,
    ulpin: "UP09K2452M",
    khasraNo: "Khasra No. 102/1-Ka",
  },
  {
    title: "Civil Court dispute notice registered",
    message: "Injunction Order #OS-412/2024 sub judice caveat attached to revenue register.",
    type: "dispute" as const,
    ulpin: "UP28D1891R",
    khasraNo: "Khasra No. 88/3",
  },
  {
    title: "Municipal property tax demand generated",
    message: "FY 2024-25 institutional municipal commercial assessment notice dispatched.",
    type: "tax" as const,
    ulpin: "UP14C5123Z",
    khasraNo: "Khasra No. 512/3",
  },
  {
    title: "Patta transfer mutation confirmed",
    message: "Tamil Nadu e-Services Patta/Chitta transfer finalized by Sriperumbudur Sub-Collector.",
    type: "mutation" as const,
    ulpin: "TN04M4910A",
    khasraNo: "Khasra No. 49/10A",
  },
  {
    title: "Digitally signed survey sketch uploaded",
    message: "Field Measurement Book (FMB) coordinates certified with zero spatial conflicts.",
    type: "ror" as const,
    ulpin: "TN05R1423B",
    khasraNo: "Khasra No. 142/3A1",
  },
  {
    title: "Zoning boundary dispute filed in UT Court",
    message: "Commercial setback encroachment flagged on institutional research campus.",
    type: "dispute" as const,
    ulpin: "CH03I1788C",
    khasraNo: "Khasra No. 88/C-Inst",
  },
  {
    title: "Heritage preservation clearance granted",
    message: "Chandigarh Urban Planning commission approved architectural heritage certification.",
    type: "ror" as const,
    ulpin: "CH01S1742A",
    khasraNo: "Khasra No. 42/B-Sec17",
  },
];

// Initial starter notifications to display on load
export const INITIAL_NOTIFICATIONS: CadastralNotification[] = [
  {
    id: "notif-init-1",
    title: "New mutation approved for Parcel #245/2",
    message: "Tehsildar Sadar approved agricultural mutation application for Rameshwar Prasad Sharma.",
    timestamp: "Just now",
    createdAt: 1774000000000,
    type: "mutation",
    ulpin: "UP26A8941B",
    khasraNo: "Khasra No. 245/2",
    isRead: false,
  },
  {
    id: "notif-init-2",
    title: "Encroachment flagged near Sector 12",
    message: "Automated Sentinel-2 satellite change detection flagged boundary deviation on Commercial plot.",
    timestamp: "1m ago",
    createdAt: 1773999940000,
    type: "encroachment",
    ulpin: "UP80B3184X",
    khasraNo: "Khasra No. 318/4-Min",
    isRead: false,
  },
  {
    id: "notif-init-3",
    title: "RoR updated & Aadhaar e-KYC linked",
    message: "Digital title deed updated with Biometric e-Sign confirmation for Sunita Devi Verma.",
    timestamp: "3m ago",
    createdAt: 1773999820000,
    type: "ror",
    ulpin: "UP09K2452M",
    khasraNo: "Khasra No. 102/1-Ka",
    isRead: false,
  },
];

export interface AppStoreState {
  // 1. Selected Parcel State
  selectedParcel: LandParcelProperties | null;
  setSelectedParcel: (
    parcel:
      | LandParcelProperties
      | null
      | ((prev: LandParcelProperties | null) => LandParcelProperties | null)
  ) => void;

  // 2. User Role State
  userRole: UserRole;
  setUserRole: (role: UserRole | ((prev: UserRole) => UserRole)) => void;
  toggleUserRole: () => void;

  // 3. Current Data Source State
  currentDataSource: StateDataSource;
  setCurrentDataSource: (
    source: StateDataSource | ((prev: StateDataSource) => StateDataSource)
  ) => void;

  // 4. Language State
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;

  // 5. Theme State
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;

  // 6. Cadastral Notifications State
  notifications: CadastralNotification[];
  unreadCount: number;
  setNotifications: (
    notifications:
      | CadastralNotification[]
      | ((prev: CadastralNotification[]) => CadastralNotification[])
  ) => void;
  addNotification: (notification: CadastralNotification) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearAllNotifications: () => void;

  // 7. Drawer & UI States to eliminate prop-drilling
  isDrawerOpen: boolean;
  setIsDrawerOpen: (isOpen: boolean | ((prev: boolean) => boolean)) => void;
  openDrawer: () => void;
  closeDrawer: () => void;

  isPresentationMode: boolean;
  setIsPresentationMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  togglePresentationMode: () => void;

  isBankModalOpen: boolean;
  setIsBankModalOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
  openBankModal: () => void;
  closeBankModal: () => void;

  targetCoordinates: [number, number][] | null;
  setTargetCoordinates: (coords: [number, number][] | null) => void;

  approvedConsentUlpins: string[];
  setApprovedConsentUlpins: (
    ulpins: string[] | ((prev: string[]) => string[])
  ) => void;
  approveConsent: (ulpin: string) => void;

  // 8. Global Reset Demo State Action
  resetDemoState: () => void;
  initFromStorage: () => void;
}

export const useAppStore = create<AppStoreState>((set, get) => ({
  // 1. Selected Parcel
  selectedParcel: null,
  setSelectedParcel: (parcel) =>
    set((state) => ({
      selectedParcel:
        typeof parcel === "function" ? parcel(state.selectedParcel) : parcel,
    })),

  // 2. User Role
  userRole: "citizen",
  setUserRole: (role) =>
    set((state) => ({
      userRole: typeof role === "function" ? role(state.userRole) : role,
    })),
  toggleUserRole: () =>
    set((state) => ({
      userRole:
        state.userRole === "citizen"
          ? "officer"
          : state.userRole === "officer"
          ? "bank"
          : "citizen",
    })),

  // 3. Current Data Source
  currentDataSource: "Tamil Nadu",
  setCurrentDataSource: (source) =>
    set((state) => ({
      currentDataSource:
        typeof source === "function" ? source(state.currentDataSource) : source,
    })),

  // 4. Language
  language: "en",
  setLanguage: (language) => {
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem("land_stack_lang", language);
      } catch {}
    }
    set({ language });
  },
  toggleLanguage: () => {
    const next = get().language === "en" ? "hi" : "en";
    get().setLanguage(next);
  },

  // 5. Theme
  theme: "light",
  isDark: false,
  setTheme: (theme) => {
    if (typeof document !== "undefined") {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem("land_stack_theme", theme);
      } catch {}
    }
    set({ theme, isDark: theme === "dark" });
  },
  toggleTheme: () => {
    const current = get().theme;
    const next = current === "light" ? "dark" : "light";
    get().setTheme(next);
  },

  // 6. Notifications
  notifications: INITIAL_NOTIFICATIONS,
  unreadCount: INITIAL_NOTIFICATIONS.filter((n) => !n.isRead).length,
  setNotifications: (updater) => {
    set((state) => {
      const next =
        typeof updater === "function" ? updater(state.notifications) : updater;
      const unread = next.filter((n) => !n.isRead).length;
      return { notifications: next, unreadCount: unread };
    });
  },
  addNotification: (notification) => {
    set((state) => {
      const next = [notification, ...state.notifications.slice(0, 19)];
      const unread = next.filter((n) => !n.isRead).length;
      return { notifications: next, unreadCount: unread };
    });
  },
  markNotificationRead: (id) => {
    set((state) => {
      const next = state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      );
      const unread = next.filter((n) => !n.isRead).length;
      return { notifications: next, unreadCount: unread };
    });
  },
  markAllNotificationsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },
  clearAllNotifications: () => {
    set({
      notifications: [],
      unreadCount: 0,
    });
  },

  // 7. Drawer & UI States
  isDrawerOpen: false,
  setIsDrawerOpen: (isOpen) =>
    set((state) => ({
      isDrawerOpen:
        typeof isOpen === "function" ? isOpen(state.isDrawerOpen) : isOpen,
    })),
  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false, selectedParcel: null }),

  isPresentationMode: false,
  setIsPresentationMode: (val) => {
    set((state) => ({
      isPresentationMode:
        typeof val === "function" ? val(state.isPresentationMode) : val,
    }));
  },
  togglePresentationMode: () => {
    set((state) => ({ isPresentationMode: !state.isPresentationMode }));
  },

  isBankModalOpen: false,
  setIsBankModalOpen: (val) => {
    set((state) => ({
      isBankModalOpen:
        typeof val === "function" ? val(state.isBankModalOpen) : val,
    }));
  },
  openBankModal: () => set({ isBankModalOpen: true }),
  closeBankModal: () => set({ isBankModalOpen: false }),

  targetCoordinates: null,
  setTargetCoordinates: (coords) => set({ targetCoordinates: coords }),

  approvedConsentUlpins: [],
  setApprovedConsentUlpins: (updater) => {
    set((state) => ({
      approvedConsentUlpins:
        typeof updater === "function"
          ? updater(state.approvedConsentUlpins)
          : updater,
    }));
  },
  approveConsent: (ulpin) => {
    set((state) => {
      if (state.approvedConsentUlpins.includes(ulpin)) return state;
      return {
        approvedConsentUlpins: [...state.approvedConsentUlpins, ulpin],
      };
    });
  },

  // 8. Global Reset Demo State
  resetDemoState: () => {
    set({
      selectedParcel: null,
      userRole: "citizen",
      currentDataSource: "Tamil Nadu",
      isDrawerOpen: false,
      isPresentationMode: false,
      isBankModalOpen: false,
      approvedConsentUlpins: [],
      notifications: INITIAL_NOTIFICATIONS,
      unreadCount: INITIAL_NOTIFICATIONS.filter((n) => !n.isRead).length,
      targetCoordinates: null,
    });

    if (typeof window !== "undefined") {
      try {
        const theme = localStorage.getItem("land_stack_theme");
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (
            key &&
            (key.startsWith("landstack_demo_") ||
              key.startsWith("landstack_mutation_") ||
              key.startsWith("landstack_consent_"))
          ) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
        if (theme) {
          localStorage.setItem("land_stack_theme", theme);
        }
      } catch {}
      window.dispatchEvent(new CustomEvent("landstack:reset-demo"));
    }
  },

  initFromStorage: () => {
    if (typeof window === "undefined") return;
    try {
      const savedTheme = localStorage.getItem("land_stack_theme") as Theme | null;
      if (savedTheme === "dark" || savedTheme === "light") {
        get().setTheme(savedTheme);
      } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        get().setTheme("dark");
      }
      const savedLang = localStorage.getItem("land_stack_lang") as Language | null;
      if (savedLang === "en" || savedLang === "hi") {
        get().setLanguage(savedLang);
      }
    } catch {}
  },
}));

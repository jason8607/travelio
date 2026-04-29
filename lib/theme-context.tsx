"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark" | "japanese";

export const THEME_OPTIONS: {
  value: Theme;
  label: string;
  description: string;
  swatches: [string, string, string];
}[] = [
  {
    value: "light",
    label: "淺色",
    description: "白底＋藍色，清爽簡約",
    swatches: ["#FFFFFF", "#2563EB", "#F1F5F9"],
  },
  {
    value: "dark",
    label: "深色",
    description: "黑底＋靛藍，低調沉穩",
    swatches: ["#0B0B0F", "#818CF8", "#1C1C22"],
  },
  {
    value: "japanese",
    label: "和風",
    description: "和紙米白＋墨黑＋朱紅，日式 editorial 風格",
    swatches: ["#F4EFE6", "#B83A26", "#1A1815"],
  },
];

const THEME_BG: Record<Theme, string> = {
  light: "#FFFFFF",
  dark: "#0B0B0F",
  japanese: "#F4EFE6",
};

export const DEFAULT_THEME: Theme = "light";
const STORAGE_KEY = "theme";
const THEME_CHANGE_EVENT = "theme-change";
let fallbackTheme: Theme = DEFAULT_THEME;

function isTheme(v: unknown): v is Theme {
  return v === "light" || v === "dark" || v === "japanese";
}

/**
 * Serialisable init script that sets the theme before React hydrates.
 * Inlined into <head> to avoid a flash of unstyled content.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}');if(t!=='light'&&t!=='dark'&&t!=='japanese')t='${DEFAULT_THEME}';var d=document.documentElement;d.setAttribute('data-theme',t);if(t==='dark')d.classList.add('dark');else d.classList.remove('dark');var bg=t==='dark'?'#0B0B0F':t==='japanese'?'#F4EFE6':'#FFFFFF';var m=document.querySelector('meta[name="theme-color"]');if(!m){m=document.createElement('meta');m.setAttribute('name','theme-color');document.head.appendChild(m);}m.setAttribute('content',bg);}catch(e){}})();`;

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.classList.toggle("dark", theme === "dark");

  // Keep the mobile browser chrome colour in sync with the active theme.
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", THEME_BG[theme]);
}

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return DEFAULT_THEME;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isTheme(stored)) return stored;
  } catch {
    // ignore
  }

  return fallbackTheme;
}

function subscribeToThemeChange(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
  };
}

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeToThemeChange,
    getStoredTheme,
    () => DEFAULT_THEME
  );

  const setTheme = useCallback((next: Theme) => {
    fallbackTheme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    applyTheme(next);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

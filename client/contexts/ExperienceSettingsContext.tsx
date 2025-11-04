import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type ExperienceTheme = "dark" | "light";

export type ExperienceSettings = {
  theme: ExperienceTheme;
  motionEnabled: boolean;
  highContrast: boolean;
  textScale: number;
  crtEnabled: boolean;
  grainEnabled: boolean;
  audioEnabled: boolean;
  startupSoundEnabled: boolean;
  webglPreferred: boolean;
};

export type ExperienceSettingsContextValue = {
  settings: ExperienceSettings;
  updateSetting: <K extends keyof ExperienceSettings>(
    key: K,
    value: ExperienceSettings[K],
  ) => void;
  reset: () => void;
};

const DEFAULT_SETTINGS: ExperienceSettings = {
  theme: "dark",
  motionEnabled: true,
  highContrast: false,
  textScale: 1,
  crtEnabled: false,
  grainEnabled: true,
  audioEnabled: false,
  startupSoundEnabled: false,
  webglPreferred: true,
};

const STORAGE_KEY = "pirtatage-experience-settings";

const ExperienceSettingsContext = createContext<
  ExperienceSettingsContextValue | undefined
>(undefined);

export const ExperienceSettingsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [settings, setSettings] = useState<ExperienceSettings>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_SETTINGS;
    }

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return {
          ...DEFAULT_SETTINGS,
          motionEnabled: !prefersReducedMotion,
        };
      }

      const parsed = JSON.parse(stored) as Partial<ExperienceSettings>;
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        motionEnabled:
          typeof parsed.motionEnabled === "boolean"
            ? parsed.motionEnabled && !prefersReducedMotion
            : !prefersReducedMotion,
      } satisfies ExperienceSettings;
    } catch (error) {
      console.warn("Failed to parse experience settings", error);
      return {
        ...DEFAULT_SETTINGS,
        motionEnabled: !prefersReducedMotion,
      };
    }
  });

  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  useEffect(() => {
    applyMotion(settings.motionEnabled);
  }, [settings.motionEnabled]);

  useEffect(() => {
    applyContrast(settings.highContrast);
  }, [settings.highContrast]);

  useEffect(() => {
    applyTextScale(settings.textScale);
  }, [settings.textScale]);

  useEffect(() => {
    applyCRT(settings.crtEnabled);
  }, [settings.crtEnabled]);

  useEffect(() => {
    applyGrain(settings.grainEnabled);
  }, [settings.grainEnabled]);

  useEffect(() => {
    persistSettings(settings);
  }, [settings]);

  const updateSetting = useCallback(
    <K extends keyof ExperienceSettings>(
      key: K,
      value: ExperienceSettings[K],
    ) => {
      setSettings((prev) => {
        if (prev[key] === value) {
          return prev;
        }

        const next = {
          ...prev,
          [key]: value,
        } as ExperienceSettings;
        return next;
      });
    },
  []);

  const reset = useCallback(() => {
    setSettings({
      ...DEFAULT_SETTINGS,
      motionEnabled: !prefersReducedMotion,
    });
  }, [prefersReducedMotion]);

  const value = useMemo<ExperienceSettingsContextValue>(
    () => ({
      settings,
      updateSetting,
      reset,
    }),
    [settings, updateSetting, reset],
  );

  return (
    <ExperienceSettingsContext.Provider value={value}>
      {children}
    </ExperienceSettingsContext.Provider>
  );
};

export const useExperienceSettings = () => {
  const context = useContext(ExperienceSettingsContext);

  if (!context) {
    throw new Error(
      "useExperienceSettings must be used within ExperienceSettingsProvider",
    );
  }

  return context;
};

const applyTheme = (theme: ExperienceTheme) => {
  const root = document.documentElement;
  if (theme === "light") {
    root.classList.add("light");
    root.setAttribute("data-theme", "light");
  } else {
    root.classList.remove("light");
    root.removeAttribute("data-theme");
  }
};

const applyMotion = (enabled: boolean) => {
  const root = document.documentElement;
  if (enabled) {
    root.removeAttribute("data-reduce-motion");
  } else {
    root.setAttribute("data-reduce-motion", "true");
  }
};

const applyContrast = (enabled: boolean) => {
  const root = document.documentElement;
  if (enabled) {
    root.setAttribute("data-contrast", "high");
  } else {
    root.removeAttribute("data-contrast");
  }
};

const applyTextScale = (scale: number) => {
  const root = document.documentElement;
  const clamped = Math.min(Math.max(scale, 0.85), 1.35);
  root.style.setProperty("--text-scale", clamped.toString());
  root.style.setProperty("font-size", `${clamped * 100}%`);
};

const applyCRT = (enabled: boolean) => {
  document.body.classList.toggle("CRT-off", !enabled);
};

const applyGrain = (enabled: boolean) => {
  if (enabled) {
    document.body.removeAttribute("data-grain");
  } else {
    document.body.setAttribute("data-grain", "off");
  }
};

const persistSettings = (settings: ExperienceSettings) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn("Unable to persist experience settings", error);
  }
};

const usePrefersReducedMotion = () => {
  const query = "(prefers-reduced-motion: reduce)";
  const mediaQuery = useRef<MediaQueryList | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }

    mediaQuery.current = window.matchMedia(query);
    const handler = () => {
      setPrefersReducedMotion(Boolean(mediaQuery.current?.matches));
    };

    handler();
    mediaQuery.current?.addEventListener("change", handler);

    return () => mediaQuery.current?.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
};

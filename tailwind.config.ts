import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: ["./client/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        neon: {
          teal: "hsl(var(--neon-teal))",
          purple: "hsl(var(--neon-purple))",
          gold: "hsl(var(--warning-gold))",
        },
        panel: {
          DEFAULT: "hsl(var(--panel))",
          ring: "hsl(var(--panel-ring))",
          accent: "hsl(var(--panel-accent))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 6px)",
      },
      fontFamily: {
        display: ["\"Space Grotesk\"", "Inter", "sans-serif"],
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["\"JetBrains Mono\"", "SFMono-Regular", "Menlo", "monospace"],
      },
      backgroundImage: {
        "cyber-sky":
          "linear-gradient(180deg, rgba(6, 2, 24, 0.95) 0%, rgba(8, 4, 32, 0.93) 35%, rgba(6, 2, 24, 0.98) 100%)",
        "cyber-grid":
          "radial-gradient(circle at 20% 20%, rgba(124, 77, 255, 0.35), transparent 55%), radial-gradient(circle at 80% 5%, rgba(0, 255, 209, 0.25), transparent 45%)",
        glass:
          "linear-gradient(135deg, rgba(28, 7, 55, 0.95) 0%, rgba(15, 8, 30, 0.75) 100%)",
        scanlines:
          "repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.06) 0, rgba(255, 255, 255, 0.06) 1px, transparent 1px, transparent 3px)",
      },
      boxShadow: {
        glow: "0 0 25px rgba(0, 255, 209, 0.45), 0 0 45px rgba(124, 77, 255, 0.35)",
        "glow-strong": "0 0 35px rgba(0, 255, 209, 0.6), 0 0 55px rgba(124, 77, 255, 0.5)",
        "inner-glass": "inset 0 0 0 1px rgba(124, 77, 255, 0.35)",
      },
      dropShadow: {
        neon: "0 0 0.75rem rgba(0, 255, 209, 0.8)",
        purple: "0 0 0.75rem rgba(124, 77, 255, 0.75)",
        gold: "0 0 0.75rem rgba(255, 204, 51, 0.75)",
      },
      backdropBlur: {
        xs: "2px",
        md: "18px",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "pulse-glow": {
          "0%": {
            boxShadow: "0 0 12px rgba(0, 255, 209, 0.35), 0 0 18px rgba(124, 77, 255, 0.25)",
          },
          "50%": {
            boxShadow: "0 0 28px rgba(0, 255, 209, 0.55), 0 0 36px rgba(124, 77, 255, 0.45)",
          },
          "100%": {
            boxShadow: "0 0 12px rgba(0, 255, 209, 0.35), 0 0 18px rgba(124, 77, 255, 0.25)",
          },
        },
        float: {
          "0%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -12px, 6px)" },
          "100%": { transform: "translate3d(0, 0, 0)" },
        },
        "scanline-sweep": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "grain-twinkle": {
          "0%": { opacity: "0.15" },
          "50%": { opacity: "var(--grain-opacity)" },
          "100%": { opacity: "0.1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2.6s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "scanline-sweep": "scanline-sweep 9s linear infinite",
        "grain-twinkle": "grain-twinkle 8s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;

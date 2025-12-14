import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
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
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Space Grotesk', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
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
          muted: "hsl(var(--sidebar-muted))",
        },
        status: {
          queue: "hsl(var(--status-queue))",
          "queue-foreground": "hsl(var(--status-queue-foreground))",
          ready: "hsl(var(--status-ready))",
          "ready-foreground": "hsl(var(--status-ready-foreground))",
          scheduled: "hsl(var(--status-scheduled))",
          "scheduled-foreground": "hsl(var(--status-scheduled-foreground))",
          production: "hsl(var(--status-production))",
          "production-foreground": "hsl(var(--status-production-foreground))",
          finished: "hsl(var(--status-finished))",
          "finished-foreground": "hsl(var(--status-finished-foreground))",
          paused: "hsl(var(--status-paused))",
          "paused-foreground": "hsl(var(--status-paused-foreground))",
          cancelled: "hsl(var(--status-cancelled))",
          "cancelled-foreground": "hsl(var(--status-cancelled-foreground))",
          delayed: "hsl(var(--status-delayed))",
          "delayed-foreground": "hsl(var(--status-delayed-foreground))",
          rework: "hsl(var(--status-rework))",
          "rework-foreground": "hsl(var(--status-rework-foreground))",
        },
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        xp: "hsl(var(--xp))",
        coins: "hsl(var(--coins))",
        streak: "hsl(var(--streak))",
        gold: {
          DEFAULT: "hsl(var(--gold))",
          foreground: "hsl(var(--gold-foreground))",
        },
        silver: {
          DEFAULT: "hsl(var(--silver))",
          foreground: "hsl(var(--silver-foreground))",
        },
        bronze: {
          DEFAULT: "hsl(var(--bronze))",
          foreground: "hsl(var(--bronze-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        'elevation-1': '0 1px 3px 0 hsl(var(--foreground) / 0.1), 0 1px 2px -1px hsl(var(--foreground) / 0.1)',
        'elevation-2': '0 4px 6px -1px hsl(var(--foreground) / 0.1), 0 2px 4px -2px hsl(var(--foreground) / 0.1)',
        'elevation-3': '0 10px 15px -3px hsl(var(--foreground) / 0.1), 0 4px 6px -4px hsl(var(--foreground) / 0.1)',
        'elevation-4': '0 20px 25px -5px hsl(var(--foreground) / 0.1), 0 8px 10px -6px hsl(var(--foreground) / 0.1)',
        'glow-sm': '0 0 15px -3px hsl(var(--primary) / 0.3)',
        'glow-md': '0 0 25px -5px hsl(var(--primary) / 0.4)',
        'glow-lg': '0 0 40px -5px hsl(var(--primary) / 0.5)',
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '250ms',
        'slow': '400ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-left": {
          from: { transform: "translateX(-100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px -5px hsl(var(--primary) / 0.4)" },
          "50%": { boxShadow: "0 0 30px -5px hsl(var(--primary) / 0.6)" },
        },
        "shimmer": {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" },
        },
        "float": {
          "0%": { transform: "translate(0, 0)" },
          "25%": { transform: "translate(5px, -8px)" },
          "50%": { transform: "translate(-3px, -5px)" },
          "75%": { transform: "translate(-6px, -10px)" },
          "100%": { transform: "translate(0, 0)" },
        },
        "gradient-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "ripple": {
          "0%": { transform: "scale(0)", opacity: "0.5" },
          "100%": { transform: "scale(4)", opacity: "0" },
        },
        "confetti-burst": {
          "0%": { 
            transform: "translate(0, 0) rotate(0deg) scale(1)", 
            opacity: "1" 
          },
          "15%": { 
            transform: "translate(calc(var(--confetti-x) * 0.3), calc(var(--confetti-y) * 0.5)) rotate(180deg) scale(1.1)", 
            opacity: "1" 
          },
          "30%": { 
            transform: "translate(calc(var(--confetti-x) * 0.6), calc(var(--confetti-y) * 0.8)) rotate(360deg) scale(1.05)", 
            opacity: "1" 
          },
          "45%": { 
            transform: "translate(calc(var(--confetti-x) * 0.8), calc(var(--confetti-y) * 0.5 + 10px)) rotate(540deg) scale(0.95)", 
            opacity: "0.9" 
          },
          "60%": { 
            transform: "translate(calc(var(--confetti-x) * 0.9), calc(var(--confetti-y) * 0.3 + 40px)) rotate(720deg) scale(0.85)", 
            opacity: "0.7" 
          },
          "80%": { 
            transform: "translate(calc(var(--confetti-x) * 0.95), calc(var(--confetti-y) + 100px)) rotate(900deg) scale(0.6)", 
            opacity: "0.4" 
          },
          "100%": { 
            transform: "translate(var(--confetti-x), calc(var(--confetti-y) + 180px)) rotate(1080deg) scale(0.3)", 
            opacity: "0" 
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.4s ease-out",
        "fade-in-up": "fade-in-up 0.5s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.4s ease-out",
        "slide-in-left": "slide-in-left 0.4s ease-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "shimmer": "shimmer 3s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "enter": "fade-in 0.3s ease-out, scale-in 0.2s ease-out",
        "gradient-shift": "gradient-shift 2s ease infinite",
        "ripple": "ripple 0.6s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

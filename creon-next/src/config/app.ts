export const APP_CONFIG = {
  // App Identity
  name: "RavishingRavisha",
  tagline: "Your Links, Your Story",
  description:
    "Create a stunning bio page that showcases all your links, products, and social media in one place. Built for creators, businesses, and influencers who want to make an impact.",

  // Logo and Branding
  logo: {
    src: "/logo.png",
    alt: "Creon Logo",
    width: 40,
    height: 40,
  },

  // Colors (Lavender/Purple Theme)
  colors: {
    primary: {
      50: "#faf5ff",
      100: "#f3e8ff",
      200: "#e9d5ff",
      300: "#d8b4fe",
      400: "#c084fc",
      500: "#a855f7",
      600: "#9333ea",
      700: "#7c3aed",
      800: "#6b21a8",
      900: "#581c87",
    },
    secondary: {
      50: "#fdf4ff",
      100: "#fae8ff",
      200: "#f5d0fe",
      300: "#f0abfc",
      400: "#e879f9",
      500: "#d946ef",
      600: "#c026d3",
      700: "#a21caf",
      800: "#86198f",
      900: "#701a75",
    },
    accent: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
    },
  },

  // Gradients
  gradients: {
    primary: "bg-gradient-to-r from-purple-600 to-violet-600",
    secondary: "bg-gradient-to-r from-purple-500 to-pink-500",
    background: "bg-gradient-to-br from-purple-50 via-violet-50 to-pink-50",
    card: "bg-gradient-to-br from-purple-50/40 via-white to-violet-50/40",
  },

  // Theme Classes
  theme: {
    // Buttons
    btnPrimary:
      "bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700",
    btnSecondary:
      "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
    btnOutline:
      "border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white",

    // Backgrounds
    pageBackground: "bg-gradient-to-br from-purple-50 via-violet-50 to-pink-50",
    cardBackground: "bg-white/95 backdrop-blur-xl",
    sidebarBackground: "bg-white/95 backdrop-blur-xl",

    // Text
    primaryText: "text-gray-900",
    secondaryText: "text-gray-600",
    accentText: "text-purple-600",
    gradientText:
      "bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent",

    // Borders and rings
    border: "border-purple-200/50",
    ring: "ring-purple-500/25",
    focusRing: "focus:ring-purple-500/25 focus:border-purple-500",

    // Icons and accents
    iconBg: "bg-purple-500",
    iconBgSecondary: "bg-violet-500",
    iconBgAccent: "bg-pink-500",
    activeIndicator: "bg-purple-400",

    // Shadows
    shadow: "shadow-purple-500/10",
    shadowHover: "hover:shadow-purple-500/20",
  },

  // Social Links
  social: {
    website: "https://creon.example.com",
    twitter: "@creon",
    instagram: "@creon",
  },

  // Features
  features: {
    enableAnalytics: true,
    enableShop: true,
    enableInfluencerTracker: true,
    enableMediaGenerator: true,
    enableRoleManagement: true,
  },

  // Default Settings
  defaults: {
    profileTheme: "lavender",
    currency: "USD",
    timezone: "UTC",
  },
} as const;

export type AppConfig = typeof APP_CONFIG;

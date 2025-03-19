module.exports = {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "color-schemes-color-scheme-1-accent":
          "var(--color-schemes-color-scheme-1-accent)",
        "color-schemes-color-scheme-1-background":
          "var(--color-schemes-color-scheme-1-background)",
        "color-schemes-color-scheme-2-foreground":
          "var(--color-schemes-color-scheme-2-foreground)",
        "primitives-color-aqua-forest": "var(--primitives-color-aqua-forest)",
        "primitives-color-aqua-forest-dark":
          "var(--primitives-color-aqua-forest-dark)",
        "primitives-color-aqua-forest-darker":
          "var(--primitives-color-aqua-forest-darker)",
        "primitives-color-aqua-forest-darkest":
          "var(--primitives-color-aqua-forest-darkest)",
        "primitives-color-aqua-forest-light":
          "var(--primitives-color-aqua-forest-light)",
        "primitives-color-aqua-forest-lighter":
          "var(--primitives-color-aqua-forest-lighter)",
        "primitives-color-aqua-forest-lightest":
          "var(--primitives-color-aqua-forest-lightest)",
        "primitives-color-jonquil-dark": "var(--primitives-color-jonquil-dark)",
        "primitives-color-jonquil-darker":
          "var(--primitives-color-jonquil-darker)",
        "primitives-color-jonquil-darkest":
          "var(--primitives-color-jonquil-darkest)",
        "primitives-color-jonquil-lighter":
          "var(--primitives-color-jonquil-lighter)",
        "primitives-color-jonquil-lightest":
          "var(--primitives-color-jonquil-lightest)",
        "primitives-color-neutral": "var(--primitives-color-neutral)",
        "primitives-color-neutral-dark": "var(--primitives-color-neutral-dark)",
        "primitives-color-neutral-darker":
          "var(--primitives-color-neutral-darker)",
        "primitives-color-neutral-light":
          "var(--primitives-color-neutral-light)",
        "primitives-color-neutral-lighter":
          "var(--primitives-color-neutral-lighter)",
        "primitives-color-neutral-lightest":
          "var(--primitives-color-neutral-lightest)",
        "primitives-color-teak": "var(--primitives-color-teak)",
        "primitives-color-teak-dark": "var(--primitives-color-teak-dark)",
        "primitives-color-teak-darker": "var(--primitives-color-teak-darker)",
        "primitives-color-teak-darkest": "var(--primitives-color-teak-darkest)",
        "primitives-color-teak-light": "var(--primitives-color-teak-light)",
        "primitives-color-teak-lighter": "var(--primitives-color-teak-lighter)",
        "primitives-color-teak-lightest":
          "var(--primitives-color-teak-lightest)",
        "primitives-color-white": "var(--primitives-color-white)",
        "primitives-opacity-neutral-darkest-10":
          "var(--primitives-opacity-neutral-darkest-10)",
        "primitives-opacity-neutral-darkest-15":
          "var(--primitives-opacity-neutral-darkest-15)",
        "primitives-opacity-neutral-darkest-20":
          "var(--primitives-opacity-neutral-darkest-20)",
        "primitives-opacity-neutral-darkest-30":
          "var(--primitives-opacity-neutral-darkest-30)",
        "primitives-opacity-neutral-darkest-40":
          "var(--primitives-opacity-neutral-darkest-40)",
        "primitives-opacity-neutral-darkest-5":
          "var(--primitives-opacity-neutral-darkest-5)",
        "primitives-opacity-neutral-darkest-50":
          "var(--primitives-opacity-neutral-darkest-50)",
        "primitives-opacity-neutral-darkest-60":
          "var(--primitives-opacity-neutral-darkest-60)",
        "primitives-opacity-transparent":
          "var(--primitives-opacity-transparent)",
        "primitives-opacity-white-10": "var(--primitives-opacity-white-10)",
        "primitives-opacity-white-15": "var(--primitives-opacity-white-15)",
        "primitives-opacity-white-20": "var(--primitives-opacity-white-20)",
        "primitives-opacity-white-30": "var(--primitives-opacity-white-30)",
        "primitives-opacity-white-40": "var(--primitives-opacity-white-40)",
        "primitives-opacity-white-5": "var(--primitives-opacity-white-5)",
        "primitives-opacity-white-50": "var(--primitives-opacity-white-50)",
        "primitives-opacity-white-60": "var(--primitives-opacity-white-60)",
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
      },
      fontFamily: {
        "heading-desktop-h1": "var(--heading-desktop-h1-font-family)",
        "heading-desktop-h2": "var(--heading-desktop-h2-font-family)",
        "heading-desktop-h3": "var(--heading-desktop-h3-font-family)",
        "heading-desktop-h4": "var(--heading-desktop-h4-font-family)",
        "heading-desktop-h5": "var(--heading-desktop-h5-font-family)",
        "heading-desktop-h6": "var(--heading-desktop-h6-font-family)",
        "heading-desktop-tagline": "var(--heading-desktop-tagline-font-family)",
        "heading-mobile-h1": "var(--heading-mobile-h1-font-family)",
        "heading-mobile-h2": "var(--heading-mobile-h2-font-family)",
        "heading-mobile-h3": "var(--heading-mobile-h3-font-family)",
        "heading-mobile-h4": "var(--heading-mobile-h4-font-family)",
        "heading-mobile-h5": "var(--heading-mobile-h5-font-family)",
        "heading-mobile-h6": "var(--heading-mobile-h6-font-family)",
        "text-large-bold": "var(--text-large-bold-font-family)",
        "text-large-extra-bold": "var(--text-large-extra-bold-font-family)",
        "text-large-light": "var(--text-large-light-font-family)",
        "text-large-link": "var(--text-large-link-font-family)",
        "text-large-medium": "var(--text-large-medium-font-family)",
        "text-large-normal": "var(--text-large-normal-font-family)",
        "text-large-semi-bold": "var(--text-large-semi-bold-font-family)",
        "text-medium-bold": "var(--text-medium-bold-font-family)",
        "text-medium-extra-bold": "var(--text-medium-extra-bold-font-family)",
        "text-medium-light": "var(--text-medium-light-font-family)",
        "text-medium-link": "var(--text-medium-link-font-family)",
        "text-medium-medium": "var(--text-medium-medium-font-family)",
        "text-medium-normal": "var(--text-medium-normal-font-family)",
        "text-medium-semi-bold": "var(--text-medium-semi-bold-font-family)",
        "text-regular-bold": "var(--text-regular-bold-font-family)",
        "text-regular-extra-bold": "var(--text-regular-extra-bold-font-family)",
        "text-regular-light": "var(--text-regular-light-font-family)",
        "text-regular-link": "var(--text-regular-link-font-family)",
        "text-regular-medium": "var(--text-regular-medium-font-family)",
        "text-regular-normal": "var(--text-regular-normal-font-family)",
        "text-regular-semi-bold": "var(--text-regular-semi-bold-font-family)",
        "text-small-bold": "var(--text-small-bold-font-family)",
        "text-small-extra-bold": "var(--text-small-extra-bold-font-family)",
        "text-small-light": "var(--text-small-light-font-family)",
        "text-small-link": "var(--text-small-link-font-family)",
        "text-small-medium": "var(--text-small-medium-font-family)",
        "text-small-normal": "var(--text-small-normal-font-family)",
        "text-small-semi-bold": "var(--text-small-semi-bold-font-family)",
        "text-tiny-bold": "var(--text-tiny-bold-font-family)",
        "text-tiny-extra-bold": "var(--text-tiny-extra-bold-font-family)",
        "text-tiny-light": "var(--text-tiny-light-font-family)",
        "text-tiny-link": "var(--text-tiny-link-font-family)",
        "text-tiny-medium": "var(--text-tiny-medium-font-family)",
        "text-tiny-normal": "var(--text-tiny-normal-font-family)",
        "text-tiny-semi-bold": "var(--text-tiny-semi-bold-font-family)",
        sans: [
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
      },
      boxShadow: {
        large: "var(--large)",
        medium: "var(--medium)",
        small: "var(--small)",
        xlarge: "var(--xlarge)",
        xsmall: "var(--xsmall)",
        xxlarge: "var(--xxlarge)",
        xxsmall: "var(--xxsmall)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
  },
  plugins: [],
  darkMode: ["class"],
};

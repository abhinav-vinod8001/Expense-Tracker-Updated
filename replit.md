# Overview

This is a web-based expense tracker application built with React and TypeScript (Version 2.0). The app allows users to track their daily expenses and income with a dialer-style numpad interface, view transaction history with customizable currency display, get AI-powered spending insights with YouTube integration, and customize their experience with different currencies and themes. It's designed as a single-page application with a clean, modern interface that supports both light and dark modes.

## Developer Information
- **Developer**: Abhinav Vinod
- **Student**: Computer Science and Engineering (CSE)
- **College**: Mar Athanasius College of Engineering, Kothamangalam, Kerala, India
- **Version**: 2.0.0

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and better development experience
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS for utility-first styling with PostCSS for processing
- **State Management**: React hooks (useState, useCallback) with custom hooks for localStorage persistence and theme management
- **Component Structure**: Functional components with clear separation of concerns

## Data Storage
- **Local Storage**: Client-side persistence using localStorage through a custom useLocalStorage hook
- **State Structure**: Centralized app state containing transactions array, currency selection, balance, and display currency for history
- **Data Format**: JSON serialization for localStorage with proper error handling
- **Currency Conversion**: Real-time conversion system with exchange rates for history display in user's preferred currency

## UI/UX Design Patterns
- **Responsive Design**: Mobile-first approach with responsive grid layouts
- **Dark Mode**: System-wide theme switching with persistent user preferences
- **Navigation**: Slide-out menu system with overlay backdrop
- **Accessibility**: Proper ARIA labels, keyboard navigation, and color contrast

## Component Architecture
- **Modular Components**: Each feature has its own component (History, Settings, AboutUs, etc.)
- **Props Interface**: TypeScript interfaces for all component props ensuring type safety
- **Custom Hooks**: Reusable logic extracted into hooks (useLocalStorage, useTheme)
- **Event Handling**: Callback-based event system with proper event delegation

## Currency System
- **Multi-Currency Support**: Predefined currency list with symbols and exchange rates (USD, EUR, GBP, JPY, CAD, AUD, KRW, RUB, INR)
- **Exchange Rate Conversion**: Comprehensive conversion system supporting any-to-any currency conversion via INR as base
- **Display Currency Selection**: Users can choose preferred currency for transaction history totals in Settings
- **Smart Formatting**: Currency-specific formatting with proper number formatting and symbols
- **Dialer Interface**: Professional phone-style numpad for amount entry with mobile/desktop detection

## Development Setup
- **ESLint Configuration**: TypeScript ESLint with React-specific rules
- **Build Configuration**: Vite config optimized for React with host binding for development
- **TypeScript**: Strict configuration with multiple tsconfig files for different contexts

# External Dependencies

## Core Dependencies
- **React 18.3.1**: Main UI framework
- **React DOM 18.3.1**: DOM rendering for React
- **Lucide React 0.344.0**: Icon library for consistent iconography

## Development Dependencies
- **Vite 5.4.2**: Build tool and development server
- **TypeScript 5.5.3**: Type checking and compilation
- **Tailwind CSS 3.4.1**: Utility-first CSS framework
- **ESLint**: Code linting with React and TypeScript plugins
- **PostCSS**: CSS processing with Autoprefixer

## Build and Deployment
- **Serve**: Static file server for production builds
- **Autoprefixer**: CSS vendor prefixing
- **Vite Plugin React**: React integration for Vite

## Version 2.0 Features
- **Dialer-Style Numpad**: Professional phone-like interface for amount entry
- **Mobile Input Control**: Disabled mobile keyboard input, uses on-screen numpad instead
- **Currency Selection in Settings**: Choose display currency for transaction history totals
- **Enhanced History Display**: All amounts properly converted and displayed in user's preferred currency
- **AI-Powered Recommendations**: Integrated AI financial insights and analysis
- **YouTube Integration**: Educational finance content with graceful fallbacks
- **Clean iOS-Style Animations**: Minimal, polished sliding transitions between sections
- **Developer Attribution**: Full developer information and college details included

Note: The application currently uses static exchange rates and localStorage for data persistence. Version 2.0 adds significant UI improvements and currency flexibility while maintaining the core privacy-first approach.
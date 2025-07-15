# KWACI Grow 🚀

**Keuangan Wirausaha Automated Commerce Insights**

A comprehensive business management platform designed specifically for Southeast Asian small and medium enterprises (SMEs), with particular focus on Indonesian entrepreneurs and multi-business operators.

![KWACI Grow](https://img.shields.io/badge/KWACI-Grow-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat&logo=tailwind-css)

## 🎯 **Project Overview**

KWACI Grow is a modern, web-based business management platform that empowers Southeast Asian entrepreneurs to efficiently manage their operations, finances, and growth strategies. Built with a deep understanding of local business practices and challenges, it provides comprehensive tools for financial planning, inventory management, sales tracking, and multi-business operations.

### **Target Market**
- 🇮🇩 **Indonesian SMEs and entrepreneurs**
- 🏪 **Warung and small business owners**
- ☕ **Coffee shops, bakeries, and food service businesses**
- 🏢 **Multi-location business operators**
- 📈 **Growth-focused entrepreneurs in Southeast Asia**

## 🎯 **Problem Statement**

Southeast Asian SMEs face unique challenges that generic business software doesn't address:

- **Language Barriers**: Most business software is English-only, creating adoption barriers
- **Local Business Practices**: International software doesn't understand local business models (warung, kedai, etc.)
- **Cost Sensitivity**: Expensive enterprise solutions are unaffordable for small businesses
- **Multi-Business Management**: Many entrepreneurs operate multiple small businesses simultaneously
- **Cash Flow Complexity**: Managing variable costs, seasonal fluctuations, and informal transactions
- **Limited Technical Resources**: Need for simple, intuitive interfaces that don't require extensive training

**KWACI Grow solves these problems** by providing a culturally relevant, affordable, and comprehensive business management solution tailored specifically for Southeast Asian markets.

## ✨ **Core Features**

### 📊 **Financial Management**
- **Real-time Financial Dashboard** with profit/loss tracking
- **Cost of Goods Sold (COGS) Calculator** with ingredient-level precision
- **Variable and Fixed Cost Management** with automated calculations
- **Revenue Projections** with customizable parameters
- **Bonus Scheme Management** for staff incentives

### 🏢 **Multi-Business Support**
- **Business Context Switching** with complete data isolation
- **Centralized Management** across multiple business entities
- **Business-specific Settings** and configurations
- **Consolidated Reporting** across all businesses

### 📦 **Inventory & Warehouse Management**
- **Stock Level Tracking** with low-stock alerts
- **Batch Management** with auto-incrementing batch numbers
- **Ingredient Requirements Calculator** for production planning
- **Warehouse Operations** with comprehensive stock transactions

### 🏭 **Production Planning**
- **Production Batch Management** with multi-status workflows
- **Recipe-based Ingredient Allocation** with automatic calculations
- **Stock Reservation System** to prevent over-allocation
- **Production Cost Tracking** with real-time updates

### 📈 **Sales & Operations**
- **Sales Recording Interface** with timestamp tracking
- **Target vs Actual Analysis** with variance calculations
- **Menu and Product Management** with pricing optimization
- **Branch-specific Operations** for multi-location businesses

### 💰 **Accounting & Reporting**
- **Unified Transaction Management** across all business activities
- **Fixed Asset Management** with automatic depreciation
- **Recurring Expense Tracking** (monthly/yearly)
- **Comprehensive Financial Reports** with export capabilities

### 📋 **Planning & Goal Management**
- **Operational Planning** with template-based workflows
- **Goal Setting and Tracking** with task dependencies
- **Business Journey Mapping** with guided onboarding
- **Performance Metrics** and KPI tracking

## 🔤 **KWACI Acronym Meanings**

KWACI Grow offers three culturally relevant acronym interpretations:

### **Primary (Mixed Indonesian-English)** ⭐
- **K**: **Keuangan** (Finance)
- **W**: **Wirausaha** (Entrepreneur)
- **A**: **Automated** (Automated processes)
- **C**: **Commerce** (Commerce management)
- **I**: **Insights** (Business insights)

### **All English Alternative**
- **K**: **Knowledge** (Business knowledge management)
- **W**: **Warehouse** (Inventory and stock management)
- **A**: **Analytics** (Data analytics and reporting)
- **C**: **Commerce** (Business commerce operations)
- **I**: **Intelligence** (Business intelligence)

### **All Bahasa Indonesia Alternative**
- **K**: **Kasir** (Cashier/POS)
- **W**: **Warung** (Small business/shop)
- **A**: **Akuntansi** (Accounting)
- **C**: **Cerdas** (Smart/intelligent)
- **I**: **Inovasi** (Innovation)

*Experience the animated acronym showcase at `/kwaci-demo`*

## 🛠 **Technology Stack**

### **Frontend**
- **React 19.1.0** - Modern UI library with latest features
- **TypeScript** - Type-safe development
- **TanStack Router** - File-based routing with type safety
- **Tailwind CSS 4.x** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library

### **State Management**
- **Zustand** - Lightweight state management
- **React Hook Form** - Performant form handling
- **Zod** - Runtime type validation

### **Database & Storage**
- **Dexie.js** - IndexedDB wrapper for client-side storage
- **SQLite-compatible schema** - Structured data management
- **Multi-business data isolation** - Secure business separation

### **Development Tools**
- **Vite** - Fast build tool and dev server
- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting
- **TypeScript Compiler** - Type checking

### **UI/UX**
- **shadcn/ui** - High-quality component library
- **Next Themes** - Dark/light mode support
- **Sonner** - Toast notifications
- **Recharts** - Data visualization

## 🚀 **Getting Started**

### **Prerequisites**
- **Node.js** 18+ or **Bun** runtime
- **Modern web browser** with IndexedDB support

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd financial-dashboard
   ```

2. **Install dependencies**
   ```bash
   # Using bun (recommended)
   bun install

   # Or using npm
   npm install
   ```

3. **Start development server**
   ```bash
   # Using bun
   bun run dev

   # Or using npm
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:5173
   ```

### **Database Setup**
The application automatically initializes the IndexedDB database on first run. No additional setup required!

### **Seeding Sample Data**
```bash
# Generate sample business data
bun run db:seed
```

## 📱 **Demo & Screenshots**

Visit the **interactive demo** at `/kwaci-demo` to explore:
- ✨ **Live acronym animations** with all three language options
- 🎯 **Feature explanations** and cultural context
- 🎨 **UI/UX showcase** with responsive design
- 📚 **Educational content** about KWACI Grow's mission

## 🤝 **Contributing**

We welcome contributions from developers who understand Southeast Asian business needs!

### **Development Guidelines**
1. **Cultural Sensitivity** - Ensure features respect local business practices
2. **Bilingual Support** - Consider both Bahasa Indonesia and English users
3. **Performance First** - Optimize for lower-end devices common in the region
4. **Accessibility** - Follow WCAG guidelines for inclusive design

### **Getting Started with Development**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with proper TypeScript types
4. Test thoroughly across different business scenarios
5. Commit with descriptive messages
6. Push to your branch and create a Pull Request

### **Code Style**
- Use **TypeScript** for all new code
- Follow **ESLint** and **Prettier** configurations
- Write **descriptive commit messages**
- Add **JSDoc comments** for complex functions
- Ensure **responsive design** for mobile devices

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 **Acknowledgments**

- Built with ❤️ for Southeast Asian entrepreneurs
- Inspired by the resilience and innovation of Indonesian SMEs
- Designed to bridge the gap between traditional business practices and modern technology

---

**KWACI Grow** - Empowering Southeast Asian businesses with intelligent, culturally-relevant management tools. 🚀🇮🇩

# 📦 Stockly

**Stockly** is a modern, lightweight, and high-performance Inventory Management & Point of Sale (POS) application built with **Wails**, **Go**, and **React**. Designed for speed and aesthetics, it provides a seamless experience for small to medium-sized businesses.

<p align="center">
  <img src="build/appicon.png" alt="Stockly Logo" width="100" style="border-radius: 50%" />
</p>

## ✨ Key Features

- **🚀 Professional Cashier System**: A streamlined, modal-driven checkout flow for lightning-fast transactions.
- **💰 Localized for Philippines**: Fully localized currency (₱) and cash-handling helpers.
- **📦 Inventory Management**: Track stock levels, SKUs, and categories with real-time low-stock alerts.
- **📊 Real-time Dashboard**: Visualize your business health with revenue charts and best-selling product lists.
- **🗄️ Persistent Storage**: Powered by **SQLite**, ensuring your data is safely stored locally on your machine.
- **🎨 Premium UI/UX**: Built with **Tailwind CSS** and **Shadcn UI**, featuring a dark-themed, modern aesthetic with smooth animations.

## 🛠️ Tech Stack

- **Backend**: [Go](https://go.dev/) (powered by [Wails v2](https://wails.io/))
- **Frontend**: [React](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/)
- **Database**: [SQLite](https://sqlite.org/) (CGO-free driver)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/) & [Bun](https://bun.sh/)

## 🚀 Getting Started

### Prerequisites

- [Go](https://go.dev/doc/install) (1.21+)
- [Wails CLI](https://wails.io/docs/gettingstarted/installation)
- [Bun](https://bun.sh/) (or Node.js)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ravvdevv/Stockly.git
   cd Stockly
   ```

2. Install frontend dependencies:
   ```bash
   cd frontend
   bun install
   ```

3. Run in development mode:
   ```bash
   wails dev
   ```

### Building for Production

To create a standalone executable for your operating system:
```bash
wails build
```

The resulting binary will be available in the `build/bin/` directory.

## 📁 Project Structure

- `app.go`: Main backend logic, database operations, and Wails bindings.
- `frontend/`: The React application.
  - `src/hooks/`: Custom hooks for Products, Sales, and Categories.
  - `src/pages/`: Main application views (Dashboard, Checkout, Inventory).
- `build/`: Icons and production build artifacts.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
Built with ❤️ by [Raven](https://github.com/ravvdevv)

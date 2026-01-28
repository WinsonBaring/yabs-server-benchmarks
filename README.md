# 🛡️ Server Vault

**Your Server History, Simplified & Beautiful.**

Stop digging through messy logs. Server Vault turns raw `yabs.sh` benchmark outputs into a sophisticated, interactive dashboard. Compare performance across your entire fleet, track history over time, and simulate real-user experiences from dozens of global locations.

![Server Vault Preview](https://github.com/user-attachments/assets/ae76973c-e755-40a6-83ec-6380e50360b2) *Note: Implement your own screenshots for the best effect!*

## ✨ Key Features

-   **🚀 Instant YABS Parsing**: Just copy the entire output of `curl -sL yabs.sh | bash` and paste it. We handle the rest.
-   **📊 Advanced Disk Metrics**: Deep-dive into disk performance with multi-block size breakdown (4k, 64k, 512k, 1m) and IOPS tables.
-   **🌍 Simulation Playground**: 
    -   Reactive Heatmap: See connection quality from global cities at a glance.
    -   Real-World Tests: Simulate "Snappiness", "Large File Downloads", and "Database Saves" based on actual benchmark data.
-   **🌗 Dynamic Theming**: Sophisticated Light and Dark modes with glassmorphism aesthetics.
-   **🏦 Private & Local**: All data is saved directly to your browser's `localStorage`. No accounts, no servers, no database leaks.
-   **📈 Fleet Management**: Group multiple test runs for the same server to see performance drift or improvements after upgrades.

## 🛠️ Tech Stack

-   **Frontend**: React 18, TypeScript, Vite
-   **Styling**: Premium Vanilla CSS + CSS Variables
-   **Charts**: Recharts
-   **Icons**: Lucide React
-   **Parsing**: Custom High-Performance Regex Parser

## 🚀 Getting Started

### 1. Run the Benchmark
On the server you want to test, run:
```bash
curl -sL yabs.sh | bash
```

### 2. Launch the Vault
To run the dashboard locally:

```bash
# Clone the repository
git clone https://github.com/winsonbaring/server-benchmarks.git
cd server-benchmarks/frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

### 3. Upload & Explore
Open the dashboard in your browser, click **"Add Server"**, and paste your YABS result.

## 🤝 Contributing
Contributions are welcome! If you have ideas for new simulation types or parser improvements, feel free to open a PR.

---
Built with ❤️ for server enthusiasts.

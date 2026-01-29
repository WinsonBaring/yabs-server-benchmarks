# 🛡️ Server Vault: The Story Behind the Project

## Why I Built This
Have you ever bought a VPS that promised "8 Cores and 32GB RAM" for a suspiciously low price, only to find out it runs like a potato when you actually try to use it? 

I've been there. Throughout my journey with different VPS providers, I noticed a frustrating trend: **Hardware specs on paper don't tell the full story.** A provider might give you plenty of RAM, but if the disk I/O is slow or the CPU is heavily oversold (shared with too many people), your applications will crawl. 

I created **Server Vault** because I wanted a lifelong record of how these providers *actually* perform over time. I wanted to see if a great provider starts degrading after six months, or if that "Premium" network link is actually just marketing fluff. This tool is my way of holding providers accountable and keeping a personal vault of performance history.

---

## 🚀 The Workflow: How to use this
The logic is simple: **Test -> Copy -> Vault.**

### 1. The "Secret Sauce": YABS
We don't do the testing ourselves because there's already a gold standard in the Linux community: **YABS (Yet Another Bench Script)**. 

To start, you run this one-liner on your server:
```bash
curl -sL yabs.sh | bash
```
This script acts as the "truth-seeker." It hammers the CPU, tests the disk speed at different depths, and pings locations around the world.

### 2. Feeding the Vault
Once YABS finishes, your terminal will be filled with raw text and numbers. **Don't try to read it there.** Just copy everything from the very first line of the output to the last.

Come back here, click **"Add Server"**, and paste that mess of text. Server Vault's parser will instantly "digest" it, turning that wall of text into the beautiful charts and simulation data you see in the dashboard.

---

## 🧠 Making Sense of "Weird" Metrics
If you aren't a sysadmin, some of these numbers look like gibberish. Here is what they actually mean in the real world:

### Disk I/O (The "Bottle-Neck")
You'll see things like **4k** and **1m**. 
- **4k (Random):** This is the most important number for most users. It describes how fast the server can handle thousands of tiny tiny tasks (like saving a user to a database). If this is low, your website will feel "laggy" regardless of your CPU.
- **1m (Sequential):** This is for moving huge files. High numbers here are great for media servers or backups.

### Network: Send vs. Receive
Providers often advertise "Gigabit Port," but that usually only means *Receive* speed (downloading). The **Send Rate** (upload) is often much lower. Server Vault tracks both so you know if your server can actually serve content to your users effectively.

### Geekbench (Raw Muscle)
This is a standard score that compares your server's brain (CPU) to everything else on the planet.
- **Single Core:** How fast a single task runs (important for most web apps).
- **Multi Core:** How much work the server can do at once (important for heavy processing).

---

## 🌍 The Simulation Lab: Why a Heatmap?
A benchmark says your network is "10Gbps," but that's just to the nearest data center. Your users are in London, Tokyo, and New York.

Our **Simulation Lab** takes your raw speed data and "simulates" how a human in those cities would experience your server. It answers the question: *"If a guy in Paris tries to download my 500MB backup, how many minutes will he actually wait?"*

---

## 🔒 A Note on Your Data
This is a **personal vault**. I don't want your server data, and I don't want to manage your accounts.
- There is no database.
- There is no "Cloud."
- **Everything is stored in your own browser.** 
If you switch computers, your data stays on the old one. This is by design—total privacy for your infrastructure history.

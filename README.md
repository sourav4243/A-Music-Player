# 🎵 Offline Music Player Web App

A lightweight, front-end-only music player built using **pure HTML, CSS, and JavaScript** — no backend, no database, no external dependencies. Just your local files and seamless music playback.

## 💡 About the Project

This project offers a clean, modern interface for playing your **offline MP3 files directly in the browser**. It’s ideal for users who prefer keeping their music downloaded and want a fast, organized way to play it — without any internet or heavy software.

## 🚀 Features

- 🎧 **Play local MP3 files** in the browser  
- 📁 **Folder-based playlists** (auto-detected)  
- 🃏 **Dynamic playlist cards** based on folder names  
- 🔄 **No backend or database** – fully frontend  
- 🌐 **Optional metadata fetching** if connected to Wi-Fi  
- 💾 Uses browser **localStorage**  
- 📱 **Responsive design** – works on mobile & desktop  

## 📂 Folder Structure

To organize your songs:

```plaintext
library/
├── chill-vibes/
│   ├── song1.mp3
│   └── song2.mp3
├── road-trip/
│   ├── track1.mp3
│   └── track2.mp3
```

Each folder inside the `library/` acts as a **playlist**, and its name (e.g., `chill-vibes`) is used as the title of a card on the homepage. Songs in that folder appear inside the playlist.

> ℹ️ If you add new songs to an existing folder and they don’t appear instantly, try refreshing the page or clearing the cache to reload the latest contents.

## 🛠️ How to Use

1. **Clone this repository**
   ```bash
   git clone https://github.com/your-username/your-repo.git
   ```

2. **Add your music**
   - Go to the `library/` folder.
   - Create folders like `party-mix`, `sleep-sounds`, etc.
   - Drop your `.mp3` files inside those folders.

3. **Run the app**
   - Simply open `index.html` in your browser.
   - Or use **Live Server** in VS Code:
     - Right-click `index.html` → "Open with Live Server"
     - Ensure Wi-Fi is connected if you want song metadata like album art and artist name.

4. **Enjoy your music**
   - Playlist cards show up automatically.
   - Click any card to see songs inside and start listening.

## 📌 Notes

- 🎵 Only `.mp3` files are supported.
- 🌐 Metadata loads better with internet, but not required.
- 🛡️ No data is sent anywhere — everything runs in your browser.
- 📁 Folder names with hyphens (`my-playlist`) are used as display names.

## ✨ Why Use This?

If you:

- Prefer keeping your music **downloaded** rather than streaming
- Want an app that respects your **privacy**
- Love organizing music in **folders as playlists**
- Don’t want to install heavy apps
- Hate seeing **ads while listening to music**

Then this project gives you a seamless, lightweight experience — right from your browser.

---

Made with ❤️ using pure HTML, CSS, and JS  
🎧 Built for offline music lovers

# Iron Fist Tournament 3D (Tekken 3 Inspired Fighting Game)

A high-fidelity, nostalgic arcade fighting game inspired by Tekken 3, built using modern web technology (HTML5 Canvas, CSS, JavaScript) and wrapped in **Electron** for a native desktop application experience. It also features a custom-built Web Audio synthesis engine for retro-arcade sound effects.

---

## 🎮 Game Features

- **Fluid Combat Engine**: Realistic combat states including walking, jumping, crouching, hitstun, blockstun, auto-blocking, knockout animations, and victory poses.
- **Dynamic Audio Synthesis**: Built-in sound effects (punch, kick, hit, block) dynamically generated via the **Web Audio API** at runtime—no external audio files required!
- **Interactive Visual Effects**: A custom particle system handles sparks, hit impacts, dust trails, fire breath, and glowing auras.
- **3D Parallax Stage**: A perspective grid and camera movement system simulating a 3D combat arena with camera panning and zooming.
- **Rage System**: When health drops below 30%, fighters enter a glowing **Rage State**, amplifying their attack power and unlocking their high-damage **Ultimate Move**.
- **Combo System**: Tracks consecutive hits with styled floating popup counters and multipliers.
- **Versatile Game Modes**:
  - **VS CPU (Arcade)**: Battle against an intelligent CPU-controlled fighter.
  - **VS Human (Local)**: Play against a friend locally on the same keyboard.
  - **Training Mode**: Practice your moves against a controllable dummy with a controls dashboard.

---

## 🥋 Character Roster & Move List

Each character features unique balance stats, special visual indicators, and distinct combat styles:

| Character | Style | Special Move (U / Numpad 4) | Ultimate Move (I / Numpad 5) |
| :--- | :--- | :--- | :--- |
| **Jin Kazama** | Karate | **Electric Fist** (Fast punch dash) | **Rage Drive** (High damage combo) |
| **King** | Wrestling | **Giant Swing** (Grapple throw dash) | **Tombstone** (Devastating piledriver) |
| **Paul Phoenix** | Heavy Hitter | **Deathfist** (Explosive single-strike) | **Rage Phoenix** (Ultimate charge punch) |
| **Ogre** | Ancient Beast | **Fire Breath** (Aura flame wave) | **Ancient Apocalypse** (Full-screen power burst) |

---

## ⌨️ Controls Layout

### Player 1 (P1)
- **A / D**: Walk Left / Right
- **W**: Jump
- **S**: Crouch / Block
- **J**: Punch
- **K**: Kick
- **U**: Special Move
- **I**: Ultimate Move (Requires **Rage** - Health < 30%)
- **Auto-Block**: Hold opposite movement direction relative to opponent (e.g. Hold **A** if opponent is to the right)

### Player 2 (P2)
- **Left / Right Arrows**: Walk Left / Right
- **Up Arrow**: Jump
- **Down Arrow**: Crouch / Block
- **Numpad 1**: Punch
- **Numpad 2**: Kick
- **Numpad 4**: Special Move
- **Numpad 5**: Ultimate Move (Requires **Rage** - Health < 30%)
- **Auto-Block**: Hold opposite movement direction relative to opponent

---

## 🚀 How to Play

### 📥 Option A: Direct Download (Windows Portable - No Install Required)
1. Download **[Tekken_3_Game.zip](https://github.com/nikhil3495/tekken-3-game/releases/download/v1.0.0/Tekken_3_Game.zip)** from the GitHub Releases.
2. Extract the downloaded ZIP file to any folder on your computer.
3. Open the extracted folder, find **`Tekken 3 Game.exe`**, and run it to play immediately!

---

### 💻 Option B: Run from Source Code (For Developers)
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

1. Clone the repository and navigate to the project folder:
   ```bash
   git clone https://github.com/nikhil3495/tekken-3-game.git
   cd tekken-3-game
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch the game in desktop mode:
   ```bash
   npm start
   ```

---

### 🌐 Option C: Run as a Web App
You can run the game using the built-in HTTP server:
1. Start the server:
   ```bash
   node server.js
   ```
2. Open your browser and navigate to:
   ```
   http://localhost:8080
   ```

---

### 📦 Option D: Build and Package
To build your own standalone `.exe` installer or package:
```bash
npm run package
```
The compiled build will be generated in the `dist/` directory.

---

## 📂 Project Structure

- `index.html` - Game container, UI screens (Menu, Character Select, Results), and HUD elements.
- `game.css` - UI layout styling, high-tech cyber-punk aesthetic, animation frames, and font imports.
- `game.js` - Main codebase: Game loops, Canvas renderer, Physics engine, Player controller, CPU controller, Collision systems, and Sound managers.
- `main.js` - Electron startup configuration and window parameters.
- `server.js` - Fallback HTTP web server code.
- `package.json` - Node scripts and dev dependencies.
- `.gitignore` - Standard filters to exclude `node_modules` and compiled builds.

---

## 🛠️ Built With

- **HTML5 Canvas** - Game rendering context.
- **Vanilla JavaScript** - Game logic and physics.
- **Web Audio API** - Dynamic sound synthesis.
- **Electron** - Native OS wrapper.
- **Google Fonts (Press Start 2P & Outfit)** - Authentic arcade typography.

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

## 🚀 How to Install and Run

Make sure you have [Node.js](https://nodejs.org/) installed.

### Option A: Run as Desktop App (Recommended)
1. Clone the repository and navigate to the project folder:
   ```bash
   git clone https://github.com/nikhil3495/tekken-3-game.git
   cd tekken-3-game
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Start the game in desktop mode:
   ```bash
   npm start
   ```

### Option B: Run as Web App
If you'd rather run the game via a local web server:
1. Start the server using Node:
   ```bash
   node server.js
   ```
2. Open your web browser and navigate to:
   ```
   http://localhost:8080
   ```

### Option C: Build / Package Desktop Executable
To package the game into a standalone `.exe` for Windows:
```bash
npm run package
```
The packaged application will build inside the `dist/` directory.

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

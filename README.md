# Flight Simulator

## 👨‍💻 Team Members

| Name             | ID          | Section     |
|------------------|-------------|-------------|
| ABUBEKER JUHAR    | UGR/3857/15 | SECTION 3   |
| DAGMAWI MINALE    | UGR/8048/14 | SECTION 3   |
| EYOSIYAS BISRAT   | UGR/2434/15 | SECTION 3   |
| FIKIR TILAHUN     | UGR/0163/15 | SECTION 3   |
| MILKIAS WAKGARI   | UGR/0422/15 | SECTION 3   |   

A 3D flight simulator built with Three.js that provides a basic aircraft flying experience with terrain, skybox, and motion controls.

## Features

- 3D aircraft model with realistic flight controls
- Dynamic terrain with height mapping
- Skybox for immersive environment
- Realistic lighting and shadows
- Interactive controls for pitch, roll, and yaw
- Throttle control for speed management

## Controls

- W/S - Pitch down/up
- A/D - Roll left/right
- Q/E - Yaw left/right
- Space - Increase throttle
- Shift - Decrease throttle

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```
**Troubleshooting `npm start`:** If `npm start` does not provide a URL or seems to exit silently, try running the development server directly with verbose output and automatic browser opening:
```bash
npx vite --force --open
```

3. Open your browser and navigate to `http://localhost:5173`

## Technologies Used

- Three.js for 3D rendering
- Vite for development and building
- JavaScript ES6+

## Project Structure

```
flight-simulator/
├── src/
│   ├── main.js         # Main application code
│   ├── aircraft.js     # Aircraft model and physics
│   ├── terrain.js      # Terrain generation
│   └── skybox.js       # Procedural skybox
├── index.html          # Main HTML file
├── style.css           # Styles
├── package.json        # Project dependencies
└── README.md          # Project documentation
```

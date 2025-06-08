import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Aircraft } from './aircraft.js';
import { Terrain } from './terrain.js';
import { Skybox } from './skybox.js';
import { ObstacleManager } from './obstacle_manager.js';

class FlightSimulator {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.clock = new THREE.Clock();
        
        // Physics properties
        this.velocity = new THREE.Vector3();
        this.rotation = new THREE.Euler(); // Current angular velocity
        this.throttle = 1; // Start with full throttle for continuous forward movement
        this.maxSpeed = 100; // Adjusted for dodging game
        this.liftFactor = 0.001; // Less emphasis on lift for dodging game
        this.gravity = 0.005; // Less gravity for more stable flight
        this.dragFactor = 0.995; // Less air resistance
        this.rotationSpeed = 1.5; // Faster rotation response for dodging
        this.rotationDamping = 0.8; // More damping to snap back

        // Game state
        this.isGameOver = false;
        this.score = 0;
        this.highScores = []; // Initialize high scores array
        this.currentCameraTarget = new THREE.Vector3();
        this.currentCameraLookAt = new THREE.Vector3();
        
        this.init();
        this.setupLights();
        this.createEnvironment();
        this.setupEventListeners();
        this.loadHighScores(); // Load high scores on game start
        this.animate();
    }

    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.setClearColor(0x87CEEB); // Sky blue background
        document.getElementById('scene-container').appendChild(this.renderer.domElement);

        // Log canvas dimensions
        const canvas = this.renderer.domElement;
        console.log(`Canvas dimensions: ${canvas.width}x${canvas.height}`);

        // Setup camera
        this.camera.position.set(0, 50, 50); // Initial camera behind aircraft, adjusted for dodging, higher Y
        this.camera.lookAt(0, 50, 0);

        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // UI Elements
        this.scoreDisplay = document.getElementById('score-display');
        this.gameOverOverlay = document.getElementById('game-over-overlay');
        this.finalScoreDisplay = document.getElementById('final-score');
        this.restartButton = document.getElementById('restart-button');
        this.highScoresList = document.getElementById('high-scores-list'); // Get high scores list element

        this.restartButton.addEventListener('click', () => this.restartGame());
    }

    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(1000, 1000, 500);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 4096;
        directionalLight.shadow.mapSize.height = 4096;
        directionalLight.shadow.camera.near = 1;
        directionalLight.shadow.camera.far = 2500;
        directionalLight.shadow.camera.left = -1000;
        directionalLight.shadow.camera.right = 1000;
        directionalLight.shadow.camera.top = 1000;
        directionalLight.shadow.camera.bottom = -1000;
        this.scene.add(directionalLight);

        // Add point lights for better visibility
        const pointLight1 = new THREE.PointLight(0xffffff, 0.3);
        pointLight1.position.set(0, 100, 0);
        this.scene.add(pointLight1);
    }

    createEnvironment() {
        // Create skybox
        this.skybox = new Skybox();
        this.scene.add(this.skybox.mesh);

        // Create terrain
        this.terrain = new Terrain(2000, 200);
        this.scene.add(this.terrain.mesh);

        // Create aircraft
        this.aircraft = new Aircraft();
        this.aircraft.mesh.position.set(0, 50, 0); // Start at higher Y position for dodging game
        this.scene.add(this.aircraft.mesh);

        // Add bounding box helper for aircraft for debugging
        const aircraftBoxHelper = new THREE.BoxHelper(this.aircraft.mesh, 0xffff00);
        this.scene.add(aircraftBoxHelper);

        // Add a test cube
        const geometry = new THREE.BoxGeometry(10, 10, 10);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(0, 50, -100); // Position it in front of the camera
        this.scene.add(cube);
        
        // Log initial position and terrain height for debugging
        const initialHeight = this.terrain.getHeightAt(this.aircraft.mesh.position.x, this.aircraft.mesh.position.z);
        console.log(`Aircraft initial Y: ${this.aircraft.mesh.position.y}, Terrain height at start: ${initialHeight}`);

        // Create obstacle manager
        this.obstacleManager = new ObstacleManager(this.scene);

        // Log scene children count
        console.log(`Scene has ${this.scene.children.length} objects after environment creation.`);
    }

    setupEventListeners() {
        this.keys = {
            w: false, s: false, a: false, d: false, q: false, e: false,
            ' ': false, 'shift': false
        };

        document.addEventListener('keydown', (event) => {
            if (this.keys.hasOwnProperty(event.key.toLowerCase())) {
                this.keys[event.key.toLowerCase()] = true;
            }
        });

        document.addEventListener('keyup', (event) => {
            if (this.keys.hasOwnProperty(event.key.toLowerCase())) {
                this.keys[event.key.toLowerCase()] = false;
            }
        });
    }

    updatePhysics(delta) {
        if (!this.aircraft || this.isGameOver) return;

        // Apply rotational input (W/S reversed)
        if (this.keys['w']) this.rotation.x += this.rotationSpeed * delta; // Pitch up
        if (this.keys['s']) this.rotation.x -= this.rotationSpeed * delta; // Pitch down
        if (this.keys['a']) this.rotation.z += this.rotationSpeed * delta; // Roll left
        if (this.keys['d']) this.rotation.z -= this.rotationSpeed * delta; // Roll right
        if (this.keys['q']) this.rotation.y += this.rotationSpeed * delta; // Yaw left
        if (this.keys['e']) this.rotation.y -= this.rotationSpeed * delta; // Yaw right

        // Apply throttle input (only if not full throttle, but for dodging game, throttle is often fixed)
        // if (this.keys[' ']) this.throttle = Math.min(this.throttle + 0.5 * delta, 1); // Increase throttle
        // if (this.keys['shift']) this.throttle = Math.max(this.throttle - 0.5 * delta, 0); // Decrease throttle

        // Apply rotation to aircraft (smoothly)
        this.aircraft.mesh.rotation.x += this.rotation.x * delta;
        this.aircraft.mesh.rotation.y += this.rotation.y * delta;
        this.aircraft.mesh.rotation.z += this.rotation.z * delta;

        // Dampen rotation
        this.rotation.x *= this.rotationDamping;
        this.rotation.y *= this.rotationDamping;
        this.rotation.z *= this.rotationDamping;

        // Calculate forward direction based on aircraft rotation
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyEuler(this.aircraft.mesh.rotation);

        // Update velocity based on throttle and direction
        // In dodging game, velocity is primarily forward based on maxSpeed
        this.velocity.copy(direction.multiplyScalar(this.throttle * this.maxSpeed));

        // Apply gravity and lift (less prominent in a dodging game but still there)
        this.velocity.y -= this.gravity * delta;
        const speed = this.velocity.length();
        const angleOfAttack = -Math.cos(this.aircraft.mesh.rotation.x) + 1; // Simplified angle of attack
        this.velocity.y += speed * angleOfAttack * this.liftFactor * delta;

        // Apply drag
        this.velocity.multiplyScalar(this.dragFactor);

        // Update position
        this.aircraft.mesh.position.add(this.velocity.clone().multiplyScalar(delta));

        // Update obstacles and check for collisions
        this.obstacleManager.update(delta, this.aircraft.mesh.position);
        this.checkCollisions();

        // Update score - score is now based on distance traveled
        this.score += this.maxSpeed * delta; // Score increases with forward movement
        this.scoreDisplay.textContent = `Score: ${Math.floor(this.score)}`;

        // Update propeller animation
        this.aircraft.update(delta);
    }

    checkCollisions() {
        const aircraftBox = new THREE.Box3().setFromObject(this.aircraft.mesh);

        // Ground collision (still relevant if you dive)
        const position = this.aircraft.mesh.position;
        const terrainHeight = this.terrain.getHeightAt(position.x, position.z);
        if (position.y < terrainHeight + 15) { // Increased buffer for ground collision to make it harder
            this.gameOver("You crashed into the ground!");
            return;
        }

        // Obstacle collision (new dynamic obstacles)
        for (const obstacle of this.obstacleManager.obstacles) {
            const obstacleBox = new THREE.Box3().setFromObject(obstacle);

            if (aircraftBox.intersectsBox(obstacleBox)) {
                this.gameOver("You hit an obstacle!");
                return;
            }
        }
    }

    gameOver(message) {
        this.isGameOver = true;
        this.gameOverOverlay.style.display = 'flex';
        this.finalScoreDisplay.textContent = `Final Score: ${Math.floor(this.score)} - ${message}`;
        this.saveHighScores(); // Save high scores on game over
    }

    restartGame() {
        this.isGameOver = false;
        this.gameOverOverlay.style.display = 'none';
        
        // Reset aircraft position and physics
        this.aircraft.mesh.position.set(0, 50, 0); // Reset to higher Y position
        this.aircraft.mesh.rotation.set(0, 0, 0);
        this.velocity.set(0, 0, 0);
        this.rotation.set(0, 0, 0);
        this.throttle = 1; // Reset to full throttle
        this.score = 0;
        this.scoreDisplay.textContent = `Score: 0`;

        // Reset camera 
        this.camera.position.set(0, 50, 50);
        this.camera.lookAt(0, 50, 0);

        // Reset Obstacle Manager
        this.obstacleManager.reset();

        this.updateHighScoresDisplay(); // Update high scores display after restart
    }

    loadHighScores() {
        const savedScores = localStorage.getItem('flightSimulatorHighScores');
        if (savedScores) {
            this.highScores = JSON.parse(savedScores);
        } else {
            this.highScores = [];
        }
        this.updateHighScoresDisplay();
    }

    saveHighScores() {
        const currentScore = Math.floor(this.score);
        // Only add if it's a new high score or top 5
        if (this.highScores.length < 5 || currentScore > Math.min(...this.highScores.map(s => s.score))) {
            const timestamp = new Date().toLocaleString();
            this.highScores.push({ score: currentScore, date: timestamp });
            // Sort by score descending and keep top 5
            this.highScores.sort((a, b) => b.score - a.score);
            this.highScores = this.highScores.slice(0, 5);
        }
        localStorage.setItem('flightSimulatorHighScores', JSON.stringify(this.highScores));
        this.updateHighScoresDisplay();
    }

    updateHighScoresDisplay() {
        if (!this.highScoresList) return; // Ensure element exists
        this.highScoresList.innerHTML = ''; // Clear current list
        if (this.highScores.length === 0) {
            this.highScoresList.innerHTML = '<li>No high scores yet.</li>';
            return;
        }
        this.highScores.forEach((entry, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = `#${index + 1}: ${entry.score} (${entry.date})`;
            this.highScoresList.appendChild(listItem);
        });
    }

    updateCamera() {
        if (!this.aircraft) return;

        // Calculate camera position behind and above aircraft
        const cameraOffset = new THREE.Vector3(0, 10, 30); // Adjusted offset for closer view
        cameraOffset.applyEuler(this.aircraft.mesh.rotation);
        
        const targetCameraPosition = this.aircraft.mesh.position.clone().add(cameraOffset);
        const targetCameraLookAt = this.aircraft.mesh.position.clone().add(new THREE.Vector3(0, 5, -50)); // Look slightly ahead

        // Smoothly interpolate camera position and lookAt target
        this.camera.position.lerp(targetCameraPosition, 0.1); 
        this.camera.lookAt(this.currentCameraLookAt.lerp(targetCameraLookAt, 0.1));
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        const delta = this.clock.getDelta();
        this.updatePhysics(delta);
        this.updateCamera();
        
        this.renderer.render(this.scene, this.camera);
        console.log("Rendering frame...");
    }
}

// Start the simulator
new FlightSimulator(); 
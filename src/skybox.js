import * as THREE from 'three';

export class Skybox {
    constructor() {
        this.mesh = null;
        this.createSkybox();
    }

    createSkybox() {
        const geometry = new THREE.BoxGeometry(10000, 10000, 10000);
        const materials = [];

        // Create materials for each face of the skybox
        for (let i = 0; i < 6; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = 1024;
            canvas.height = 1024;
            const context = canvas.getContext('2d');

            // Create gradient background
            const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#1a1a2e');   // Dark blue at top
            gradient.addColorStop(0.5, '#16213e'); // Medium blue in middle
            gradient.addColorStop(1, '#0f3460');   // Lighter blue at bottom

            context.fillStyle = gradient;
            context.fillRect(0, 0, canvas.width, canvas.height);

            // Add stars
            for (let j = 0; j < 200; j++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                const radius = Math.random() * 1.5;
                const opacity = Math.random() * 0.8 + 0.2;

                context.beginPath();
                context.arc(x, y, radius, 0, Math.PI * 2);
                context.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                context.fill();
            }

            // Create texture from canvas
            const texture = new THREE.CanvasTexture(canvas);
            materials.push(new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.BackSide
            }));
        }

        this.mesh = new THREE.Mesh(geometry, materials);
    }
} 
import * as THREE from 'three';

export class ObstacleManager {
    constructor(scene) {
        this.scene = scene;
        this.obstacles = [];
        this.obstacleSpawnInterval = 1.5; // seconds
        this.timeSinceLastSpawn = 0;
        this.obstacleSpeed = 100; // Speed at which obstacles move towards the player
    }

    update(delta, aircraftPosition) {
        this.timeSinceLastSpawn += delta;

        // Spawn new obstacle
        if (this.timeSinceLastSpawn >= this.obstacleSpawnInterval) {
            this.spawnObstacle(aircraftPosition.z - 1000); // Spawn far in front of aircraft
            this.timeSinceLastSpawn = 0;
            this.obstacleSpawnInterval = Math.max(0.8, this.obstacleSpawnInterval * 0.98); // Gradually increase difficulty
            this.obstacleSpeed = Math.min(200, this.obstacleSpeed * 1.01); // Gradually increase speed
        }

        // Move and clean up obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.position.z += this.obstacleSpeed * delta; // Move towards player

            // Remove if behind player
            if (obstacle.position.z > aircraftPosition.z + 50) { 
                this.scene.remove(obstacle);
                this.obstacles.splice(i, 1);
            }
        }
    }

    spawnObstacle(zPos) {
        const type = Math.floor(Math.random() * 4); // 0: Ring, 1: Wall, 2: Shapes, 3: Combined Shapes
        let obstacle;
        
        switch(type) {
            case 0:
                obstacle = this.createRingObstacle();
                break;
            case 1:
                obstacle = this.createWallObstacle();
                break;
            case 2:
                obstacle = this.createShapeObstacle();
                break;
            case 3:
                obstacle = this.createCombinedShapeObstacle();
                break;
        }

        obstacle.position.z = zPos;
        obstacle.position.y = Math.random() * 80 - 40; // Random Y position
        obstacle.position.x = Math.random() * 100 - 50; // Random X position
        this.scene.add(obstacle);
        this.obstacles.push(obstacle);
    }

    createRingObstacle() {
        const innerRadius = 20 + Math.random() * 10; // 20 to 30
        const outerRadius = innerRadius + 5 + Math.random() * 5; // 25 to 40
        const tube = 2 + Math.random() * 2; // 2 to 4
        const radialSegments = 8;
        const tubularSegments = 64;

        const geometry = new THREE.TorusGeometry(outerRadius, tube, radialSegments, tubularSegments);
        const material = new THREE.MeshStandardMaterial({ color: 0xff0000, metalness: 0.5, roughness: 0.5 });
        const ring = new THREE.Mesh(geometry, material);
        ring.rotation.x = Math.PI / 2; // Orient correctly
        return ring;
    }

    createWallObstacle() {
        const width = 10 + Math.random() * 40; // 10 to 50
        const height = 10 + Math.random() * 40; // 10 to 50
        const depth = 2 + Math.random() * 2; // 2 to 4

        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00, metalness: 0.5, roughness: 0.5 });
        const wall = new THREE.Mesh(geometry, material);
        return wall;
    }

    createShapeObstacle() {
        let geometry;
        const size = 5 + Math.random() * 10; // 5 to 15
        const shapeChoice = Math.floor(Math.random() * 6); // More shape variants

        switch(shapeChoice) {
            case 0:
                geometry = new THREE.DodecahedronGeometry(size);
                break;
            case 1:
                geometry = new THREE.IcosahedronGeometry(size);
                break;
            case 2:
                geometry = new THREE.OctahedronGeometry(size);
                break;
            case 3:
                geometry = new THREE.TetrahedronGeometry(size); // New shape
                break;
            case 4:
                geometry = new THREE.ConeGeometry(size * 0.8, size * 1.5, 32); // New shape
                break;
            case 5:
                geometry = new THREE.CylinderGeometry(size * 0.7, size * 0.7, size * 2, 32); // New shape
                break;
        }
        const material = new THREE.MeshStandardMaterial({ color: 0x0000ff, metalness: 0.5, roughness: 0.5 });
        const shape = new THREE.Mesh(geometry, material);
        shape.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        return shape;
    }

    createCombinedShapeObstacle() {
        const group = new THREE.Group();
        const numShapes = Math.floor(Math.random() * 3) + 2; // 2 to 4 shapes

        for (let i = 0; i < numShapes; i++) {
            const shape = this.createShapeObstacle();
            shape.position.set(
                (Math.random() - 0.5) * 50,
                (Math.random() - 0.5) * 50,
                (Math.random() - 0.5) * 50
            );
            group.add(shape);
        }
        return group;
    }

    reset() {
        // Remove all current obstacles from scene and array
        for (const obstacle of this.obstacles) {
            this.scene.remove(obstacle);
        }
        this.obstacles = [];
        this.timeSinceLastSpawn = 0;
        this.obstacleSpawnInterval = 1.5; // Reset to initial
        this.obstacleSpeed = 100; // Reset to initial
    }
} 
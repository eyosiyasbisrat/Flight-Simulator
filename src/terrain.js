import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';

export class Terrain {
    constructor(size = 1000, resolution = 100) {
        this.size = size;
        this.resolution = resolution;
        this.mesh = null;
        this.noise2D = createNoise2D();
        this.createTerrain();
    }

    createTerrain() {
        const geometry = new THREE.PlaneGeometry(
            this.size,
            this.size,
            this.resolution,
            this.resolution
        );

        // Generate height map using Simplex noise
        const vertices = geometry.attributes.position.array;
        
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const z = vertices[i + 2];
            
            // Generate multiple layers of noise for more natural terrain
            let height = 0;
            // Make terrain less aggressive near the center
            const distFromCenter = Math.sqrt(x*x + z*z);
            const falloff = Math.max(0, (500 - distFromCenter) / 500);
            
            height += this.noise2D(x * 0.001, z * 0.001) * 40 * falloff;
            height += this.noise2D(x * 0.002, z * 0.002) * 20 * falloff;
            height += this.noise2D(x * 0.004, z * 0.004) * 10 * falloff;
            
            vertices[i + 1] = height;
        }

        geometry.computeVertexNormals();

        // Create materials for different terrain types
        const materials = [
            new THREE.MeshStandardMaterial({
                color: 0x3a7e4f,
                roughness: 0.8,
                metalness: 0.2
            }),
            new THREE.MeshStandardMaterial({
                color: 0x808080,
                roughness: 0.9,
                metalness: 0.1
            }),
            new THREE.MeshStandardMaterial({
                color: 0xffffff,
                roughness: 0.7,
                metalness: 0.1
            })
        ];

        // Create terrain mesh
        this.mesh = new THREE.Mesh(geometry, materials[0]);
        this.mesh.rotation.x = -Math.PI / 2;
        this.mesh.receiveShadow = true;

        // Add static terrain details (trees, rocks) for view
        this.addTerrainDetails();
    }

    addTerrainDetails() {
        const treeCount = 2000;
        const rockCount = 1000;

        // Add trees for visual background
        for (let i = 0; i < treeCount; i++) {
            const x = (Math.random() - 0.5) * this.size;
            const z = (Math.random() - 0.5) * this.size;

            // Ensure trees are not too close to the player's immediate path, but allow closer side view
            if (Math.abs(x) < 50 && Math.abs(z) < 100) continue;

            const height = this.getHeightAt(x, z);
            
            if (height > 5 && height < 120) {
                const tree = this.createTree();
                tree.position.set(x, height, z);
                this.mesh.add(tree);
            }
        }

        // Add rocks for visual background
        for (let i = 0; i < rockCount; i++) {
            const x = (Math.random() - 0.5) * this.size;
            const z = (Math.random() - 0.5) * this.size;
            
            // Ensure rocks are not too close to the player's immediate path, but allow closer side view
            if (Math.abs(x) < 50 && Math.abs(z) < 100) continue;

            const height = this.getHeightAt(x, z);
            
            if (height > 0 && height < 100) {
                const rock = this.createRock();
                rock.position.set(x, height, z);
                this.mesh.add(rock);
            }
        }
    }

    createTree() {
        const tree = new THREE.Group();

        // Tree trunk (randomized height and radius)
        const trunkHeight = Math.random() * 10 + 10;
        const trunkRadius = Math.random() * 1 + 1;
        const trunkGeometry = new THREE.CylinderGeometry(trunkRadius * 0.8, trunkRadius, trunkHeight, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x4d2926,
            roughness: 0.9,
            metalness: 0.1
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = trunkHeight / 2;
        tree.add(trunk);

        // Tree top (randomized size and shape)
        const topRadius = Math.random() * 5 + 5;
        const topHeight = Math.random() * 5 + 8;
        let topGeometry;
        const shapeChoice = Math.random();
        if (shapeChoice < 0.33) {
            topGeometry = new THREE.ConeGeometry(topRadius, topHeight, 8);
        } else if (shapeChoice < 0.66) {
            topGeometry = new THREE.DodecahedronGeometry(topRadius);
        } else {
            topGeometry = new THREE.IcosahedronGeometry(topRadius);
        }

        const topMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d5a27,
            roughness: 0.8,
            metalness: 0.1
        });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.y = trunkHeight + topHeight / 2 - (shapeChoice < 0.33 ? 0 : topRadius / 2);
        tree.add(top);

        return tree;
    }

    createRock() {
        let geometry;
        const size = Math.random() * 8 + 5;
        const shapeChoice = Math.random();
        if (shapeChoice < 0.33) {
            geometry = new THREE.DodecahedronGeometry(size);
        } else if (shapeChoice < 0.66) {
            geometry = new THREE.IcosahedronGeometry(size);
        } else {
            geometry = new THREE.OctahedronGeometry(size);
        }

        const material = new THREE.MeshStandardMaterial({
            color: 0x808080,
            roughness: 0.9,
            metalness: 0.1
        });
        const rock = new THREE.Mesh(geometry, material);
        rock.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        return rock;
    }

    getHeightAt(x, z) {
        let height = 0;
        const distFromCenter = Math.sqrt(x*x + z*z);
        const falloff = Math.max(0, (500 - distFromCenter) / 500);

        height += this.noise2D(x * 0.001, z * 0.001) * 40 * falloff;
        height += this.noise2D(x * 0.002, z * 0.002) * 20 * falloff;
        height += this.noise2D(x * 0.004, z * 0.004) * 10 * falloff;
        
        return height;
    }
}
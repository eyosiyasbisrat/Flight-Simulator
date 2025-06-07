import * as THREE from 'three';

export class Aircraft {
    constructor() {
        this.mesh = new THREE.Group();
        this.createFuselage();
        this.createWings();
        this.createTail();
        this.createPropeller();
        this.createCockpit();
    }

    createFuselage() {
        // Main body
        const fuselageGeometry = new THREE.CylinderGeometry(2, 2, 20, 8);
        const fuselageMaterial = new THREE.MeshStandardMaterial({
            color: 0x3366ff,
            metalness: 0.7,
            roughness: 0.3
        });
        const fuselage = new THREE.Mesh(fuselageGeometry, fuselageMaterial);
        fuselage.rotation.x = Math.PI / 2;
        this.mesh.add(fuselage);

        // Nose cone
        const noseGeometry = new THREE.ConeGeometry(2, 4, 8);
        const nose = new THREE.Mesh(noseGeometry, fuselageMaterial);
        nose.position.z = -12;
        nose.rotation.x = -Math.PI / 2;
        this.mesh.add(nose);
    }

    createWings() {
        const wingGeometry = new THREE.BoxGeometry(30, 0.5, 5);
        const wingMaterial = new THREE.MeshStandardMaterial({
            color: 0x3366ff,
            metalness: 0.7,
            roughness: 0.3
        });
        const wings = new THREE.Mesh(wingGeometry, wingMaterial);
        this.mesh.add(wings);

        // Wing details
        const wingDetailGeometry = new THREE.BoxGeometry(28, 0.1, 3);
        const wingDetailMaterial = new THREE.MeshStandardMaterial({
            color: 0x2255cc,
            metalness: 0.8,
            roughness: 0.2
        });
        const wingDetails = new THREE.Mesh(wingDetailGeometry, wingDetailMaterial);
        wingDetails.position.y = 0.3;
        wings.add(wingDetails);
    }

    createTail() {
        // Vertical stabilizer
        const vStabGeometry = new THREE.BoxGeometry(6, 4, 0.5);
        const tailMaterial = new THREE.MeshStandardMaterial({
            color: 0x3366ff,
            metalness: 0.7,
            roughness: 0.3
        });
        const vStab = new THREE.Mesh(vStabGeometry, tailMaterial);
        vStab.position.z = 10;
        vStab.position.y = 2;
        this.mesh.add(vStab);

        // Horizontal stabilizers
        const hStabGeometry = new THREE.BoxGeometry(8, 0.5, 2);
        const hStab = new THREE.Mesh(hStabGeometry, tailMaterial);
        hStab.position.z = 10;
        this.mesh.add(hStab);
    }

    createPropeller() {
        const propellerGroup = new THREE.Group();
        
        // Propeller hub
        const hubGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.5, 8);
        const hubMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            metalness: 0.9,
            roughness: 0.1
        });
        const hub = new THREE.Mesh(hubGeometry, hubMaterial);
        propellerGroup.add(hub);

        // Propeller blades
        const bladeGeometry = new THREE.BoxGeometry(8, 0.2, 0.5);
        const bladeMaterial = new THREE.MeshStandardMaterial({
            color: 0x666666,
            metalness: 0.8,
            roughness: 0.2
        });

        for (let i = 0; i < 3; i++) {
            const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
            blade.rotation.z = (i * Math.PI * 2) / 3;
            propellerGroup.add(blade);
        }

        propellerGroup.position.z = -12;
        this.mesh.add(propellerGroup);
        this.propeller = propellerGroup;
    }

    createCockpit() {
        const cockpitGeometry = new THREE.SphereGeometry(2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const cockpitMaterial = new THREE.MeshStandardMaterial({
            color: 0x88ccff,
            metalness: 0.1,
            roughness: 0.1,
            transparent: true,
            opacity: 0.7
        });
        const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
        cockpit.position.z = -6;
        cockpit.position.y = 1;
        cockpit.rotation.x = Math.PI;
        this.mesh.add(cockpit);
    }

    update(delta) {
        if (this.propeller) {
            this.propeller.rotation.z += delta * 10;
        }
    }
} 
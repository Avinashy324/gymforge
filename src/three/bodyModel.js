import * as THREE from 'three';

export class BodyModel {
  constructor() {
    this.group = null;
    this.models = {};
  }

  createBodyType(type) {
    const group = new THREE.Group();
    const material = new THREE.MeshBasicMaterial({
      color: type === 'ectomorph' ? 0x3B82F6 : type === 'mesomorph' ? 0xFF6B2C : 0xA855F7,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    });

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), material);
    head.position.y = 2.5;
    group.add(head);

    // Torso - varying widths based on body type
    let torsoTopRadius, torsoBottomRadius, torsoHeight;
    if (type === 'ectomorph') {
      torsoTopRadius = 0.35; torsoBottomRadius = 0.3; torsoHeight = 1.4;
    } else if (type === 'mesomorph') {
      torsoTopRadius = 0.55; torsoBottomRadius = 0.4; torsoHeight = 1.5;
    } else {
      torsoTopRadius = 0.45; torsoBottomRadius = 0.55; torsoHeight = 1.4;
    }

    const torso = new THREE.Mesh(
      new THREE.CylinderGeometry(torsoTopRadius, torsoBottomRadius, torsoHeight, 12),
      material
    );
    torso.position.y = 1.5;
    group.add(torso);

    // Arms
    const armRadius = type === 'mesomorph' ? 0.12 : type === 'endomorph' ? 0.14 : 0.08;
    const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(armRadius, armRadius * 0.7, 1.3, 8), material);
    leftArm.position.set(-(torsoTopRadius + 0.2), 1.7, 0);
    leftArm.rotation.z = 0.2;
    group.add(leftArm);

    const rightArm = leftArm.clone();
    rightArm.position.x = torsoTopRadius + 0.2;
    rightArm.rotation.z = -0.2;
    group.add(rightArm);

    // Hips
    const hipWidth = type === 'endomorph' ? 0.5 : type === 'mesomorph' ? 0.42 : 0.32;
    const hips = new THREE.Mesh(
      new THREE.CylinderGeometry(torsoBottomRadius, hipWidth, 0.4, 12),
      material
    );
    hips.position.y = 0.6;
    group.add(hips);

    // Legs
    const legRadius = type === 'endomorph' ? 0.16 : type === 'mesomorph' ? 0.15 : 0.1;
    const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(legRadius, legRadius * 0.7, 1.2, 8), material);
    leftLeg.position.set(-0.2, -0.2, 0);
    group.add(leftLeg);

    const rightLeg = leftLeg.clone();
    rightLeg.position.x = 0.2;
    group.add(rightLeg);

    group.scale.set(0.8, 0.8, 0.8);
    return group;
  }

  addToScene(scene, type) {
    this.removeFromScene(scene);
    this.group = this.createBodyType(type);
    scene.add(this.group);
  }

  removeFromScene(scene) {
    if (this.group) {
      scene.remove(this.group);
      this.group = null;
    }
  }

  update(time) {
    if (this.group) {
      this.group.rotation.y = Math.sin(time * 0.5) * 0.3;
    }
  }
}

import * as THREE from 'three';

export class ParticleSystem {
  constructor() {
    this.particles = null;
    this.count = 400;
    this.geometry = null;
    this.material = null;
  }

  init(scene) {
    this.geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.count * 3);
    const colors = new Float32Array(this.count * 3);
    const sizes = new Float32Array(this.count);

    const orangeColor = new THREE.Color(0xFF6B2C);
    const purpleColor = new THREE.Color(0xA855F7);
    const blueColor = new THREE.Color(0x3B82F6);
    const colorOptions = [orangeColor, purpleColor, blueColor];

    for (let i = 0; i < this.count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15;

      const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = Math.random() * 3 + 1;
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    this.material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    this.particles = new THREE.Points(this.geometry, this.material);
    scene.add(this.particles);
  }

  update(time) {
    if (!this.particles) return;
    const positions = this.geometry.attributes.position.array;
    for (let i = 0; i < this.count; i++) {
      positions[i * 3 + 1] += Math.sin(time * 0.5 + i * 0.1) * 0.002;
      positions[i * 3] += Math.cos(time * 0.3 + i * 0.05) * 0.001;
    }
    this.geometry.attributes.position.needsUpdate = true;
    this.particles.rotation.y = time * 0.02;
  }

  dispose() {
    if (this.geometry) this.geometry.dispose();
    if (this.material) this.material.dispose();
  }
}

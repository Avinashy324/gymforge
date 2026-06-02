import * as THREE from 'three';
import { ParticleSystem } from './particles.js';
import { BodyModel } from './bodyModel.js';

export class SceneManager {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.particles = null;
    this.bodyModel = null;
    this.geometricShapes = [];
    this.clock = new THREE.Clock();
    this.animationId = null;
    this.isRunning = false;
  }

  init(canvasId = 'three-canvas') {
    // Check if device can handle it
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.z = 8;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);

    // Particles
    this.particles = new ParticleSystem();
    this.particles.init(this.scene);

    // Body Model
    this.bodyModel = new BodyModel();

    // Ambient geometric shapes
    this._addGeometricShapes();

    // Handle resize
    window.addEventListener('resize', () => this._onResize());

    // Start animation
    this.isRunning = true;
    this._animate();
  }

  _addGeometricShapes() {
    const shapeConfigs = [
      { geometry: new THREE.IcosahedronGeometry(0.5, 0), color: 0xFF6B2C, position: [-4, 3, -3] },
      { geometry: new THREE.OctahedronGeometry(0.4, 0), color: 0xA855F7, position: [5, -2, -4] },
      { geometry: new THREE.TorusGeometry(0.4, 0.15, 8, 20), color: 0x3B82F6, position: [-3, -3, -2] },
      { geometry: new THREE.TetrahedronGeometry(0.35, 0), color: 0x22C55E, position: [4, 2, -5] },
      { geometry: new THREE.DodecahedronGeometry(0.3, 0), color: 0xFF6B2C, position: [0, 4, -3] },
    ];

    shapeConfigs.forEach(config => {
      const material = new THREE.MeshBasicMaterial({
        color: config.color,
        wireframe: true,
        transparent: true,
        opacity: 0.15,
      });
      const mesh = new THREE.Mesh(config.geometry, material);
      mesh.position.set(...config.position);
      mesh.userData = {
        rotSpeed: { x: (Math.random() - 0.5) * 0.01, y: (Math.random() - 0.5) * 0.01, z: (Math.random() - 0.5) * 0.005 },
        floatOffset: Math.random() * Math.PI * 2,
        originalY: config.position[1],
      };
      this.scene.add(mesh);
      this.geometricShapes.push(mesh);
    });
  }

  showBodyModel(type) {
    this.bodyModel.addToScene(this.scene, type);
  }

  hideBodyModel() {
    this.bodyModel.removeFromScene(this.scene);
  }

  _animate() {
    if (!this.isRunning) return;
    this.animationId = requestAnimationFrame(() => this._animate());

    const time = this.clock.getElapsedTime();

    // Update particles
    this.particles.update(time);

    // Update body model
    this.bodyModel.update(time);

    // Update geometric shapes
    this.geometricShapes.forEach(mesh => {
      mesh.rotation.x += mesh.userData.rotSpeed.x;
      mesh.rotation.y += mesh.userData.rotSpeed.y;
      mesh.rotation.z += mesh.userData.rotSpeed.z;
      mesh.position.y = mesh.userData.originalY + Math.sin(time + mesh.userData.floatOffset) * 0.3;
    });

    // Render
    this.renderer.render(this.scene, this.camera);
  }

  _onResize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  dispose() {
    this.isRunning = false;
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.particles.dispose();
    this.geometricShapes.forEach(mesh => {
      mesh.geometry.dispose();
      mesh.material.dispose();
    });
    if (this.renderer) this.renderer.dispose();
  }
}

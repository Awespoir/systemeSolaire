import {
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  AmbientLight,
  PointLight,
  TextureLoader,
  Raycaster,
  Vector2,
  Vector3
} from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Planet } from './src/components/planete.js';
import Sun from './src/components/soleil.js';

const scene = new Scene();

const loader = new TextureLoader();
loader.load('/public/assets/images/sky.jpg', texture => {
  scene.background = texture;
});

const camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.set(0, 500, 500);

const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Soleil
const sun = new Sun(20);
scene.add(sun);

const ambientLight = new AmbientLight(0xffffff, 0.05);
scene.add(ambientLight);

const lumos = new PointLight(0xffffff, 1.5, 5000);
lumos.position.copy(sun.position);
scene.add(lumos);

const controls = new OrbitControls(camera, renderer.domElement);
const initialCameraPosition = camera.position.clone();
const initialTarget = controls.target.clone();

const raycaster = new Raycaster();
const mouse = new Vector2();

let planets = [];
let selectedPlanet = null;
let startTime = Date.now();
let lastTime = Date.now();

fetch('/public/planets.json')
  .then(res => res.json())
  .then(data => {
    planets = data.map(p => {
      const planet = new Planet(p);
      scene.add(planet.orbitGroup);
      return planet;
    });
    initPlanetClickZoom();
    animate();
  });

  function animate() {
    requestAnimationFrame(animate);
  
    const now = Date.now();
    const delta = (now - lastTime) / 1000;
    lastTime = now;
  
    const elapsedSeconds = (now - startTime) / 1000;
    const elapsedDays = elapsedSeconds * 10;
  
    planets.forEach(planet => {
      planet.update(elapsedDays);
      planet.tick(delta);
    });
  
    sun.tick(delta);
  
    // === 💫 Suivi automatique de la planète sélectionnée ===
    if (selectedPlanet) {
      const planetPos = selectedPlanet.mesh.getWorldPosition(new Vector3());
  
      // Position de la caméra légèrement derrière
      const direction = new Vector3().subVectors(camera.position, controls.target).normalize();
      const offsetDistance = 30;
      const targetCameraPos = planetPos.clone().add(direction.multiplyScalar(offsetDistance));
  
      // Interpolation fluide vers la planète
      camera.position.lerp(targetCameraPos, 0.05);  // Vitesse du suivi
      controls.target.lerp(planetPos, 0.1);         // Centre la planète
      controls.update();
  
      selectedPlanet.showLabel(true);
    } else {
      planets.forEach(p => p.showLabel(false));
      controls.update();
    }
  
    renderer.render(scene, camera);
  }
  

function initPlanetClickZoom() {
  window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));
    if (intersects.length > 0) {
      const selected = intersects[0].object;
      selectedPlanet = planets.find(p => p.mesh === selected || p.orbitGroup === selected.parent);
      zoomToObject(selected, camera, controls);
    }
  });

  document.getElementById('back-to-sun')?.addEventListener('click', () => {
    resetCamera(camera, controls);
    selectedPlanet = null;
  });
}

function zoomToObject(target, camera, controls) {
  const offset = 30;

  const targetPos = target.getWorldPosition(new Vector3());

  const direction = new Vector3()
    .subVectors(camera.position, targetPos)
    .normalize();

  const newPosition = targetPos.clone().add(direction.multiplyScalar(offset));

  const startPosition = camera.position.clone();
  const startTarget = controls.target.clone();
  const startTime = performance.now();
  const duration = 1000;
   
  // Masquer tous les labels, afficher uniquement celui de la planète ciblée
   planets.forEach(p => {
    if (p.mesh === target) {
      p.showLabel(true);
    } else {
      p.showLabel(false);
    }
  });

  function animateCam(time) {
    const t = Math.min((time - startTime) / duration, 1);
    camera.position.lerpVectors(startPosition, newPosition, t);
    controls.target.lerpVectors(startTarget, targetPos, t);
    controls.update();
    if (t < 1) requestAnimationFrame(animateCam);
  }

  requestAnimationFrame(animateCam);
}


function resetCamera(camera, controls) {
  const startPosition = camera.position.clone();
  const startTarget = controls.target.clone();
  const startTime = performance.now();

  function animateReset(time) {
    const t = Math.min((time - startTime) / 1000, 1);
    camera.position.lerpVectors(startPosition, initialCameraPosition, t);
    controls.target.lerpVectors(startTarget, initialTarget, t);
    controls.update();
    if (t < 1) requestAnimationFrame(animateReset);
  }

  requestAnimationFrame(animateReset);
}

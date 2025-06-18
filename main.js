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

// 🌟 Création de la scène principale
const scene = new Scene();

// Chargement d'une texture pour le ciel d'arrière-plan
const loader = new TextureLoader();
loader.load('/assets/images/sky.jpg', texture => {
  scene.background = texture;
});

// Configuration de la caméra (PerspectiveCamera)
const camera = new PerspectiveCamera(
  60, // angle de vue
  window.innerWidth / window.innerHeight, // ratio
  0.1, // plan rapproché
  10000 // plan éloigné
);
camera.position.set(0, 500, 500); // position initiale

// Configuration du moteur de rendu
const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 🔆 Ajout du Soleil
const sun = new Sun(20); // rayon du soleil
scene.add(sun);

// Ajout d'une lumière ambiante
const ambientLight = new AmbientLight(0xffffff, 0.05);
scene.add(ambientLight);

// Ajout d'une lumière ponctuelle positionnée sur le Soleil
const lumos = new PointLight(0xffffff, 1.5, 5000);
lumos.position.copy(sun.position);
scene.add(lumos);

// Configuration des contrôles orbitaux (rotation de la caméra)
const controls = new OrbitControls(camera, renderer.domElement);
const initialCameraPosition = camera.position.clone(); // sauvegarde de la position initiale
const initialTarget = controls.target.clone(); // sauvegarde la cible initiale

// Configuration du Raycaster pour détecter les clics sur les planètes
const raycaster = new Raycaster();
const mouse = new Vector2();

// Variables globales
let planets = [];
let selectedPlanet = null;
let startTime = Date.now();
let lastTime = Date.now();

// 📥 Chargement des données des planètes depuis un fichier JSON
fetch('/planets.json')
  .then(res => res.json())
  .then(data => {
    planets = data.map(p => {
      const planet = new Planet(p); 
      scene.add(planet.orbitGroup); // ajoute le groupe orbite + planète
      return planet;
    });
    initPlanetClickZoom(); // initialise les interactions click/zoom
    animate(); // lance la boucle d'animation
  });

// 🚀 Boucle d'animation principale
function animate() {
  requestAnimationFrame(animate);

  const now = Date.now();
  const delta = (now - lastTime) / 1000; // temps écoulé entre frames en secondes
  lastTime = now;

  const elapsedSeconds = (now - startTime) / 1000;
  const elapsedDays = elapsedSeconds * 10; // vitesse accélérée des jours

  // Mise à jour de chaque planète (orbite + rotation)
  planets.forEach(planet => {
    planet.update(elapsedDays);
    planet.tick(delta);
  });

  sun.tick(delta); // mise à jour de la rotation du soleil

  // 🎯 Si une planète est sélectionnée, la caméra la suit
  if (selectedPlanet) {
    const planetPos = selectedPlanet.mesh.getWorldPosition(new Vector3());
    const direction = new Vector3()
      .subVectors(camera.position, controls.target)
      .normalize();
    const offsetDistance = 30;
    const targetCameraPos = planetPos
      .clone()
      .add(direction.multiplyScalar(offsetDistance));

    camera.position.lerp(targetCameraPos, 0.05);  // mouvement doux de la caméra
    controls.target.lerp(planetPos, 0.1);         // centrage sur la planète
    controls.update();

    selectedPlanet.showLabel(true); // affiche l'étiquette de la planète ciblée
  } else {
    // Masquage des étiquettes si aucune planète sélectionnée
    planets.forEach(p => p.showLabel(false));
    controls.update();
  }

  renderer.render(scene, camera); // rendu de la scène
}

// 🌍 Détection des clics sur les planètes
function initPlanetClickZoom() {
  window.addEventListener('click', event => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));
    if (intersects.length > 0) {
      const selected = intersects[0].object;
      selectedPlanet = planets.find(
        p => p.mesh === selected || p.orbitGroup === selected.parent
      );
      zoomToObject(selected, camera, controls); // zoom animé vers la planète
    }
  });

  // Bouton HTML optionnel pour revenir au Soleil (si présent)
  document.getElementById('back-to-sun')?.addEventListener('click', () => {
    resetCamera(camera, controls);
    selectedPlanet = null;
  });
}

// 🎥 Fonction pour zoomer sur une planète
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
  const duration = 1000; // durée de l'animation (1 seconde)

  // Affiche uniquement l'étiquette de la planète ciblée
  planets.forEach(p => {
    if (p.mesh === target) {
      p.showLabel(true);
    } else {
      p.showLabel(false);
    }
  });

  function animateCam(time) {
    const t = Math.min((time - startTime) / duration, 1); // interpolation de 0 à 1
    camera.position.lerpVectors(startPosition, newPosition, t);
    controls.target.lerpVectors(startTarget, targetPos, t);
    controls.update();
    if (t < 1) requestAnimationFrame(animateCam); // continuer l'animation
  }

  requestAnimationFrame(animateCam);
}

// 🔁 Fonction pour réinitialiser la caméra sur le Soleil
function resetCamera(camera, controls) {
  const startPosition = camera.position.clone();
  const startTarget = controls.target.clone();
  const startTime = performance.now();

  function animateReset(time) {
    const t = Math.min((time - startTime) / 1000, 1); // interpolation de 0 à 1 sur 1s
    camera.position.lerpVectors(startPosition, initialCameraPosition, t);
    controls.target.lerpVectors(startTarget, initialTarget, t);
    controls.update();
    if (t < 1) requestAnimationFrame(animateReset);
  }

  requestAnimationFrame(animateReset);
}

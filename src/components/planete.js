import {
  Group,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  TextureLoader,
  Vector3,
  CanvasTexture,
  MathUtils
} from 'three';

export class Planet {
  constructor({ name, diameter, distance, orbitalPeriod, rotationPeriod, tilt, texture }) {
    // Propriétés de la planète extraites de l'objet passé en paramètre
    this.name = name;                   // Nom de la planète
    this.diameter = diameter;           // Diamètre en km
    this.distance = distance;           // Distance à l'objet central (ex: soleil)
    this.orbitalPeriod = orbitalPeriod; // Durée de l'orbite en jours
    this.rotationPeriod= rotationPeriod; // Durée de rotation sur elle-même en heures
    this.scaledDiameter = Math.log10(diameter) * 0.5; // Diamètre mis à l'échelle logarithmique pour affichage
    this.scaledDistance = Math.log10(distance + 1) * 50; // Distance mise à l'échelle logarithmique (évite les trop grands écarts)
    this.axe= tilt || 0 // Inclinaison de l'axe de rotation (en degrés), défaut 0

    // Création de la géométrie sphérique avec la taille adaptée
    const geometry = new SphereGeometry(this.scaledDiameter, 32, 32);

    // Chargement de la texture de la planète
    const loader = new TextureLoader();
    const textureMap = loader.load(texture);

    // Matériau avec la texture pour un rendu réaliste
    const material = new MeshStandardMaterial({ map: textureMap });

    // Création du mesh combinant géométrie + matériau
    this.mesh = new Mesh(geometry, material);
    this.mesh.name = name;

    // Application de l'inclinaison de l'axe de rotation (rotation autour de Z)
    this.mesh.rotation.z = MathUtils.degToRad(this.axe);

    // Groupe pour gérer le système d'orbite (permettra de faire tourner tout le groupe autour du soleil)
    this.orbitGroup = new Group();
    this.orbitGroup.add(this.mesh);

    // Position initiale sur l'axe X selon la distance scalée
    this.mesh.position.x = this.scaledDistance;

    // Création et ajout de l'étiquette info au-dessus de la planète (invisible par défaut)
    this.label = this.createLabel(name);
    this.mesh.add(this.label);
    this.label.visible = false;
  }

  // Crée une étiquette (sprite 2D) avec les informations de la planète
  createLabel(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 130;  // Hauteur augmentée pour afficher plusieurs lignes
    const context = canvas.getContext('2d');

    // Efface le canvas pour repartir à zéro
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Style du texte : blanc avec ombre portée noire pour lisibilité
    context.fillStyle = 'white';
    context.font = '20px Arial';
    context.textAlign = 'left';
    context.textBaseline = 'top';
    context.shadowColor = 'black';
    context.shadowBlur = 5;

    // Affichage des différentes lignes d'informations
    context.fillText(`Nom : ${this.name}`, 10, 10);
    context.fillText(`Diamètre : ${this.diameter} km`, 10, 35);
    context.fillText(`Temps d'orbite : ${this.orbitalPeriod ? this.orbitalPeriod + ' j' : 'N/A'}`, 10, 60);
    context.fillText(`Rotation : ${this.rotationPeriod ? this.rotationPeriod + ' h' : 'N/A'}`, 10, 90);
    context.fillText(`Axe de Rotation : ${this.axe ? this.axe + '°': 'N/A'}`, 10, 110)

    // Création d'une texture à partir du canvas
    const texture = new CanvasTexture(canvas);

    // Matériau sprite avec transparence et sans test de profondeur (toujours visible)
    const material = new SpriteMaterial({ map: texture, transparent: true, depthTest:false });

    // Sprite 2D affichant l'étiquette dans la scène 3D
    const sprite = new Sprite(material);

    // Taille et positionnement du sprite au-dessus de la planète (en fonction de son diamètre)
    sprite.scale.set(15, 4.5, 2);
    sprite.position.set(0, this.scaledDiameter + 3, 0);

    return sprite;
  }

  // Met à jour la position de la planète sur son orbite en fonction du temps écoulé (en jours)
  update(elapsedDays) {
    // Calcul de l'angle orbital (en radians) proportionnel au temps écoulé et à la période orbitale
    const angle = (elapsedDays / this.orbitalPeriod) * 2 * Math.PI;

    // Mise à jour des coordonnées X et Z pour simuler la trajectoire circulaire de l'orbite
    this.mesh.position.x = Math.cos(angle) * this.scaledDistance;
    this.mesh.position.z = Math.sin(angle) * this.scaledDistance;
  }

  // Mise à jour de la rotation de la planète autour de son propre axe à chaque frame
  tick(delta) {
    const simDaysPerSecond = 10; // Nombre de jours simulés par seconde réelle
    const simDays = delta * simDaysPerSecond; // Temps simulé écoulé depuis la dernière frame

    // Convertit la période de rotation (en heures) en jours (24h = 1 jour)
    const rotationPeriodInDays = Math.abs(this.rotationPeriod / 24);

    // Détermine le sens de rotation (sens horaire ou antihoraire) selon le signe de rotationPeriod
    const direction = this.rotationPeriod >= 0 ? 1 : -1;

    // Calcule la vitesse angulaire (rad/jour)
    let rotationSpeed = direction * (2 * Math.PI / rotationPeriodInDays);

    // Applique un facteur de ralentissement global pour une rotation plus visible à l'écran
    const slowdownFactor = 0.01; // Ajustable : diminue la vitesse réelle
    rotationSpeed *= slowdownFactor;

    // Applique la rotation sur l'axe Y (rotation autour de l'axe vertical)
    this.mesh.rotation.y += rotationSpeed * simDays;
  }

  // Affiche ou masque l'étiquette info de la planète
  showLabel(show = true) {
    this.label.visible = show;
  }
}

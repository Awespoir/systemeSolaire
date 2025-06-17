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
  constructor({ name, diameter, distance, orbitalPeriod,rotationPeriod, tilt, texture }) {
    this.name = name;
    this.diameter = diameter;
    this.distance = distance;
    this.orbitalPeriod = orbitalPeriod;
    this.rotationPeriod= rotationPeriod;
    this.scaledDiameter = Math.log10(diameter) * 0.5;
    this.scaledDistance = Math.log10(distance + 1) * 50;
    this.axe= tilt || 0

    const geometry = new SphereGeometry(this.scaledDiameter, 32, 32);

    const loader = new TextureLoader();
    const textureMap = loader.load(texture);

    const material = new MeshStandardMaterial({ map: textureMap });

    this.mesh = new Mesh(geometry, material);
    this.mesh.name = name;

    this.mesh.rotation.z = MathUtils.degToRad(this.axe);
    this.orbitGroup = new Group();
    this.orbitGroup.add(this.mesh);

    // Position initiale
    this.mesh.position.x = this.scaledDistance;

    // Ajout de l'étiquette
    this.label = this.createLabel(name);
    this.mesh.add(this.label);
    this.label.visible = false;
  }

  createLabel(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 130;  // un peu plus haut pour 3 lignes
    const context = canvas.getContext('2d');
  
    context.clearRect(0, 0, canvas.width, canvas.height);
  
    context.fillStyle = 'white';
    context.font = '20px Arial';
    context.textAlign = 'left';
    context.textBaseline = 'top';
    context.shadowColor = 'black';
    context.shadowBlur = 5;
  
    context.fillText(`Nom : ${this.name}`, 10, 10);
    context.fillText(`Diamètre : ${this.diameter} km`, 10, 35);
    context.fillText(`Temps d'orbite : ${this.orbitalPeriod ? this.orbitalPeriod + ' j' : 'N/A'}`, 10, 60);
    context.fillText(`Rotation : ${this.rotationPeriod ? this.rotationPeriod + ' h' : 'N/A'}`, 10, 90);
    context.fillText(`Axe de Rotation : ${this.axe ? this.axe + '°': 'N/A'}`, 10, 110)
  
    const texture = new CanvasTexture(canvas);
    const material = new SpriteMaterial({ map: texture, transparent: true, depthTest:false });
    const sprite = new Sprite(material);
    sprite.scale.set(15, 4.5, 2);
    sprite.position.set(0, this.scaledDiameter + 3, 0);
    return sprite;
  }
  

  update(elapsedDays) {
    const angle = (elapsedDays / this.orbitalPeriod) * 2 * Math.PI;
    this.mesh.position.x = Math.cos(angle) * this.scaledDistance;
    this.mesh.position.z = Math.sin(angle) * this.scaledDistance;
  }

  tick(delta) {
    const simDaysPerSecond = 10;
    const simDays = delta * simDaysPerSecond;
  
    // Conversion de période de rotation en jours
    const rotationPeriodInDays = Math.abs(this.rotationPeriod / 24);
    const direction = this.rotationPeriod >= 0 ? 1 : -1;
  
    // Calcul de vitesse angulaire réelle
    let rotationSpeed = direction * (2 * Math.PI / rotationPeriodInDays);
  
    // 🔁 Ralentir la vitesse de rotation (sans fausser les écarts)
    const slowdownFactor = 0.01; // <--- ajuste ici pour ralentir (ex : 0.1 = 10x plus lent)
    rotationSpeed *= slowdownFactor;
  
    this.mesh.rotation.y += rotationSpeed * simDays;
  }
  

  showLabel(show = true) {
    this.label.visible = show;
  }
}

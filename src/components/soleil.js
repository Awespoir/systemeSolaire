import { Mesh, SphereGeometry, TextureLoader, MeshStandardMaterial } from 'three';
import sunTexture from '/assets/images/124867239-matériau-de-conception-texture-du-soleil-au-centre-de-l-univers-du-système-solaire-pas-de-rendu-3d.jpg';

// Classe représentant le Soleil, dérivée de Mesh (objet 3D avec géométrie et matériau)
export default class Sun extends Mesh {
  constructor(radius) {
    // Chargement de la texture du Soleil (image)
    const texture = new TextureLoader().load(sunTexture);

    // Création d'une géométrie sphérique avec le rayon donné
    const geometry = new SphereGeometry(radius, 32, 32);

    // Matériau avec des propriétés d'émission pour simuler la lumière émise par le Soleil
    const material = new MeshStandardMaterial({
      emissive: 0xffff33,         // Couleur émise (jaune clair)
      emissiveMap: texture,       // Texture qui modifie la couleur émise
      emissiveIntensity: 1,       // Intensité de l'émission lumineuse
      color: 0x000000,            // Couleur diffuse noire pour ne pas interférer avec l'émission
      transparent: true           // Permet des effets de transparence si nécessaire
    });

    // Appel du constructeur parent Mesh avec la géométrie et le matériau créés
    super(geometry, material);
  }

  // Méthode appelée à chaque frame pour animer la rotation du Soleil
  tick(delta) {
    // Fait tourner le Soleil lentement autour de l'axe Y
    // delta est le temps écoulé depuis la dernière frame en secondes
    this.rotation.y += delta * (1 / 25); // rotation lente : un tour complet en 25 secondes
  }
}










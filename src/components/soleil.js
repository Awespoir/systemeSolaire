import { Mesh, SphereGeometry, TextureLoader, MeshStandardMaterial } from 'three';
import sunTexture from '/assets/images/124867239-matériau-de-conception-texture-du-soleil-au-centre-de-l-univers-du-système-solaire-pas-de-rendu-3d.jpg';
export default class Sun extends Mesh {
  constructor(radius) {
    const texture = new TextureLoader().load(sunTexture);
    const geometry = new SphereGeometry(radius, 32, 32);
    const material = new MeshStandardMaterial({
      emissive: 0xffff33,
      emissiveMap: texture,
      emissiveIntensity: 1,
      color: 0x000000,
      transparent: true
    });
    super(geometry, material);
  }

  tick(delta) {
    this.rotation.y += delta * (1 / 25);
  }
}









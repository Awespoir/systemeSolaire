import { TextureLoader } from 'three';
import background from '../assets/images/sky.jpg';

export default function createBackground() {
  const textureLoader = new TextureLoader();
  const texture = textureLoader.load(background);
  return texture;
}

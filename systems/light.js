import { AmbientLight } from 'three';

export default function createLight() {
  // Creates an ambiant light
  const light = new AmbientLight(0xffffff);
  // move the light right, up, and towards us
  light.position.set(5, 5, 5);
  return light;
}

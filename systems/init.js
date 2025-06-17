import { WebGLRenderer, PerspectiveCamera, Scene } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function init() {
  const camera = new PerspectiveCamera(75, 1.77, 1, 1000);
  camera.position.z = 8;
  const renderer = new WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.update();
  const scene = new Scene();
  return [camera, renderer, scene, controls];
}

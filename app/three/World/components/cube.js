import { MeshBasicMaterial, BoxGeometry, Mesh } from "three";

function createCube() {
  const material = new MeshBasicMaterial();
  const geometry = new BoxGeometry(2, 2, 2);
  const cube = new Mesh(geometry, material);

  return cube;
}

export { createCube };

import { Scene, Color } from "three";

function createScene() {
  const scene = new Scene();

  scene.background = new Color("#902030");
  return scene;
}

export { createScene };

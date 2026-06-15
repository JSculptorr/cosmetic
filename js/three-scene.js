function initBeautyThreeScene() {
  const stage = document.querySelector("[data-three-stage]");

  if (!stage || !window.THREE) {
    return;
  }

  const THREE = window.THREE;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(stage.clientWidth, stage.clientHeight);

  if ("outputColorSpace" in renderer && THREE.SRGBColorSpace) {
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  } else if ("outputEncoding" in renderer && THREE.sRGBEncoding) {
    renderer.outputEncoding = THREE.sRGBEncoding;
  }

  stage.prepend(renderer.domElement);
  stage.classList.add("is-three-ready");

  camera.position.set(0, 0.15, 6.3);

  const crystalGroup = new THREE.Group();
  scene.add(crystalGroup);

  const crystalGeometry = new THREE.IcosahedronGeometry(1.55, 2);
  const position = crystalGeometry.attributes.position;

  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index);
    const y = position.getY(index);
    const z = position.getZ(index);
    const verticalShape = 1 + Math.abs(y) * 0.16;
    const softFacet = 1 + Math.sin((x + z) * 3.2) * 0.035;

    position.setXYZ(
      index,
      x * softFacet * 0.86,
      y * verticalShape * 1.16,
      z * softFacet
    );
  }

  crystalGeometry.computeVertexNormals();

  const crystalMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xf4b9bd,
    roughness: 0.18,
    metalness: 0,
    transparent: true,
    opacity: 0.72,
    transmission: 0.38,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    reflectivity: 0.72
  });

  const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
  crystal.rotation.set(-0.16, 0.38, 0.08);
  crystalGroup.add(crystal);

  const innerGlow = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.06, 1),
    new THREE.MeshStandardMaterial({
      color: 0xffe7e3,
      roughness: 0.62,
      metalness: 0,
      transparent: true,
      opacity: 0.28
    })
  );
  innerGlow.scale.set(0.72, 1.05, 0.72);
  crystalGroup.add(innerGlow);

  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.28,
    side: THREE.DoubleSide
  });

  const halo = new THREE.Mesh(new THREE.RingGeometry(1.82, 1.84, 96), ringMaterial);
  halo.rotation.x = Math.PI / 2.5;
  halo.rotation.y = -0.38;
  crystalGroup.add(halo);

  const baseShadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.55, 96),
    new THREE.MeshBasicMaterial({
      color: 0x6b6d56,
      transparent: true,
      opacity: 0.12
    })
  );
  baseShadow.position.y = -1.9;
  baseShadow.rotation.x = -Math.PI / 2;
  baseShadow.scale.set(1.45, 0.42, 1);
  crystalGroup.add(baseShadow);

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.9);
  keyLight.position.set(3.4, 4.4, 4.8);
  scene.add(keyLight);

  const blushLight = new THREE.DirectionalLight(0xf7b8b5, 1.9);
  blushLight.position.set(-3.8, 1.4, 2.6);
  scene.add(blushLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, 1.6);
  rimLight.position.set(0, 2.4, -4);
  scene.add(rimLight);

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.55);
  scene.add(ambientLight);

  const targetRotation = { x: 0, y: 0 };
  const currentRotation = { x: 0, y: 0 };

  stage.addEventListener("pointermove", (event) => {
    const rect = stage.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    targetRotation.y = x * 0.5;
    targetRotation.x = y * 0.32;
  });

  stage.addEventListener("pointerleave", () => {
    targetRotation.x = 0;
    targetRotation.y = 0;
  });

  function resize() {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function animate() {
    const time = performance.now() * 0.001;
    currentRotation.x += (targetRotation.x - currentRotation.x) * 0.055;
    currentRotation.y += (targetRotation.y - currentRotation.y) * 0.055;

    crystalGroup.rotation.x = currentRotation.x;
    crystalGroup.rotation.y += 0.0048;
    crystalGroup.rotation.z = currentRotation.y;
    crystalGroup.position.y = Math.sin(time * 1.25) * 0.08;
    halo.rotation.z = time * 0.18;
    innerGlow.scale.setScalar(0.96 + Math.sin(time * 1.7) * 0.025);
    innerGlow.scale.y = 1.18 + Math.sin(time * 1.7) * 0.035;

    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
  }

  window.addEventListener("resize", resize);
  resize();
  animate();
}

document.addEventListener("DOMContentLoaded", initBeautyThreeScene);

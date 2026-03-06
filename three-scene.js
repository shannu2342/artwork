import {
  AdditiveBlending,
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  TorusGeometry,
  WebGLRenderer,
} from "three";

export const initThreeScene = ({ canvas, floatingCards, getPointer, getScrollProgress }) => {
  const compactMode = window.innerWidth < 860;
  const renderer = new WebGLRenderer({
    canvas,
    antialias: !compactMode,
    alpha: true,
    powerPreference: "high-performance",
  });

  const setRendererSize = () => {
    const nextCompactMode = window.innerWidth < 860;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, nextCompactMode ? 1.1 : 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
  };

  setRendererSize();

  const scene = new Scene();
  const camera = new PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 11);

  const group = new Group();
  scene.add(group);

  const particleCount = compactMode ? 1200 : 1900;
  const geometry = new BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const color = new Color();

  for (let index = 0; index < particleCount; index += 1) {
    const angle = index * 0.18;
    const radius = 2.8 + Math.sin(index * 0.13) * 1.7 + Math.random() * 2.2;
    const depth = (index / particleCount) * 34 - 17;

    positions[index * 3] = Math.cos(angle) * radius;
    positions[index * 3 + 1] = Math.sin(angle) * radius * 0.75;
    positions[index * 3 + 2] = depth;

    color.set(index % 3 === 0 ? "#8f7cff" : index % 2 === 0 ? "#18e0ff" : "#ff5dca");
    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
  }

  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("color", new BufferAttribute(colors, 3));

  const particleMaterial = new PointsMaterial({
    size: compactMode ? 0.07 : 0.08,
    vertexColors: true,
    transparent: true,
    opacity: 0.78,
    blending: AdditiveBlending,
    depthWrite: false,
  });

  const particles = new Points(geometry, particleMaterial);
  group.add(particles);

  const ringMaterial = new MeshBasicMaterial({
    color: "#8f7cff",
    wireframe: true,
    transparent: true,
    opacity: 0.12,
  });

  const ringOne = new Mesh(new TorusGeometry(4.8, 0.04, 12, 130), ringMaterial);
  const ringTwo = new Mesh(new TorusGeometry(3.1, 0.03, 12, 130), ringMaterial.clone());
  ringTwo.material.color = new Color("#18e0ff");
  ringTwo.material.opacity = 0.16;
  ringTwo.rotation.x = Math.PI / 2.5;
  ringTwo.position.z = -6;
  ringOne.rotation.x = Math.PI / 2.3;

  group.add(ringOne, ringTwo);
  scene.add(new AmbientLight("#d8e3ff", 1.1));

  const handleResize = () => {
    setRendererSize();
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  };

  window.addEventListener("resize", handleResize);

  const renderFrame = () => {
    const { x, y, width, height } = getPointer();
    const pointerX = (x / width - 0.5) * 2;
    const pointerY = (y / height - 0.5) * 2;
    const scrollProgress = getScrollProgress();

    group.rotation.z += 0.0015;
    group.rotation.y += 0.0012;
    group.position.x = MathUtils.lerp(group.position.x, pointerX * 1.2, 0.06);
    group.position.y = MathUtils.lerp(group.position.y, -pointerY * 0.8, 0.06);

    camera.position.z = 11 - scrollProgress * 4.5;
    camera.position.x = MathUtils.lerp(camera.position.x, pointerX * 0.85, 0.05);
    camera.position.y = MathUtils.lerp(camera.position.y, -pointerY * 0.65, 0.05);

    ringOne.rotation.z += 0.0024;
    ringTwo.rotation.y -= 0.002;
    particles.rotation.z -= 0.0008;

    floatingCards.forEach((card, index) => {
      const depth = Number(card.dataset.depth || 0.12);
      const offset = Math.sin(performance.now() * 0.00045 + index) * 10;
      card.style.transform = `translate3d(${pointerX * depth * 26}px, ${offset}px, 0)`;
    });

    renderer.render(scene, camera);
    window.requestAnimationFrame(renderFrame);
  };

  renderFrame();
};

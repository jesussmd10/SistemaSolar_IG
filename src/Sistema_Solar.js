import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// --- VARIABLES GLOBALES ---
let scene, renderer;
let camera, cameraNave, activeCamera;
let camcontrols1;
let estrella, plano, raycaster, nave;
let Planetas = [];
let Lunas = [];
let t0 = 0;
const accglobal = 0.001;

let teclasPresionadas = {};
const textureLoader = new THREE.TextureLoader();

// Rutas de texturas
const listaTexturasPlanetas = [
  "src/2k_mercury.jpg",
  "src/2k_mars.jpg",
  "src/2k_venus_surface.jpg",
  "src/earthmap1k.jpg",
  "src/2k_neptune.jpg",
];
const texturaSol = "src/2k_sun.jpg";
const texturaLuna = "src/2k_moon.jpg";
const texturaFondo = "src/2k_stars_milky_way.jpg";

init();
animationLoop();

function init() {
  // Interfaz de información
  const info = document.createElement("div");
  info.style.position = "absolute";
  info.style.top = "30px";
  info.style.width = "100%";
  info.style.textAlign = "center";
  info.style.color = "#fff";
  info.style.fontWeight = "bold";
  info.style.backgroundColor = "transparent";
  info.style.zIndex = "1";
  info.style.fontFamily = "Monospace";
  info.innerHTML =
    "Presiona [C] para cambiar de vista | Controles Nave: [W] [A] [S] [D] | Clic Izquierdo para crear | Clic Derecho para borrar";
  document.body.appendChild(info);

  // Escena
  scene = new THREE.Scene();

  // Fondo de Estrellas
  const backgroundTexture = textureLoader.load(texturaFondo);
  backgroundTexture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = backgroundTexture;

  // --- CÁMARA 1: Orbital (Vista general) ---
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 25, 0); // Vista desde arriba
  camera.lookAt(0, 0, 0);

  // --- CÁMARA 2: Nave Espacial ---
  cameraNave = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  activeCamera = camera; // Empezamos con la vista orbital

  // --- CARGADOR DE NAVE ---
  const loader = new GLTFLoader();
  loader.load("src/nave_espacial.glb", (gltf) => {
    console.log("¡Nave cargada!");
    nave = gltf.scene;
    //Para poder iluminar la nave
    nave.traverse((child) => {
      if (child.isMesh && child.material) {
        // Creamos un nuevo material estándar
        const newMaterial = new THREE.MeshStandardMaterial({
          // Reutilizamos la textura (map) del material antiguo
          map: child.material.map,
        });

        // Reemplazamos el material básico por el nuevo material estándar
        child.material = newMaterial;
      }
    });
    nave.scale.set(0.1, 0.1, 0.1);
    nave.add(cameraNave);
    cameraNave.position.set(0, 10, 45);

    nave.position.set(-25, 0, 0);
    nave.lookAt(-50, 0, 0);

    scene.add(nave);
  });

  // Renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Controles
  camcontrols1 = new OrbitControls(camera, renderer.domElement);

  // --- LUCES ---
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  const pointLight = new THREE.PointLight(0xffffff, 3.0, 0);

  // Plano invisible para clics (horizontal)
  const geometryp = new THREE.PlaneGeometry(60, 60);
  const materialp = new THREE.MeshBasicMaterial({
    visible: false,
    side: THREE.DoubleSide,
  });
  plano = new THREE.Mesh(geometryp, materialp);
  plano.rotateX(-Math.PI / 2); // Lo ponemos en el plano X-Z
  scene.add(plano);

  // Raycaster
  raycaster = new THREE.Raycaster();

  // Eventos
  document.addEventListener("mousedown", onDocumentMouseDown); // Clic izquierdo
  document.addEventListener("contextmenu", onDocumentRightClick); // Clic derecho
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);

  // --- Creación de objetos iniciales ---
  Estrella(2.5, texturaSol);
  estrella.add(pointLight);

  // 5 Planetas iniciales
  Planeta(0.8, listaTexturasPlanetas[0], 5.0, 1.2, 0);
  Planeta(1.2, listaTexturasPlanetas[1], 8.5, 0.8, 1.5);
  Planeta(1.0, listaTexturasPlanetas[2], 12.0, 0.6, 3.0);
  Planeta(0.6, listaTexturasPlanetas[3], 15.0, 0.4, 4.5);
  Planeta(1.1, listaTexturasPlanetas[4], 18.0, 0.2, 6.0);

  // 3 Lunas iniciales
  Luna(Planetas[2], 0.3, texturaLuna, 2.0, 3.0);
  Luna(Planetas[0], 0.2, texturaLuna, 1.5, 2.5);
  Luna(Planetas[3], 0.4, texturaLuna, 2.5, 4.0);

  t0 = Date.now();
}

// --- FUNCIÓN ESTRELLA ---
function Estrella(rad, textureUrl) {
  const texture = textureLoader.load(textureUrl, undefined, (err) =>
    console.error("Error cargando textura del sol:", err)
  );
  const geometry = new THREE.SphereGeometry(rad, 32, 16);
  const material = new THREE.MeshBasicMaterial({ map: texture });
  estrella = new THREE.Mesh(geometry, material);
  scene.add(estrella);
}

// --- FUNCIÓN PLANETA ---
function Planeta(radio, textureUrl, dist, vel, anguloInicial) {
  const texture = textureLoader.load(textureUrl, undefined, (err) =>
    console.error("Error cargando textura de planeta:", textureUrl, err)
  );
  const geom = new THREE.SphereGeometry(radio, 32, 16);
  const mat = new THREE.MeshStandardMaterial({ map: texture });
  const planeta = new THREE.Mesh(geom, mat);
  planeta.userData.dist = dist;
  planeta.userData.speed = vel;
  planeta.userData.angle = anguloInicial;
  Planetas.push(planeta);
  scene.add(planeta);

  // Dibuja la trayectoria
  const curve = new THREE.EllipseCurve(
    0,
    0,
    dist,
    dist,
    0,
    2 * Math.PI,
    false,
    0
  );
  const points = curve.getPoints(100);
  const geome = new THREE.BufferGeometry().setFromPoints(points);
  const mate = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.3,
  });
  const orbita = new THREE.Line(geome, mate);
  orbita.rotateX(Math.PI / 2);

  // Guardamos referencia a la órbita para poder borrarla
  planeta.userData.orbita = orbita;

  scene.add(orbita);
  return planeta; // Devolvemos el planeta para la creación aleatoria de lunas
}

// --- FUNCIÓN LUNA ---
function Luna(planetaPadre, radio, textureUrl, dist, vel) {
  const texture = textureLoader.load(textureUrl, undefined, (err) =>
    console.error("Error cargando textura de luna:", err)
  );
  const geom = new THREE.SphereGeometry(radio, 32, 16);
  const mat = new THREE.MeshStandardMaterial({ map: texture });
  const luna = new THREE.Mesh(geom, mat);
  luna.userData.dist = dist;
  luna.userData.speed = vel;
  luna.userData.angle = Math.random() * Math.PI * 2;
  Lunas.push(luna);
  planetaPadre.add(luna);
}

// --- MANEJADORES DE EVENTOS ---

// CLIC DERECHO (Borrar)
function onDocumentRightClick(event) {
  event.preventDefault(); // Prevenimos el menú contextual
  if (activeCamera !== camera) return; // Solo en vista orbital

  const mouse = {
    x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
    y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1,
  };
  raycaster.setFromCamera(mouse, activeCamera);

  // Lanzamos el rayo contra los planetas
  const intersects = raycaster.intersectObjects(Planetas);

  if (intersects.length > 0) {
    const planetaABorrar = intersects[0].object;

    // Eliminamos la órbita
    scene.remove(planetaABorrar.userData.orbita);
    // Eliminamos el planeta (y sus lunas hijas)
    scene.remove(planetaABorrar);

    // Lo sacamos del array de animación
    Planetas = Planetas.filter((p) => p !== planetaABorrar);
  }
}

// CLIC IZQUIERDO (Crear)
function onDocumentMouseDown(event) {
  if (event.button !== 0) return; // Solo clic izquierdo
  if (activeCamera !== camera) return; // Solo en vista orbital

  const mouse = {
    x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
    y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1,
  };
  raycaster.setFromCamera(mouse, activeCamera);

  // Lanzamos el rayo contra el plano invisible
  const intersects = raycaster.intersectObject(plano);

  if (intersects.length > 0) {
    const punto = intersects[0].point;
    const distancia = Math.sqrt(punto.x ** 2 + punto.z ** 2);
    if (distancia < 4.0) return; // Evitar crear planetas dentro del sol

    const velocidad = 5 / distancia;
    const anguloInicial = Math.atan2(punto.z, punto.x);
    const radioPlaneta = Math.random() * 0.4 + 0.2;
    const texturaAleatoria =
      listaTexturasPlanetas[
        Math.floor(Math.random() * listaTexturasPlanetas.length)
      ];

    // Creamos el planeta y guardamos la referencia
    const nuevoPlaneta = Planeta(
      radioPlaneta,
      texturaAleatoria,
      distancia,
      velocidad,
      anguloInicial
    );

    // 40% de probabilidad de crear una luna
    if (Math.random() < 0.4) {
      const radioLuna = radioPlaneta * (Math.random() * 0.2 + 0.2);
      const distLuna = radioPlaneta + 0.5 + Math.random() * 0.5;
      const velLuna = (Math.random() * 2 + 2) * (Math.random() < 0.5 ? 1 : -1);

      Luna(nuevoPlaneta, radioLuna, texturaLuna, distLuna, velLuna);
    }
  }
}

// Controles de teclado
function onKeyDown(event) {
  const tecla = event.key.toLowerCase();
  teclasPresionadas[tecla] = true;
  if (tecla === "c") {
    toggleCamera();
  }
}
function onKeyUp(event) {
  teclasPresionadas[event.key.toLowerCase()] = false;
}

// Cambio de cámara
function toggleCamera() {
  if (activeCamera === camera) {
    activeCamera = cameraNave;
    camcontrols1.enabled = false;
  } else {
    activeCamera = camera;
    camcontrols1.enabled = true;
  }
}

// Mover la nave
function actualizarNave() {
  if (!nave) return; // Guardián por si la nave no ha cargado

  const velocidadGiro = 0.03;
  const velocidadAvance = 0.1;

  if (teclasPresionadas["a"]) {
    nave.rotateY(velocidadGiro);
  }
  if (teclasPresionadas["d"]) {
    nave.rotateY(-velocidadGiro);
  }
  if (teclasPresionadas["w"]) {
    nave.translateZ(-velocidadAvance);
  }
  if (teclasPresionadas["s"]) {
    nave.translateZ(velocidadAvance);
  }
}

// --- BUCLE DE ANIMACIÓN ---
function animationLoop() {
  const timestamp = (Date.now() - t0) * accglobal;
  requestAnimationFrame(animationLoop);

  if (activeCamera === cameraNave) {
    actualizarNave();
  }

  // Animar Planetas
  for (const planeta of Planetas) {
    const anguloActual =
      timestamp * planeta.userData.speed + planeta.userData.angle;
    planeta.position.x = Math.cos(anguloActual) * planeta.userData.dist;
    planeta.position.z = Math.sin(anguloActual) * planeta.userData.dist; // Eje Z
    planeta.rotation.y += 0.003;
  }

  // Animar Lunas
  for (const luna of Lunas) {
    const anguloActual = timestamp * luna.userData.speed + luna.userData.angle;
    luna.position.x = Math.cos(anguloActual) * luna.userData.dist;
    luna.position.z = Math.sin(anguloActual) * luna.userData.dist; // Eje Z
  }

  if (estrella) {
    estrella.rotation.y += 0.001;
  }

  renderer.render(scene, activeCamera);
}

// Voiture 3D : Volkswagen Atlas Cross Sport (2025) simplifié — low-poly procédural,
// custom-layer MapLibre sur three.js. Référence visuelle : Sketchfab
// « Volkswagen Atlas Teramont Cross Sport 2025 » (8fec636e245a4909814bf564d6da307f),
// bleu azure #3A86C3. Simplifié : profil latéral extrudé, sportback modéré,
// calandre chromée large intégrée aux phares fins, rails de toit SANS coffre.
// Nose de la model en -Z, haut en +Y.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { metersPerPixel } from './geo.js';

function box(w, h, d, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  return m;
}

/** Боковой профиль (z — вдоль машины, нос в -z; y — вверх), выдавленный на ширину w по оси x. */
function profile(points, w, mat, bevel = 0.012) {
  const shape = new THREE.Shape();
  points.forEach(([z, y], i) => (i ? shape.lineTo(z, y) : shape.moveTo(z, y)));
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: w, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 6,
  });
  const m = new THREE.Mesh(geo, mat);
  m.rotation.y = -Math.PI / 2; // ось выдавливания → ширина (x), координата профиля → длина (z)
  m.position.x = w / 2;
  return m;
}

/**
 * VW Atlas Cross Sport simplifié : SUV 5 places à toit sportback modéré.
 * Long capot, pare-brise moyennement incliné, toit plat à l'avant/milieu puis
 * descente continue (hayon incliné, vitre arrière réduite), calandre chromée
 * horizontale reliée à des phares fins, liseré chromé arrière pleine largeur,
 * plastique noir bas de caisse, roues SUV. Longueur 1.0 (z −0.5..+0.5), largeur 0.42.
 */
export function buildCar(color) {
  const g = new THREE.Group();
  const body = new THREE.MeshStandardMaterial({ color, metalness: 0.45, roughness: 0.35 });
  const trim = new THREE.MeshStandardMaterial({ color: 0x1a1c1f, roughness: 0.9 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x1e2a36, metalness: 0.75, roughness: 0.18 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xdfe4ea, metalness: 0.9, roughness: 0.25 });
  const tire = new THREE.MeshStandardMaterial({ color: 0x0d0d0d, roughness: 1 });
  const head = new THREE.MeshStandardMaterial({ color: 0xfff7d0, emissive: 0xfff1a8, emissiveIntensity: 0.9 });
  const tail = new THREE.MeshStandardMaterial({ color: 0xe0342b, emissive: 0xe0342b, emissiveIntensity: 0.7 });

  const W = 0.42;
  // Caisse basse : pare-chocs avant → long capot → ceinture légèrement ascendante → arrière haut.
  g.add(profile([
    [-0.50, 0.10], [-0.50, 0.235], [-0.45, 0.262], [-0.10, 0.305], [0.30, 0.318], [0.50, 0.330], [0.50, 0.10],
  ], W, body));
  // Cabine (vitres) : pare-brise moyennement incliné, toit plat, puis sportback continu jusqu'au hayon.
  g.add(profile([
    [-0.10, 0.300], [-0.015, 0.428], [0.240, 0.428], [0.435, 0.300],
  ], W - 0.02, glass, 0.008));
  // Toit en couleur caisse coiffant les vitres, suivant la ligne sportback.
  g.add(profile([
    [-0.020, 0.432], [0.240, 0.432], [0.445, 0.305], [0.417, 0.290], [0.240, 0.410], [-0.020, 0.410],
  ], W - 0.06, body, 0.005));
  // Montants : pare-brise (A), central (B), arrière épais incliné (D, sportback).
  g.add(profile([[-0.105, 0.300], [-0.020, 0.428], [0.018, 0.428], [-0.062, 0.300]], W - 0.015, body, 0.004));
  g.add(profile([[0.115, 0.300], [0.115, 0.424], [0.148, 0.424], [0.148, 0.300]], W - 0.015, body, 0.004));
  g.add(profile([[0.340, 0.300], [0.255, 0.424], [0.300, 0.424], [0.440, 0.300]], W - 0.015, body, 0.004));
  // Bas de caisse noir crossover + passages de roue.
  g.add(box(W + 0.02, 0.05, 0.99, trim, 0, 0.125, 0));
  for (const z of [-0.30, 0.30]) g.add(box(W + 0.03, 0.10, 0.24, trim, 0, 0.17, z));
  // Avant : calandre chromée pleine largeur entre phares fins, prise d'air basse.
  g.add(box(W - 0.10, 0.032, 0.02, chrome, 0, 0.238, -0.505));
  g.add(box(0.115, 0.030, 0.02, head, -0.163, 0.248, -0.502));
  g.add(box(0.115, 0.030, 0.02, head, 0.163, 0.248, -0.502));
  g.add(box(W - 0.06, 0.035, 0.02, trim, 0, 0.155, -0.505));
  // Arrière : feux fins horizontaux + liseré chromé pleine largeur (signature Atlas).
  g.add(box(0.155, 0.026, 0.02, tail, -0.185, 0.308, 0.505));
  g.add(box(0.155, 0.026, 0.02, tail, 0.185, 0.308, 0.505));
  g.add(box(W - 0.08, 0.02, 0.015, chrome, 0, 0.285, 0.506));
  // Rétroviseurs.
  g.add(box(0.055, 0.032, 0.045, body, -0.235, 0.335, -0.075));
  g.add(box(0.055, 0.032, 0.045, body, 0.235, 0.335, -0.075));
  // Rails de toit chromés (section plate ; pas de coffre de toit — modèle d'origine).
  g.add(box(0.022, 0.018, 0.26, chrome, -0.150, 0.443, 0.10));
  g.add(box(0.022, 0.018, 0.26, chrome, 0.150, 0.443, 0.10));
  // Roues SUV (grandes).
  const wheelGeo = new THREE.CylinderGeometry(0.098, 0.098, 0.078, 20);
  const capGeo = new THREE.CylinderGeometry(0.058, 0.058, 0.080, 12);
  for (const [x, z] of [[-0.20, -0.30], [0.20, -0.30], [-0.20, 0.30], [0.20, 0.30]]) {
    const w = new THREE.Mesh(wheelGeo, tire);
    w.rotation.z = Math.PI / 2;
    w.position.set(x, 0.098, z);
    g.add(w);
    const cap = new THREE.Mesh(capGeo, chrome);
    cap.rotation.z = Math.PI / 2;
    cap.position.set(x, 0.098, z);
    g.add(cap);
  }
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.5, 32),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.scale.set(0.62, 1.16, 1);
  shadow.position.set(0.03, 0.004, 0.02);
  g.add(shadow);
  g.userData.bodyMaterial = body;
  return g;
}

export class Car3DLayer {
  constructor({ color = '#3A86C3', sizePx = 60 } = {}) {
    this.id = 'car-3d';
    this.type = 'custom';
    this.renderingMode = '3d';
    this.color = color;
    this.sizePx = sizePx;
    this.state = null;
  }

  onAdd(map, gl) {
    this.map = map;
    this.camera = new THREE.Camera();
    this.scene = new THREE.Scene();
    const sun = new THREE.DirectionalLight(0xffffff, 2.6);
    sun.position.set(0.6, 1.4, -0.8);
    this.scene.add(sun);
    const fill = new THREE.DirectionalLight(0xbfd4ff, 0.8);
    fill.position.set(-0.8, 0.6, 0.9);
    this.scene.add(fill);
    this.scene.add(new THREE.AmbientLight(0xffffff, 1.1));
    this.model = buildCar(this.color);
    this.scene.add(this.model);
    this.renderer = new THREE.WebGLRenderer({ canvas: map.getCanvas(), context: gl, antialias: true });
    this.renderer.autoClear = false;
  }

  onRemove() {
    this.renderer?.dispose();
  }

  setColor(color) {
    this.color = color;
    this.model?.userData.bodyMaterial.color.set(color);
  }

  /** Позиция [lng, lat], курс в градусах. */
  setState(lngLat, bearing) {
    this.state = { lngLat, bearing };
  }

  render(gl, args) {
    if (!this.state || !this.model) return;
    const matrix = args && args.defaultProjectionData ? args.defaultProjectionData.mainMatrix : args;
    const { lngLat, bearing } = this.state;
    const alt = this.map.getTerrain() ? (this.map.queryTerrainElevation(lngLat) || 0) : 0;
    const lengthM = this.sizePx * metersPerPixel(lngLat[1], this.map.getZoom());
    const mc = maplibregl.MercatorCoordinate.fromLngLat(lngLat, alt + lengthM * 0.01);
    const s = lengthM * mc.meterInMercatorCoordinateUnits();
    const local = new THREE.Matrix4()
      .makeTranslation(mc.x, mc.y, mc.z)
      .scale(new THREE.Vector3(s, -s, s))
      .multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2))
      .multiply(new THREE.Matrix4().makeRotationY((-bearing * Math.PI) / 180));
    this.camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix).multiply(local);
    this.renderer.resetState();
    this.renderer.setViewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    this.renderer.render(this.scene, this.camera);
  }
}

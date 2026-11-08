import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Landing-only decorative WebGL scene (README "Why three"):
// a small grad-cap mascot + floating portfolio cards, gentle idle motion,
// pointer parallax. No models downloaded — primitives only, one draw pass.
// Reduced motion → one static frame. Tab hidden → loop pauses.

interface Body {
  mesh: THREE.Object3D;
  base: THREE.Vector3;
  phase: number;
  speed: number;
  spinY: number;
  spinZ: number;
  amp: number;
}

const COLORS = {
  indigo: 0x4f46e5,
  blue: 0x2052eb,
  blush: 0xfadbe5,
  mint: 0xf4ffc9,
  cream: 0xe3e0dc,
  white: 0xffffff,
  ink: 0x0f172a,
};

export default function HeroCanvas() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let running = false;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    host.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60);
    camera.position.set(0, 0.15, 8.4);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const key = new THREE.DirectionalLight(0xfff4e0, 1.8);
    key.position.set(3.2, 5, 4.2);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xf4ffc9, 0.9);
    rim.position.set(-4, -2.5, -3);
    scene.add(rim);

    const group = new THREE.Group();
    scene.add(group);

    const bodies: Body[] = [];
    const disposables: Array<{ dispose: () => void }> = [];
    const mat = (color: number, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) => {
      const m = new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.04, ...extra });
      disposables.push(m);
      return m;
    };
    const track = <T extends THREE.BufferGeometry>(g: T): T => { disposables.push(g); return g; };

    function place(mesh: THREE.Object3D, x: number, y: number, z: number, opts: Partial<Body> = {}) {
      mesh.position.set(x, y, z);
      bodies.push({
        mesh,
        base: new THREE.Vector3(x, y, z),
        phase: Math.random() * Math.PI * 2,
        speed: 0.8 + Math.random() * 0.5,
        spinY: 0,
        spinZ: 0,
        amp: 0.22,
        ...opts,
      });
      group.add(mesh);
    }

    // ── mascot: grad-cap figure (capsule body, sphere head, mortarboard) ──
    const mascot = new THREE.Group();
    const body = new THREE.Mesh(track(new THREE.CapsuleGeometry(0.26, 0.46, 4, 12)), mat(COLORS.indigo));
    body.position.y = 0;
    const head = new THREE.Mesh(track(new THREE.SphereGeometry(0.22, 20, 14)), mat(COLORS.white, { roughness: 0.5 }));
    head.position.y = 0.58;
    const capBoard = new THREE.Mesh(track(new THREE.BoxGeometry(0.58, 0.055, 0.58)), mat(COLORS.ink, { roughness: 0.35 }));
    capBoard.position.y = 0.82;
    const capBase = new THREE.Mesh(track(new THREE.CylinderGeometry(0.15, 0.17, 0.1, 16)), mat(COLORS.ink, { roughness: 0.35 }));
    capBase.position.y = 0.76;
    const tassel = new THREE.Mesh(track(new THREE.SphereGeometry(0.045, 8, 8)), mat(COLORS.mint));
    tassel.position.set(0.24, 0.79, 0.18);
    const eyeGeo = track(new THREE.SphereGeometry(0.028, 8, 8));
    const eyeMat = mat(COLORS.ink, { roughness: 0.6 });
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat); eyeL.position.set(-0.07, 0.6, 0.19);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat); eyeR.position.set(0.07, 0.6, 0.19);
    mascot.add(body, head, capBoard, capBase, tassel, eyeL, eyeR);
    mascot.scale.setScalar(1.18);
    // mascot stands between the text column and the phone (visible, not hidden)
    place(mascot, -1.15, -0.28, 0.7, { speed: 0.75, amp: 0.16, spinY: 0.15 });

    // ── floating portfolio cards (orbit the phone; ink card replaces white — contrast) ──
    const cardGeo = track(new RoundedBoxGeometry(1.05, 1.28, 0.09, 3, 0.09));
    const card = (color: number, x: number, y: number, z: number, tiltZ: number, spin: number) => {
      const m = new THREE.Mesh(cardGeo, mat(color, { roughness: 0.38 }));
      m.rotation.set(0.05 * Math.sign(y) * -1, 0.32 * (Math.random() > 0.5 ? 1 : -1), tiltZ);
      place(m, x, y, z, { spinY: spin, amp: 0.26 });
    };
    card(COLORS.indigo, -1.75, 1.28, -0.7, 0.12, 0.22);
    card(COLORS.blush, 1.62, 1.38, -1.4, -0.08, -0.18);
    card(COLORS.ink, 1.78, -1.28, 0.3, 0.1, 0.2);
    card(COLORS.mint, -1.95, -1.18, -0.4, -0.12, -0.16);

    // ── accent ring + orb (kept inside the cluster) ──
    const torus = new THREE.Mesh(track(new THREE.TorusGeometry(0.34, 0.05, 12, 40)), mat(COLORS.cream, { roughness: 0.3 }));
    torus.rotation.x = 0.9;
    place(torus, 0.4, 1.72, -0.7, { speed: 0.6, amp: 0.16, spinY: 0.35 });
    const orb = new THREE.Mesh(track(new THREE.SphereGeometry(0.15, 16, 12)), mat(COLORS.blush));
    place(orb, 0.18, -1.62, 0.55, { speed: 1.1, amp: 0.22 });

    // pointer parallax target (window-level so hover over the text also moves it)
    const target = new THREE.Vector2(0, 0);
    const onPointer = (e: PointerEvent) => {
      target.set(
        (e.clientY / window.innerHeight - 0.5) * -0.16,
        (e.clientX / window.innerWidth - 0.5) * 0.3,
      );
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    function resize() {
      const w = host!.clientWidth || 1;
      const h = host!.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      // bias the cluster firmly into the right (mockup) column on wide screens,
      // so the left text column stays clean
      const lg = w >= 1024;
      group.position.x = lg ? 2.35 : 0;
      const s = lg ? 1.0 : Math.max(0.55, Math.min(0.8, w / 950));
      group.scale.setScalar(s);
    }
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    const clock = new THREE.Clock();
    function frame() {
      const t = clock.getElapsedTime();
      for (const b of bodies) {
        b.mesh.position.y = b.base.y + Math.sin(t * b.speed + b.phase) * b.amp;
        if (b.spinY) b.mesh.rotation.y += b.spinY * 0.016;
        if (b.spinZ) b.mesh.rotation.z += b.spinZ * 0.016;
      }
      group.rotation.x += (target.x - group.rotation.x) * 0.05;
      group.rotation.y += (target.y - group.rotation.y) * 0.05;
      renderer.render(scene, camera);
    }

    function loop() {
      raf = requestAnimationFrame(loop);
      frame();
    }

    if (reduced) {
      renderer.render(scene, camera); // one honest static frame
    } else {
      running = true;
      loop();
      const onVis = () => {
        if (document.hidden && running) {
          cancelAnimationFrame(raf);
          running = false;
        } else if (!document.hidden && !running) {
          clock.getDelta(); // absorb the pause gap
          running = true;
          loop();
        }
      };
      document.addEventListener("visibilitychange", onVis);

      return () => {
        document.removeEventListener("visibilitychange", onVis);
        document.removeEventListener("pointermove", onPointer);
        cancelAnimationFrame(raf);
        ro.disconnect();
        for (const d of disposables) d.dispose();
        renderer.dispose();
        if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
      };
    }

    return () => {
      document.removeEventListener("pointermove", onPointer);
      cancelAnimationFrame(raf);
      ro.disconnect();
      for (const d of disposables) d.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={hostRef} aria-hidden className="absolute inset-0 opacity-60 lg:opacity-100 pointer-events-none" />;
}

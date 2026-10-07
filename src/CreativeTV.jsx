import gsap from 'gsap';
import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, Power, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import './creative-tv.css';
import { playSound, soundsEnabled, subscribeSounds, toggleSounds } from './creative-sfx';

export default function CreativeTV({ item, channel, count, onChannel }) {
  const soundOn = useSyncExternalStore(subscribeSounds, soundsEnabled, () => true);
  const hostRef = useRef(null);
  const engineRef = useRef(null);
  const currentRef = useRef(item);
  const settingsRef = useRef({ power: true, playing: !matchMedia('(prefers-reduced-motion: reduce)').matches, muted: true });
  const [power, setPower] = useState(true);
  const [playing, setPlaying] = useState(settingsRef.current.playing);
  const [muted, setMuted] = useState(true);
  const [ready, setReady] = useState(false);
  currentRef.current = item;

  useEffect(() => {
    const host = hostRef.current;
    let cancelled = false;
    let dispose = () => {};
    async function start() {
      try {
        const [THREE, { RoundedBoxGeometry }] = await Promise.all([import('three'), import('three/addons/geometries/RoundedBoxGeometry.js')]);
        if (cancelled) return;
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
        renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFShadowMap;
        renderer.domElement.setAttribute('aria-hidden', 'true');
        host.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(35, 1, .1, 50);
        camera.position.set(0, .75, 7.2); camera.lookAt(0, -.1, 0);
        scene.add(new THREE.HemisphereLight(0xffffff, 0x807367, 2.6));
        const light = new THREE.DirectionalLight(0xfff3dd, 3.2);
        light.position.set(-3, 6, 5); light.castShadow = true;
        light.shadow.mapSize.set(1024, 1024); light.shadow.camera.left = -5; light.shadow.camera.right = 5;
        light.shadow.camera.top = 5; light.shadow.camera.bottom = -5; light.shadow.normalBias = .025;
        scene.add(light);
        const rim = new THREE.DirectionalLight(0xffffff, 1.4); rim.position.set(4, 2, -2); scene.add(rim);
        const tv = new THREE.Group(); tv.rotation.y = -.12; scene.add(tv);
        const motion = gsap.context(() => {});
        const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
        const cream = new THREE.MeshStandardMaterial({ color: 0xd6cbb7, roughness: .52 });
        const dark = new THREE.MeshStandardMaterial({ color: 0x292a26, roughness: .48 });
        const copper = new THREE.MeshStandardMaterial({ color: 0x966144, roughness: .45, metalness: .3 });
        function box(w, h, d, radius, material, x, y, z) {
          const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, radius), material);
          mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; tv.add(mesh); return mesh;
        }
        box(4.2, 3.1, 1.25, .16, cream, 0, 0, 0);
        box(3.42, 2.49, .14, .14, dark, -.25, .12, .65);
        box(3.17, 2.25, .08, .11, new THREE.MeshStandardMaterial({ color: 0x0b100e, roughness: .22 }), -.25, .12, .75);
        const screenMaterial = new THREE.ShaderMaterial({
          uniforms: { mediaMap: { value: null }, videoMedia: { value: false }, reveal: { value: 0 }, beamWidth: { value: 0 }, cropScale: { value: new THREE.Vector2(1, 1) } },
          vertexShader: 'varying vec2 mediaUv; void main(){ mediaUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
          fragmentShader: `uniform sampler2D mediaMap; uniform bool videoMedia; uniform float reveal; uniform float beamWidth; uniform vec2 cropScale; varying vec2 mediaUv;
            void main(){
              float dy=abs(mediaUv.y-.5); float dx=abs(mediaUv.x-.5);
              if(dy>max(.0015,reveal*.5)||dx>beamWidth*.5) discard;
              vec4 picture=texture2D(mediaMap,(mediaUv-.5)*cropScale+.5);
              // Video textures need the same sRGB decode as Three's standard materials.
              if(videoMedia) picture=sRGBTransferEOTF(picture);
              float beam=exp(-pow(dy*300.0,2.0))*(1.0-smoothstep(.02,.22,reveal));
              gl_FragColor=vec4(mix(picture.rgb,vec3(1.0,.98,.89),beam),1.0);
              #include <tonemapping_fragment>
              #include <colorspace_fragment>
            }`, toneMapped: false
        });
        const screen = new THREE.Mesh(new THREE.PlaneGeometry(3.00, 2.07), screenMaterial);
        screen.position.set(-.25, .12, .8); tv.add(screen);
        for (const y of [.75, .12]) {
          const knob = new THREE.Mesh(new THREE.CylinderGeometry(.18, .18, .16, 32), dark);
          knob.rotation.x = Math.PI / 2; knob.position.set(1.68, y, .7); tv.add(knob);
          box(.035, .19, .035, .009, copper, 1.68, y, .8);
        }
        for (let i = 0; i < 7; i++) box(.35, .018, .025, .007, dark, 1.68, -.48 - i * .08, .65);
        box(1.1, .09, .055, .02, copper, -.97, -1.3, .66);
        box(1.42, .14, .05, .015, dark, .66, -1.3, .67);
        const diskMaterial = new THREE.MeshStandardMaterial({ color: 0x5b8176, roughness: .55 });
        const insertedDisk = new THREE.Group(); insertedDisk.position.set(.66, -1.3, .85); tv.add(insertedDisk);
        const diskBody = new THREE.Mesh(new RoundedBoxGeometry(1.24, .075, .9, 2, .025), diskMaterial); insertedDisk.add(diskBody);
        const labelCanvas = document.createElement('canvas'); labelCanvas.width = 512; labelCanvas.height = 200;
        const labelMap = new THREE.CanvasTexture(labelCanvas); labelMap.colorSpace = THREE.SRGBColorSpace;
        const labelMaterial = new THREE.MeshBasicMaterial({ map: labelMap });
        const diskLabel = new THREE.Mesh(new THREE.PlaneGeometry(.98, .38), labelMaterial);
        diskLabel.rotation.x = -Math.PI / 2; diskLabel.position.set(0, .041, .13); insertedDisk.add(diskLabel);
        const ledMaterial = new THREE.MeshBasicMaterial({ color: 0x98bd71 });
        const led = new THREE.Mesh(new THREE.SphereGeometry(.045, 12, 12), ledMaterial);
        led.position.set(1.68, -1.24, .67); tv.add(led);
        box(3.0, .18, .85, .08, cream, 0, -1.65, 0);
        for (const x of [-1.4, 1.4]) box(.24, .2, .55, .05, dark, x, -1.68, .02);
        const ground = new THREE.Mesh(new THREE.PlaneGeometry(18, 18), new THREE.ShadowMaterial({ opacity: .18 }));
        ground.rotation.x = -Math.PI / 2; ground.position.y = -1.8; ground.receiveShadow = true; scene.add(ground);
        const loader = new THREE.TextureLoader();
        let texture = null, video = null, mediaId = 0, visible = false, raf = 0, last = 0;
        let targetX = 0, targetY = -.12, drag = null, booting = false, bootedId = -1;
        function frame(time) {
          if (!visible || cancelled) return;
          raf = requestAnimationFrame(frame);
          if (time - last < 32) return;
          last = time;
          tv.rotation.x += (targetX - tv.rotation.x) * .12;
          tv.rotation.y += (targetY - tv.rotation.y) * .12;
          renderer.render(scene, camera);
        }
        function sync() {
          const state = settingsRef.current;
          screen.visible = state.power && !!currentRef.current;
          ledMaterial.color.set(state.power && currentRef.current ? 0x98bd71 : 0x664037);
          if (video) {
            video.muted = state.muted;
            if (visible && state.power && state.playing && !booting) video.play().catch(() => {});
            else video.pause();
          }
          renderer.render(scene, camera);
        }
        // Fill the CRT with video; preserve the complete composition of still images.
        function fitTexture(map, width, height) {
          const aspect = width / height, screenAspect = 3 / 2.07;
          map.wrapS = map.wrapT = THREE.ClampToEdgeWrapping;
          if (currentRef.current?.video) {
            screen.scale.set(1, 1, 1);
            screenMaterial.uniforms.cropScale.value.set(aspect > screenAspect ? screenAspect / aspect : 1, aspect < screenAspect ? aspect / screenAspect : 1);
          } else {
            screen.scale.set(aspect < screenAspect ? aspect / screenAspect : 1, aspect > screenAspect ? screenAspect / aspect : 1, 1);
            screenMaterial.uniforms.cropScale.value.set(1, 1);
          }
          map.colorSpace = THREE.SRGBColorSpace;
          screenMaterial.uniforms.mediaMap.value = map;
          screenMaterial.uniforms.videoMedia.value = !!map.isVideoTexture;
          if (bootedId !== mediaId) {
            bootedId = mediaId;
            playSound('boot');
            motion.add(() => {
              const reveal = screenMaterial.uniforms.reveal, width = screenMaterial.uniforms.beamWidth;
              gsap.killTweensOf([reveal, width]);
              if (reduced) { reveal.value = 1; width.value = 1; booting = false; sync(); return; }
              booting = true; sync(); reveal.value = .003; width.value = .01;
              gsap.timeline({ onComplete: () => { booting = false; sync(); } })
                .to(width, { value: 1, duration: .24, ease: 'power2.out' })
                .to(reveal, { value: .008, duration: .12 })
                .to(reveal, { value: 1, duration: .8, ease: 'power3.inOut' });
            });
          }
          renderer.render(scene, camera);
        }
        function load(next) {
          const id = ++mediaId;
          gsap.killTweensOf([screenMaterial.uniforms.reveal, screenMaterial.uniforms.beamWidth]);
          screenMaterial.uniforms.reveal.value = 0; screenMaterial.uniforms.beamWidth.value = 0;
          insertedDisk.visible = !!next; booting = !!next;
          if (video) { video.pause(); video.removeAttribute('src'); video.load(); video.remove(); video = null; }
          if (!next) { screen.visible = false; sync(); return; }
          const palette = { Film: '#5b8176', Photography: '#c19a5b', Motion: '#b77760', Branding: '#719397', 'Graphic design': '#8a8099', Digital: '#84936c', Web: '#73849b' };
          diskMaterial.color.set(palette[next.name] || '#5b8176');
          const label = labelCanvas.getContext('2d'); label.fillStyle = '#f4efdf'; label.fillRect(0, 0, 512, 200);
          label.fillStyle = '#29362c'; label.font = 'bold 42px sans-serif'; label.fillText(next.name.toUpperCase(), 24, 88); label.font = '22px monospace'; label.fillText('AASHISH MAHATO / CREATIVE DISK', 24, 146); labelMap.needsUpdate = true;
          motion.add(() => {
            gsap.killTweensOf([insertedDisk.position, insertedDisk.rotation, tv.scale]);
            if (!reduced) {
              gsap.fromTo(insertedDisk.position, { z: 1.05 }, { z: .85, duration: .18, ease: 'power2.out' });
              gsap.fromTo(insertedDisk.rotation, { x: -.08 }, { x: 0, duration: .2, ease: 'power2.out' });
            }
          });
          if (video) { video.pause(); video.removeAttribute('src'); video.load(); video.remove(); video = null; }
          texture?.dispose(); texture = null; screenMaterial.uniforms.mediaMap.value = null;
          loader.load(next.image, map => {
            if (cancelled || id !== mediaId || texture?.isVideoTexture) { map.dispose(); return; }
            texture?.dispose(); texture = map; fitTexture(map, map.image.width, map.image.height);
          });
          if (next.video) {
            const element = document.createElement('video');
            video = element; element.src = next.video; element.loop = true; element.muted = settingsRef.current.muted;
            element.playsInline = true; element.preload = 'metadata'; element.hidden = true; element.setAttribute('aria-hidden', 'true'); host.appendChild(element);
            element.addEventListener('loadeddata', () => {
              if (cancelled || id !== mediaId) return;
              texture?.dispose(); texture = new THREE.VideoTexture(element);
              fitTexture(texture, element.videoWidth, element.videoHeight); sync();
            }, { once: true });
          }
          sync();
        }
        const resize = new ResizeObserver(() => {
          const w = host.clientWidth, h = host.clientHeight;
          renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.render(scene, camera);
        }); resize.observe(host);
        const observer = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting; cancelAnimationFrame(raf);
          sync(); if (visible) raf = requestAnimationFrame(frame);
        }, { rootMargin: '80px' }); observer.observe(host);
        const down = e => { if (e.pointerType === 'touch') return; drag = { x: e.clientX, y: e.clientY, rx: targetX, ry: targetY }; renderer.domElement.setPointerCapture(e.pointerId); };
        const move = e => { if (!drag) return; targetY = THREE.MathUtils.clamp(drag.ry + (e.clientX - drag.x) * .005, -.65, .65); targetX = THREE.MathUtils.clamp(drag.rx + (e.clientY - drag.y) * .003, -.18, .18); };
        const up = () => { drag = null; };
        renderer.domElement.addEventListener('pointerdown', down); renderer.domElement.addEventListener('pointermove', move);
        renderer.domElement.addEventListener('pointerup', up); renderer.domElement.addEventListener('pointercancel', up);
        engineRef.current = { load, sync, reset: () => { targetX = 0; targetY = -.12; } };
        load(currentRef.current); setReady(true);
        dispose = () => {
          motion.revert(); labelMap.dispose(); observer.disconnect(); resize.disconnect(); cancelAnimationFrame(raf); ++mediaId;
          if (video) { video.pause(); video.removeAttribute('src'); video.load(); video.remove(); }
          texture?.dispose(); scene.traverse(object => { object.geometry?.dispose(); if (object.material) object.material.dispose(); });
          renderer.dispose(); renderer.domElement.remove(); engineRef.current = null;
        };
      } catch (error) { if (!cancelled) { console.warn('Creative TV could not start; showing project preview.', error); setReady(false); } }
    }
    start();
    return () => { cancelled = true; dispose(); };
  }, []);
  useEffect(() => { engineRef.current?.load(item); }, [item]);
  useEffect(() => { settingsRef.current = { power, playing, muted }; engineRef.current?.sync(); }, [power, playing, muted]);

  return <div className="creative-tv">
    <div className="creative-tv-status"><span><i className={power && item ? 'is-on' : ''} /> AM / CREATIVE CHANNEL</span><span>{item ? `CH ${String(channel + 1).padStart(2, '0')} / ${String(count).padStart(2, '0')}` : 'NO DISK'}</span></div>
    <div className="creative-tv-stage" ref={hostRef}>
      {!ready && <div className="creative-tv-fallback">{item && <img src={item.image} alt={item.caption} loading="lazy" />}</div>}
      <div className="creative-tv-drive" aria-hidden="true"><span /><small>DISK DRIVE</small></div>
    </div>
    <div className="creative-tv-remote" role="group" aria-label="TV remote control">
      <button type="button" disabled={!item} onClick={() => { playSound(power ? 'click' : 'boot'); setPower(value => !value); }} aria-label={power ? 'Turn TV off' : 'Turn TV on'} aria-pressed={power}><Power size={17} /></button>
      <button type="button" disabled={!item} onClick={() => { playSound('click'); onChannel((channel + count - 1) % count); }} aria-label="Previous creative channel"><ChevronLeft size={20} /></button>
      <span aria-live="polite">{!item ? 'INSERT A DISK' : power ? item.name : 'STANDBY'}</span>
      <button type="button" disabled={!item} onClick={() => { playSound('click'); onChannel((channel + 1) % count); }} aria-label="Next creative channel"><ChevronRight size={20} /></button>
      {item?.video && <><button type="button" onClick={() => setPlaying(value => !value)} aria-label={playing ? 'Pause TV video' : 'Play TV video'}>{playing ? <Pause size={17} /> : <Play size={17} />}</button><button type="button" onClick={() => setMuted(value => !value)} aria-label={muted ? 'Unmute TV video' : 'Mute TV video'}>{muted ? <VolumeX size={17} /> : <Volume2 size={17} />}</button></>}
      <button type="button" onClick={() => engineRef.current?.reset()} aria-label="Reset TV angle"><RotateCcw size={16} /></button>
      <button type="button" onClick={toggleSounds} aria-label={soundOn ? 'Mute interaction sounds' : 'Enable interaction sounds'} aria-pressed={soundOn}>{soundOn ? 'SFX ON' : 'SFX OFF'}</button>
    </div>
    <p className="creative-tv-hint">Choose a disk to change the channel. Drag the TV to look around.</p>
  </div>;
}

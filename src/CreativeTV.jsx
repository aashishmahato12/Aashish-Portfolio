import { isWebKit } from './browser-performance.js';
import gsap from 'gsap';
import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, Power, Triangle, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import ExpandedTVMedia from './ExpandedTVMedia.jsx';
import './creative-tv.css';
import { playSound, soundsEnabled, subscribeSounds, toggleSounds } from './creative-sfx';

export default function CreativeTV({ item, channel, count, onChannel, onVideoEnd, onEject }) {
  const soundOn = useSyncExternalStore(subscribeSounds, soundsEnabled, () => true);
  const hostRef = useRef(null);
  const remoteRef = useRef(null);
  const engineRef = useRef(null);
  const currentRef = useRef(item);
  const videoEndRef = useRef(onVideoEnd);
  videoEndRef.current = onVideoEnd;
  const settingsRef = useRef({ power: true, playing: !matchMedia('(prefers-reduced-motion: reduce)').matches, muted: true });
  const [power, setPower] = useState(true);
  const [playing, setPlaying] = useState(settingsRef.current.playing);
  const [muted, setMuted] = useState(true);
  const [ready, setReady] = useState(false);
  const [slide, setSlide] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const expandedTime = useRef(0);
  const expandedOrigin = useRef(null);
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
        renderer.setPixelRatio(Math.min(devicePixelRatio, isWebKit ? 1 : 1.5));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFShadowMap;
        renderer.domElement.setAttribute('aria-hidden', 'true');
        host.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(35, 1, .1, 50);
        camera.position.set(0, .75, 7.8); camera.lookAt(0, -.3, 0);
        scene.add(new THREE.HemisphereLight(0xffffff, 0x777777, 2.6));
        const light = new THREE.DirectionalLight(0xffffff, 3.2);
        light.position.set(-3, 6, 5); light.castShadow = true;
        light.shadow.mapSize.set(isWebKit ? 512 : 1024, isWebKit ? 512 : 1024); light.shadow.camera.left = -5; light.shadow.camera.right = 5;
        light.shadow.camera.top = 5; light.shadow.camera.bottom = -5; light.shadow.normalBias = .025;
        scene.add(light);
        const rim = new THREE.DirectionalLight(0xffffff, 1.4); rim.position.set(4, 2, -2); scene.add(rim);
        const tv = new THREE.Group(); tv.rotation.y = -.12; scene.add(tv);
        const motion = gsap.context(() => {});
        const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
        const cream = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: .52 });
        const dark = new THREE.MeshStandardMaterial({ color: 0x292929, roughness: .48 });
        const copper = new THREE.MeshStandardMaterial({ color: 0xe34530, roughness: .45, metalness: .3 });
        function box(w, h, d, radius, material, x, y, z) {
          const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, radius), material);
          mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; tv.add(mesh); return mesh;
        }
        box(4.2, 3.1, 1.25, .16, cream, 0, 0, 0);
        box(3.42, 2.49, .14, .14, dark, -.25, .12, .65);
        box(3.17, 2.25, .08, .11, new THREE.MeshStandardMaterial({ color: 0x111111, roughness: .22 }), -.25, .12, .75);
        const screenMaterial = new THREE.ShaderMaterial({
          uniforms: { mediaMap: { value: null }, videoMedia: { value: false }, nextMap: { value: null }, slideProgress: { value: 0 }, sliding: { value: false }, containScale: { value: new THREE.Vector2(1, 1) }, nextContain: { value: new THREE.Vector2(1, 1) }, reveal: { value: 0 }, beamWidth: { value: 0 }, cropScale: { value: new THREE.Vector2(1, 1) } },
          vertexShader: 'varying vec2 mediaUv; void main(){ mediaUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
          fragmentShader: `uniform sampler2D mediaMap; uniform bool videoMedia; uniform sampler2D nextMap; uniform float slideProgress; uniform bool sliding; uniform vec2 containScale; uniform vec2 nextContain; uniform float reveal; uniform float beamWidth; uniform vec2 cropScale; varying vec2 mediaUv;
            vec4 stillPicture(sampler2D map, vec2 uv, vec2 size){
              vec2 fitted=(uv-.5)*size+.5;
              return texture2D(map,fitted);
            }
            void main(){
              float dy=abs(mediaUv.y-.5); float dx=abs(mediaUv.x-.5);
              if(dy>max(.0015,reveal*.5)||dx>beamWidth*.5) discard;
              vec4 picture;
              if(videoMedia) picture=texture2D(mediaMap,(mediaUv-.5)*cropScale+.5);
              else {
                vec2 uv=mediaUv+vec2(sliding?slideProgress:0.0,0.0);
                picture=uv.x<=1.0 ? stillPicture(mediaMap,uv,containScale) : stillPicture(nextMap,uv-vec2(1.0,0.0),nextContain);
              }
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
        const idleCanvas = document.createElement('canvas'); idleCanvas.width = 768; idleCanvas.height = 530;
        const idleContext = idleCanvas.getContext('2d');
        const noiseCanvas = document.createElement('canvas'); noiseCanvas.width = 128; noiseCanvas.height = 88;
        const noiseContext = noiseCanvas.getContext('2d');
        const idleMap = new THREE.CanvasTexture(idleCanvas); idleMap.colorSpace = THREE.SRGBColorSpace;
        const idleScreen = new THREE.Mesh(new THREE.PlaneGeometry(3, 2.07), new THREE.MeshBasicMaterial({ map: idleMap, toneMapped: false }));
        idleScreen.position.copy(screen.position); tv.add(idleScreen);
        let lastIdle = -Infinity;
        function drawIdle(time = 0) {
          if (time - lastIdle < 120 && !reduced) return;
          lastIdle = time;
          const ctx = idleContext;
          ctx.fillStyle = '#111111'; ctx.fillRect(0, 0, 768, 530);
          const noise = noiseContext.createImageData(128, 88);
          for (let i = 0; i < noise.data.length; i += 4) {
            const value = Math.random() * 90;
            noise.data[i] = value * .65; noise.data[i + 1] = value; noise.data[i + 2] = value * .8; noise.data[i + 3] = 255;
          }
          noiseContext.putImageData(noise, 0, 0); ctx.globalAlpha = .19;
          ctx.drawImage(noiseCanvas, 0, 0, 768, 530); ctx.globalAlpha = 1;
          ctx.textAlign = 'center'; ctx.fillStyle = '#aaaaaa'; ctx.font = '18px monospace';
          ctx.fillText('A / M  ·  PORTFOLIO', 384, 78);
          ctx.strokeStyle = '#e34530'; ctx.lineWidth = 3; ctx.shadowColor = '#e34530'; ctx.shadowBlur = 12;
          ctx.strokeRect(350, 135, 68, 64); ctx.strokeRect(367, 135, 32, 22); ctx.strokeRect(362, 172, 44, 27);
          ctx.fillStyle = '#ffffff'; ctx.font = 'bold 35px monospace';
          ctx.fillText('SELECT A FLOPPY DISK', 384, 266);
          ctx.shadowBlur = 0; ctx.fillStyle = '#aaaaaa'; ctx.font = '20px monospace';
          ctx.fillText('Open the box. Pick a discipline.', 384, 309);
          ctx.font = '17px monospace'; ctx.fillText('READY FOR YOUR NEXT IDEA', 384, 405);
          if (reduced || Math.floor(time / 650) % 2 === 0) ctx.fillRect(529, 394, 10, 15);
          ctx.fillStyle = '#00000028'; for (let y = 0; y < 530; y += 4) ctx.fillRect(0, y, 768, 1);
          idleMap.needsUpdate = true;
        }
        drawIdle();
        for (const y of [.75, .12]) {
          const knob = new THREE.Mesh(new THREE.CylinderGeometry(.18, .18, .16, 32), dark);
          knob.rotation.x = Math.PI / 2; knob.position.set(1.68, y, .7); tv.add(knob);
          box(.035, .19, .035, .009, copper, 1.68, y, .8);
        }
        for (let i = 0; i < 7; i++) box(.35, .018, .025, .007, dark, 1.68, -.48 - i * .08, .65);
        box(1.1, .09, .055, .02, copper, -.97, -1.3, .66);
        box(1.42, .14, .05, .015, dark, .66, -1.3, .67);
        const diskMaterial = new THREE.MeshStandardMaterial({ color: 0xe34530, roughness: .55 });
        const insertedDisk = new THREE.Group(); insertedDisk.position.set(.66, -1.3, .85); tv.add(insertedDisk);
        const diskBody = new THREE.Mesh(new RoundedBoxGeometry(1.24, .075, .9, 2, .025), diskMaterial); insertedDisk.add(diskBody);
        const labelCanvas = document.createElement('canvas'); labelCanvas.width = 512; labelCanvas.height = 200;
        const labelMap = new THREE.CanvasTexture(labelCanvas); labelMap.colorSpace = THREE.SRGBColorSpace;
        const labelMaterial = new THREE.MeshBasicMaterial({ map: labelMap });
        const diskLabel = new THREE.Mesh(new THREE.PlaneGeometry(.98, .38), labelMaterial);
        diskLabel.rotation.x = -Math.PI / 2; diskLabel.position.set(0, .041, .13); insertedDisk.add(diskLabel);
        const ledMaterial = new THREE.MeshBasicMaterial({ color: 0xe34530 });
        const led = new THREE.Mesh(new THREE.SphereGeometry(.045, 12, 12), ledMaterial);
        led.position.set(1.68, -1.24, .67); tv.add(led);
        // Physical controls are part of the TV's base; HTML hit areas follow their 3D positions.
        box(3.9, .46, 1.0, .08, cream, 0, -1.8, .08);
        box(3.78, .37, .09, .045, dark, 0, -1.8, .61);
        const controls = ['power', 'previous', 'next', 'play', 'audio', 'eject', 'sound', 'expand'].map((key, index) => {
          const cap = box(.39, .28, .10, .035, dark.clone(), -1.645 + index * .47, -1.8, .70);
          const canvas = document.createElement('canvas'); canvas.width = canvas.height = 128;
          const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace;
          const icon = new THREE.Mesh(new THREE.PlaneGeometry(.30, .22), new THREE.MeshBasicMaterial({ map, transparent: true }));
          icon.position.set(cap.position.x, cap.position.y, .756); tv.add(icon);
          return { key, cap, canvas, map, icon, text: null };
        });
        function syncControls() {
          const state = settingsRef.current;
          const symbols = { power: '⏻', previous: '‹', next: '›', play: state.playing ? 'Ⅱ' : '▶', audio: state.muted ? '♪×' : '♪', eject: '⏏', sound: soundsEnabled() ? 'SFX' : 'OFF', expand: '⤢' };
          controls.forEach(control => {
            const disabled = !currentRef.current && control.key !== 'sound' || control.key === 'audio' && !currentRef.current?.video;
            const text = symbols[control.key] + disabled;
            if (text !== control.text) {
              control.text = text;
              const ctx = control.canvas.getContext('2d'); ctx.clearRect(0, 0, 128, 128);
              ctx.fillStyle = disabled ? '#777777' : control.key === 'power' ? '#e34530' : '#ffffff';
              ctx.font = `bold ${control.key === 'sound' ? 38 : 76}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(symbols[control.key], 64, 67); control.map.needsUpdate = true;
            }
          });
        }
        const controlButtons = new Map(controls.map(({ key }) => [key, remoteRef.current?.querySelector(`[data-control="${key}"]`)]));
        function positionControls() {
          tv.updateMatrixWorld(true);
          const hostWidth = host.clientWidth, hostHeight = host.clientHeight;
          controls.forEach(({ key, cap }) => {
            const button = controlButtons.get(key);
            if (!button) return;
            const points = [[-.22,-.17],[.22,.17]].map(([x,y]) => new THREE.Vector3(x,y,.07).applyMatrix4(cap.matrixWorld).project(camera));
            const left = (points[0].x + 1) * hostWidth / 2, top = (1 - points[1].y) * hostHeight / 2;
            Object.assign(button.style, { left: `${left}px`, top: `${top}px`, width: `${(points[1].x-points[0].x)*hostWidth/2}px`, height: `${(points[1].y-points[0].y)*hostHeight/2}px` });
          });
        }
        const controlCleanup = [];
        controls.forEach(({ key, cap }) => {
          const button = remoteRef.current?.querySelector(`[data-control="${key}"]`);
          if (!button) return;
          const press = () => { playSound('click'); motion.add(() => gsap.to(cap.position, { z: .665, duration: .08, yoyo: true, repeat: 1 })); };
          const hover = () => { playSound('hover'); cap.material.color.set(0x444444); renderer.render(scene, camera); };
          const leave = () => { cap.material.color.set(0x292929); renderer.render(scene, camera); };
          button.addEventListener('click', press); button.addEventListener('pointerenter', hover); button.addEventListener('pointerleave', leave);
          button.addEventListener('focus', hover); button.addEventListener('blur', leave);
          controlCleanup.push(() => { button.removeEventListener('click', press); button.removeEventListener('pointerenter', hover); button.removeEventListener('pointerleave', leave); button.removeEventListener('focus', hover); button.removeEventListener('blur', leave); });
        });
        for (const x of [-1.4, 1.4]) box(.24, .2, .55, .05, dark, x, -1.68, .02);
        const ground = new THREE.Mesh(new THREE.PlaneGeometry(18, 18), new THREE.ShadowMaterial({ opacity: .18 }));
        ground.rotation.x = -Math.PI / 2; ground.position.y = -2.13; ground.receiveShadow = true; scene.add(ground);
        const loader = new THREE.TextureLoader();
        let texture = null, video = null, mediaId = 0, visible = false, raf = 0, last = 0;
        let carouselMaps = [], carouselTween = null;
        let targetX = 0, targetY = -.12, drag = null, booting = false, bootedId = -1;
        function frame(time) {
          if (!visible || cancelled) return;
          raf = requestAnimationFrame(frame);
          if (time - last < 32) return;
          last = time;
          const rotating = Math.abs(targetX - tv.rotation.x) + Math.abs(targetY - tv.rotation.y) > .0001;
          const buttonsMoving = controls.some(({ cap }) => gsap.isTweening(cap.position));
          const idleUpdating = idleScreen.visible && !reduced && time - lastIdle >= 120;
          const mediaPlaying = !settingsRef.current.expanded && ((video && !video.paused) || (carouselTween && !carouselTween.paused()));
          if (!rotating && !buttonsMoving && !idleUpdating && !mediaPlaying && !booting) return;
          if (rotating) {
            tv.rotation.x += (targetX - tv.rotation.x) * .12;
            tv.rotation.y += (targetY - tv.rotation.y) * .12;
          }
          if (idleUpdating) drawIdle(time);
          if (rotating || buttonsMoving) positionControls();
          renderer.render(scene, camera);
        }
        function sync() {
          const state = settingsRef.current;
          syncControls(); positionControls();
          screen.visible = state.power && !!currentRef.current;
          idleScreen.visible = state.power && !currentRef.current;
          ledMaterial.color.set(state.power && currentRef.current ? 0xe34530 : 0x555555);
          if (video) {
            video.muted = state.muted;
            if (visible && !document.hidden && state.power && state.playing && !state.expanded && !booting) video.play().catch(() => {});
            else video.pause();
          }
          if (carouselTween) carouselTween.paused(!visible || document.hidden || !state.power || !state.playing || state.expanded || booting);
          renderer.render(scene, camera);
        }
        // Fill the CRT with every medium, cropping excess at the edges.
        function fitTexture(map, width, height) {
          const aspect = width / height, screenAspect = 3 / 2.07;
          map.wrapS = map.wrapT = THREE.ClampToEdgeWrapping;
          if (currentRef.current?.video) {
            screen.scale.set(1, 1, 1);
            screenMaterial.uniforms.cropScale.value.set(aspect > screenAspect ? screenAspect / aspect : 1, aspect < screenAspect ? aspect / screenAspect : 1);
          } else {
            screen.scale.set(1, 1, 1);
            screenMaterial.uniforms.containScale.value.set(Math.min(1, screenAspect / aspect), Math.min(1, aspect / screenAspect));
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
          carouselTween?.kill(); carouselTween = null;
          carouselMaps.forEach(map => map.dispose()); carouselMaps = [];
          screenMaterial.uniforms.sliding.value = false;
          screenMaterial.uniforms.slideProgress.value = 0;
          gsap.killTweensOf([screenMaterial.uniforms.reveal, screenMaterial.uniforms.beamWidth]);
          screenMaterial.uniforms.reveal.value = 0; screenMaterial.uniforms.beamWidth.value = 0;
          insertedDisk.visible = !!next; booting = !!next;
          if (video) { video.pause(); video.removeAttribute('src'); video.load(); video.remove(); video = null; }
          if (!next) { screen.visible = false; sync(); return; }
          const palette = { Film: '#e34530', Photography: '#292929', Motion: '#c63826', Branding: '#444444', 'Graphic design': '#a92c1d', Digital: '#666666', Web: '#111111' };
          diskMaterial.color.set(palette[next.name] || '#e34530');
          const label = labelCanvas.getContext('2d'); label.fillStyle = '#ffffff'; label.fillRect(0, 0, 512, 200);
          label.fillStyle = '#111111'; label.font = 'bold 42px sans-serif'; label.fillText(next.name.toUpperCase(), 24, 88); label.font = '22px monospace'; label.fillText('AASHISH MAHATO / PROJECT DISK', 24, 146); labelMap.needsUpdate = true;
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
            if (cancelled || id !== mediaId || texture?.isVideoTexture || carouselMaps.length) { map.dispose(); return; }
            texture?.dispose(); texture = map; fitTexture(map, map.image.width, map.image.height);
          });
          if (next.slides?.length > 1) {
            Promise.all(next.slides.map(slide => loader.loadAsync(slide.src))).then(maps => {
              if (cancelled || id !== mediaId) { maps.forEach(map => map.dispose()); return; }
              texture?.dispose(); carouselMaps = maps;
              maps.forEach(map => { map.colorSpace = THREE.SRGBColorSpace; });
              let index = 0;
              function advance() {
                if (cancelled || id !== mediaId) return;
                texture = maps[index]; fitTexture(texture, texture.image.width, texture.image.height);
                const upcoming = maps[(index + 1) % maps.length];
                const aspect = upcoming.image.width / upcoming.image.height, screenAspect = 3 / 2.07;
                screenMaterial.uniforms.nextMap.value = upcoming;
                screenMaterial.uniforms.nextContain.value.set(Math.min(1, screenAspect / aspect), Math.min(1, aspect / screenAspect));
                screenMaterial.uniforms.sliding.value = !reduced;
                screenMaterial.uniforms.slideProgress.value = 0;
                setSlide(index);
                motion.add(() => {
                  carouselTween = gsap.to(screenMaterial.uniforms.slideProgress, { value: 1, duration: 4.5, ease: 'none', onComplete: () => { index = (index + 1) % maps.length; advance(); } });
                });
                sync();
              }
              advance();
            }).catch(() => {});
          }
          if (next.video) {
            const element = document.createElement('video');
            video = element; element.defaultMuted = true; element.muted = settingsRef.current.muted; element.crossOrigin = 'anonymous'; element.src = next.video; element.loop = !next.rotateFilms;
            element.addEventListener('ended', () => { if (!cancelled && id === mediaId) videoEndRef.current?.(); }); element.muted = settingsRef.current.muted;
            element.playsInline = true; element.preload = 'auto'; element.hidden = true; element.setAttribute('aria-hidden', 'true'); host.appendChild(element);
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
          renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); positionControls(); renderer.render(scene, camera);
        }); resize.observe(host);
        let inView = false;
        const updateVisibility = () => {
          visible = inView && !document.hidden;
          cancelAnimationFrame(raf);
          sync(); if (visible) raf = requestAnimationFrame(frame);
        };
        const observer = new IntersectionObserver(([entry]) => {
          inView = entry.isIntersecting; updateVisibility();
        }, { rootMargin: '80px' }); observer.observe(host);
        document.addEventListener('visibilitychange', updateVisibility);
        const down = e => { if (e.pointerType === 'touch') return; drag = { x: e.clientX, y: e.clientY, rx: targetX, ry: targetY }; renderer.domElement.setPointerCapture(e.pointerId); };
        const move = e => { if (!drag) return; targetY = THREE.MathUtils.clamp(drag.ry + (e.clientX - drag.x) * .005, -.65, .65); targetX = THREE.MathUtils.clamp(drag.rx + (e.clientY - drag.y) * .003, -.18, .18); };
        const up = () => { drag = null; };
        renderer.domElement.addEventListener('pointerdown', down); renderer.domElement.addEventListener('pointermove', move);
        renderer.domElement.addEventListener('pointerup', up); renderer.domElement.addEventListener('pointercancel', up);
        function screenRect() {
          tv.updateMatrixWorld(true);
          const bounds = host.getBoundingClientRect();
          const corners = [[-1.5, -1.035], [1.5, -1.035], [-1.5, 1.035], [1.5, 1.035]].map(([x, y]) => {
            const point = new THREE.Vector3(x, y, 0).applyMatrix4(screen.matrixWorld).project(camera);
            return { x: bounds.left + (point.x + 1) * bounds.width / 2, y: bounds.top + (1 - point.y) * bounds.height / 2 };
          });
          const left = Math.min(...corners.map(point => point.x)), top = Math.min(...corners.map(point => point.y));
          return { left, top, width: Math.max(...corners.map(point => point.x)) - left, height: Math.max(...corners.map(point => point.y)) - top };
        }
        engineRef.current = { load, sync, screenRect, time: () => video?.currentTime || 0, seek: time => { if (video && Number.isFinite(time)) video.currentTime = time; }, driveRect: () => {
          tv.updateMatrixWorld(true);
          const bounds = host.getBoundingClientRect();
          const point = new THREE.Vector3(0, .04, .13).applyMatrix4(insertedDisk.matrixWorld).project(camera);
          return { left: bounds.left + (point.x + 1) * bounds.width / 2, top: bounds.top + (1 - point.y) * bounds.height / 2 };
        } };
        load(currentRef.current); setReady(true);
        dispose = () => {
          controlCleanup.forEach(cleanup => cleanup()); carouselTween?.kill(); carouselMaps.forEach(map => map.dispose()); motion.revert(); controls.forEach(control => control.map.dispose()); labelMap.dispose(); document.removeEventListener('visibilitychange', updateVisibility); observer.disconnect(); resize.disconnect(); cancelAnimationFrame(raf); ++mediaId;
          if (video) { video.pause(); video.removeAttribute('src'); video.load(); video.remove(); }
          texture?.dispose(); scene.traverse(object => { object.geometry?.dispose(); if (object.material) object.material.dispose(); });
          idleMap.dispose(); renderer.dispose(); renderer.domElement.remove(); engineRef.current = null;
        };
      } catch (error) { if (!cancelled) { console.warn('Creative TV could not start; showing project preview.', error); setReady(false); } }
    }
    start();
    return () => { cancelled = true; dispose(); };
  }, []);
  useEffect(() => { setSlide(0); engineRef.current?.load(item); }, [item]);
  useEffect(() => { settingsRef.current = { power, playing, muted, expanded }; engineRef.current?.sync(); }, [power, playing, muted, expanded, soundOn]);


  return <div className={`creative-tv${ready ? ' has-3d-controls' : ''}`}>
    <div className="creative-tv-status"><span><i className={power && item ? 'is-on' : ''} /> AM / PROJECT PREVIEW</span><span>{item ? `CH ${String(channel + 1).padStart(2, '0')} / ${String(count).padStart(2, '0')}` : 'NO DISK'}</span></div>
    <div className="creative-tv-stage" ref={hostRef}>
      {!ready && <div className="creative-tv-fallback">{item && <img src={item.image} alt={item.caption} loading="lazy" />}</div>}
      <div className="creative-tv-drive" aria-hidden="true"><span /><small>DISK DRIVE</small></div>
    <div className="creative-tv-remote" ref={remoteRef} role="group" aria-label="TV controls">
      <button data-control="power" type="button" disabled={!item} onClick={() => { playSound(power ? 'click' : 'boot'); setPower(value => !value); }} aria-label={power ? 'Turn TV off' : 'Turn TV on'} aria-pressed={power}><Power size={17} /></button>
      <button data-control="previous" type="button" disabled={!item} onClick={() => { playSound('click'); onChannel((channel + count - 1) % count); }} aria-label="Previous creative channel"><ChevronLeft size={20} /></button>
      <button data-control="next" type="button" disabled={!item} onClick={() => { playSound('click'); onChannel((channel + 1) % count); }} aria-label="Next creative channel"><ChevronRight size={20} /></button>
      <button data-control="play" type="button" disabled={!item} onClick={() => setPlaying(value => !value)} aria-label={playing ? (item?.video ? 'Pause TV video' : 'Pause slideshow') : (item?.video ? 'Play TV video' : 'Play slideshow')}>{playing ? <Pause size={17} /> : <Play size={17} />}</button>
      <button data-control="audio" type="button" disabled={!item?.video} onClick={() => setMuted(value => !value)} aria-label={muted ? 'Unmute TV video' : 'Mute TV video'}>{muted ? <VolumeX size={17} /> : <Volume2 size={17} />}</button>
      <button data-control="eject" type="button" disabled={!item} onClick={() => onEject(engineRef.current?.driveRect())} aria-label="Eject floppy disk"><Triangle size={16} /></button>
      <button data-control="sound" type="button" onClick={toggleSounds} aria-label={soundOn ? 'Mute interaction sounds' : 'Enable interaction sounds'} aria-pressed={soundOn}>{soundOn ? 'SFX ON' : 'SFX OFF'}</button>
      <button data-control="expand" type="button" disabled={!item} aria-label="Expand preview" onClick={() => { expandedTime.current = engineRef.current?.time() || 0; expandedOrigin.current = engineRef.current?.screenRect() || hostRef.current.getBoundingClientRect(); playSound('click'); setExpanded(true); }}><Maximize2 size={16} /></button>
    </div>
    </div>
    {item && <div className="creative-tv-preview-tools"><span>{item.slides?.length ? `${slide + 1} / ${item.slides.length} · SLIDESHOW` : 'FILM PREVIEW'} · {item.name}</span></div>}
    <p className="creative-tv-hint">Choose a disk to change the channel. Drag the TV to look around.</p>
    {expanded && item && <ExpandedTVMedia item={item} slide={slide} origin={expandedOrigin.current} startTime={expandedTime.current} onVideoEnd={onVideoEnd} muted={muted} playing={playing} onClose={time => { engineRef.current?.seek(time); setExpanded(false); }} />}
  </div>;
}

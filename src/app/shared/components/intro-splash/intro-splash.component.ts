import {
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  HostListener,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';

@Component({
  selector: 'app-intro-splash',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="intro-container" [class.fade-out]="isFadingOut">
      <!-- 3D WebGL Canvas Viewport -->
      <canvas #webglCanvas class="webgl-canvas"></canvas>

      <!-- Glassmorphic Vignette & Cinematic Overlays -->
      <div class="cinematic-overlay">
        <!-- Top Status Bar -->
        <header class="intro-header">
          <div class="brand-pill">
            <span class="pulse-dot"></span>
            <span class="brand-name">EVENTRO <em>LUXURY</em></span>
            <span class="divider">|</span>
            <span class="system-status">SPATIAL SYSTEM 3.0</span>
          </div>

          <div class="countdown-clock">
            <div class="clock-display">
              <span class="time-num">{{ secondsRemaining }}</span>
              <span class="time-unit">SEC</span>
            </div>
            <button class="skip-btn" (click)="finishIntro()" title="Skip into application">
              <span>Enter Platform</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </header>

        <!-- Center Editorial Text (Morphs across phases) -->
        <div class="center-content">
          <div class="category-badge">RESERVATION EXPERIENCE</div>
          <h1 class="hero-title">
            <span class="line-1">Your Stage.</span>
            <span class="line-2">Your Space.</span>
          </h1>
          <p class="hero-desc">{{ currentPhaseSubtitle }}</p>

          <div class="phase-capsule">
            <span class="phase-index">STEP 0{{ currentPhaseIndex }}</span>
            <span class="phase-divider">/</span>
            <span class="phase-title">{{ currentPhaseTitle }}</span>
          </div>
        </div>

        <!-- Bottom Progress & Metric Indicators -->
        <footer class="intro-footer">
          <div class="metrics-row">
            <div class="metric-item">
              <span class="m-label">CONCURRENCY HOLD</span>
              <span class="m-val">15:00 GUARANTEED</span>
            </div>
            <div class="metric-item">
              <span class="m-label">DOUBLE-BOOKINGS</span>
              <span class="m-val">0.00% ZERO RISK</span>
            </div>
            <div class="metric-item">
              <span class="m-label">SMART PARKING</span>
              <span class="m-val">SYNCHRONIZED</span>
            </div>
          </div>

          <!-- 10-Second Animated Progress Bar -->
          <div class="progress-track">
            <div class="progress-fill" [style.width.%]="progressPercent"></div>
          </div>

          <div class="progress-meta">
            <span class="status-feed">{{ liveTickerText }}</span>
            <span class="percent-label">{{ progressPercent | number:'1.0-0' }}%</span>
          </div>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: fixed;
      inset: 0;
      z-index: 999999;
      pointer-events: auto;
    }

    .intro-container {
      position: relative;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      background: radial-gradient(circle at center, #132219 0%, #0c140f 60%, #050806 100%);
      font-family: 'Outfit', 'Inter', system-ui, -apple-system, sans-serif;
      color: #F7F2E7;
      transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .intro-container.fade-out {
      opacity: 0;
      transform: scale(1.04);
      pointer-events: none;
    }

    .webgl-canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: block;
    }

    .cinematic-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 2.5rem 3.5rem;
      box-sizing: border-box;
      pointer-events: none;
      background: radial-gradient(circle at center, transparent 40%, rgba(5, 8, 6, 0.7) 100%);
    }

    /* Header */
    .intro-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      pointer-events: auto;
    }

    .brand-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.6rem 1.25rem;
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(230, 222, 200, 0.15);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #4ade80;
      box-shadow: 0 0 10px #4ade80;
      animation: pulseGlow 1.8s infinite alternate;
    }

    @keyframes pulseGlow {
      from { transform: scale(0.85); opacity: 0.6; box-shadow: 0 0 6px #4ade80; }
      to { transform: scale(1.2); opacity: 1; box-shadow: 0 0 14px #4ade80; }
    }

    .brand-name {
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.18em;
      color: #F7F2E7;
    }

    .brand-name em {
      font-style: normal;
      color: #B59A5B;
      font-weight: 400;
    }

    .divider {
      color: rgba(230, 222, 200, 0.3);
    }

    .system-status {
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      color: #B59A5B;
      font-family: monospace;
    }

    .countdown-clock {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .clock-display {
      display: flex;
      align-items: baseline;
      gap: 0.3rem;
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      background: rgba(181, 154, 91, 0.12);
      border: 1px solid rgba(181, 154, 91, 0.3);
    }

    .time-num {
      font-size: 1.2rem;
      font-weight: 800;
      color: #F7F2E7;
      font-family: monospace;
      min-width: 1.4rem;
      text-align: right;
    }

    .time-unit {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: #B59A5B;
    }

    .skip-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.65rem 1.4rem;
      background: #294936;
      color: #F7F2E7;
      border: 1px solid rgba(181, 154, 91, 0.4);
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      cursor: pointer;
      transition: all 0.25s ease;
      box-shadow: 0 4px 18px rgba(41, 73, 54, 0.4);
    }

    .skip-btn:hover {
      background: #1E3628;
      border-color: #B59A5B;
      transform: translateY(-2px);
      box-shadow: 0 6px 24px rgba(181, 154, 91, 0.3);
    }

    /* Center Editorial Hero */
    .center-content {
      align-self: center;
      text-align: center;
      max-width: 700px;
      pointer-events: none;
      animation: heroFloat 4s ease-in-out infinite alternate;
    }

    @keyframes heroFloat {
      from { transform: translateY(0px); }
      to { transform: translateY(-8px); }
    }

    .category-badge {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.28em;
      color: #B59A5B;
      text-transform: uppercase;
      margin-bottom: 0.75rem;
      border-bottom: 1px solid rgba(181, 154, 91, 0.4);
      padding-bottom: 0.25rem;
    }

    .hero-title {
      margin: 0 0 1rem 0;
      font-family: 'Playfair Display', Georgia, serif;
      font-weight: 700;
      font-size: 3.8rem;
      line-height: 1.08;
      letter-spacing: -0.02em;
      text-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
    }

    .hero-title .line-1 {
      display: block;
      color: #F7F2E7;
    }

    .hero-title .line-2 {
      display: block;
      color: #D4AF37;
      font-style: italic;
    }

    .hero-desc {
      font-size: 1.05rem;
      color: rgba(247, 242, 231, 0.8);
      line-height: 1.6;
      margin: 0 0 1.5rem 0;
      font-weight: 300;
      min-height: 2.2rem;
      transition: all 0.4s ease;
    }

    .phase-capsule {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 1.1rem;
      border-radius: 9999px;
      background: rgba(41, 73, 54, 0.35);
      border: 1px solid rgba(74, 222, 128, 0.3);
      font-size: 0.72rem;
      letter-spacing: 0.14em;
    }

    .phase-index {
      color: #4ade80;
      font-weight: 700;
      font-family: monospace;
    }

    .phase-divider {
      color: rgba(247, 242, 231, 0.3);
    }

    .phase-title {
      color: #F7F2E7;
      font-weight: 500;
      text-transform: uppercase;
    }

    /* Footer */
    .intro-footer {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .metrics-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      padding: 0 1rem;
    }

    .metric-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .m-label {
      font-size: 0.65rem;
      letter-spacing: 0.14em;
      color: #B59A5B;
      font-weight: 600;
    }

    .m-val {
      font-size: 0.85rem;
      font-weight: 600;
      color: #F7F2E7;
      font-family: monospace;
      letter-spacing: 0.05em;
    }

    .progress-track {
      width: 100%;
      height: 4px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 9999px;
      overflow: hidden;
      position: relative;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #294936 0%, #4ade80 50%, #D4AF37 100%);
      box-shadow: 0 0 12px rgba(212, 175, 55, 0.7);
      transition: width 0.05s linear;
    }

    .progress-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.7rem;
      letter-spacing: 0.12em;
    }

    .status-feed {
      color: rgba(247, 242, 231, 0.6);
      font-family: monospace;
      text-transform: uppercase;
    }

    .percent-label {
      color: #B59A5B;
      font-family: monospace;
      font-weight: 700;
    }

    @media (max-width: 768px) {
      .cinematic-overlay {
        padding: 1.5rem;
      }
      .hero-title {
        font-size: 2.5rem;
      }
      .metrics-row {
        grid-template-columns: 1fr;
        gap: 0.5rem;
      }
    }
  `]
})
export class IntroSplashComponent implements OnInit, OnDestroy {
  @ViewChild('webglCanvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  @Output() completed = new EventEmitter<void>();

  // 10-Second Timing Configuration
  readonly DURATION_MS = 10000;
  startTime: number = 0;
  progressPercent: number = 0;
  secondsRemaining: number = 10;
  isFadingOut: boolean = false;

  // Phase metadata
  currentPhaseIndex: number = 1;
  currentPhaseTitle: string = 'Initializing 3D Spatial Arena';
  currentPhaseSubtitle: string = 'Generating real-time venue seating architecture & acoustic boundaries...';
  liveTickerText: string = 'ESTABLISHING SECURE REAL-TIME PIPELINE';

  // Three.js instances
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private animFrameId: number | null = null;
  private timerIntervalId: any = null;

  // 3D Scene Components
  private arenaGroup = new THREE.Group();
  private parkingGroup = new THREE.Group();
  private ticketGroup = new THREE.Group();
  private particleSystem!: THREE.Points;
  private laserBeams: THREE.Line[] = [];

  // Mouse Parallax
  private mouseX = 0;
  private mouseY = 0;
  private targetMouseX = 0;
  private targetMouseY = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.startTime = performance.now();
    this.initThree();
    this.startAnimationLoop();
    this.startClock();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  @HostListener('window:resize')
  onResize(): void {
    if (!this.canvasRef || !this.camera || !this.renderer) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    this.targetMouseX = (event.clientX / window.innerWidth - 0.5) * 2;
    this.targetMouseY = (event.clientY / window.innerHeight - 0.5) * 2;
  }

  private initThree(): void {
    const canvas = this.canvasRef.nativeElement;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0a120c, 0.035);

    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    this.camera.position.set(0, 4, 12);
    this.camera.lookAt(0, 0.5, 0);

    // 2. High-Fidelity Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;

    // 3. Dynamic Lighting
    const ambientLight = new THREE.AmbientLight(0x162c1e, 1.8);
    this.scene.add(ambientLight);

    const goldKeyLight = new THREE.DirectionalLight(0xffd77a, 3.5);
    goldKeyLight.position.set(8, 12, 6);
    this.scene.add(goldKeyLight);

    const emeraldFillLight = new THREE.DirectionalLight(0x4ade80, 2.0);
    emeraldFillLight.position.set(-8, -4, -4);
    this.scene.add(emeraldFillLight);

    const centerPointLight = new THREE.PointLight(0xd4af37, 4.0, 18);
    centerPointLight.position.set(0, 1.5, 0);
    this.scene.add(centerPointLight);

    // 4. Build 3D Architectures
    this.buildArenaModel();
    this.buildParkingMatrix();
    this.buildHolographicPass();
    this.buildParticleNebula();
    this.buildLaserRays();

    this.scene.add(this.arenaGroup);
    this.scene.add(this.parkingGroup);
    this.scene.add(this.ticketGroup);
  }

  /**
   * 1. 3D Arena & Concentric Seating Bowl
   */
  private buildArenaModel(): void {
    // Stage circle
    const stageGeo = new THREE.CylinderGeometry(2.5, 2.6, 0.25, 48);
    const stageMat = new THREE.MeshStandardMaterial({
      color: 0x1f2722,
      metalness: 0.8,
      roughness: 0.3,
      emissive: 0x294936,
      emissiveIntensity: 0.2
    });
    const stage = new THREE.Mesh(stageGeo, stageMat);
    stage.position.y = -0.5;
    this.arenaGroup.add(stage);

    // Gold Outer Stage Rim
    const rimGeo = new THREE.TorusGeometry(2.55, 0.04, 16, 64);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.95,
      roughness: 0.15,
      emissive: 0xb59a5b,
      emissiveIntensity: 0.6
    });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = -0.38;
    this.arenaGroup.add(rim);

    // Concentric Seating Tier Rings (Instanced Seats)
    const seatGeo = new THREE.BoxGeometry(0.12, 0.08, 0.12);
    const seatMat = new THREE.MeshStandardMaterial({
      color: 0x294936,
      metalness: 0.4,
      roughness: 0.5,
      emissive: 0x4ade80,
      emissiveIntensity: 0.5
    });

    const tierCount = 4;
    for (let t = 0; t < tierCount; t++) {
      const radius = 3.4 + t * 0.9;
      const count = 28 + t * 10;
      const yOffset = -0.3 + t * 0.35;

      for (let i = 0; i < count; i++) {
        // Leave front open for stage viewing curve (240 deg arc)
        const angle = -Math.PI * 0.75 + (i / count) * (Math.PI * 1.5);
        const seat = new THREE.Mesh(seatGeo, seatMat.clone());
        seat.position.set(
          Math.cos(angle) * radius,
          yOffset,
          Math.sin(angle) * radius
        );
        seat.rotation.y = -angle - Math.PI / 2;
        this.arenaGroup.add(seat);
      }
    }
  }

  /**
   * 2. 3D Smart Parking Array with Holographic Bays
   */
  private buildParkingMatrix(): void {
    const bayMat = new THREE.LineBasicMaterial({
      color: 0x4ade80,
      transparent: true,
      opacity: 0.75
    });

    // Generate angled parking stalls
    const rows = 4;
    const cols = 6;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = 5.5 + c * 0.8;
        const z = -2.5 + r * 1.2;
        const y = -0.5;

        // Stall outline points
        const pts = [
          new THREE.Vector3(x, y, z),
          new THREE.Vector3(x + 0.5, y, z - 0.7),
          new THREE.Vector3(x + 0.5, y, z + 0.7),
          new THREE.Vector3(x, y, z)
        ];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
        const stall = new THREE.Line(lineGeo, bayMat);
        this.parkingGroup.add(stall);

        // Center slot glowing sensor node
        const nodeGeo = new THREE.SphereGeometry(0.04, 8, 8);
        const nodeMat = new THREE.MeshBasicMaterial({
          color: (r + c) % 3 === 0 ? 0xd4af37 : 0x4ade80
        });
        const node = new THREE.Mesh(nodeGeo, nodeMat);
        node.position.set(x + 0.25, y + 0.05, z);
        this.parkingGroup.add(node);
      }
    }

    // Roadway grid lines
    const gridHelper = new THREE.GridHelper(24, 32, 0x294936, 0x122419);
    gridHelper.position.y = -0.52;
    this.scene.add(gridHelper);
  }

  /**
   * 3. 3D Floating VIP Gold Ticket / Pass
   */
  private buildHolographicPass(): void {
    // Ticket Body
    const ticketGeo = new THREE.BoxGeometry(3.6, 2.1, 0.06);
    const ticketMat = new THREE.MeshStandardMaterial({
      color: 0x141f17,
      metalness: 0.9,
      roughness: 0.15,
      emissive: 0xd4af37,
      emissiveIntensity: 0.35
    });
    const ticketMesh = new THREE.Mesh(ticketGeo, ticketMat);
    this.ticketGroup.add(ticketMesh);

    // Gold Ingot Border
    const edgeGeo = new THREE.EdgesGeometry(ticketGeo);
    const edgeMat = new THREE.LineBasicMaterial({
      color: 0xffd77a,
      linewidth: 2
    });
    const edges = new THREE.LineSegments(edgeGeo, edgeMat);
    this.ticketGroup.add(edges);

    // Decorative Holographic Chip
    const chipGeo = new THREE.BoxGeometry(0.6, 0.45, 0.08);
    const chipMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.98,
      roughness: 0.1
    });
    const chip = new THREE.Mesh(chipGeo, chipMat);
    chip.position.set(-1.1, 0.4, 0.02);
    this.ticketGroup.add(chip);

    // Initial position of ticket (floats elevated)
    this.ticketGroup.position.set(0, 1.2, 0);
    this.ticketGroup.rotation.y = -0.2;
    this.ticketGroup.rotation.x = 0.1;
  }

  /**
   * 4. Floating Golden Cosmic Particle Field
   */
  private buildParticleNebula(): void {
    const count = 900;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const goldColor = new THREE.Color(0xd4af37);
    const emeraldColor = new THREE.Color(0x4ade80);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 30;
      positions[i3 + 1] = (Math.random() - 0.2) * 16;
      positions[i3 + 2] = (Math.random() - 0.5) * 30;

      const mixed = Math.random() > 0.4 ? goldColor : emeraldColor;
      colors[i3] = mixed.r;
      colors[i3 + 1] = mixed.g;
      colors[i3 + 2] = mixed.b;
    }

    const partGeo = new THREE.BufferGeometry();
    partGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    partGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const partMat = new THREE.PointsMaterial({
      size: 0.07,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    this.particleSystem = new THREE.Points(partGeo, partMat);
    this.scene.add(this.particleSystem);
  }

  /**
   * 5. Connecting Laser Beams (Seats <-> Parking)
   */
  private buildLaserRays(): void {
    const laserMat = new THREE.LineBasicMaterial({
      color: 0x4ade80,
      transparent: true,
      opacity: 0.5
    });

    for (let i = 0; i < 6; i++) {
      const p1 = new THREE.Vector3(-1.5 + i * 0.6, 0.4, 1.0);
      const p2 = new THREE.Vector3(5.0 + i * 0.5, -0.4, -1.0 + i * 0.4);
      const geo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const beam = new THREE.Line(geo, laserMat);
      this.laserBeams.push(beam);
      this.scene.add(beam);
    }
  }

  /**
   * 10-Second Countdown & Progress Driver
   */
  private startClock(): void {
    this.timerIntervalId = setInterval(() => {
      const elapsed = performance.now() - this.startTime;
      const progress = Math.min(elapsed / this.DURATION_MS, 1);
      this.progressPercent = progress * 100;
      this.secondsRemaining = Math.max(0, Math.ceil((this.DURATION_MS - elapsed) / 1000));

      // Synchronize Phase Narration
      if (progress < 0.3) {
        this.currentPhaseIndex = 1;
        this.currentPhaseTitle = 'Arena Seat Topology';
        this.currentPhaseSubtitle = 'Building real-time 3D stadium geometry and stage acoustical zones...';
        this.liveTickerText = 'SYNCING 120+ SEATS WITH CONCURRENCY DB';
      } else if (progress < 0.6) {
        this.currentPhaseIndex = 2;
        this.currentPhaseTitle = 'Smart Parking Synchronization';
        this.currentPhaseSubtitle = 'Aligning vehicle bays with reserved seats for unified arrival...';
        this.liveTickerText = 'VERIFYING ZERO DOUBLE-BOOKING ALGORITHMS';
      } else if (progress < 0.85) {
        this.currentPhaseIndex = 3;
        this.currentPhaseTitle = 'VIP Access Pass Authorization';
        this.currentPhaseSubtitle = 'Generating 15-minute guaranteed hold token and digital wallet pass...';
        this.liveTickerText = 'ENCRYPTING CONCURRENCY HOLD RECORD';
      } else {
        this.currentPhaseIndex = 4;
        this.currentPhaseTitle = 'Entering Platform';
        this.currentPhaseSubtitle = 'Welcome to Eventro: Where every reservation is guaranteed.';
        this.liveTickerText = 'SESSION READY — TRANSITIONING TO DASHBOARD';
      }

      this.cdr.markForCheck();

      // At 10 Seconds: Trigger smooth finish
      if (progress >= 1 && !this.isFadingOut) {
        this.finishIntro();
      }
    }, 50);
  }

  /**
   * Render Loop with Dynamic Orbit & Parallax
   */
  private startAnimationLoop(): void {
    const loop = (time: number) => {
      const elapsed = (performance.now() - this.startTime) / 1000;
      const progress = Math.min(elapsed / (this.DURATION_MS / 1000), 1);

      // Smooth mouse lerp
      this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
      this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

      // 1. Camera Choreography across the 10 seconds
      if (progress < 0.35) {
        // High angle swooping in
        const t = progress / 0.35;
        this.camera.position.x = Math.sin(t * 1.5) * 6 + this.mouseX * 0.8;
        this.camera.position.y = 8 - t * 4 + this.mouseY * 0.6;
        this.camera.position.z = 16 - t * 6;
      } else if (progress < 0.75) {
        // Smooth rotational orbit
        const t = (progress - 0.35) / 0.4;
        const angle = t * Math.PI * 0.8;
        this.camera.position.x = Math.cos(angle) * 8 + this.mouseX * 0.8;
        this.camera.position.y = 3.5 + Math.sin(t * Math.PI) * 1.5 + this.mouseY * 0.6;
        this.camera.position.z = Math.sin(angle) * 8 + 4;
      } else {
        // Final focus on VIP Pass
        const t = (progress - 0.75) / 0.25;
        this.camera.position.x = (1 - t) * 2 + this.mouseX * 0.4;
        this.camera.position.y = 1.8 + this.mouseY * 0.4;
        this.camera.position.z = 8 - t * 2.5; // Zoom in
      }
      this.camera.lookAt(0, 0.6, 0);

      // 2. Rotate Arena & Objects
      this.arenaGroup.rotation.y = elapsed * 0.18;
      this.parkingGroup.position.y = Math.sin(elapsed * 1.2) * 0.05;

      // 3. Floating Hologram Pass
      if (this.ticketGroup) {
        this.ticketGroup.rotation.y = Math.sin(elapsed * 0.8) * 0.25 + this.mouseX * 0.4;
        this.ticketGroup.rotation.x = Math.cos(elapsed * 0.6) * 0.12 - this.mouseY * 0.3;
        this.ticketGroup.position.y = 1.2 + Math.sin(elapsed * 1.5) * 0.12;
      }

      // 4. Stardust Particles Wave
      if (this.particleSystem) {
        this.particleSystem.rotation.y = elapsed * 0.04;
        this.particleSystem.rotation.x = Math.sin(elapsed * 0.02) * 0.1;
      }

      // 5. Pulsing Laser Beams
      this.laserBeams.forEach((beam, idx) => {
        (beam.material as THREE.LineBasicMaterial).opacity =
          0.3 + Math.sin(elapsed * 4 + idx) * 0.35;
      });

      this.renderer.render(this.scene, this.camera);
      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  /**
   * Complete Intro and Emit Output
   */
  finishIntro(): void {
    if (this.isFadingOut) return;
    this.isFadingOut = true;
    this.cdr.markForCheck();

    if (this.timerIntervalId) {
      clearInterval(this.timerIntervalId);
    }

    // 800ms graceful transition dissolve
    setTimeout(() => {
      this.cleanup();
      this.completed.emit();
    }, 800);
  }

  private cleanup(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.timerIntervalId) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.scene) {
      this.scene.clear();
    }
  }
}

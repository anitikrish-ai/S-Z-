<div align="center">

  <br />

  <img src="public/sozo-logo.png" alt="SŌZŌ Studio" width="560" style="max-width: 100%; height: auto;" />

  <br />
  <br />

  <p align="center">
    <strong>The Precision Visual Web Development Workshop</strong>
  </p>
  <p align="center">
    An Apple-inspired desktop creative environment for vector component design, visual keyframe choreography, responsive DOM construction, website architecture graphs, and static security diagnostics.
  </p>

  <p align="center">
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-the-six-workspaces">Workspaces</a> •
    <a href="#-architecture--two-way-synchronization">Architecture</a> •
    <a href="#-keyboard-shortcuts">Shortcuts</a> •
    <a href="#-export-deliverables">Export</a> •
    <a href="#-license">License</a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/React-19.3-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-8.3-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS v4" />
    <img src="https://img.shields.io/badge/Storage-IndexedDB_Local--First-8B7CFF?style=flat-square" alt="IndexedDB" />
    <img src="https://img.shields.io/badge/License-MIT-30D18A?style=flat-square" alt="MIT License" />
  </p>

  <br />

</div>

---

## ✦ The SŌZŌ Manifesto

> **"SŌZŌ" (創造)** — *Creation through deliberate, manual human craftsmanship.*

Modern web development has become clouded with generative approximations and sluggish cloud lock-in. **SŌZŌ Studio** returns total tactile control to designers and developers:

- **Tactile Precision:** Every pixel, corner radius, bezier control point, and DOM node is directly manipulated through drawing, dragging, configuring, and coding.
- **Pure Local-First:** Runs completely offline in your browser. All projects persist in browser **IndexedDB** with zero tracking, external telemetry, or mandatory accounts.
- **Bi-Directional Code Parity:** Changes drawn on the visual canvas instantly generate clean, human-readable HTML, CSS, SVG, and React code—and manual code edits cleanly synchronize back without destroying structure.
- **Apple Pro Aesthetics:** Engineered with macOS design language, SF Pro typography, refined 180ms ease-out curves, subtle hairline borders (`rgba(255,255,255,0.08)`), and an uncluttered dark canvas that keeps your work the visual centerpiece.

---

## ✦ The Six Specialized Workspaces

SŌZŌ Studio organizes visual development into six dedicated, high-performance studios accessible via a unified segmented control:

```
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │  SŌZŌ STUDIO                                                                │
  │  ┌──────────┬──────────┬──────────┬──────────────┬──────────┬────────────┐  │
  │  │  Design  │  Motion  │  Builder │ Architecture │   Code   │  Security  │  │
  │  └──────────┴──────────┴──────────┴──────────────┴──────────┴────────────┘  │
  └─────────────────────────────────────────────────────────────────────────────┘
```

### 1. Design Studio (Precision Vector Canvas)
- **Vector Toolset:** Rectangle, Rounded Card, Circle, Ellipse, Polygon, Star, Line, Arrow, Text, and Pen paths.
- **Styling Engine:** Solid fills, Linear & Radial gradients, multiple elevated Box Shadows, CSS Backdrop Filters, and independent corner radius linkers.
- **Live Output:** Instant generation of modular CSS classes and standalone clean SVG vector code.

### 2. Animation Lab (Motion & Keyframe Choreography)
- **Visual Timeline:** Draggable keyframe diamonds across multiple property tracks (`translateX`, `translateY`, `rotate`, `scale`, `opacity`, `borderRadius`).
- **Scrubbing & Playhead:** Sub-frame scrubbing with real-time millisecond timecode display (`0.00s / 1.40s`) and speed multipliers (`0.5x`, `1x`, `1.5x`, `2x`).
- **Easing Curve Engine:** Calibrated Apple smooth curves (`cubic-bezier(0.16, 1, 0.3, 1)`) with direct CSS `@keyframes` code generation.

### 3. UI Builder (DOM Website Constructor)
- **Component Palette:** Prebuilt semantic layout wrappers, navigation bars, cards, headings, accordion items, pricing blocks, metrics, and forms.
- **Direct Canvas Editing:** Double-click or click to edit text inline with `contentEditable`.
- **Responsive Viewport Frame:** Instant preview switching between **Desktop (Fluid 100%)**, **Tablet (768px)**, and **Mobile (375px)**.
- **Multi-Page Engine:** Create, duplicate, reorder, and configure routes for complete multi-page web applications.

### 4. Website Graph (Architecture & Component Map)
- **Node-Based Visualization:** Powered by `@xyflow/react`. Automatically diagrams project roots, pages, sections, and nested child elements.
- **Hierarchy & Connection Map:** Inspect parent-child dependencies and routing relationships at a glance.
- **Click-to-Focus:** Selecting any component node in the architecture graph instantly navigates and focuses that element inside the UI Builder.

### 5. Code Studio (Dual-Pane Source IDE)
- **Monaco Editor Core:** The same editing engine powering VS Code, pre-configured with syntax highlighting for HTML, CSS, JavaScript, and TypeScript.
- **Split-Screen Sandbox:** Live sandboxed iframe preview with hot reload and bidirectional console log bridging.
- **Project Tree:** Fast multi-file tab navigation across `index.html`, `styles.css`, `app.js`, and `App.tsx`.

### 6. Security Lab (Diagnostic & Hardening Suite)
- **Automated Heuristic Scanner:** Real-time static analysis detecting hardcoded API secrets, private keys, unsafe `innerHTML`, `dangerouslySetInnerHTML`, and insecure HTTP assets.
- **CSP Policy Generator:** Interactive builder for strict `Content-Security-Policy` directives (`script-src`, `style-src`, `img-src`).
- **1-Click Remediation:** Automatically injects safe configuration patches and security headers directly into source markup.

---

## ✦ System Architecture & Design System

SŌZŌ Studio is built strictly around decoupled, maintainable layers:

```
src/
├── app/
│   ├── App.tsx                     # Studio application shell & keyboard routing
│   └── Header.tsx                  # macOS toolbar, traffic lights, workspace switcher
├── components/
│   └── SozoLogo.tsx                # Official vector logo lockup & mark
├── workspaces/
│   ├── design-studio/              # Infinite vector canvas & geometry inspector
│   ├── animation-lab/              # Visual timeline & keyframe interpolator
│   ├── ui-builder/                 # Responsive DOM canvas & property panel
│   ├── website-graph/              # React Flow website architecture graph
│   ├── code-studio/                # Monaco editor & split-screen live preview
│   └── security-lab/               # Heuristic vulnerability audit dashboard
├── engines/
│   ├── project/db.ts               # IndexedDB persistence layer
│   ├── code/generator.ts           # Clean HTML/CSS/JS/React compiler
│   ├── security/scanner.ts         # Static analysis rules engine
│   └── export/zipExporter.ts       # Standalone ZIP bundler (JSZip)
├── registry/
│   └── componentRegistry.ts        # Modular UI component definitions
├── store/
│   └── useProjectStore.ts          # Zustand master state with Undo/Redo history
└── types/                          # Strict TypeScript domain interfaces
```

### Design Tokens
| Token | Dark Mode Value | Purpose |
|---|---|---|
| `--color-bg-base` | `#101114` | Distraction-free canvas background |
| `--color-surface` | `#18191D` | macOS window toolbar & side panels |
| `--color-surface-elevated` | `#202126` | Active segmented controls & inspectors |
| `--color-border-subtle` | `rgba(255,255,255,0.08)` | Hairline separation borders |
| `--color-accent` | `#8B7CFF` / `#8B5CF6` | SŌZŌ signature purple accent |
| `--color-success` | `#30D18A` | Audit pass & active sync indicator |
| `--color-danger` | `#FF5B62` | Critical vulnerability alerts |
| `--duration-apple` | `180ms` | Apple-calibrated transition duration |

---

## ✦ Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/anitikrish-ai/S-Z-.git
cd S-Z-
```

### 2. Install dependencies
```bash
npm install
```

### 3. Launch SŌZŌ Studio
```bash
npm run dev
```

Open `http://localhost:5173` in your browser. SŌZŌ Studio will load instantaneously and restore your previous work session from local IndexedDB.

---

## ✦ Keyboard Shortcuts

| Shortcut | Action | Scope |
|---|---|---|
| `Cmd / Ctrl + S` | Save Project to IndexedDB | Global |
| `Cmd / Ctrl + Z` | Undo last action | Global |
| `Cmd / Ctrl + Shift + Z` | Redo action | Global |
| `Space` | Play / Pause Motion Timeline | Animation Lab |
| `V` | Select / Move Tool | Design Studio |
| `R` | Rectangle Tool | Design Studio |
| `O` | Circle Tool | Design Studio |
| `T` | Typography Tool | Design Studio |
| `L` | Line Tool | Design Studio |

---

## ✦ Export Deliverables

Clicking the **Export** button in the top toolbar generates an unminified, zero-dependency ZIP archive ready for production deployment:

```
[your-project]-export.zip
├── index.html                   # Clean, semantic responsive markup
├── styles.css                   # Consolidated design system tokens & styles
├── app.js                       # Vanilla JavaScript event bindings
├── assets/
│   ├── vector-elements.svg      # Clean standalone vector SVG graphics
│   └── animations.css           # Isolated high-performance @keyframes
├── reports/
│   └── security-audit.json      # Complete vulnerability audit report
├── sozo-project.json            # 1-click reimportable project state
└── README.md                    # Deployment and project notes
```

---

## ✦ Contributing & Quality Assurance

SŌZŌ Studio enforces strict TypeScript interfaces and unit test suites:

```bash
# Run unit tests
npm test

# Typecheck code
npm run typecheck
```

---

## ✦ License

SŌZŌ Studio is open-source software licensed under the [MIT License](LICENSE).

<div align="center">
  <br />
  <p>Crafted for designers and engineers who value precision, privacy, and performance.</p>
  <sub>© 2026 SŌZŌ Studio. All rights reserved.</sub>
</div>

# Homepage Component Documentation

## Overview
The `HomepageComponent` acts as the primary landing page for the Neon Barber Club application. It seamlessly integrates a series of child components (Hero Video, Services, Booking, Location, and Footer) while featuring a complex, scroll-driven visual experience implemented via GSAP (GreenSock Animation Platform).

## Core Architecture
The homepage follows a modular, lazy-rendered structure to ensure maximum performance while maintaining a rich aesthetic:
1. **HeroVideoComponent:** Grabs attention immediately upon loading.
2. **GSAP Animation Section:** A sophisticated `<canvas>`-based interactive component that dissects a barber machine frame-by-frame as the user scrolls.
3. **Servicios (Services):** A traditional CSS grid presenting available services and pricing.
4. **BookingComponent:** (Lazy loaded) Direct portal for users to schedule appointments.
5. **LocationComponent:** (Lazy loaded) Contact & geographic information.
6. **FooterComponent:** Standard site footer.

## Animation & ScrollTrigger Mechanics
The central feature of this view is a 120-frame scroll animation. It leverages `gsap` and `ScrollTrigger` mapped dynamically to user scroll momentum to sequence the un-building of a premium machine, accompanied by coordinated text appearance.

### The Mechanics:
- **Frame Loading:** Preloads 120 PNG images (`public/machineFrames/fotograma_001.png` to `120`).
- **Trigger Alignment:** The animation starts when the scroll container enters `75%` visibility into the viewport (`start: 'top 75%'`) and lasts exactly until `bottom top`. This provides an inclusive timeline mapping across its entire visible lifecycle.
- **Canvas Rendering:** A dynamic render cycle targets a single `currentFrame` object hooked to GSAP. Instead of DOM swaps, the `canvas.getContext('2d')` strictly draws the required individual image per tick.
- **Text Syncing:** Absolute text elements gracefully emerge and fade sequentially directly tied to GSAP scroll decimals. The structural design explicitly separates the canvas (right side) from the texts (left side) using flex layouts, avoiding any pixel overlap even at maximum scale.

## Responsive Design
- The GSAP structural block utilizes standard `max-w-6xl` containers with flex (`flex-col md:flex-row`). 
- On desktop, the transparent visual overlaps neatly with zero interference. 
- On smaller mobile viewports, the timeline auto-adapts by stacking items (`flex-col`) providing optimal reading zones below visual focus points without requiring discrete JS timeline modifications.

## Component Settings
- **Change Detection:** Configured aggressively with `ChangeDetectionStrategy.OnPush` optimizing out standard angular digest cycles since UI updates here are predominantly handled via vanilla Canvas and manual window APIs.

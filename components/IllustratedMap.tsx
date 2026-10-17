"use client";

import { useEffect, useRef, useState } from "react";
import { BOARD, DISTRICTS, SPOTS } from "@/lib/map/board";
import type { PlacePin } from "@/lib/places";

type Zoom = "overview" | "street";

/** Where the camera opens: Echo Flats framed with the Halo Dome on the far edge (C46). */
const START = { x: 495, y: 640 };
/** How far a finger may move before a tap becomes a drag. */
const TAP_SLOP = 8;

/**
 * The illustrated Echo Flats board (Clarifications 3, Design C46 to C48; owner, Oct 17: the contained Lagos Life
 * style map). The art is two images (day and night) that crossfade; only plates, clouds and lock pills draw live.
 * The camera pans within the board's edges and has two zoom levels: overview (emoji tiles) and street (name
 * plates). Pinch, double-tap or the zoom button switch between them.
 */
export function IllustratedMap({
  places,
  night,
  onPlace,
  onDistrict,
  onTap,
}: {
  places: PlacePin[];
  night: boolean;
  onPlace: (id: string) => void;
  onDistrict: (id: string) => void;
  /** A tap on the board that isn't on a place or a district. */
  onTap?: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ w: 390, h: 780 });
  const [zoom, setZoom] = useState<Zoom>("overview");
  const [center, setCenter] = useState(START);
  const [animate, setAnimate] = useState(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ startX: number; startY: number; moved: boolean; pinch0: number; center0: { x: number; y: number }; target: HTMLElement } | null>(null);

  useEffect(() => {
    const el = rootRef.current!;
    const fit = () => setView({ w: el.clientWidth, h: el.clientHeight });
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Overview fits the board to the screen's height or width, whichever fills it; street is full size.
  const overviewScale = Math.max(view.w / BOARD.w, view.h / BOARD.h);
  const scaleFor = (z: Zoom) => (z === "overview" ? overviewScale : Math.max(1, overviewScale));
  const scale = scaleFor(zoom);

  /** Keeps the camera inside the board, so it never shows emptiness past the edge. */
  const clamp = (c: { x: number; y: number }, s: number) => {
    const hw = view.w / 2 / s, hh = view.h / 2 / s;
    return {
      x: Math.max(hw, Math.min(BOARD.w - hw, c.x)),
      y: Math.max(hh, Math.min(BOARD.h - hh, c.y)),
    };
  };
  const cam = clamp(center, scale);
  const toScreen = (x: number, y: number) => ({ left: view.w / 2 + (x - cam.x) * scale, top: view.h / 2 + (y - cam.y) * scale });

  function switchZoom(next: Zoom, focus?: { x: number; y: number }) {
    if (next === zoom) return;
    setAnimate(true);
    setZoom(next);
    if (focus) setCenter(clamp(focus, scaleFor(next)));
    setTimeout(() => setAnimate(false), 320);
  }

  /** A screen point (relative to the map) in board units. */
  const toBoard = (sx: number, sy: number) => ({ x: cam.x + (sx - view.w / 2) / scale, y: cam.y + (sy - view.h / 2) / scale });

  function onPointerDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest(".imap-zoom")) return;
    rootRef.current!.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    gesture.current = {
      startX: e.clientX,
      startY: e.clientY,
      moved: pts.length > 1 || (gesture.current?.moved ?? false),
      pinch0: pts.length > 1 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0,
      center0: cam,
      // What the finger landed on: with pointer capture, later events all point at the map itself.
      target: gesture.current?.target ?? (e.target as HTMLElement),
    };
  }

  function onPointerMove(e: React.PointerEvent) {
    const g = gesture.current;
    if (!g || !pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    if (pts.length > 1) {
      // Pinch: spreading the fingers goes to street zoom, closing them back to overview.
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (g.pinch0 > 0 && (d / g.pinch0 > 1.3 || d / g.pinch0 < 0.75)) {
        const rect = rootRef.current!.getBoundingClientRect();
        const mid = toBoard((pts[0].x + pts[1].x) / 2 - rect.left, (pts[0].y + pts[1].y) / 2 - rect.top);
        switchZoom(d > g.pinch0 ? "street" : "overview", mid);
        g.pinch0 = d;
      }
      return;
    }
    const dx = e.clientX - g.startX, dy = e.clientY - g.startY;
    if (!g.moved && Math.hypot(dx, dy) < TAP_SLOP) return;
    g.moved = true;
    setCenter(clamp({ x: g.center0.x - dx / scale, y: g.center0.y - dy / scale }, scale));
  }

  function onPointerUp(e: React.PointerEvent) {
    const g = gesture.current;
    pointers.current.delete(e.pointerId);
    if (pointers.current.size > 0) return;
    gesture.current = null;
    if (!g || g.moved) return;
    const target = g.target;
    const place = target.closest<HTMLElement>("[data-place]")?.dataset.place;
    const district = target.closest<HTMLElement>("[data-district]")?.dataset.district;
    if (place) onPlace(place);
    else if (district) onDistrict(district);
    else onTap?.();
  }

  function onDoubleClick(e: React.MouseEvent) {
    const rect = rootRef.current!.getBoundingClientRect();
    switchZoom(zoom === "overview" ? "street" : "overview", toBoard(e.clientX - rect.left, e.clientY - rect.top));
  }

  const spots = new Map(SPOTS.map((s) => [s.id, s]));
  const boardStyle = {
    width: BOARD.w,
    height: BOARD.h,
    transform: `translate(${view.w / 2 - cam.x * scale}px, ${view.h / 2 - cam.y * scale}px) scale(${scale})`,
  };

  return (
    <div
      ref={rootRef}
      className={`imap${animate ? " animate" : ""}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={onDoubleClick}
      role="application"
      aria-label="Map of Echo Flats"
    >
      <div className="imap-board" style={boardStyle}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="imap-art" src="/map/echo-flats-day.svg" alt="" draggable={false} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="imap-art" src="/map/echo-flats-night.svg" alt="" draggable={false} style={{ opacity: night ? 1 : 0 }} />
        {DISTRICTS.map((d) => (
          <div
            key={d.id}
            data-district={d.id}
            className={`imap-clouds${night ? " night" : ""}`}
            style={{ left: d.rect[0], top: d.rect[1], width: d.rect[2], height: d.rect[3] }}
          />
        ))}
      </div>

      <div className={`imap-layer${animate ? " animate" : ""}`}>
        {DISTRICTS.map((d) => {
          const p = toScreen(d.x, d.y);
          return (
            <button key={d.id} data-district={d.id} className="imap-lock" style={p} aria-label={`${d.name}: locked, coming soon`}>
              🔒 {d.name}
              <small>Coming soon</small>
            </button>
          );
        })}
        {places.map((pl) => {
          const s = spots.get(pl.id);
          if (!s) return null;
          const p = toScreen(s.x, s.y);
          if (zoom === "overview") {
            return (
              <button key={pl.id} data-place={pl.id} className={`imap-tile${pl.category === "venue" ? " venue" : ""}`} style={{ left: p.left, top: p.top - 8 * scale }} aria-label={pl.name}>
                {pl.emoji}
              </button>
            );
          }
          if (pl.category === "venue") {
            return (
              <button key={pl.id} data-place={pl.id} className="imap-marquee" style={p} aria-label={`${pl.name}. ${pl.status ?? ""}`}>
                <i aria-hidden="true" />
                <b>{pl.name}</b>
                {pl.status && <span>{pl.status}</span>}
              </button>
            );
          }
          return (
            <button key={pl.id} data-place={pl.id} className="imap-plate" style={p}>
              <span className="imap-plate-emoji" aria-hidden="true">{pl.emoji}</span>
              {pl.id === "halo-dome" ? "Stadium Status 🔒" : pl.name}
            </button>
          );
        })}
      </div>

      <button
        className="imap-zoom glass-hud"
        onClick={() => switchZoom(zoom === "overview" ? "street" : "overview", cam)}
        aria-label={zoom === "overview" ? "Zoom in to street level" : "Zoom out to the whole town"}
      >
        {zoom === "overview" ? "+" : "−"}
      </button>
    </div>
  );
}

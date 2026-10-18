"use client";

import { useEffect, useRef, useState } from "react";
import type { Board3D, Spot3D } from "@/components/map/board3d";
import { DISTRICTS } from "@/lib/map/board";
import type { PlacePin } from "@/lib/places";

type Zoom = "overview" | "street";

/** Where the camera opens: the city with the CLOUTWOOD hill behind it, clear of the sign-up card below. */
const START = { x: 450, y: 660 };
/** How far a finger may move before a tap becomes a drag. */
const TAP_SLOP = 8;
/** Board width the overview frames (about two thirds of the city). */
const OVERVIEW_W = 900 / 1.45;
/** Keeps the camera over the city, so it never drifts out over the empty sky. */
const LIMITS = { x0: 30, x1: 870, y0: 80, y1: 1210 };

interface Label {
  el: HTMLElement | null;
  x: number;
  y: number;
  /** Height above the ground in board units; floating labels centre on their point, plates hang below it. */
  lift: number;
}

/**
 * The 3D Echo Flats city (owner, Oct 18: 3D with an illustrated look, Hollywood streets, the CLOUTWOOD hill). three.js
 * loads only on this screen; the model draws on a canvas and the plates, tiles and lock pills are buttons laid over
 * it at their projected spots. Same camera rules as the 2D board: drag to pan, two zoom levels (overview tiles,
 * street plates) by pinch, double-tap or the zoom button. If WebGL fails, onFail swaps in the 2D board.
 */
export function CityMap3D({
  places,
  night,
  onPlace,
  onDistrict,
  onTap,
  onFail,
}: {
  places: PlacePin[];
  night: boolean;
  onPlace: (id: string) => void;
  onDistrict: (id: string) => void;
  onTap?: () => void;
  onFail: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boardRef = useRef<Board3D | null>(null);
  const spotsRef = useRef<Map<string, Spot3D>>(new Map());
  const labels = useRef(new Map<string, Label>());
  const center = useRef(START);
  const size = useRef({ w: 390, h: 780 });
  const [zoom, setZoom] = useState<Zoom>("overview");
  const [ready, setReady] = useState(false);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ startX: number; startY: number; moved: boolean; pinch0: number; center0: { x: number; y: number }; target: HTMLElement } | null>(null);
  const failRef = useRef(onFail);
  failRef.current = onFail;
  const yawTilt = useRef({ cos: 1, sin: 0, tilt: 1 });

  const scaleFor = (z: Zoom) => {
    const o = size.current.w / OVERVIEW_W;
    return z === "overview" ? o : Math.max(1.2, o);
  };

  /** Moves the camera and every label to match it. Runs on every drag frame, so it touches the DOM directly. */
  function layout() {
    const board = boardRef.current;
    if (!board) return;
    const c = center.current;
    center.current = { x: Math.max(LIMITS.x0, Math.min(LIMITS.x1, c.x)), y: Math.max(LIMITS.y0, Math.min(LIMITS.y1, c.y)) };
    board.setView({ center: center.current, scale: scaleFor(zoomRef.current) });
    for (const l of labels.current.values()) {
      if (!l.el) continue;
      const p = board.project(l.x, l.y, l.lift);
      l.el.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, ${l.lift ? "-50%" : "0"})`;
    }
  }

  useEffect(() => {
    let cancelled = false;
    let ro: ResizeObserver | null = null;
    import("@/components/map/board3d")
      .then(({ createBoard3D, SPOTS_3D, PITCH, YAW }) => {
        if (cancelled) return;
        const board = createBoard3D(canvasRef.current!);
        boardRef.current = board;
        spotsRef.current = new Map(SPOTS_3D.map((s) => [s.id, s]));
        const yaw = (YAW * Math.PI) / 180;
        yawTilt.current = { cos: Math.cos(yaw), sin: Math.sin(yaw), tilt: Math.sin((PITCH * Math.PI) / 180) };
        const el = rootRef.current!;
        const fit = () => {
          size.current = { w: el.clientWidth, h: el.clientHeight };
          board.resize(size.current.w, size.current.h);
          layout();
        };
        ro = new ResizeObserver(fit);
        ro.observe(el);
        fit();
        board.start(matchMedia("(prefers-reduced-motion: reduce)").matches);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) failRef.current();
      });
    return () => {
      cancelled = true;
      ro?.disconnect();
      boardRef.current?.dispose();
      boardRef.current = null;
    };
  }, []);

  useEffect(() => {
    boardRef.current?.setNight(night);
  }, [night, ready]);

  // Labels change with the zoom level; place them once React has drawn them.
  useEffect(() => {
    layout();
  });

  /** A spot for each label: tiles float over their building, plates sit on the pavement in front of it. */
  function labelRef(id: string, x: number, y: number, lift: number) {
    return (el: HTMLElement | null) => {
      if (el) labels.current.set(id, { el, x, y, lift });
      else labels.current.delete(id);
    };
  }

  /** A screen point (relative to the map) in board units on the ground. */
  function toBoard(sx: number, sy: number) {
    const s = scaleFor(zoomRef.current);
    const { cos, sin, tilt } = yawTilt.current;
    const dx = (sx - size.current.w / 2) / s, dy = (sy - size.current.h / 2) / s / tilt;
    return { x: center.current.x + dx * cos + dy * sin, y: center.current.y - dx * sin + dy * cos };
  }

  function switchZoom(next: Zoom, focus?: { x: number; y: number }) {
    if (next === zoomRef.current) return;
    if (focus) center.current = focus;
    zoomRef.current = next;
    setZoom(next);
  }

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
      center0: center.current,
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
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (g.pinch0 > 0 && (d / g.pinch0 > 1.3 || d / g.pinch0 < 0.75)) {
        const rect = rootRef.current!.getBoundingClientRect();
        switchZoom(d > g.pinch0 ? "street" : "overview", toBoard((pts[0].x + pts[1].x) / 2 - rect.left, (pts[0].y + pts[1].y) / 2 - rect.top));
        g.pinch0 = d;
      }
      return;
    }
    const sx = e.clientX - g.startX, sy = e.clientY - g.startY;
    if (!g.moved && Math.hypot(sx, sy) < TAP_SLOP) return;
    g.moved = true;
    // The camera looks along the yaw: a screen drag moves the ground along the turned axes, foreshortened by the tilt.
    const s = scaleFor(zoomRef.current);
    const { cos, sin, tilt } = yawTilt.current;
    const dx = sx / s, dy = sy / s / tilt;
    center.current = { x: g.center0.x - (dx * cos + dy * sin), y: g.center0.y - (-dx * sin + dy * cos) };
    layout();
  }

  function onPointerUp(e: React.PointerEvent) {
    const g = gesture.current;
    pointers.current.delete(e.pointerId);
    if (pointers.current.size > 0) return;
    gesture.current = null;
    if (!g || g.moved) return;
    const place = g.target.closest<HTMLElement>("[data-place]")?.dataset.place;
    const district = g.target.closest<HTMLElement>("[data-district]")?.dataset.district;
    if (place) onPlace(place);
    else if (district) onDistrict(district);
    else onTap?.();
  }

  function onDoubleClick(e: React.MouseEvent) {
    const rect = rootRef.current!.getBoundingClientRect();
    switchZoom(zoomRef.current === "overview" ? "street" : "overview", toBoard(e.clientX - rect.left, e.clientY - rect.top));
  }

  const spots = spotsRef.current;

  return (
    <div
      ref={rootRef}
      className={`imap imap3d${night ? " night" : ""}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={onDoubleClick}
      role="application"
      aria-label="Map of Echo Flats"
    >
      <canvas ref={canvasRef} className="imap3d-canvas" />

      {ready && (
        <div className="imap-layer">
          {DISTRICTS.map((d) => (
            <button key={d.id} ref={labelRef(`d:${d.id}`, d.x, d.y, 90)} data-district={d.id} className="imap3d-label imap-lock" aria-label={`${d.name}: locked, coming soon`}>
              🔒 {d.name}
              <small>Coming soon</small>
            </button>
          ))}
          {places.map((pl) => {
            const s = spots.get(pl.id);
            if (!s) return null;
            if (zoom === "overview") {
              // Tiles float above their building; the letters' tile floats above the letters so it never covers them.
              const sign = pl.id === "cloutwood-sign";
              return (
                <button key={pl.id} ref={labelRef(pl.id, s.x, sign ? s.y : s.y - 50, sign ? s.h + 150 : 70)} data-place={pl.id} className={`imap3d-label imap-tile${pl.category === "venue" ? " venue" : ""}`} aria-label={pl.name}>
                  {pl.emoji}
                </button>
              );
            }
            if (pl.category === "venue") {
              return (
                <button key={pl.id} ref={labelRef(pl.id, s.x, s.y, s.h)} data-place={pl.id} className="imap3d-label imap-marquee" aria-label={`${pl.name}. ${pl.status ?? ""}`}>
                  <i aria-hidden="true" />
                  <b>{pl.name}</b>
                  {pl.status && <span>{pl.status}</span>}
                </button>
              );
            }
            return (
              <button key={pl.id} ref={labelRef(pl.id, s.x, s.y, s.h)} data-place={pl.id} className="imap3d-label imap-plate">
                <span className="imap-plate-emoji" aria-hidden="true">{pl.emoji}</span>
                {pl.id === "halo-dome" ? "Stadium Status 🔒" : pl.name}
              </button>
            );
          })}
        </div>
      )}

      <button
        className="imap-zoom glass-hud"
        onClick={() => switchZoom(zoom === "overview" ? "street" : "overview")}
        aria-label={zoom === "overview" ? "Zoom in to street level" : "Zoom out to the whole town"}
      >
        {zoom === "overview" ? "+" : "−"}
      </button>
    </div>
  );
}

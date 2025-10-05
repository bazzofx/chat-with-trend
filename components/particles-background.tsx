"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  maxLife: number
  color: "red" | "yellow"
}

export function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let particles: Particle[] = []
    let lastTime = performance.now()

    const DPR = Math.max(1, window.devicePixelRatio || 1)

    const resizeCanvas = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      canvas.width = Math.round(w * DPR)
      canvas.height = Math.round(h * DPR)
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0) // keep drawing in CSS pixels
    }

    // Create one new particle (fire ember) at bottom
    const spawnParticle = () => {
      const w = canvas.width / DPR
      const h = canvas.height / DPR
      const px = Math.random() * w
      const py = h + 4 // slightly below bottom so they pop into view

      const upwardSpeed = 0.6 + Math.random() * 2.2 // vy magnitude
      const vx = (Math.random() - 0.5) * 0.8 // slight horizontal drift
      const vy = -upwardSpeed - Math.random() * 0.6 // negative = upward

      const size = Math.random() * 1 + 0.22 // small embers
      const maxLife = 800 + Math.random() * 900 // ms lifetime

      const color = Math.random() < 0.55 ? "yellow" : "red" // slightly more yellow

      particles.push({
        x: px,
        y: py,
        vx,
        vy,
        size,
        life: maxLife,
        maxLife,
        color,
      })
    }

    // spawn a few at init so it doesn't look empty
    const initialSpawn = () => {
      const count = Math.min(80, Math.floor((canvas.width / DPR) / 10))
      for (let i = 0; i < count; i++) spawnParticle()
    }

    const draw = (time: number) => {
      const dt = time - lastTime
      lastTime = time

      const w = canvas.width / DPR
      const h = canvas.height / DPR

      // clear
      ctx.clearRect(0, 0, w, h)

      // Make fire blend additively
      ctx.globalCompositeOperation = "lighter"

      // spawn rate depends on width (so wide screens have more embers)
      const spawnRatePerFrame = Math.max(1, Math.round((w / 5700) * (dt / 1.4))) // baseline
      for (let s = 0; s < spawnRatePerFrame; s++) {
        // spawn probabilistically to avoid huge spikes
        if (Math.random() < 0.9) spawnParticle()
      }

      // Update & draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]

        // physics
        // slight upward acceleration to mimic hot-air buoyancy
        const buoyancy = -0.0015 * (p.size + 1)
        p.vy += buoyancy * dt
        // small horizontal turbulence
        p.vx += (Math.random() - 0.5) * 0.0015 * dt

        p.x += p.vx * (dt / 16)
        p.y += p.vy * (dt / 16)

        // reduce life
        p.life -= dt
        const lifeRatio = Math.max(0, p.life / p.maxLife) // 1 -> 0

        // compute opacity from life and y position (stronger fade as life runs out)
        const opacity = lifeRatio

        // color blend between yellow and red by life (youthful = yellower -> brighter)
        // but keep independent color choice too
        let innerColor = ""
        let outerColor = ""
        if (p.color === "yellow") {
          // yellow ember -> from bright yellow to transparent orange
          innerColor = `rgba(255, 235, 59, ${0.9 * opacity})` // bright yellow (material amber-like)
          outerColor = `rgba(255, 140, 0, ${0.05 * opacity})` // orange glow
        } else {
          // red ember
          innerColor = `rgba(255, 80, 60, ${0.85 * opacity})`
          outerColor = `rgba(220, 38, 38, ${0.06 * opacity})`
        }

        // draw as radial gradient for soft glow
        const radius = p.size * (1 + (1 - lifeRatio) * 1.8) // small growth while rising
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 6)
        grad.addColorStop(0, innerColor)
        grad.addColorStop(0.3, innerColor)
        grad.addColorStop(0.6, outerColor)
        grad.addColorStop(1, `rgba(0,0,0,0)`)

        ctx.beginPath()
        ctx.fillStyle = grad
        ctx.arc(p.x, p.y, radius * 3, 0, Math.PI * 2) // larger circle to show gradient
        ctx.fill()

        // optional tiny bright core
        ctx.beginPath()
        ctx.globalCompositeOperation = "source-over"
        ctx.fillStyle = innerColor
        ctx.arc(p.x, p.y, Math.max(0.4, p.size * 0.6), 0, Math.PI * 2)
        ctx.fill()
        ctx.globalCompositeOperation = "lighter"

        // remove particle when life is finished or it has risen above middle of screen
        if (p.life <= 0 || p.y < h * 0.45) {
          particles.splice(i, 1)
        }
      }

      // cap particles to avoid runaway
      const maxParticles = Math.max(200, Math.floor((w * h) / 100000))
      if (particles.length > maxParticles) {
        particles.splice(0, particles.length - maxParticles)
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    // init
    resizeCanvas()
    initialSpawn()
    lastTime = performance.now()
    rafRef.current = requestAnimationFrame(draw)

    // listeners
    const onResize = () => {
      resizeCanvas()
      // keep some particles but not too many
      particles = particles.filter((p) => p.y <= (canvas.height / DPR + 100))
    }
    window.addEventListener("resize", onResize)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 1, mixBlendMode: "screen" }}
    />
  )
}

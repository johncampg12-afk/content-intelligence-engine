'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'

export function ParticlesCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrame: number
    let time = 0
    let particles: Array<{ x: number; y: number; radius: number; speedX: number; speedY: number; opacity: number; pulse: number }> = []
    let width = 0
    let height = 0

    const initParticles = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height

      particles = []
      const count = Math.min(120, Math.floor((width * height) / 10000)) // responsive
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 4 + 1,
          speedX: (Math.random() - 0.5) * 0.25,
          speedY: (Math.random() - 0.5) * 0.25,
          opacity: Math.random() * 0.4 + 0.1,
          pulse: Math.random() * Math.PI * 2,
        })
      }
    }

    const animate = () => {
      if (!ctx || !canvas) return
      time += 0.02
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const isDark = theme === 'dark'
      // Color de partículas: azul claro en modo claro, blanco/gris en modo oscuro
      const baseColor = isDark ? '255, 255, 255' : '59, 130, 246'

      for (const p of particles) {
        p.x += p.speedX
        p.y += p.speedY
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        const pulseAlpha = p.opacity + Math.sin(time + p.pulse) * 0.1
        const alpha = Math.min(0.6, Math.max(0.1, pulseAlpha)) * (isDark ? 0.4 : 0.7)

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius + Math.sin(time + p.pulse) * 0.3, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${baseColor}, ${alpha})`
        ctx.fill()
      }

      animationFrame = requestAnimationFrame(animate)
    }

    const handleResize = () => {
      initParticles()
    }

    initParticles()
    animate()
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', handleResize)
    }
  }, [theme])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" style={{ position: 'fixed' }} />
}
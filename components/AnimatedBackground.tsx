"use client"

import React, { useEffect, useRef } from "react"
import { useTheme } from "@/contexts/ThemeContext"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  type: "slice" | "seed"
  rotation: number
  rotationSpeed: number
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = []
      const particleCount = Math.min(Math.floor((window.innerWidth * window.innerHeight) / 30000), 15)
      
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 40 + 30,
          type: Math.random() > 0.7 ? "seed" : "slice",
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.01,
        })
      }
    }
    initParticles()

    // Animation loop
    let animationId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw particles
      particlesRef.current.forEach((particle) => {
        ctx.save()
        ctx.translate(particle.x, particle.y)
        ctx.rotate(particle.rotation)

        if (particle.type === "slice") {
          // Draw watermelon slice
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size)
          if (theme === "dark") {
            gradient.addColorStop(0, "rgba(255, 107, 107, 0.08)")
            gradient.addColorStop(0.5, "rgba(255, 107, 107, 0.04)")
            gradient.addColorStop(1, "rgba(255, 107, 107, 0)")
          } else {
            gradient.addColorStop(0, "rgba(255, 107, 107, 0.12)")
            gradient.addColorStop(0.5, "rgba(255, 107, 107, 0.06)")
            gradient.addColorStop(1, "rgba(255, 107, 107, 0)")
          }
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(0, 0, particle.size, 0, Math.PI * 2)
          ctx.fill()
        } else {
          // Draw seed
          ctx.fillStyle = theme === "dark" 
            ? "rgba(255, 255, 255, 0.03)" 
            : "rgba(0, 0, 0, 0.05)"
          ctx.beginPath()
          ctx.ellipse(0, 0, particle.size / 4, particle.size / 6, 0, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.restore()

        // Update particle position
        particle.x += particle.vx
        particle.y += particle.vy
        particle.rotation += particle.rotationSpeed

        // Wrap around screen
        if (particle.x < -particle.size) particle.x = canvas.width + particle.size
        if (particle.x > canvas.width + particle.size) particle.x = -particle.size
        if (particle.y < -particle.size) particle.y = canvas.height + particle.size
        if (particle.y > canvas.height + particle.size) particle.y = -particle.size
      })

      animationId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}

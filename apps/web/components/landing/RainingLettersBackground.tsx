"use client"

import { useState, useEffect, useCallback } from "react"

interface Character {
  char: string
  x: number
  y: number
  speed: number
}

const RainingLettersBackground = ({ children }: { children: React.ReactNode }) => {
  const [characters, setCharacters] = useState<Character[]>([])
  const [activeIndices, setActiveIndices] = useState<Set<number>>(new Set())

  const createCharacters = useCallback(() => {
    const allChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?"
    const charCount = 300
    const newCharacters: Character[] = []

    for (let i = 0; i < charCount; i++) {
      newCharacters.push({
        char: allChars[Math.floor(Math.random() * allChars.length)] || "",
        x: Math.random() * 100,
        y: Math.random() * 100,
        speed: 0.1 + Math.random() * 0.3,
      })
    }

    return newCharacters
  }, [])

  useEffect(() => {
    setCharacters(createCharacters())
  }, [createCharacters])

  useEffect(() => {
    const flickerInterval = setInterval(() => {
      const newActiveIndices = new Set<number>()
      const numActive = Math.floor(Math.random() * 3) + 3
      for (let i = 0; i < numActive; i++) {
        newActiveIndices.add(Math.floor(Math.random() * characters.length))
      }
      setActiveIndices(newActiveIndices)
    }, 50)

    return () => clearInterval(flickerInterval)
  }, [characters.length])

  useEffect(() => {
    let animationFrameId: number
    const updatePositions = () => {
      setCharacters((prev) =>
        prev.map((char) => ({
          ...char,
          y: char.y + char.speed,
          ...(char.y >= 100 && {
            y: -5,
            x: Math.random() * 100,
            char: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?"[Math.floor(Math.random() * 70)],
          }),
        })),
      )
      animationFrameId = requestAnimationFrame(updatePositions)
    }
    animationFrameId = requestAnimationFrame(updatePositions)
    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  return (
    <section className="relative py-20 px-4 md:px-6 lg:py-32 bg-zinc-800 dark:bg-black overflow-hidden">
      {/* Raining Characters */}
      {characters.map((char, index) => (
        <span
          key={index}
          className={`absolute text-xs ${
            activeIndices.has(index) ? "text-[#00ff00] font-bold animate-pulse" : "text-slate-600"
          }`}
          style={{
            left: `${char.x}%`,
            top: `${char.y}%`,
            transform: `translate(-50%, -50%)`,
            textShadow: activeIndices.has(index)
              ? "0 0 8px rgba(255,255,255,0.8), 0 0 12px rgba(255,255,255,0.4)"
              : "none",
            opacity: activeIndices.has(index) ? 1 : 0.4,
            willChange: "transform, top",
            fontSize: "1.8rem",
            transition: "color 0.1s, transform 0.1s, text-shadow 0.1s",
          }}
        >
          {char.char}
        </span>
      ))}

      {/* Slot content */}
      <div className="relative z-20">{children}</div>

      {/* Global style for dud text */}
      <style jsx global>{`
        .dud {
          color: #0f0;
          opacity: 0.7;
        }
      `}</style>
    </section>
  )
}

export default RainingLettersBackground

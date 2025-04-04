"use client"

import { useRef, useState, useEffect } from "react"

class TextScramble {
  el: HTMLElement
  chars: string
  queue: Array<{ from: string; to: string; start: number; end: number; char?: string }>
  frame: number
  frameRequest: number
  resolve: (value: void | PromiseLike<void>) => void

  constructor(el: HTMLElement) {
    this.el = el
    this.chars = "!<>-_\\/[]{}—=+*^?#"
    this.queue = []
    this.frame = 0
    this.frameRequest = 0
    this.resolve = () => {}
    this.update = this.update.bind(this)
  }

  setText(newText: string) {
    const oldText = this.el.innerText
    const length = Math.max(oldText.length, newText.length)
    const promise = new Promise<void>((resolve) => (this.resolve = resolve))
    this.queue = []

    for (let i = 0; i < length; i++) {
      const from = oldText[i] || ""
      const to = newText[i] || ""
      const start = Math.floor(Math.random() * 40)
      const end = start + Math.floor(Math.random() * 40)
      this.queue.push({ from, to, start, end })
    }

    cancelAnimationFrame(this.frameRequest)
    this.frame = 0
    this.update()
    return promise
  }

  update() {
    let output = ""
    let complete = 0

    for (let i = 0, n = this.queue.length; i < n; i++) {
      const { from, to, start, end } = this.queue[i];
      let { char } = this.queue[i];
      if (this.frame >= end) {
        complete++
        output += to
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.chars[Math.floor(Math.random() * this.chars.length)]
          this.queue[i].char = char
        }
        output += `<span class="dud">${char}</span>`
      } else {
        output += from
      }
    }

    this.el.innerHTML = output
    if (complete === this.queue.length) {
      this.resolve()
    } else {
      this.frameRequest = requestAnimationFrame(this.update)
      this.frame++
    }
  }
}

const ScrambledTitle = () => {
  const elementRef = useRef<HTMLHeadingElement>(null)
  const scramblerRef = useRef<TextScramble | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (elementRef.current && !scramblerRef.current) {
      scramblerRef.current = new TextScramble(elementRef.current)
      setMounted(true)
    }
  }, [])

  useEffect(() => {
    if (mounted && scramblerRef.current) {
      const phrases = ["Create tasks.", "Let AI judge.", "Reward the best —", "transparently.", "Only on TaskVault AI."]
      let counter = 0
      const next = () => {
        scramblerRef.current!.setText(phrases[counter]).then(() => {
          setTimeout(next, 2000)
        })
        counter = (counter + 1) % phrases.length
      }
      next()
    }
  }, [mounted])

  return (
    <h1
      ref={elementRef}
      className="text-white text-4xl md:text-6xl font-bold tracking-tight text-center"
      style={{ fontFamily: "monospace" }}
    >
      Loading...
    </h1>
  )
}

export default ScrambledTitle

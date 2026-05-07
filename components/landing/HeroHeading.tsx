'use client'
import { useEffect, useState } from 'react'

const words = [
  'kokteyl',
  'kahve',
  'yemek',
  'tatlı',
  'içecek',
  'atıştırmalık',
]

export default function HeroHeading() {
  const [index, setIndex]     = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex(i => (i + 1) % words.length)
        setVisible(true)
      }, 350)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <h1 className="font-serif text-5xl md:text-7xl font-normal mb-6 leading-tight">
      Müşterinize{' '}
      <span className="text-gradient-gold italic">ruh haline göre</span>
      <br />
      <span
        className="italic text-gradient-gold"
        style={{
          display:    'inline-block',
          opacity:    visible ? 1 : 0,
          transform:  visible ? 'translateY(0)' : 'translateY(-8px)',
          transition: 'opacity 0.35s ease, transform 0.35s ease',
          minWidth:   '200px',
        }}
      >
        {words[index]}
      </span>
      {' '}öner
    </h1>
  )
}

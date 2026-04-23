'use client'
import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Download, ExternalLink, Copy, Check } from 'lucide-react'

export default function QRCodeGenerator({ quizUrl, barName }: { quizUrl: string; barName: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [copied, setCopied] = useState(false)
  const [size, setSize] = useState(400)

  useEffect(() => {
    if (!canvasRef.current) return
    QRCode.toCanvas(canvasRef.current, quizUrl, {
      width:  size,
      margin: 3,
      color:  { dark: '#d4af37', light: '#0d0d0d' },
      errorCorrectionLevel: 'H',
    })
  }, [quizUrl, size])

  function downloadPNG() {
    const link = document.createElement('a')
    link.download = `${barName.toLowerCase().replace(/\s+/g,'-')}-qr.png`
    link.href = canvasRef.current!.toDataURL('image/png')
    link.click()
  }

  async function copyUrl() {
    await navigator.clipboard.writeText(quizUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* QR Preview */}
      <div className="glass rounded-2xl p-6 flex flex-col items-center gap-4">
        <div className="text-sm text-white/40 mb-2">Önizleme</div>
        <div className="rounded-2xl overflow-hidden p-4 bg-obsidian-800 border border-gold/10">
          <canvas ref={canvasRef} />
        </div>

        {/* Size selector */}
        <div className="flex items-center gap-3 text-sm">
          <span className="text-white/40">Boyut:</span>
          {[200, 300, 400, 600].map(s => (
            <button key={s} onClick={() => setSize(s)}
              className={`px-3 py-1 rounded-full text-xs transition-all ${
                size === s ? 'bg-gold text-obsidian' : 'text-white/40 hover:text-white'
              }`}>
              {s}px
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-4">
        {/* URL box */}
        <div className="glass rounded-xl p-4">
          <div className="text-xs text-white/40 mb-2">Quiz URL'si</div>
          <div className="flex items-center gap-2">
            <code className="text-gold text-xs font-mono flex-1 truncate">{quizUrl}</code>
            <button onClick={copyUrl} className="text-white/40 hover:text-gold transition-colors p-1.5 rounded-lg hover:bg-gold/10">
              {copied ? <Check size={14} className="text-gold" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* Download */}
        <button onClick={downloadPNG} className="btn-gold w-full flex items-center justify-center gap-2">
          <Download size={16} />
          PNG İndir
        </button>

        {/* Open */}
        <a href={quizUrl} target="_blank" rel="noopener noreferrer" className="btn-outline w-full flex items-center justify-center gap-2">
          <ExternalLink size={16} />
          Quiz Sayfasını Aç
        </a>

        {/* Tips */}
        <div className="glass rounded-xl p-4 space-y-3">
          <div className="text-sm font-medium text-white/70">Kullanım İpuçları</div>
          {[
            'PNG\'yi A6 veya A5 boyutunda yazdırın',
            'Lamine edip masa üstüne koyun veya tent card yapın',
            'Menü kitapçığına da ekleyebilirsiniz',
            'Içerik güncellendiğinde QR kodu değişmez',
          ].map(tip => (
            <div key={tip} className="flex items-start gap-2 text-xs text-white/40">
              <span className="text-gold mt-0.5">—</span>
              {tip}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

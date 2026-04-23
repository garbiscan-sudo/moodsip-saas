'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Wine, HelpCircle, QrCode, Settings } from 'lucide-react'

const icons: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard size={16} />,
  Wine: <Wine size={16} />,
  HelpCircle: <HelpCircle size={16} />,
  QrCode: <QrCode size={16} />,
  Settings: <Settings size={16} />,
}

interface Props {
  href:  string
  label: string
  icon:  string
}

export default function DashboardSidebarClient({ href, label, icon }: Props) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  return (
    <Link href={href} className={`sidebar-link ${isActive ? 'active' : ''}`}>
      {icons[icon]}
      {label}
    </Link>
  )
}
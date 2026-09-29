// Branding and navigation are kept outside feature pages for reuse.
import { LayoutDashboard, FolderOpen, Users, Settings2, Activity } from 'lucide-react'

export const brand = {
  name: 'Base',
  tagline: 'Espaço de trabalho',
  description: 'Um lugar para organizar. Uma base para crescer.',
}
export const navigation = [
  { to: '/', label: 'Visão geral', icon: LayoutDashboard },
  { to: '/registros', label: 'Registros', icon: FolderOpen },
  { to: '/atividade', label: 'Atividade', icon: Activity },
  { to: '/usuarios', label: 'Usuários', icon: Users, staff: true },
  { to: '/configuracoes', label: 'Configurações', icon: Settings2 },
]

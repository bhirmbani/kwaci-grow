import { createFileRoute } from '@tanstack/react-router'
import { MenuManagement } from '../components/menus/MenuManagement'

function MenusPage() {
  return <MenuManagement />
}

export const Route = createFileRoute('/menus')({
  component: MenusPage,
})

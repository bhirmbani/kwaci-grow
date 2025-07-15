import { createFileRoute } from '@tanstack/react-router'
import { KwaciAcronymDemo } from '../components/KwaciAcronymDemo'

function KwaciDemoPage() {
  return (
    <div className="container mx-auto py-6">
      <KwaciAcronymDemo />
    </div>
  )
}

export const Route = createFileRoute('/kwaci-demo')({
  component: KwaciDemoPage,
})

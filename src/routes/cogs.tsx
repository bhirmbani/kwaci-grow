import { createFileRoute } from '@tanstack/react-router'
import { COGSPlayground } from '../components/cogs-playground/COGSPlayground'

function COGSCalculator() {
  return <COGSPlayground />
}

export const Route = createFileRoute('/cogs')({
  component: COGSCalculator,
})

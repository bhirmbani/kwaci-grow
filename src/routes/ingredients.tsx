import { createFileRoute } from '@tanstack/react-router'
import { IngredientManagement } from '../components/ingredients/IngredientManagement'

function Ingredients() {
  return <IngredientManagement />
}

export const Route = createFileRoute('/ingredients')({
  component: Ingredients,
})

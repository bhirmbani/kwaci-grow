import { createFileRoute } from '@tanstack/react-router'
import { ProductManagement } from '../components/products/ProductManagement'

function Products() {
  return <ProductManagement />
}

export const Route = createFileRoute('/products')({
  component: Products,
})

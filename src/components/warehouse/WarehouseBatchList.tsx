import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, ChevronRight, Search, Package, Calendar, ShoppingCart } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'
import type { WarehouseBatchWithItems } from '@/hooks/useWarehouse'

interface WarehouseBatchListProps {
  batches: WarehouseBatchWithItems[]
}

export function WarehouseBatchList({ batches }: WarehouseBatchListProps) {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedBatches, setExpandedBatches] = useState<Set<string>>(new Set())

  const filteredBatches = batches.filter(batch => 
    batch.batchNumber.toString().includes(searchTerm) ||
    batch.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
    batch.items.some(item => 
      item.ingredientName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const toggleBatch = (batchId: string) => {
    const newExpanded = new Set(expandedBatches)
    if (newExpanded.has(batchId)) {
      newExpanded.delete(batchId)
    } else {
      newExpanded.add(batchId)
    }
    setExpandedBatches(newExpanded)
  }

  if (batches.length === 0) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('warehouse.batchList.noBatches.title')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('warehouse.batchList.noBatches.description')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('warehouse.batchList.noBatches.hint')}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t('warehouse.batchList.title', { count: batches.length })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('warehouse.batchList.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Batch List */}
      <div className="space-y-3">
        {filteredBatches.map((batch) => {
          const isExpanded = expandedBatches.has(batch.id)
          const totalValue = batch.items.reduce((sum, item) => {
            const cost = typeof item.totalCost === 'number' && !isNaN(item.totalCost) ? item.totalCost : 0
            return sum + cost
          }, 0)

          return (
            <Card key={batch.id}>
              <Collapsible open={isExpanded} onOpenChange={() => toggleBatch(batch.id)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <div>
                          <CardTitle className="text-lg">Batch #{batch.batchNumber}</CardTitle>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(batch.dateAdded).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <ShoppingCart className="h-3 w-3" />
                              {t('warehouse.batchList.items', { count: batch.items.length })}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">{formatCurrency(totalValue)}</p>
                        <Badge variant="secondary">{t('warehouse.batchList.ingredients', { count: batch.items.length })}</Badge>
                      </div>
                    </div>
                    {batch.note && (
                      <p className="text-sm text-muted-foreground mt-2 text-left">
                        {batch.note}
                      </p>
                    )}
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">{t('warehouse.batchList.batchItems')}</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('warehouse.batchList.table.ingredient')}</TableHead>
                            <TableHead className="text-right">{t('warehouse.batchList.table.quantity')}</TableHead>
                            <TableHead className="text-right">{t('warehouse.batchList.table.unitCost')}</TableHead>
                            <TableHead className="text-right">{t('warehouse.batchList.table.totalCost')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {batch.items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{item.ingredientName}</p>
                                  {item.note && (
                                    <p className="text-xs text-muted-foreground">{item.note}</p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                {item.quantity.toFixed(1)} {item.unit}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(item.costPerUnit)}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(item.totalCost)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          )
        })}
      </div>

      {filteredBatches.length === 0 && searchTerm && (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('warehouse.batchList.noResults.title')}</h3>
              <p className="text-muted-foreground">
                {t('warehouse.batchList.noResults.description', { term: searchTerm })}
              </p>
              <Button 
                variant="outline" 
                onClick={() => setSearchTerm('')}
                className="mt-4"
              >
                {t('warehouse.batchList.noResults.clear')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

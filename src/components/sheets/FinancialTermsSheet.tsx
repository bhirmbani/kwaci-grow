import { InfoSheet } from "./InfoSheet"
import { Info, Package, DollarSign, TrendingUp, Calendar, Target, Gift } from "lucide-react"

export function FinancialTermsSheet() {
  return (
    <InfoSheet
      title="📊 Key Financial Terms Explained"
      description="Understanding the financial metrics used in this dashboard"
      triggerLabel="Financial Terms"
      triggerIcon={<Info className="h-4 w-4" />}
      side="right"
    >
      <div className="space-y-4">
        {/* Variable COGS */}
        <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground mb-2">Variable COGS (Cost of Goods Sold)</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Biaya bahan baku per cup kopi, misalnya susu, kopi, gula, es, dan cup.
                Nilai ini akan naik atau turun sesuai jumlah cup yang terjual.
              </p>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-start gap-3">
            <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground mb-2">Revenue</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Total pemasukan penjualan kopi selama satu bulan, dihitung dari harga per cup × jumlah cup × jumlah hari jual.
              </p>
            </div>
          </div>
        </div>

        {/* Gross Profit */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground mb-2">Gross Profit</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Selisih antara total revenue dan total Variable COGS (Gross Profit = Revenue – Variable COGS).
                Ini belum dikurangi biaya tetap.
              </p>
            </div>
          </div>
        </div>

        {/* Fixed Costs */}
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground mb-2">Fixed Costs</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Biaya rutin per bulan yang harus dibayar, seperti gaji barista, sewa, depresiasi kendaraan.
                Nilainya tetap tidak bergantung jumlah cup terjual.
              </p>
            </div>
          </div>
        </div>

        {/* Net Profit */}
        <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
          <div className="flex items-start gap-3">
            <Target className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground mb-2">Net Profit</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Laba bersih setelah mengurangi semua biaya (Net Profit = Gross Profit – Fixed Costs - Bonus).
                Ini adalah sisa keuntungan usaha yang sebenarnya.
              </p>
            </div>
          </div>
        </div>

        {/* Bonus */}
        <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start gap-3">
            <Gift className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground mb-2">Bonus</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Skema insentif untuk barista jika penjualan melebihi target tertentu.
              </p>
            </div>
          </div>
        </div>
      </div>
    </InfoSheet>
  )
}

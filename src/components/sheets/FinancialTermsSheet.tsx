import { InfoSheet } from "./InfoSheet"
import { Info } from "lucide-react"

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
        <ul className="list-disc pl-6 space-y-3">
          <li>
            <span className="font-semibold">Variable COGS (Cost of Goods Sold):</span> 
            <div className="text-sm text-muted-foreground mt-1">
              Biaya bahan baku per cup kopi, misalnya susu, kopi, gula, es, dan cup. 
              Nilai ini akan naik atau turun sesuai jumlah cup yang terjual.
            </div>
          </li>
          <li>
            <span className="font-semibold">Revenue:</span> 
            <div className="text-sm text-muted-foreground mt-1">
              Total pemasukan penjualan kopi selama satu bulan, dihitung dari harga per cup × jumlah cup × jumlah hari jual.
            </div>
          </li>
          <li>
            <span className="font-semibold">Gross Profit:</span> 
            <div className="text-sm text-muted-foreground mt-1">
              Selisih antara total revenue dan total Variable COGS (Gross Profit = Revenue – Variable COGS). 
              Ini belum dikurangi biaya tetap.
            </div>
          </li>
          <li>
            <span className="font-semibold">Fixed Costs:</span> 
            <div className="text-sm text-muted-foreground mt-1">
              Biaya rutin per bulan yang harus dibayar, seperti gaji barista, sewa, depresiasi kendaraan. 
              Nilainya tetap tidak bergantung jumlah cup terjual.
            </div>
          </li>
          <li>
            <span className="font-semibold">Net Profit:</span> 
            <div className="text-sm text-muted-foreground mt-1">
              Laba bersih setelah mengurangi semua biaya (Net Profit = Gross Profit – Fixed Costs - Bonus). 
              Ini adalah sisa keuntungan usaha yang sebenarnya.
            </div>
          </li>
          <li>
            <span className="font-semibold">Bonus:</span> 
            <div className="text-sm text-muted-foreground mt-1">
              Skema insentif untuk barista jika penjualan melebihi target tertentu.
            </div>
          </li>
        </ul>
      </div>
    </InfoSheet>
  )
}

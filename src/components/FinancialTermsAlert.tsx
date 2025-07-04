import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"

export function FinancialTermsAlert() {
  return (
    <Alert className="mb-6 bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:border-blue-800">
      <Info className="h-4 w-4" />
      <AlertTitle>📊 Key Financial Terms Explained</AlertTitle>
      <AlertDescription>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>
            <span className="font-semibold">Variable COGS (Cost of Goods Sold):</span> 
            Biaya bahan baku per cup kopi, misalnya susu, kopi, gula, es, dan cup. 
            Nilai ini akan naik atau turun sesuai jumlah cup yang terjual.
          </li>
          <li>
            <span className="font-semibold">Revenue:</span> 
            Total pemasukan penjualan kopi selama satu bulan, dihitung dari harga per cup × jumlah cup × jumlah hari jual.
          </li>
          <li>
            <span className="font-semibold">Gross Profit:</span> 
            Selisih antara total revenue dan total Variable COGS (Gross Profit = Revenue – Variable COGS). 
            Ini belum dikurangi biaya tetap.
          </li>
          <li>
            <span className="font-semibold">Fixed Costs:</span> 
            Biaya rutin per bulan yang harus dibayar, seperti gaji barista, sewa, depresiasi kendaraan. 
            Nilainya tetap tidak bergantung jumlah cup terjual.
          </li>
          <li>
            <span className="font-semibold">Net Profit:</span> 
            Laba bersih setelah mengurangi semua biaya (Net Profit = Gross Profit – Fixed Costs - Bonus). 
            Ini adalah sisa keuntungan usaha yang sebenarnya.
          </li>
          <li>
            <span className="font-semibold">Bonus:</span> 
            Skema insentif untuk barista jika penjualan melebihi target tertentu.
          </li>
        </ul>
      </AlertDescription>
    </Alert>
  )
}
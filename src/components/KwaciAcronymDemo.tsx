import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { KwaciAcronymAnimation, KWACI_ACRONYMS } from './KwaciAcronymAnimation'
import { Info, Globe, Languages } from 'lucide-react'

export function KwaciAcronymDemo() {
  const [selectedAcronym, setSelectedAcronym] = useState(0)

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          KWACI Acronym Showcase
        </CardTitle>
        <CardDescription>
          Explore the different meanings behind KWACI - designed for Southeast Asian business management
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Acronym Selection */}
        <div className="flex flex-wrap gap-2">
          {KWACI_ACRONYMS.map((acronym, index) => (
            <Button
              key={index}
              variant={selectedAcronym === index ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedAcronym(index)}
              className="flex items-center gap-2"
            >
              {index === 0 && <Languages className="h-4 w-4" />}
              {index === 1 && <Globe className="h-4 w-4" />}
              {index === 2 && <span className="text-xs font-bold">ID</span>}
              {acronym.name}
            </Button>
          ))}
        </div>

        {/* Live Animation Display */}
        <div className="bg-muted/50 rounded-lg p-6 flex items-center justify-center">
          <KwaciAcronymAnimation
            acronymIndex={selectedAcronym}
            letterDuration={2000}
            cyclePause={1000}
            size="lg"
            showDescription={true}
          />
        </div>

        {/* Full Acronym Breakdown */}
        <div className="grid gap-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {KWACI_ACRONYMS[selectedAcronym].name} Version
            <Badge variant="secondary">
              {selectedAcronym === 0 ? "Recommended" : "Alternative"}
            </Badge>
          </h3>
          
          <div className="grid gap-3">
            {KWACI_ACRONYMS[selectedAcronym].acronym.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-card rounded-lg border">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                  {item.letter}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">{item.meaning}</div>
                  {item.description && (
                    <div className="text-sm text-muted-foreground">{item.description}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Usage Information */}
        <div className="bg-blue-50 dark:bg-blue-950/50 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            About KWACI Grow
          </h4>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            KWACI Grow is a comprehensive business management platform designed specifically for 
            Southeast Asian markets, with particular focus on Indonesia. The acronym reflects 
            our core values of combining local business understanding with modern technology solutions.
          </p>
        </div>

        {/* Technical Details */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Animation Details:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Each letter displays for 2 seconds</li>
            <li>Smooth fade transitions between letters</li>
            <li>3-second pause between full cycles</li>
            <li>Responsive design for all screen sizes</li>
            <li>Supports light and dark themes</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { apiFetch } from "@/lib/api"
import {
  TrendingUp,
  Users,
  Package,
  DollarSign,
  FileText,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  Globe,
  Leaf,
} from "lucide-react"

interface Listing {
  id: string
  crop: string
  quantityKg: number
  quality: string
  priceUsdPerKg: number
  status?: "active" | "pending" | "sold"
  createdAt?: string
}

const BUYERS = [
  {
    id: "b1",
    name: "EuroTrade GmbH",
    regions: ["EU"],
    crops: ["Coffee", "Tea"],
    minKg: 500,
    rating: 4.8,
    verified: true,
  },
  {
    id: "b2",
    name: "AsiaAgro Ltd",
    regions: ["Asia"],
    crops: ["Avocado", "Tea"],
    minKg: 300,
    rating: 4.6,
    verified: true,
  },
  { id: "b3", name: "GreenBeans EU", regions: ["EU"], crops: ["Coffee"], minKg: 1000, rating: 4.9, verified: true },
]

const CROP_ICONS = {
  Coffee: "☕",
  Tea: "🍃",
  Avocado: "🥑",
}

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [crop, setCrop] = useState("Coffee")
  const [quantityKg, setQuantityKg] = useState(500)
  const [quality, setQuality] = useState("AA")
  const [priceUsdPerKg, setPriceUsdPerKg] = useState(3.5)
  const [isLoading, setIsLoading] = useState(false)

  const [prices, setPrices] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      const res = await apiFetch<any>("/api/market/prices")
      if (res.data) setPrices(res.data)
    }
    load()
    const t = setInterval(load, 60_000)
    return () => clearInterval(t)
  }, [])

  const addListing = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newListing: Listing = {
      id: Math.random().toString(36).slice(2),
      crop,
      quantityKg,
      quality,
      priceUsdPerKg,
      status: "active",
      createdAt: new Date().toISOString(),
    }

    setListings((prev) => [newListing, ...prev])
    setIsLoading(false)
  }

  const matchedBuyers = useMemo(() => {
    return BUYERS.filter((b) => b.crops.includes(crop) && quantityKg >= b.minKg)
  }, [crop, quantityKg])

  // Export docs (localStorage)
  const [docOrigin, setDocOrigin] = useState("")
  const [docPhyto, setDocPhyto] = useState("")
  const [docInvoice, setDocInvoice] = useState("")
  const [docProgress, setDocProgress] = useState(0)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("exportDocs") || "null")
      if (saved) {
        setDocOrigin(saved.origin || "")
        setDocPhyto(saved.phyto || "")
        setDocInvoice(saved.invoice || "")
      }
    } catch {}
  }, [])

  useEffect(() => {
    // Calculate completion progress
    const fields = [docOrigin, docPhyto, docInvoice]
    const completed = fields.filter((field) => field.trim().length > 0).length
    setDocProgress((completed / fields.length) * 100)
  }, [docOrigin, docPhyto, docInvoice])

  const saveDocs = () => {
    localStorage.setItem("exportDocs", JSON.stringify({ origin: docOrigin, phyto: docPhyto, invoice: docInvoice }))
  }

  const previewDocs = () => {
    const preview = `Certificate of Origin: ${docOrigin}\nPhytosanitary: ${docPhyto}\nCommercial Invoice: ${docInvoice}`
    const blob = new Blob([preview], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    window.open(url, "_blank")
  }

  const totalValue = listings.reduce((sum, listing) => sum + listing.quantityKg * listing.priceUsdPerKg, 0)
  const totalQuantity = listings.reduce((sum, listing) => sum + listing.quantityKg, 0)

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="p-6 space-y-8 bg-gradient-to-br from-background via-background to-muted/20 min-h-screen">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Leaf className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold text-balance">Agricultural Marketplace</h1>
              </div>
              <p className="text-muted-foreground text-pretty">
                Connect with global buyers and manage your crop listings efficiently
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Listings</p>
                      <p className="text-2xl font-bold">{listings.length}</p>
                    </div>
                    <Package className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-chart-3">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Quantity</p>
                      <p className="text-2xl font-bold">{totalQuantity.toLocaleString()} kg</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-chart-3" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-chart-4">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                      <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-chart-4" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-chart-5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Matched Buyers</p>
                      <p className="text-2xl font-bold">{matchedBuyers.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-chart-5" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Create New Listing
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Crop Type</label>
                      <Select value={crop} onValueChange={setCrop}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select crop" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Coffee">☕ Coffee</SelectItem>
                          <SelectItem value="Tea">🍃 Tea</SelectItem>
                          <SelectItem value="Avocado">🥑 Avocado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Quantity (kg)</label>
                      <Input
                        type="number"
                        value={quantityKg}
                        onChange={(e) => setQuantityKg(Number(e.target.value))}
                        placeholder="Enter quantity"
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Quality Grade</label>
                      <Input
                        value={quality}
                        onChange={(e) => setQuality(e.target.value)}
                        placeholder="e.g., AA, Premium"
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Price (USD/kg)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={priceUsdPerKg}
                        onChange={(e) => setPriceUsdPerKg(Number(e.target.value))}
                        placeholder="Price per kg"
                        className="h-11"
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        onClick={addListing}
                        disabled={isLoading}
                        className="w-full h-11 bg-primary hover:bg-primary/90"
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Adding...
                          </div>
                        ) : (
                          "Add Listing"
                        )}
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Your Active Listings</h3>

                    {listings.length === 0 ? (
                      <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20">
                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground text-lg font-medium">No listings yet</p>
                        <p className="text-sm text-muted-foreground mt-1">Create your first listing to start selling</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {listings.map((listing) => (
                          <Card
                            key={listing.id}
                            className="border-l-4 border-l-primary/50 hover:shadow-md transition-shadow"
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="text-2xl">{CROP_ICONS[listing.crop as keyof typeof CROP_ICONS]}</div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-semibold">{listing.crop}</h4>
                                      <Badge variant="secondary" className="text-xs">
                                        {listing.quality}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Active
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {listing.quantityKg.toLocaleString()} kg • ${listing.priceUsdPerKg.toFixed(2)}/kg
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold text-primary">
                                    ${(listing.quantityKg * listing.priceUsdPerKg).toLocaleString()}
                                  </p>
                                  <p className="text-xs text-muted-foreground">Total Value</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="bg-gradient-to-r from-chart-1/5 to-chart-1/10 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-chart-1" />
                    Live Market Prices
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {prices ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Updated: {new Date(prices.updatedAt).toLocaleString()}
                      </div>

                      <div className="space-y-3">
                        {prices.crops.map((c: any, i: number) => (
                          <Card key={i} className="border-l-4 border-l-chart-1/50">
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{CROP_ICONS[c.crop as keyof typeof CROP_ICONS]}</span>
                                  <div>
                                    <p className="font-medium">{c.crop}</p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Globe className="h-3 w-3" />
                                      {c.region}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-chart-1">{c.price.toLocaleString()}</p>
                                  <p className="text-xs text-muted-foreground">{prices.currencies}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                        Loading market data...
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-sm">
              <CardHeader className="bg-gradient-to-r from-chart-5/5 to-chart-5/10 rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-chart-5" />
                  Matched Buyers for {crop}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {matchedBuyers.length === 0 ? (
                  <div className="text-center py-8 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground font-medium">No buyers match your current selection</p>
                    <p className="text-sm text-muted-foreground mt-1">Try adjusting your crop type or quantity</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {matchedBuyers.map((buyer) => (
                      <Card key={buyer.id} className="border hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">{buyer.name}</h4>
                                  {buyer.verified && (
                                    <Badge variant="secondary" className="text-xs">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Verified
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <span
                                        key={i}
                                        className={`text-xs ${i < Math.floor(buyer.rating) ? "text-yellow-400" : "text-gray-300"}`}
                                      >
                                        ★
                                      </span>
                                    ))}
                                  </div>
                                  <span className="text-xs text-muted-foreground">({buyer.rating})</span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Globe className="h-3 w-3 text-muted-foreground" />
                                <span>Regions: {buyer.regions.join(", ")}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Package className="h-3 w-3 text-muted-foreground" />
                                <span>Min order: {buyer.minKg.toLocaleString()}kg</span>
                              </div>
                            </div>

                            <Button variant="outline" size="sm" className="w-full bg-transparent">
                              Contact Buyer
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="bg-gradient-to-r from-chart-3/5 to-chart-3/10 rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-chart-3" />
                  Export Documentation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Completion Progress</span>
                    <span className="font-medium">{Math.round(docProgress)}%</span>
                  </div>
                  <Progress value={docProgress} className="h-2" />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Certificate of Origin</label>
                    <Input
                      placeholder="Enter certificate details"
                      value={docOrigin}
                      onChange={(e) => setDocOrigin(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phytosanitary Certificate</label>
                    <Input
                      placeholder="Enter phytosanitary details"
                      value={docPhyto}
                      onChange={(e) => setDocPhyto(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Commercial Invoice</label>
                    <Input
                      placeholder="Enter invoice details"
                      value={docInvoice}
                      onChange={(e) => setDocInvoice(e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={saveDocs} className="flex items-center gap-2 bg-transparent">
                    <CheckCircle className="h-4 w-4" />
                    Save Progress
                  </Button>
                  <Button onClick={previewDocs} className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Preview Documents
                  </Button>
                  <Button variant="secondary" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download Templates
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}

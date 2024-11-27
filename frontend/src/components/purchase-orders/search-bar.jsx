"use client"

import { Search, Copy, Download, Maximize2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function SearchBar({ onSearch, searchQuery }) {
  return (
    <div className="flex gap-4 items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search Purchase Orders"
          className="pl-9"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <Button variant="outline" size="icon">
        <Copy className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon">
        <Download className="h-4 w-4" />
      </Button>
    </div>
  )
}
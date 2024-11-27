"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  BarChart2,
  Package,
  Truck,
  Clock,
  DollarSign,
  FileText,
  Settings,
  HelpCircle,
  LogOut
} from "lucide-react"
import Image from "next/image"

const sidebarItems = [
  { label: 'Supply Chain', isHeader: true },
  { icon: Package, label: 'Purchase Orders', active: true },
  { icon: BarChart2, label: 'Customer Analytics' },
  { icon: Truck, label: 'Supplier Performance' },
  { label: 'Material Planning', isHeader: true },
  { icon: Package, label: 'Inventory Coverage' },
  { icon: Truck, label: 'In-Transit Inventory' },
  { icon: Clock, label: 'Inventory Forecast' },
  { label: 'Finance', isHeader: true },
  { icon: DollarSign, label: 'Purchasing' },
  { icon: BarChart2, label: 'Spend Intelligence' },
  { icon: FileText, label: 'Invoice Matching' },
  { label: 'System', isHeader: true },
  { icon: Settings, label: 'Settings' },
  { icon: HelpCircle, label: 'Help' },
  { icon: LogOut, label: 'Logout' },
]

export function Sidebar() {
  return (
    <div className="w-64 border-r bg-background">
      <div className="p-4 border-b">
        <Image 
          src="/logo.svg"
          alt="Endeavor AI Logo"
          width={150}
          height={40}
          priority
        />
      </div>
      <div className="py-4">
        {sidebarItems.map((item, index) => (
          item.isHeader ? (
            <div key={index}>
              <div className="px-4 py-2 text-sm text-muted-foreground">
                {item.label}
              </div>
              <Separator className="my-2" />
            </div>
          ) : (
            <Button
              key={index}
              variant={item.active ? "secondary" : "ghost"}
              className="w-full justify-start gap-2 px-4"
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.label}
            </Button>
          )
        ))}
      </div>
    </div>
  )
}
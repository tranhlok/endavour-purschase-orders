"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { PurchaseOrdersTable } from "@/components/purchase-orders/purchase-orders-table"

export default function PurchaseOrders() {
  const [orders, setOrders] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Add the missing handleSearch function
  const handleSearch = (value) => {
    setSearchQuery(value)
  }
  
  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/orders')
        const data = await response.json()
        setOrders(data)
      } catch (error) {
        console.error('Error fetching orders:', error)
      }
    }
    fetchOrders()
  }, [])

  // Combined search and filter logic
  const filteredOrders = orders.filter(order => {
    const matchesFilter = activeFilter === 'all' || 
      order.status.toLowerCase() === activeFilter.toLowerCase()

    const matchesSearch = !searchQuery || 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.date.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesFilter && matchesSearch
  })

  const refreshOrders = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header 
          activeFilter={activeFilter} 
          onFilterChange={setActiveFilter}
          searchQuery={searchQuery}
          onSearch={handleSearch}
        />
        <main className="flex-1 p-6 overflow-auto">
          <PurchaseOrdersTable 
            orders={filteredOrders} 
            onOrdersRefresh={refreshOrders}
          />
        </main>
      </div>
    </div>
  );
}
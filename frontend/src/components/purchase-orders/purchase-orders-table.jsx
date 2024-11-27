"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { FileText, CheckCircle2 } from "lucide-react"

const API_BASE_URL = 'http://localhost:8000/api';


export function PurchaseOrdersTable({ orders , onOrdersRefresh}) {
  const [selectedRows, setSelectedRows] = useState(new Set())

  const toggleAll = () => {
    if (selectedRows.size === orders.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(orders.map(order => order.id)))
    }
  }

  useEffect(() => {
    setSelectedRows(new Set())
  }, [orders])

  const toggleRow = (id) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedRows(newSelected)
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/orders/${orderId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            status: newStatus 
          })
        }
      );
  
      if (!response.ok) {
        // Get the error details from the response
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
  
      if (onOrdersRefresh) {
        await onOrdersRefresh();
      }
    } catch (error) {
      console.error('Error updating status:', error.message);
    }
  };

  const getStatusClass = (status) => {
    const baseClasses = "text-sm px-3 py-1 rounded-md text-center";
    
    switch (status.toLowerCase()) {
      case 'processed':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'review':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'processing':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'finalized':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return baseClasses;
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[60px] text-center">
            {orders.length > 0 && (
              <Checkbox 
                checked={selectedRows.size === orders.length}
                onCheckedChange={toggleAll}
              />
            )}
          </TableHead>
          <TableHead className="w-[120px] text-center">Request ID</TableHead>
          <TableHead className="w-[120px] text-center">Date</TableHead>
          <TableHead className="w-[100px] text-center">Request</TableHead>
          <TableHead className="w-[100px] text-center">Response</TableHead>
          <TableHead className="w-[100px] text-center">Finalized</TableHead>
          <TableHead className="w-[120px] text-center">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="w-[60px] text-center">
              <Checkbox
                checked={selectedRows.has(order.id)}
                onCheckedChange={() => toggleRow(order.id)}
              />
            </TableCell>
            <TableCell className="w-[120px] text-center">{order.id}</TableCell>
            <TableCell className="w-[120px] text-center">{order.date}</TableCell>
            <TableCell className="w-[100px] text-center">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <FileText className="h-4 w-4" />
              </Button>
            </TableCell>
            <TableCell className="w-[100px] text-center">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <FileText className="h-4 w-4" />
              </Button>
            </TableCell>
            <TableCell className="w-[100px] text-center">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <FileText className="h-4 w-4" />
              </Button>
            </TableCell>
            <TableCell className="w-[120px]">
              <div className={getStatusClass(order.status)}>
                {order.status}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
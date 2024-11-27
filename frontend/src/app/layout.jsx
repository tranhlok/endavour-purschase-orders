import { Inter } from 'next/font/google'
import '@/app/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Purchase Orders Dashboard',
  description: 'Enterprise Purchase Order Management System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
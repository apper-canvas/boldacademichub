import { useState } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "@/components/organisms/Sidebar"
import Header from "@/components/organisms/Header"

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleMenuClick = () => {
    setSidebarOpen(true)
  }

  const handleSidebarClose = () => {
    setSidebarOpen(false)
  }

  const handleQuickAdd = (type) => {
    console.log(`Quick add ${type}`)
    // This would typically open a modal or navigate to add form
  }

  return (
<div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onMenuClick={handleMenuClick} onQuickAdd={handleQuickAdd} />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
      <div id="authentication" className="hidden" />
    </div>
  )
}

export default Layout
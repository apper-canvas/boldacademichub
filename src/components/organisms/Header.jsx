import { useState } from "react"
import { format } from "date-fns"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import { useAuth } from "@/layouts/Root"

const Header = ({ onMenuClick, onQuickAdd }) => {
  const [currentDate] = useState(new Date())
  const { logout } = useAuth()

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-4 lg:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden mr-2"
            icon="Menu"
          />
          <div className="hidden lg:block">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
            <p className="text-sm text-gray-600">
              {format(currentDate, "EEEE, MMMM do, yyyy")}
            </p>
          </div>
          <div className="lg:hidden">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <ApperIcon name="GraduationCap" className="w-5 h-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                AcademicHub
              </span>
            </div>
          </div>
        </div>
<div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onQuickAdd("course")}
            icon="BookOpen"
            className="hidden sm:flex"
          >
            Add Course
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onQuickAdd("assignment")}
            icon="Plus"
          >
            <span className="hidden sm:inline">Add Assignment</span>
            <span className="sm:hidden">Add</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            icon="LogOut"
            className="text-red-600 hover:bg-red-50"
          >
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Header
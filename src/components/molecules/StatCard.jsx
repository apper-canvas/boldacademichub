import { motion } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color = "primary", 
  trend,
  className = "" 
}) => {
  const colorVariants = {
    primary: "from-primary to-primary-600",
    success: "from-green-500 to-green-600",
    warning: "from-amber-500 to-amber-600",
    error: "from-red-500 to-red-600",
    info: "from-blue-500 to-blue-600",
    accent: "from-accent to-accent-600"
  }

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={`card p-6 hover:shadow-lg transition-all duration-300 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <ApperIcon 
                name={trend.direction === "up" ? "TrendingUp" : "TrendingDown"} 
                className={`w-4 h-4 mr-1 ${trend.direction === "up" ? "text-green-500" : "text-red-500"}`}
              />
              <span className={`text-sm font-medium ${trend.direction === "up" ? "text-green-600" : "text-red-600"}`}>
                {trend.value}
              </span>
            </div>
          )}
        </div>
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorVariants[color]} flex items-center justify-center shadow-lg`}>
          <ApperIcon name={icon} className="w-7 h-7 text-white" />
        </div>
      </div>
    </motion.div>
  )
}

export default StatCard
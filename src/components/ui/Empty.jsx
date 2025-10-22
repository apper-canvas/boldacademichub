import { motion } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"

const Empty = ({ 
  title = "Nothing here yet", 
  description = "Get started by adding your first item",
  actionLabel = "Add Item",
  onAction,
  icon = "Plus"
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-12 text-center"
    >
      <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mb-6">
        <ApperIcon name={icon} className="w-10 h-10 text-primary" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        {title}
      </h3>
      <p className="text-gray-600 mb-8 max-w-md">{description}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="btn-primary text-lg px-6 py-3"
        >
          <ApperIcon name={icon} className="w-5 h-5" />
          {actionLabel}
        </button>
      )}
    </motion.div>
  )
}

export default Empty
import { forwardRef } from "react"
import { cn } from "@/utils/cn"
import ApperIcon from "@/components/ApperIcon"

const Button = forwardRef(({ 
  children, 
  className, 
  variant = "primary", 
  size = "md", 
  icon,
  iconPosition = "left",
  loading = false,
  disabled,
  ...props 
}, ref) => {
  const baseClasses = "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
  
  const variants = {
    primary: "bg-gradient-to-r from-primary to-primary-700 text-white hover:from-primary-600 hover:to-primary-800 hover:shadow-lg transform hover:-translate-y-0.5 focus:ring-primary-500",
    secondary: "bg-white text-primary border border-primary hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 focus:ring-primary-500",
    accent: "bg-gradient-to-r from-accent to-accent-600 text-white hover:from-accent-600 hover:to-accent-700 hover:shadow-lg transform hover:-translate-y-0.5 focus:ring-accent-500",
    outline: "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-500",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
    danger: "bg-gradient-to-r from-error to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:shadow-lg transform hover:-translate-y-0.5 focus:ring-error"
  }
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
    xl: "px-8 py-4 text-xl"
  }

  return (
    <button
      ref={ref}
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <ApperIcon name="Loader2" className="w-4 h-4 animate-spin" />}
      {!loading && icon && iconPosition === "left" && <ApperIcon name={icon} className="w-4 h-4" />}
      {children}
      {!loading && icon && iconPosition === "right" && <ApperIcon name={icon} className="w-4 h-4" />}
    </button>
  )
})

Button.displayName = "Button"

export default Button
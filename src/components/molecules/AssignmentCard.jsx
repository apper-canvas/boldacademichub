import { motion } from "framer-motion";
import { addDays, format, isAfter, isBefore } from "date-fns";
import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";

const AssignmentCard = ({ assignment, course, onEdit, onDelete, onStatusChange }) => {
  const dueDate = new Date(assignment.due_date_c)
  const now = new Date()
  const isOverdue = isBefore(dueDate, now) && assignment.status_c !== "completed" && assignment.status_c !== "submitted"
  const isDueSoon = isBefore(dueDate, addDays(now, 3)) && isAfter(dueDate, now)

  const getStatusColor = () => {
    switch (assignment.status_c) {
      case "completed": return "success"
      case "submitted": return "info"
      case "in-progress": return "warning"
      default: return "default"
    }
  }

const getPriorityIcon = () => {
    switch (assignment.priority_c) {
      case "high": return "AlertTriangle"
      case "medium": return "Minus"
      default: return "Circle"
    }
  }
  const handleStatusChange = (newStatus) => {
    onStatusChange(assignment.Id, newStatus)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="card p-6 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
<h3 className="text-lg font-semibold text-gray-900">{assignment.title_c}</h3>
            <Badge variant={assignment.priority_c}>
              <ApperIcon name={getPriorityIcon()} className="w-3 h-3 mr-1" />
              {assignment.priority_c}
            </Badge>
            <Badge variant={getStatusColor()}>
              {assignment.status_c}
            </Badge>
          </div>
          
<div className="flex items-center text-sm text-gray-600 mb-2">
            <div 
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: course?.color_c || "#6B46C1" }}
            />
            <span>{course?.name_c || "Unknown Course"}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600 mb-3">
            <ApperIcon name="Calendar" className="w-4 h-4 mr-2" />
            <span className={isOverdue ? "text-red-600 font-medium" : isDueSoon ? "text-amber-600 font-medium" : ""}>
              Due: {format(dueDate, "MMM dd, yyyy 'at' h:mm a")}
            </span>
          </div>

{assignment.description_c && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {assignment.description_c}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-500">
<div className="flex items-center">
                <ApperIcon name="FileText" className="w-4 h-4 mr-1" />
                <span>{assignment.type_c}</span>
              </div>
              <div className="flex items-center">
                <ApperIcon name="Target" className="w-4 h-4 mr-1" />
                <span>{assignment.points_c} pts</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(assignment)}
            icon="Edit2"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(assignment.Id)}
            icon="Trash2"
          />
        </div>
      </div>

{assignment.status_c === "pending" && (
        <div className="flex gap-2 pt-4 border-t border-gray-100">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleStatusChange("in-progress")}
            icon="Play"
          >
            Start Working
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={() => handleStatusChange("submitted")}
            icon="Send"
          >
            Mark Submitted
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleStatusChange("completed")}
            icon="Check"
          >
            Mark Complete
          </Button>
        </div>
      )}

{assignment.status_c === "in-progress" && (
        <div className="flex gap-2 pt-4 border-t border-gray-100">
          <Button
            variant="accent"
            size="sm"
            onClick={() => handleStatusChange("submitted")}
            icon="Send"
          >
            Mark Submitted
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleStatusChange("completed")}
            icon="Check"
          >
            Mark Complete
          </Button>
        </div>
      )}
    </motion.div>
  )
}

export default AssignmentCard
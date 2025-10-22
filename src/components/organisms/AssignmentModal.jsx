import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import Select from "@/components/atoms/Select"
import Textarea from "@/components/atoms/Textarea"

const AssignmentModal = ({ isOpen, onClose, onSubmit, assignment = null, courses = [] }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courseId: "",
    dueDate: "",
    priority: "medium",
    type: "Assignment",
    points: ""
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (assignment) {
      const dueDate = new Date(assignment.dueDate)
      setFormData({
        title: assignment.title || "",
        description: assignment.description || "",
        courseId: assignment.courseId?.toString() || "",
        dueDate: format(dueDate, "yyyy-MM-dd'T'HH:mm"),
        priority: assignment.priority || "medium",
        type: assignment.type || "Assignment",
        points: assignment.points?.toString() || ""
      })
    } else {
      setFormData({
        title: "",
        description: "",
        courseId: courses[0]?.Id?.toString() || "",
        dueDate: "",
        priority: "medium",
        type: "Assignment",
        points: ""
      })
    }
  }, [assignment, courses])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const assignmentData = {
        ...formData,
        courseId: parseInt(formData.courseId),
        dueDate: new Date(formData.dueDate).toISOString(),
        points: parseInt(formData.points),
        status: assignment?.status || "pending"
      }
      
      await onSubmit(assignmentData)
      onClose()
    } catch (error) {
      console.error("Failed to save assignment:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const assignmentTypes = [
    "Assignment",
    "Project",
    "Essay",
    "Lab Assignment",
    "Programming Assignment",
    "Lab Report",
    "Documentation",
    "Exam",
    "Quiz",
    "Presentation"
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {assignment ? "Edit Assignment" : "Add New Assignment"}
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ApperIcon name="X" className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Assignment Title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="e.g., Binary Search Tree Implementation"
                    required
                  />

                  <Select
                    label="Course"
                    value={formData.courseId}
                    onChange={(e) => handleInputChange("courseId", e.target.value)}
                    required
                  >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course.Id} value={course.Id.toString()}>
                        {course.name}
                      </option>
                    ))}
                  </Select>

                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Type"
                      value={formData.type}
                      onChange={(e) => handleInputChange("type", e.target.value)}
                    >
                      {assignmentTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </Select>

                    <Select
                      label="Priority"
                      value={formData.priority}
                      onChange={(e) => handleInputChange("priority", e.target.value)}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Due Date & Time"
                      type="datetime-local"
                      value={formData.dueDate}
                      onChange={(e) => handleInputChange("dueDate", e.target.value)}
                      required
                    />

                    <Input
                      label="Points"
                      type="number"
                      min="1"
                      value={formData.points}
                      onChange={(e) => handleInputChange("points", e.target.value)}
                      placeholder="100"
                      required
                    />
                  </div>

                  <Textarea
                    label="Description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Detailed description of the assignment..."
                    rows={4}
                  />

                  <div className="flex justify-end gap-3 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      loading={loading}
                    >
                      {assignment ? "Update Assignment" : "Add Assignment"}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default AssignmentModal
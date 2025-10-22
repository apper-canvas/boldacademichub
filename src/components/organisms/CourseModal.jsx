import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import Select from "@/components/atoms/Select"

const CourseModal = ({ isOpen, onClose, onSubmit, course = null }) => {
  const [formData, setFormData] = useState({
    name: "",
    instructor: "",
    room: "",
    credits: "",
    semester: "Fall 2024",
    color: "#6B46C1"
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name || "",
        instructor: course.instructor || "",
        room: course.room || "",
        credits: course.credits?.toString() || "",
        semester: course.semester || "Fall 2024",
        color: course.color || "#6B46C1"
      })
    } else {
      setFormData({
        name: "",
        instructor: "",
        room: "",
        credits: "",
        semester: "Fall 2024",
        color: "#6B46C1"
      })
    }
  }, [course])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const courseData = {
        ...formData,
        credits: parseInt(formData.credits),
        schedule: [] // This would be set in a separate step or form
      }
      
      await onSubmit(courseData)
      onClose()
    } catch (error) {
      console.error("Failed to save course:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const colorOptions = [
    { value: "#6B46C1", label: "Purple", color: "#6B46C1" },
    { value: "#059669", label: "Green", color: "#059669" },
    { value: "#DC2626", label: "Red", color: "#DC2626" },
    { value: "#7C3AED", label: "Violet", color: "#7C3AED" },
    { value: "#F59E0B", label: "Amber", color: "#F59E0B" },
    { value: "#3B82F6", label: "Blue", color: "#3B82F6" },
    { value: "#EF4444", label: "Rose", color: "#EF4444" },
    { value: "#10B981", label: "Emerald", color: "#10B981" }
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
              className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {course ? "Edit Course" : "Add New Course"}
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
                    label="Course Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="e.g., Data Structures & Algorithms"
                    required
                  />

                  <Input
                    label="Instructor"
                    value={formData.instructor}
                    onChange={(e) => handleInputChange("instructor", e.target.value)}
                    placeholder="e.g., Dr. Sarah Johnson"
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Room"
                      value={formData.room}
                      onChange={(e) => handleInputChange("room", e.target.value)}
                      placeholder="e.g., CS 201"
                      required
                    />

                    <Input
                      label="Credits"
                      type="number"
                      min="1"
                      max="6"
                      value={formData.credits}
                      onChange={(e) => handleInputChange("credits", e.target.value)}
                      placeholder="3"
                      required
                    />
                  </div>

                  <Select
                    label="Semester"
                    value={formData.semester}
                    onChange={(e) => handleInputChange("semester", e.target.value)}
                  >
                    <option value="Fall 2024">Fall 2024</option>
                    <option value="Spring 2024">Spring 2024</option>
                    <option value="Summer 2024">Summer 2024</option>
                    <option value="Fall 2023">Fall 2023</option>
                  </Select>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Course Color
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {colorOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleInputChange("color", option.value)}
                          className={`w-full h-12 rounded-lg border-2 flex items-center justify-center transition-all ${
                            formData.color === option.value
                              ? "border-gray-800 shadow-lg transform scale-105"
                              : "border-gray-200 hover:border-gray-400"
                          }`}
                          style={{ backgroundColor: option.color }}
                        >
                          {formData.color === option.value && (
                            <ApperIcon name="Check" className="w-5 h-5 text-white" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

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
                      {course ? "Update Course" : "Add Course"}
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

export default CourseModal
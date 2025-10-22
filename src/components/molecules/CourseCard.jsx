import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"

const CourseCard = ({ course, onEdit, onDelete }) => {
  const navigate = useNavigate()

  const handleViewAssignments = () => {
navigate(`/assignments?course=${course.Id}`)
  }

  const handleViewGrades = () => {
    navigate(`/grades?course=${course.Id}`)
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="card overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      <div 
        className="h-3 bg-gradient-to-r"
style={{ 
          background: `linear-gradient(90deg, ${course.color_c} 0%, ${course.color_c}CC 100%)` 
        }}
      >
        <div className="flex-1">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
              {course.name_c}
            </h3>
            <div className="flex items-center text-gray-600 mb-2">
              <ApperIcon name="User" className="w-4 h-4 mr-2" />
              <span className="text-sm">{course.instructor_c}</span>
            </div>
            <div className="flex items-center text-gray-600 mb-2">
              <ApperIcon name="MapPin" className="w-4 h-4 mr-2" />
              <span className="text-sm">{course.room_c}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <ApperIcon name="BookOpen" className="w-4 h-4 mr-2" />
              <span className="text-sm">{course.credits_c} Credits</span>
            </div>
          </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(course)}
              icon="Edit2"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(course.Id)}
              icon="Trash2"
            />
          </div>
        </div>
        
<div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          <span className="font-medium">Semester:</span> {course.semester_c}
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleViewAssignments}
            icon="FileText"
            className="flex-1"
          >
            Assignments
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleViewGrades}
            icon="BarChart3"
            className="flex-1"
          >
            Grades
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

export default CourseCard
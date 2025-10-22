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
          background: `linear-gradient(90deg, ${course.color} 0%, ${course.color}CC 100%)` 
        }}
      />
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
              {course.name}
            </h3>
            <div className="flex items-center text-gray-600 mb-2">
              <ApperIcon name="User" className="w-4 h-4 mr-2" />
              <span className="text-sm">{course.instructor}</span>
            </div>
            <div className="flex items-center text-gray-600 mb-2">
              <ApperIcon name="MapPin" className="w-4 h-4 mr-2" />
              <span className="text-sm">{course.room}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <ApperIcon name="BookOpen" className="w-4 h-4 mr-2" />
              <span className="text-sm">{course.credits} Credits</span>
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
        
        <div className="space-y-2 mb-6">
          <h4 className="text-sm font-semibold text-gray-700">Schedule:</h4>
          {course.schedule.map((slot, index) => (
            <div key={index} className="flex items-center text-sm text-gray-600">
              <ApperIcon name="Clock" className="w-3 h-3 mr-2" />
              <span>{slot.day}: {slot.time}</span>
            </div>
          ))}
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
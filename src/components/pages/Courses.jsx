import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { courseService } from "@/services/api/courseService";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import CourseModal from "@/components/organisms/CourseModal";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";
import CourseCard from "@/components/molecules/CourseCard";
import SearchBar from "@/components/molecules/SearchBar";

const Courses = () => {
  const [courses, setCourses] = useState([])
  const [filteredCourses, setFilteredCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadCourses()
  }, [])

  useEffect(() => {
    filterCourses()
  }, [courses, searchQuery])

  const loadCourses = async () => {
    try {
      setError(null)
      setLoading(true)
      const data = await courseService.getAll()
      setCourses(data)
    } catch (err) {
      setError(err.message || "Failed to load courses")
    } finally {
      setLoading(false)
    }
  }

  const filterCourses = () => {
    if (!searchQuery.trim()) {
      setFilteredCourses(courses)
    } else {
      const query = searchQuery.toLowerCase()
const filtered = courses.filter(course => 
        course.name_c?.toLowerCase().includes(query) ||
        course.instructor_c?.toLowerCase().includes(query) ||
        course.semester_c?.toLowerCase().includes(query)
      )
      setFilteredCourses(filtered)
    }
  }

  const handleAddCourse = () => {
    setEditingCourse(null)
    setModalOpen(true)
  }

  const handleEditCourse = (course) => {
    setEditingCourse(course)
    setModalOpen(true)
  }

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return
    }

    try {
      await courseService.delete(courseId)
      setCourses(prev => prev.filter(course => course.Id !== courseId))
      toast.success("Course deleted successfully!")
    } catch (err) {
      toast.error("Failed to delete course")
    }
  }

  const handleSubmitCourse = async (courseData) => {
    try {
      if (editingCourse) {
        const updatedCourse = await courseService.update(editingCourse.Id, courseData)
        setCourses(prev => prev.map(course => 
          course.Id === editingCourse.Id ? updatedCourse : course
        ))
        toast.success("Course updated successfully!")
      } else {
        const newCourse = await courseService.create(courseData)
        setCourses(prev => [...prev, newCourse])
        toast.success("Course added successfully!")
      }
    } catch (err) {
      toast.error(`Failed to ${editingCourse ? "update" : "add"} course`)
      throw err
    }
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
  }

  if (loading) return <Loading variant="cards" />
  if (error) return <Error message={error} onRetry={loadCourses} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-600 mt-1">
            Manage your {courses.length} course{courses.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          onClick={handleAddCourse}
          icon="Plus"
          size="lg"
        >
          Add Course
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            placeholder="Search courses, instructors, or semesters..."
            onSearch={handleSearch}
          />
        </div>
      </div>

{/* Statistics */}
      {courses.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-primary">{courses.length}</div>
            <div className="text-sm text-gray-600">Total Courses</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-accent">
              {courses.reduce((sum, course) => sum + (course.credits_c || 0), 0)}
            </div>
            <div className="text-xs text-gray-600 mt-1">Total Credits</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-success">
              {new Set(courses.map(c => c.instructor_c)).size}
            </div>
            <div className="text-xs text-gray-600 mt-1">Instructors</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-info">
              {new Set(courses.map(c => c.semester_c)).size}
            </div>
            <div className="text-sm text-gray-600">Semesters</div>
          </div>
        </div>
      )}

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <Empty
          title={searchQuery ? "No courses found" : "No courses yet"}
          description={searchQuery ? 
            "No courses match your search criteria. Try different keywords or add a new course." :
            "Start building your academic schedule by adding your first course."
          }
          actionLabel="Add Course"
          icon="BookOpen"
          onAction={handleAddCourse}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <CourseCard
                course={course}
                onEdit={handleEditCourse}
                onDelete={handleDeleteCourse}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Search Results Info */}
      {searchQuery && (
        <div className="flex items-center justify-center text-sm text-gray-500 py-4">
          <ApperIcon name="Search" className="w-4 h-4 mr-2" />
          Showing {filteredCourses.length} result{filteredCourses.length !== 1 ? "s" : ""} for "{searchQuery}"
        </div>
      )}

      {/* Course Modal */}
      <CourseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitCourse}
        course={editingCourse}
      />
    </div>
  )
}

export default Courses
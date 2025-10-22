import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useSearchParams } from "react-router-dom"
import { assignmentService } from "@/services/api/assignmentService"
import { courseService } from "@/services/api/courseService"
import AssignmentCard from "@/components/molecules/AssignmentCard"
import AssignmentModal from "@/components/organisms/AssignmentModal"
import SearchBar from "@/components/molecules/SearchBar"
import Button from "@/components/atoms/Button"
import Select from "@/components/atoms/Select"
import Badge from "@/components/atoms/Badge"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import ApperIcon from "@/components/ApperIcon"
import { toast } from "react-toastify"

const Assignments = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [assignments, setAssignments] = useState([])
  const [courses, setCourses] = useState([])
  const [filteredAssignments, setFilteredAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState(null)
  const [filters, setFilters] = useState({
    search: "",
    course: searchParams.get("course") || "",
    status: "",
    priority: ""
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterAssignments()
  }, [assignments, courses, filters])

  const loadData = async () => {
    try {
      setError(null)
      setLoading(true)
      const [assignmentsData, coursesData] = await Promise.all([
        assignmentService.getAll(),
        courseService.getAll()
      ])
      setAssignments(assignmentsData)
      setCourses(coursesData)
    } catch (err) {
      setError(err.message || "Failed to load assignments")
    } finally {
      setLoading(false)
    }
  }

  const filterAssignments = () => {
    let filtered = [...assignments]

    // Search filter
if (filters.search.trim()) {
      const query = filters.search.toLowerCase()
      filtered = filtered.filter(assignment => 
        assignment.title_c?.toLowerCase().includes(query) ||
        assignment.description_c?.toLowerCase().includes(query) ||
        assignment.type_c?.toLowerCase().includes(query)
      )
    }

    // Course filter
    if (filters.course) {
      filtered = filtered.filter(assignment => {
        const assignmentCourseId = assignment.course_id_c?.Id || assignment.course_id_c
        return assignmentCourseId === parseInt(filters.course)
      })
    }

// Status filter
    if (filters.status) {
      filtered = filtered.filter(assignment => 
        assignment.status_c === filters.status
      )
    }

    // Priority filter
    if (filters.priority) {
      filtered = filtered.filter(assignment => 
        assignment.priority_c === filters.priority
      )
    }

// Sort by due date
    filtered.sort((a, b) => new Date(a.due_date_c) - new Date(b.due_date_c))

    setFilteredAssignments(filtered)
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    
    // Update URL params for course filter
    if (key === "course") {
      if (value) {
        setSearchParams({ course: value })
      } else {
        setSearchParams({})
      }
    }
  }

  const handleAddAssignment = () => {
    setEditingAssignment(null)
    setModalOpen(true)
  }

  const handleEditAssignment = (assignment) => {
    setEditingAssignment(assignment)
    setModalOpen(true)
  }

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm("Are you sure you want to delete this assignment? This action cannot be undone.")) {
      return
    }

    try {
      await assignmentService.delete(assignmentId)
      setAssignments(prev => prev.filter(assignment => assignment.Id !== assignmentId))
      toast.success("Assignment deleted successfully!")
    } catch (err) {
      toast.error("Failed to delete assignment")
    }
  }

  const handleSubmitAssignment = async (assignmentData) => {
    try {
      if (editingAssignment) {
        const updatedAssignment = await assignmentService.update(editingAssignment.Id, assignmentData)
        setAssignments(prev => prev.map(assignment => 
          assignment.Id === editingAssignment.Id ? updatedAssignment : assignment
        ))
        toast.success("Assignment updated successfully!")
      } else {
        const newAssignment = await assignmentService.create(assignmentData)
        setAssignments(prev => [...prev, newAssignment])
        toast.success("Assignment added successfully!")
      }
    } catch (err) {
      toast.error(`Failed to ${editingAssignment ? "update" : "add"} assignment`)
      throw err
    }
  }

  const handleStatusChange = async (assignmentId, newStatus) => {
    try {
      await assignmentService.updateStatus(assignmentId, newStatus)
      setAssignments(prev => prev.map(assignment => 
        assignment.Id === assignmentId 
          ? { ...assignment, status: newStatus }
          : assignment
      ))
      toast.success("Assignment status updated successfully!")
    } catch (err) {
      toast.error("Failed to update assignment status")
    }
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      course: "",
      status: "",
      priority: ""
    })
    setSearchParams({})
  }

  if (loading) return <Loading variant="cards" />
  if (error) return <Error message={error} onRetry={loadData} />

  const activeFiltersCount = Object.values(filters).filter(value => value.trim()).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600 mt-1">
            Track and manage your {assignments.length} assignment{assignments.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          onClick={handleAddAssignment}
          icon="Plus"
          size="lg"
        >
          Add Assignment
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="card p-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              placeholder="Search assignments..."
              onSearch={(query) => handleFilterChange("search", query)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select
              value={filters.course}
              onChange={(e) => handleFilterChange("course", e.target.value)}
              className="w-full sm:w-48"
            >
              <option value="">All Courses</option>
{courses.map((course) => (
                <option key={course.Id} value={course.Id.toString()}>
                  {course.name_c}
                </option>
              ))}
            </Select>
            
            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full sm:w-40"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="submitted">Submitted</option>
              <option value="completed">Completed</option>
            </Select>

            <Select
              value={filters.priority}
              onChange={(e) => handleFilterChange("priority", e.target.value)}
              className="w-full sm:w-36"
            >
              <option value="">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
          </div>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-500">Active filters:</span>
            {filters.course && (
              <Badge variant="info">
Course: {courses.find(c => c.Id === parseInt(filters.course))?.name_c || "Unknown"}
              </Badge>
            )}
            {filters.status && <Badge variant="info">Status: {filters.status}</Badge>}
            {filters.priority && <Badge variant="info">Priority: {filters.priority}</Badge>}
            {filters.search && <Badge variant="info">Search: "{filters.search}"</Badge>}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Statistics */}
      {assignments.length > 0 && (
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {assignments.filter(a => a.status_c === "pending").length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-info">
              {assignments.filter(a => a.status_c === "in-progress").length}
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-warning">
              {assignments.filter(a => a.status_c === "submitted").length}
            </div>
            <div className="text-sm text-gray-600">Submitted</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-success">
              {assignments.filter(a => a.status_c === "completed").length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </div>
      )}

      {/* Assignments List */}
      {filteredAssignments.length === 0 ? (
        <Empty
          title={activeFiltersCount > 0 ? "No assignments found" : "No assignments yet"}
          description={activeFiltersCount > 0 ? 
            "No assignments match your current filters. Try adjusting your search criteria or add a new assignment." :
            "Start organizing your academic work by adding your first assignment."
          }
          actionLabel="Add Assignment"
          icon="FileText"
          onAction={handleAddAssignment}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
{filteredAssignments.map((assignment, index) => {
            const courseId = assignment.course_id_c?.Id || assignment.course_id_c
            const course = courses.find(c => c.Id === courseId)
            return (
              <motion.div
                key={assignment.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <AssignmentCard
                  assignment={assignment}
                  course={course}
                  onEdit={handleEditAssignment}
                  onDelete={handleDeleteAssignment}
                  onStatusChange={handleStatusChange}
                />
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Results Info */}
      {activeFiltersCount > 0 && filteredAssignments.length > 0 && (
        <div className="flex items-center justify-center text-sm text-gray-500 py-4">
          <ApperIcon name="Filter" className="w-4 h-4 mr-2" />
          Showing {filteredAssignments.length} of {assignments.length} assignment{assignments.length !== 1 ? "s" : ""}
        </div>
      )}

      {/* Assignment Modal */}
      <AssignmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitAssignment}
        assignment={editingAssignment}
        courses={courses}
      />
    </div>
  )
}

export default Assignments
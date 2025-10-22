import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { format, isAfter, isBefore, addDays } from "date-fns"
import { courseService } from "@/services/api/courseService"
import { assignmentService } from "@/services/api/assignmentService"
import { gradeService } from "@/services/api/gradeService"
import StatCard from "@/components/molecules/StatCard"
import AssignmentCard from "@/components/molecules/AssignmentCard"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import { toast } from "react-toastify"

const Dashboard = () => {
  const [courses, setCourses] = useState([])
  const [assignments, setAssignments] = useState([])
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setError(null)
      setLoading(true)
      
      const [coursesData, assignmentsData, gradesData] = await Promise.all([
        courseService.getAll(),
        assignmentService.getAll(),
        gradeService.getAll()
      ])
      
      setCourses(coursesData)
      setAssignments(assignmentsData)
      setGrades(gradesData)
    } catch (err) {
      setError(err.message || "Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const handleAssignmentStatusChange = async (assignmentId, newStatus) => {
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

  if (loading) return <Loading variant="cards" />
  if (error) return <Error message={error} onRetry={loadDashboardData} />

  const now = new Date()
  
  // Calculate dashboard statistics
  const upcomingAssignments = assignments.filter(assignment => {
    const dueDate = new Date(assignment.dueDate)
    return isAfter(dueDate, now) && assignment.status !== "completed" && assignment.status !== "submitted"
  })

  const overdueAssignments = assignments.filter(assignment => {
    const dueDate = new Date(assignment.dueDate)
    return isBefore(dueDate, now) && assignment.status !== "completed" && assignment.status !== "submitted"
  })

  const dueSoonAssignments = assignments.filter(assignment => {
    const dueDate = new Date(assignment.dueDate)
    return isAfter(dueDate, now) && isBefore(dueDate, addDays(now, 7)) && assignment.status !== "completed" && assignment.status !== "submitted"
  })

  const recentAssignments = [...assignments]
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 6)

  // Calculate overall GPA
  const courseGrades = {}
  grades.forEach(grade => {
    if (!courseGrades[grade.courseId]) {
      courseGrades[grade.courseId] = []
    }
    courseGrades[grade.courseId].push(grade)
  })

  const courseGPAs = Object.entries(courseGrades).map(([courseId, courseGradeList]) => {
    const totalWeight = courseGradeList.reduce((sum, grade) => sum + grade.weight, 0)
    const weightedScore = courseGradeList.reduce((sum, grade) => {
      const percentage = (grade.score / grade.maxScore) * 100
      return sum + (percentage * grade.weight / 100)
    }, 0)
    const courseAverage = totalWeight > 0 ? weightedScore / (totalWeight / 100) : 0
    const course = courses.find(c => c.Id === parseInt(courseId))
    return {
      courseId: parseInt(courseId),
      courseName: course?.name || "Unknown Course",
      credits: course?.credits || 3,
      average: courseAverage
    }
  })

  const totalCredits = courseGPAs.reduce((sum, course) => sum + course.credits, 0)
  const totalGradePoints = courseGPAs.reduce((sum, course) => {
    const gradePoint = course.average >= 97 ? 4.0 : 
                      course.average >= 93 ? 3.7 :
                      course.average >= 90 ? 3.3 :
                      course.average >= 87 ? 3.0 :
                      course.average >= 83 ? 2.7 :
                      course.average >= 80 ? 2.3 :
                      course.average >= 77 ? 2.0 :
                      course.average >= 73 ? 1.7 :
                      course.average >= 70 ? 1.3 :
                      course.average >= 67 ? 1.0 : 0
    return sum + (gradePoint * course.credits)
  }, 0)

  const overallGPA = totalCredits > 0 ? totalGradePoints / totalCredits : 0

  const completedAssignments = assignments.filter(a => a.status === "completed").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            {format(now, "EEEE, MMMM do, yyyy")}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Courses"
          value={courses.length}
          subtitle={`${courses.length} course${courses.length !== 1 ? "s" : ""} enrolled`}
          icon="BookOpen"
          color="primary"
        />
        <StatCard
          title="Upcoming Assignments"
          value={upcomingAssignments.length}
          subtitle={`${dueSoonAssignments.length} due this week`}
          icon="FileText"
          color="info"
        />
        <StatCard
          title="Current GPA"
          value={overallGPA.toFixed(2)}
          subtitle={`Based on ${courseGPAs.length} course${courseGPAs.length !== 1 ? "s" : ""}`}
          icon="BarChart3"
          color="success"
        />
        <StatCard
          title="Completed Tasks"
          value={completedAssignments}
          subtitle={`${assignments.length - completedAssignments} remaining`}
          icon="CheckCircle"
          color="accent"
        />
      </div>

      {/* Alert for overdue assignments */}
      {overdueAssignments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 border-l-4 border-error bg-red-50"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-error/10 rounded-full flex items-center justify-center">
                <span className="text-error text-lg font-bold">{overdueAssignments.length}</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-error">Overdue Assignments</h3>
              <p className="text-error/80">
                You have {overdueAssignments.length} assignment{overdueAssignments.length !== 1 ? "s" : ""} past due. 
                Please review and complete them as soon as possible.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recent Assignments */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Recent Assignments</h2>
          <span className="text-sm text-gray-500">Next {recentAssignments.length} assignments</span>
        </div>

        {recentAssignments.length === 0 ? (
          <Empty
            title="No assignments yet"
            description="You haven't added any assignments. Start by creating your first assignment."
            actionLabel="Add Assignment"
            icon="Plus"
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recentAssignments.map((assignment) => {
              const course = courses.find(c => c.Id === assignment.courseId)
              return (
                <AssignmentCard
                  key={assignment.Id}
                  assignment={assignment}
                  course={course}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  onStatusChange={handleAssignmentStatusChange}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Quick Course Overview */}
      {courses.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Course Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => {
              const courseAssignments = assignments.filter(a => a.courseId === course.Id)
              const completedCount = courseAssignments.filter(a => a.status === "completed" || a.status === "submitted").length
              const totalCount = courseAssignments.length
              
              const courseGrade = courseGPAs.find(g => g.courseId === course.Id)
              
              return (
                <motion.div
                  key={course.Id}
                  whileHover={{ y: -2, scale: 1.02 }}
                  className="card p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: course.color }}
                    />
                    <div className="text-right">
                      <div className="text-sm text-gray-500">{course.credits} credits</div>
                      {courseGrade && (
                        <div className="text-lg font-bold text-primary">
                          {courseGrade.average.toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {course.name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-3">{course.instructor}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {completedCount}/{totalCount} assignments
                    </span>
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
                          style={{ width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : "0%" }}
                        />
                      </div>
                      <span className="text-primary font-medium">
                        {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
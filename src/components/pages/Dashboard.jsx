import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { addDays, format, isAfter, isBefore } from "date-fns";
import { courseService } from "@/services/api/courseService";
import { assignmentService } from "@/services/api/assignmentService";
import { gradeService } from "@/services/api/gradeService";
import { toast } from "react-toastify";
import Assignments from "@/components/pages/Assignments";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";
import AssignmentCard from "@/components/molecules/AssignmentCard";
import StatCard from "@/components/molecules/StatCard";

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
          ? { ...assignment, status_c: newStatus }
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
const dueDate = new Date(assignment.due_date_c)
    return isAfter(dueDate, now) && assignment.status_c !== "completed" && assignment.status_c !== "submitted"
  })

  const overdueAssignments = assignments.filter(assignment => {
const dueDate = new Date(assignment.due_date_c)
    return isBefore(dueDate, now) && assignment.status_c !== "completed" && assignment.status_c !== "submitted"
  })

  const dueSoonAssignments = assignments.filter(assignment => {
const dueDate = new Date(assignment.due_date_c)
    return isAfter(dueDate, now) && isBefore(dueDate, addDays(now, 7)) && assignment.status_c !== "completed" && assignment.status_c !== "submitted"
  })

const recentAssignments = [...assignments]
    .sort((a, b) => new Date(a.due_date_c) - new Date(b.due_date_c))
    .slice(0, 6)

  // Calculate overall GPA
  const courseGrades = {}
  grades.forEach(grade => {
const courseId = grade.course_id_c?.Id || grade.course_id_c
    if (!courseGrades[courseId]) {
      courseGrades[courseId] = []
    }
    courseGrades[courseId].push(grade)
  })

const courseGPAs = Object.keys(courseGrades).map(courseId => {
    const courseGradeList = courseGrades[courseId]
    const totalWeight = courseGradeList.reduce((sum, grade) => sum + (grade.weight_c || 0), 0)
    const weightedScore = courseGradeList.reduce((sum, grade) => {
      const maxScore = grade.max_score_c || 100
      const score = grade.score_c || 0
      const weight = grade.weight_c || 0
      const percentage = (score / maxScore) * 100
      return sum + (percentage * weight / 100)
    }, 0)
    const courseAverage = totalWeight > 0 ? weightedScore / (totalWeight / 100) : 0
    const course = courses.find(c => c.Id === parseInt(courseId))
    
    const gradePoint = courseAverage >= 97 ? 4.0 : 
                      courseAverage >= 93 ? 3.7 :
                      courseAverage >= 90 ? 3.3 :
                      courseAverage >= 87 ? 3.0 :
                      courseAverage >= 83 ? 2.7 :
                      courseAverage >= 80 ? 2.3 :
                      courseAverage >= 77 ? 2.0 :
                      courseAverage >= 73 ? 1.7 :
                      courseAverage >= 70 ? 1.3 :
                      courseAverage >= 67 ? 1.0 : 0
    
    const letterGrade = courseAverage >= 97 ? "A+" :
                       courseAverage >= 93 ? "A" :
                       courseAverage >= 90 ? "A-" :
                       courseAverage >= 87 ? "B+" :
                       courseAverage >= 83 ? "B" :
                       courseAverage >= 80 ? "B-" :
                       courseAverage >= 77 ? "C+" :
                       courseAverage >= 73 ? "C" :
                       courseAverage >= 70 ? "C-" :
                       courseAverage >= 67 ? "D+" :
                       courseAverage >= 60 ? "D" : "F"
    
    return {
      courseId,
      courseName: course?.name_c || "Unknown Course",
      credits: course?.credits_c || 3,
      average: courseAverage,
      gradePoint,
      letterGrade
    }
  });

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

  const completedAssignments = assignments.filter(a => a.status_c === "completed" || a.status_c === "submitted").length
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
const courseId = assignment.course_id_c?.Id || assignment.course_id_c
              const course = courses.find(c => c.Id === courseId)
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
const courseAssignments = assignments.filter(a => {
                const assignmentCourseId = a.course_id_c?.Id || a.course_id_c
                return assignmentCourseId === course.Id
              })
              const completedCount = courseAssignments.filter(a => a.status_c === "completed" || a.status_c === "submitted").length
const totalCount = courseAssignments.length
              
              const courseGrade = courseGPAs.find(g => parseInt(g.courseId) === course.Id)
              
              return (
                <motion.div
                  key={course.Id}
                  whileHover={{ y: -2, scale: 1.02 }}
                  className="card p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: course.color_c }}
                    />
                    <div>
                      <div className="text-sm text-gray-500">{course.credits_c} credits</div>
                      {courseGrade && (
                        <div className="text-2xl font-bold text-primary mt-1">
                          {courseGrade.letterGrade}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {course.name_c}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{course.instructor_c}</p>
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
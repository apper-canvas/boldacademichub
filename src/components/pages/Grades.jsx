import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useSearchParams } from "react-router-dom"
import { gradeService } from "@/services/api/gradeService"
import { courseService } from "@/services/api/courseService"
import Button from "@/components/atoms/Button"
import Select from "@/components/atoms/Select"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import ApperIcon from "@/components/ApperIcon"
import { toast } from "react-toastify"

const Grades = () => {
  const [searchParams] = useSearchParams()
  const [grades, setGrades] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCourseId, setSelectedCourseId] = useState(searchParams.get("course") || "")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setError(null)
      setLoading(true)
      const [gradesData, coursesData] = await Promise.all([
        gradeService.getAll(),
        courseService.getAll()
      ])
      setGrades(gradesData)
      setCourses(coursesData)
    } catch (err) {
      setError(err.message || "Failed to load grades")
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadData} />

  // Calculate grades for each course
  const courseGrades = {}
  grades.forEach(grade => {
    if (!courseGrades[grade.courseId]) {
      courseGrades[grade.courseId] = []
    }
    courseGrades[grade.courseId].push(grade)
  })

  // Calculate GPA and course averages
  const courseAverages = Object.entries(courseGrades).map(([courseId, courseGradeList]) => {
    const course = courses.find(c => c.Id === parseInt(courseId))
    if (!course) return null

    const totalWeight = courseGradeList.reduce((sum, grade) => sum + grade.weight, 0)
    const weightedScore = courseGradeList.reduce((sum, grade) => {
      const percentage = (grade.score / grade.maxScore) * 100
      return sum + (percentage * grade.weight / 100)
    }, 0)
    
    const average = totalWeight > 0 ? weightedScore / (totalWeight / 100) : 0

    return {
      courseId: parseInt(courseId),
      course,
      grades: courseGradeList,
      average,
      letterGrade: getLetterGrade(average),
      gradePoint: getGradePoint(average)
    }
  }).filter(Boolean)

  // Calculate overall GPA
  const totalCredits = courseAverages.reduce((sum, course) => sum + course.course.credits, 0)
  const totalGradePoints = courseAverages.reduce((sum, course) => sum + (course.gradePoint * course.course.credits), 0)
  const overallGPA = totalCredits > 0 ? totalGradePoints / totalCredits : 0

  function getLetterGrade(percentage) {
    if (percentage >= 97) return "A+"
    if (percentage >= 93) return "A"
    if (percentage >= 90) return "A-"
    if (percentage >= 87) return "B+"
    if (percentage >= 83) return "B"
    if (percentage >= 80) return "B-"
    if (percentage >= 77) return "C+"
    if (percentage >= 73) return "C"
    if (percentage >= 70) return "C-"
    if (percentage >= 67) return "D+"
    if (percentage >= 65) return "D"
    return "F"
  }

  function getGradePoint(percentage) {
    if (percentage >= 97) return 4.0
    if (percentage >= 93) return 3.7
    if (percentage >= 90) return 3.3
    if (percentage >= 87) return 3.0
    if (percentage >= 83) return 2.7
    if (percentage >= 80) return 2.3
    if (percentage >= 77) return 2.0
    if (percentage >= 73) return 1.7
    if (percentage >= 70) return 1.3
    if (percentage >= 67) return 1.0
    if (percentage >= 65) return 0.7
    return 0.0
  }

  // Filter by selected course
  const displayCourses = selectedCourseId 
    ? courseAverages.filter(course => course.courseId === parseInt(selectedCourseId))
    : courseAverages

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Grades</h1>
          <p className="text-gray-600 mt-1">
            Track your academic performance across all courses
          </p>
        </div>
      </div>

      {/* Overall GPA Card */}
      <div className="card p-8 bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-200">
        <div className="text-center">
          <div className="text-4xl font-bold text-primary mb-2">
            {overallGPA.toFixed(2)}
          </div>
          <div className="text-lg text-gray-700 mb-4">Overall GPA</div>
          <div className="flex justify-center gap-8 text-sm">
            <div className="text-center">
              <div className="font-semibold text-gray-900">{courseAverages.length}</div>
              <div className="text-gray-600">Courses</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">{totalCredits}</div>
              <div className="text-gray-600">Credits</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">{getLetterGrade(courseAverages.reduce((sum, c) => sum + c.average, 0) / (courseAverages.length || 1))}</div>
              <div className="text-gray-600">Avg Grade</div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="w-full sm:w-80"
        >
          <option value="">All Courses</option>
          {courses.map((course) => (
            <option key={course.Id} value={course.Id.toString()}>
              {course.name}
            </option>
          ))}
        </Select>
      </div>

      {/* Courses Grades */}
      {displayCourses.length === 0 ? (
        <Empty
          title="No grades available"
          description="Grades will appear here once your instructors enter them in the system."
          icon="BarChart3"
        />
      ) : (
        <div className="space-y-6">
          {displayCourses.map((courseData, index) => (
            <motion.div
              key={courseData.courseId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card overflow-hidden"
            >
              {/* Course Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: courseData.course.color }}
                    />
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {courseData.course.name}
                      </h2>
                      <p className="text-gray-600">
                        {courseData.course.instructor} • {courseData.course.credits} credits
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {courseData.average.toFixed(1)}%
                    </div>
                    <div className="text-lg font-semibold text-gray-700">
                      {courseData.letterGrade}
                    </div>
                    <div className="text-sm text-gray-500">
                      {courseData.gradePoint} GPA
                    </div>
                  </div>
                </div>
              </div>

              {/* Grade Breakdown */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade Breakdown</h3>
                <div className="space-y-4">
                  {courseData.grades.map((grade) => {
                    const percentage = (grade.score / grade.maxScore) * 100
                    return (
                      <div key={grade.Id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">
                              {grade.category}
                            </span>
                            <span className="text-sm text-gray-500">
                              {grade.weight}% of total grade
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              />
                            </div>
                            <div className="text-right min-w-0">
                              <div className="font-semibold text-gray-900">
                                {grade.score}/{grade.maxScore}
                              </div>
                              <div className="text-sm text-primary font-medium">
                                {percentage.toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Course Statistics */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {courseData.grades.length}
                      </div>
                      <div className="text-sm text-gray-600">Assignments</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-success">
                        {Math.max(...courseData.grades.map(g => (g.score / g.maxScore) * 100)).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Highest</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-warning">
                        {Math.min(...courseData.grades.map(g => (g.score / g.maxScore) * 100)).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Lowest</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-info">
                        {(courseData.grades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / courseData.grades.length).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Average</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Grades
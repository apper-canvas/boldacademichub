import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { scheduleService } from "@/services/api/scheduleService";
import { courseService } from "@/services/api/courseService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";

const Schedule = () => {
  const [scheduleBlocks, setScheduleBlocks] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setError(null)
      setLoading(true)
      const [scheduleData, coursesData] = await Promise.all([
        scheduleService.getAll(),
        courseService.getAll()
      ])
      setScheduleBlocks(scheduleData)
      setCourses(coursesData)
    } catch (err) {
      setError(err.message || "Failed to load schedule")
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadData} />

  // Days of the week
  const days = [
    { id: 1, name: "Monday", short: "Mon" },
    { id: 2, name: "Tuesday", short: "Tue" },
    { id: 3, name: "Wednesday", short: "Wed" },
    { id: 4, name: "Thursday", short: "Thu" },
    { id: 5, name: "Friday", short: "Fri" }
  ]

  // Time slots (8 AM to 6 PM)
  const timeSlots = []
  for (let hour = 8; hour <= 18; hour++) {
    timeSlots.push({
      time: `${hour}:00`,
      display: `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? "PM" : "AM"}`
    })
  }

  // Group schedule blocks by day and time
  const scheduleGrid = {}
  days.forEach(day => {
    scheduleGrid[day.id] = {}
    timeSlots.forEach(slot => {
      scheduleGrid[day.id][slot.time] = null
    })
  })

  // Fill the grid with course blocks
  scheduleBlocks.forEach(block => {
    const course = courses.find(c => c.Id === block.courseId)
const dayOfWeek = parseInt(block.day_of_week_c)
    if (course && scheduleGrid[dayOfWeek]) {
      const startHour = parseInt(block.start_time_c.split(":")[0])
      const endHour = parseInt(block.end_time_c.split(":")[0])

      for (let hour = startHour; hour < endHour; hour++) {
        const timeKey = `${hour}:00`
        if (!scheduleGrid[dayOfWeek][timeKey]) {
          scheduleGrid[dayOfWeek][timeKey] = {
            ...block,
            course,
            isStart: hour === startHour,
            isEnd: hour === endHour - 1,
            duration: endHour - startHour
          }
        }
      }
    }
  })

  if (courses.length === 0) {
    return (
      <Empty
        title="No courses scheduled"
        description="Add some courses first to see your weekly schedule."
        actionLabel="Add Course"
        icon="Calendar"
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
          <p className="text-gray-600 mt-1">
            Your weekly class schedule
          </p>
        </div>
      </div>

      {/* Current Week Info */}
      <div className="card p-4">
        <div className="flex items-center justify-center">
          <ApperIcon name="Calendar" className="w-5 h-5 text-primary mr-2" />
          <span className="font-medium text-gray-900">
            Week of {format(new Date(), "MMMM do, yyyy")}
          </span>
        </div>
      </div>

      {/* Schedule Grid - Desktop */}
      <div className="hidden lg:block">
        <div className="card overflow-hidden">
          <div className="grid grid-cols-6 border-b border-gray-200">
            <div className="p-4 bg-gray-50 font-semibold text-gray-700">Time</div>
            {days.map(day => (
              <div key={day.id} className="p-4 bg-gray-50 font-semibold text-gray-700 text-center">
                {day.name}
              </div>
            ))}
          </div>
          
          {timeSlots.map((slot, timeIndex) => (
            <div key={slot.time} className="grid grid-cols-6 border-b border-gray-100 last:border-b-0 min-h-[60px]">
              <div className="p-4 bg-gray-50 text-sm font-medium text-gray-600 flex items-center">
                {slot.display}
              </div>
              {days.map(day => {
                const blockData = scheduleGrid[day.id][slot.time]
                return (
                  <div key={day.id} className="relative border-l border-gray-100">
                    {blockData && blockData.isStart && (
<motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: timeIndex * 0.05 }}
                        className="absolute inset-x-1 inset-y-1 rounded-lg p-3 shadow-sm border-l-4 text-white text-sm"
                        style={{ 
                          backgroundColor: blockData.course.color_c,
                          borderLeftColor: blockData.course.color_c,
                          height: `${blockData.duration * 60 - 4}px`,
                        }}
                      >
                        <div className="text-sm font-bold text-white mb-1">
                          {blockData.course.name_c}
                        </div>
                        <div className="flex items-center text-xs text-white text-opacity-90 mb-1">
                          <ApperIcon name="MapPin" className="w-3 h-3 mr-1" />
                          {blockData.location_c}
                        </div>
                        <div className="flex items-center text-xs text-white text-opacity-90">
                          <ApperIcon name="Clock" className="w-3 h-3 mr-1" />
                          {blockData.start_time_c} - {blockData.end_time_c}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Schedule List - Mobile */}
      <div className="lg:hidden space-y-4">
        {days.map(day => {
const dayBlocks = scheduleBlocks.filter(block => parseInt(block.day_of_week_c) === day.id)
          const dayBlocksWithCourses = dayBlocks.map(block => {
            const courseId = block.course_id_c?.Id || block.course_id_c
            return {
              ...block,
              course: courses.find(c => c.Id === courseId)
            }
          })).sort((a, b) => a.startTime.localeCompare(b.startTime))

          return (
            <motion.div
              key={day.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">{day.name}</h3>
              </div>
              <div className="p-4">
                {dayBlocksWithCourses.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No classes scheduled</p>
                ) : (
                  <div className="space-y-3">
                    {dayBlocksWithCourses.map((block) => (
                      <div
key={block.Id}
                        className="flex items-center gap-4 p-3 rounded-lg border-l-4"
                        style={{
                          backgroundColor: `${block.course.color_c}10`,
                          borderLeftColor: block.course.color_c
                        }}
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {block.course.name_c}
                          </h4>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                            <div className="flex items-center">
                              <ApperIcon name="Clock" className="w-4 h-4 mr-1" />
                              {block.start_time_c} - {block.end_time_c}
                            </div>
                            <div className="flex items-center">
                              <ApperIcon name="MapPin" className="w-4 h-4 mr-1" />
                              {block.location_c}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Schedule Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-primary mb-2">
            {courses.length}
          </div>
          <div className="text-gray-600">Active Courses</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-success mb-2">
            {scheduleBlocks.length}
          </div>
          <div className="text-gray-600">Class Sessions</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-accent mb-2">
{courses.reduce((total, course) => total + (course.credits_c || 0), 0)}
          </div>
          <div className="text-gray-600">Total Credits</div>
        </div>
      </div>
    </div>
  )
}

export default Schedule
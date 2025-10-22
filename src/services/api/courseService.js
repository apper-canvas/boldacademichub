import { getApperClient } from "@/services/apperClient";
import { toast } from "react-toastify";
import React from "react";
import Error from "@/components/ui/Error";

export const courseService = {
  async getAll() {
    try {
      const apperClient = getApperClient()
      const response = await apperClient.fetchRecords('course_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "instructor_c"}},
          {"field": {"Name": "room_c"}},
          {"field": {"Name": "credits_c"}},
          {"field": {"Name": "semester_c"}},
          {"field": {"Name": "color_c"}}
        ]
      })

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }

      return response.data || []
    } catch (error) {
      console.error("Error fetching courses:", error?.response?.data?.message || error)
      toast.error("Failed to load courses")
      return []
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient()
      const response = await apperClient.getRecordById('course_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "instructor_c"}},
          {"field": {"Name": "room_c"}},
          {"field": {"Name": "credits_c"}},
          {"field": {"Name": "semester_c"}},
          {"field": {"Name": "color_c"}}
        ]
      })

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        throw new Error("Course not found")
      }

      return response.data
    } catch (error) {
      console.error(`Error fetching course ${id}:`, error?.response?.data?.message || error)
      throw new Error("Course not found")
    }
  },

  async create(courseData) {
    try {
      const apperClient = getApperClient()
      const response = await apperClient.createRecord('course_c', {
        records: [{
          name_c: courseData.name,
          instructor_c: courseData.instructor,
          room_c: courseData.room,
          credits_c: parseInt(courseData.credits),
          semester_c: courseData.semester,
          color_c: courseData.color
        }]
      })

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        throw new Error("Failed to create course")
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success)
        if (failed.length > 0) {
          console.error(`Failed to create course: ${JSON.stringify(failed)}`)
          failed.forEach(record => {
            if (record.message) toast.error(record.message)
          })
          throw new Error("Failed to create course")
        }
        return response.results[0].data
      }

      return response.data
    } catch (error) {
      console.error("Error creating course:", error?.response?.data?.message || error)
      throw error
    }
  },

  async update(id, courseData) {
    try {
      const apperClient = getApperClient()
      const response = await apperClient.updateRecord('course_c', {
        records: [{
          Id: parseInt(id),
          name_c: courseData.name,
          instructor_c: courseData.instructor,
          room_c: courseData.room,
          credits_c: parseInt(courseData.credits),
          semester_c: courseData.semester,
          color_c: courseData.color
        }]
      })

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        throw new Error("Failed to update course")
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success)
        if (failed.length > 0) {
          console.error(`Failed to update course: ${JSON.stringify(failed)}`)
          failed.forEach(record => {
            if (record.message) toast.error(record.message)
          })
          throw new Error("Failed to update course")
        }
        return response.results[0].data
      }

      return response.data
    } catch (error) {
      console.error("Error updating course:", error?.response?.data?.message || error)
      throw error
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient()
      const response = await apperClient.deleteRecord('course_c', {
        RecordIds: [parseInt(id)]
      })

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return false
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success)
        if (failed.length > 0) {
          console.error(`Failed to delete course: ${JSON.stringify(failed)}`)
          failed.forEach(record => {
            if (record.message) toast.error(record.message)
          })
          return false
        }
      }

      return true
    } catch (error) {
      console.error("Error deleting course:", error?.response?.data?.message || error)
return false
    }
  }
}
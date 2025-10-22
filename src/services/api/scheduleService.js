import { getApperClient } from "@/services/apperClient"
import { toast } from "react-toastify"

export const scheduleService = {
  async getAll() {
    try {
      const apperClient = getApperClient()
      const response = await apperClient.fetchRecords('schedule_block_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "day_of_week_c"}},
          {"field": {"Name": "start_time_c"}},
          {"field": {"Name": "end_time_c"}},
          {"field": {"Name": "location_c"}},
          {"field": {"Name": "course_id_c"}}
        ]
      })

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }

      return response.data || []
    } catch (error) {
      console.error("Error fetching schedule blocks:", error?.response?.data?.message || error)
      toast.error("Failed to load schedule")
      return []
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient()
      const response = await apperClient.getRecordById('schedule_block_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "day_of_week_c"}},
          {"field": {"Name": "start_time_c"}},
          {"field": {"Name": "end_time_c"}},
          {"field": {"Name": "location_c"}},
          {"field": {"Name": "course_id_c"}}
        ]
      })

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        throw new Error("Schedule block not found")
      }

      return response.data
    } catch (error) {
      console.error(`Error fetching schedule block ${id}:`, error?.response?.data?.message || error)
      throw new Error("Schedule block not found")
    }
  },

  async getByCourseId(courseId) {
    try {
      const apperClient = getApperClient()
      const response = await apperClient.fetchRecords('schedule_block_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "day_of_week_c"}},
          {"field": {"Name": "start_time_c"}},
          {"field": {"Name": "end_time_c"}},
          {"field": {"Name": "location_c"}},
          {"field": {"Name": "course_id_c"}}
        ],
        where: [{
          FieldName: "course_id_c",
          Operator: "EqualTo",
          Values: [parseInt(courseId)]
        }]
      })

      if (!response.success) {
        console.error(response.message)
        return []
      }

      return response.data || []
    } catch (error) {
      console.error(`Error fetching schedule blocks for course ${courseId}:`, error?.response?.data?.message || error)
      return []
    }
  },

  async create(scheduleData) {
    try {
      const apperClient = getApperClient()
      const response = await apperClient.createRecord('schedule_block_c', {
        records: [{
          day_of_week_c: scheduleData.dayOfWeek.toString(),
          start_time_c: scheduleData.startTime,
          end_time_c: scheduleData.endTime,
          location_c: scheduleData.location,
          course_id_c: parseInt(scheduleData.courseId)
        }]
      })

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        throw new Error("Failed to create schedule block")
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success)
        if (failed.length > 0) {
          console.error(`Failed to create schedule block: ${JSON.stringify(failed)}`)
          failed.forEach(record => {
            if (record.message) toast.error(record.message)
          })
          throw new Error("Failed to create schedule block")
        }
        return response.results[0].data
      }

      return response.data
    } catch (error) {
      console.error("Error creating schedule block:", error?.response?.data?.message || error)
      throw error
    }
  },

  async update(id, scheduleData) {
    try {
      const apperClient = getApperClient()
      const response = await apperClient.updateRecord('schedule_block_c', {
        records: [{
          Id: parseInt(id),
          day_of_week_c: scheduleData.dayOfWeek?.toString(),
          start_time_c: scheduleData.startTime,
          end_time_c: scheduleData.endTime,
          location_c: scheduleData.location,
          course_id_c: scheduleData.courseId ? parseInt(scheduleData.courseId) : undefined
        }]
      })

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        throw new Error("Failed to update schedule block")
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success)
        if (failed.length > 0) {
          console.error(`Failed to update schedule block: ${JSON.stringify(failed)}`)
          failed.forEach(record => {
            if (record.message) toast.error(record.message)
          })
          throw new Error("Failed to update schedule block")
        }
        return response.results[0].data
      }

      return response.data
    } catch (error) {
      console.error("Error updating schedule block:", error?.response?.data?.message || error)
      throw error
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient()
      const response = await apperClient.deleteRecord('schedule_block_c', {
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
          console.error(`Failed to delete schedule block: ${JSON.stringify(failed)}`)
          failed.forEach(record => {
            if (record.message) toast.error(record.message)
          })
          return false
        }
      }

      return true
    } catch (error) {
      console.error("Error deleting schedule block:", error?.response?.data?.message || error)
      return false
    }
  }
}
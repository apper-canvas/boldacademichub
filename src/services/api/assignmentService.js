import { getApperClient } from "@/services/apperClient"
import { toast } from "react-toastify"

export const assignmentService = {
  async getAll() {
    try {
      const apperClient = getApperClient()
      const response = await apperClient.fetchRecords('assignment_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "points_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "type_c"}},
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
      console.error("Error fetching assignments:", error?.response?.data?.message || error)
      toast.error("Failed to load assignments")
      return []
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient()
      const response = await apperClient.getRecordById('assignment_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "points_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "course_id_c"}}
        ]
      })

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        throw new Error("Assignment not found")
      }

      return response.data
    } catch (error) {
      console.error(`Error fetching assignment ${id}:`, error?.response?.data?.message || error)
      throw new Error("Assignment not found")
    }
  },

  async getByCourseId(courseId) {
    try {
      const apperClient = getApperClient()
      const response = await apperClient.fetchRecords('assignment_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "points_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "type_c"}},
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
      console.error(`Error fetching assignments for course ${courseId}:`, error?.response?.data?.message || error)
      return []
    }
  },

  async create(assignmentData) {
    try {
      const apperClient = getApperClient()
      const response = await apperClient.createRecord('assignment_c', {
        records: [{
          title_c: assignmentData.title,
          description_c: assignmentData.description,
          due_date_c: assignmentData.dueDate,
          points_c: parseInt(assignmentData.points),
          priority_c: assignmentData.priority,
          status_c: assignmentData.status,
          type_c: assignmentData.type,
          course_id_c: parseInt(assignmentData.courseId)
        }]
      })

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        throw new Error("Failed to create assignment")
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success)
        if (failed.length > 0) {
          console.error(`Failed to create assignment: ${JSON.stringify(failed)}`)
          failed.forEach(record => {
            if (record.message) toast.error(record.message)
          })
          throw new Error("Failed to create assignment")
        }
        return response.results[0].data
      }

      return response.data
    } catch (error) {
      console.error("Error creating assignment:", error?.response?.data?.message || error)
      throw error
    }
  },

  async update(id, assignmentData) {
    try {
      const apperClient = getApperClient()
      const updatePayload = {
        Id: parseInt(id)
      }

      if (assignmentData.title) updatePayload.title_c = assignmentData.title
      if (assignmentData.description) updatePayload.description_c = assignmentData.description
      if (assignmentData.dueDate) updatePayload.due_date_c = assignmentData.dueDate
      if (assignmentData.points !== undefined) updatePayload.points_c = parseInt(assignmentData.points)
      if (assignmentData.priority) updatePayload.priority_c = assignmentData.priority
      if (assignmentData.status) updatePayload.status_c = assignmentData.status
      if (assignmentData.type) updatePayload.type_c = assignmentData.type
      if (assignmentData.courseId) updatePayload.course_id_c = parseInt(assignmentData.courseId)

      const response = await apperClient.updateRecord('assignment_c', {
        records: [updatePayload]
      })

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        throw new Error("Failed to update assignment")
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success)
        if (failed.length > 0) {
          console.error(`Failed to update assignment: ${JSON.stringify(failed)}`)
          failed.forEach(record => {
            if (record.message) toast.error(record.message)
          })
          throw new Error("Failed to update assignment")
        }
        return response.results[0].data
      }

      return response.data
    } catch (error) {
      console.error("Error updating assignment:", error?.response?.data?.message || error)
      throw error
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient()
      const response = await apperClient.deleteRecord('assignment_c', {
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
          console.error(`Failed to delete assignment: ${JSON.stringify(failed)}`)
          failed.forEach(record => {
            if (record.message) toast.error(record.message)
          })
          return false
        }
      }

      return true
    } catch (error) {
      console.error("Error deleting assignment:", error?.response?.data?.message || error)
      return false
    }
  },

  async updateStatus(id, status) {
    try {
      const apperClient = getApperClient()
      const response = await apperClient.updateRecord('assignment_c', {
        records: [{
          Id: parseInt(id),
          status_c: status
        }]
      })

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        throw new Error("Failed to update assignment status")
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success)
        if (failed.length > 0) {
          console.error(`Failed to update assignment status: ${JSON.stringify(failed)}`)
          failed.forEach(record => {
            if (record.message) toast.error(record.message)
          })
          throw new Error("Failed to update assignment status")
        }
        return response.results[0].data
      }

      return response.data
    } catch (error) {
      console.error("Error updating assignment status:", error?.response?.data?.message || error)
      throw error
    }
  }
}
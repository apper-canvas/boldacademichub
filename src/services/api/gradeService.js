import { getApperClient } from "@/services/apperClient"
import { toast } from "react-toastify"

export const gradeService = {
  async getAll() {
    try {
      const apperClient = getApperClient()
      const response = await apperClient.fetchRecords('grade_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "course_id_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "max_score_c"}},
          {"field": {"Name": "score_c"}},
          {"field": {"Name": "weight_c"}}
        ]
      })

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }

      return response.data || []
    } catch (error) {
      console.error("Error fetching grades:", error?.response?.data?.message || error)
      toast.error("Failed to load grades")
      return []
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient()
      const response = await apperClient.getRecordById('grade_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "course_id_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "max_score_c"}},
          {"field": {"Name": "score_c"}},
          {"field": {"Name": "weight_c"}}
        ]
      })

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        throw new Error("Grade not found")
      }

      return response.data
    } catch (error) {
      console.error(`Error fetching grade ${id}:`, error?.response?.data?.message || error)
      throw new Error("Grade not found")
    }
  },

  async getByCourseId(courseId) {
    try {
      const apperClient = getApperClient()
      const response = await apperClient.fetchRecords('grade_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "course_id_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "max_score_c"}},
          {"field": {"Name": "score_c"}},
          {"field": {"Name": "weight_c"}}
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
      console.error(`Error fetching grades for course ${courseId}:`, error?.response?.data?.message || error)
      return []
    }
  },

  async create(gradeData) {
    try {
      const apperClient = getApperClient()
      const response = await apperClient.createRecord('grade_c', {
        records: [{
          course_id_c: parseInt(gradeData.courseId),
          category_c: gradeData.category,
          date_c: gradeData.date,
          max_score_c: parseInt(gradeData.maxScore),
          score_c: parseInt(gradeData.score),
          weight_c: parseFloat(gradeData.weight)
        }]
      })

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        throw new Error("Failed to create grade")
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success)
        if (failed.length > 0) {
          console.error(`Failed to create grade: ${JSON.stringify(failed)}`)
          failed.forEach(record => {
            if (record.message) toast.error(record.message)
          })
          throw new Error("Failed to create grade")
        }
        return response.results[0].data
      }

      return response.data
    } catch (error) {
      console.error("Error creating grade:", error?.response?.data?.message || error)
      throw error
    }
  },

  async update(id, gradeData) {
    try {
      const apperClient = getApperClient()
      const updatePayload = {
        Id: parseInt(id)
      }

      if (gradeData.courseId) updatePayload.course_id_c = parseInt(gradeData.courseId)
      if (gradeData.category) updatePayload.category_c = gradeData.category
      if (gradeData.date) updatePayload.date_c = gradeData.date
      if (gradeData.maxScore !== undefined) updatePayload.max_score_c = parseInt(gradeData.maxScore)
      if (gradeData.score !== undefined) updatePayload.score_c = parseInt(gradeData.score)
      if (gradeData.weight !== undefined) updatePayload.weight_c = parseFloat(gradeData.weight)

      const response = await apperClient.updateRecord('grade_c', {
        records: [updatePayload]
      })

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        throw new Error("Failed to update grade")
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success)
        if (failed.length > 0) {
          console.error(`Failed to update grade: ${JSON.stringify(failed)}`)
          failed.forEach(record => {
            if (record.message) toast.error(record.message)
          })
          throw new Error("Failed to update grade")
        }
        return response.results[0].data
      }

      return response.data
    } catch (error) {
      console.error("Error updating grade:", error?.response?.data?.message || error)
      throw error
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient()
      const response = await apperClient.deleteRecord('grade_c', {
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
          console.error(`Failed to delete grade: ${JSON.stringify(failed)}`)
          failed.forEach(record => {
            if (record.message) toast.error(record.message)
          })
          return false
        }
      }

      return true
    } catch (error) {
      console.error("Error deleting grade:", error?.response?.data?.message || error)
      return false
    }
  }
}
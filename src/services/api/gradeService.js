import gradesData from "@/services/mockData/grades.json"

let grades = [...gradesData]

const delay = () => new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200))

export const gradeService = {
  async getAll() {
    await delay()
    return [...grades]
  },

  async getById(id) {
    await delay()
    const grade = grades.find(g => g.Id === parseInt(id))
    if (!grade) throw new Error("Grade not found")
    return { ...grade }
  },

  async getByCourseId(courseId) {
    await delay()
    return grades.filter(g => g.courseId === parseInt(courseId))
  },

  async create(gradeData) {
    await delay()
    const maxId = grades.length > 0 ? Math.max(...grades.map(g => g.Id)) : 0
    const newGrade = {
      Id: maxId + 1,
      ...gradeData
    }
    grades.push(newGrade)
    return { ...newGrade }
  },

  async update(id, gradeData) {
    await delay()
    const index = grades.findIndex(g => g.Id === parseInt(id))
    if (index === -1) throw new Error("Grade not found")
    
    grades[index] = { ...grades[index], ...gradeData }
    return { ...grades[index] }
  },

  async delete(id) {
    await delay()
    const index = grades.findIndex(g => g.Id === parseInt(id))
    if (index === -1) throw new Error("Grade not found")
    
    grades.splice(index, 1)
    return true
  }
}
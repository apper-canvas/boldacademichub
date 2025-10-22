import scheduleBlocksData from "@/services/mockData/scheduleBlocks.json"

let scheduleBlocks = [...scheduleBlocksData]

const delay = () => new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200))

export const scheduleService = {
  async getAll() {
    await delay()
    return [...scheduleBlocks]
  },

  async getById(id) {
    await delay()
    const block = scheduleBlocks.find(s => s.Id === parseInt(id))
    if (!block) throw new Error("Schedule block not found")
    return { ...block }
  },

  async getByCourseId(courseId) {
    await delay()
    return scheduleBlocks.filter(s => s.courseId === parseInt(courseId))
  },

  async create(scheduleData) {
    await delay()
    const maxId = scheduleBlocks.length > 0 ? Math.max(...scheduleBlocks.map(s => s.Id)) : 0
    const newBlock = {
      Id: maxId + 1,
      ...scheduleData
    }
    scheduleBlocks.push(newBlock)
    return { ...newBlock }
  },

  async update(id, scheduleData) {
    await delay()
    const index = scheduleBlocks.findIndex(s => s.Id === parseInt(id))
    if (index === -1) throw new Error("Schedule block not found")
    
    scheduleBlocks[index] = { ...scheduleBlocks[index], ...scheduleData }
    return { ...scheduleBlocks[index] }
  },

  async delete(id) {
    await delay()
    const index = scheduleBlocks.findIndex(s => s.Id === parseInt(id))
    if (index === -1) throw new Error("Schedule block not found")
    
    scheduleBlocks.splice(index, 1)
    return true
  }
}
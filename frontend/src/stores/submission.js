import { defineStore } from 'pinia'
import { ref } from 'vue'
import { submissionAPI } from '@/services/api'

export const useSubmissionStore = defineStore('submission', () => {
  const submissions = ref([])
  const currentSubmission = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const totalPages = ref(0)
  const currentPage = ref(0)

  async function fetchSubmissions(page = 0, size = 20) {
    loading.value = true
    error.value = null
    try {
      const response = await submissionAPI.getAll(page, size)
      submissions.value = response.data.content
      totalPages.value = response.data.totalPages
      currentPage.value = page
    } catch (err) {
      error.value = err.message
      console.error('Failed to fetch submissions:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchSubmissionById(id) {
    loading.value = true
    error.value = null
    try {
      const response = await submissionAPI.getById(id)
      currentSubmission.value = response.data
      return response.data
    } catch (err) {
      error.value = err.message
      console.error('Failed to fetch submission:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchUserSubmissions(userId) {
    loading.value = true
    error.value = null
    try {
      const response = await submissionAPI.getByUser(userId)
      submissions.value = response.data
    } catch (err) {
      error.value = err.message
      console.error('Failed to fetch user submissions:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    submissions,
    currentSubmission,
    loading,
    error,
    totalPages,
    currentPage,
    fetchSubmissions,
    fetchSubmissionById,
    fetchUserSubmissions
  }
})

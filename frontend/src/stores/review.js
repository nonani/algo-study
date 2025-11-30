import { defineStore } from 'pinia'
import { ref } from 'vue'
import { reviewAPI } from '@/services/api'

export const useReviewStore = defineStore('review', () => {
  const reviews = ref([])
  const comments = ref({})
  const loading = ref(false)
  const error = ref(null)

  async function fetchReviewsBySubmission(submissionId) {
    loading.value = true
    error.value = null
    try {
      const response = await reviewAPI.getBySubmission(submissionId)
      reviews.value = response.data
    } catch (err) {
      error.value = err.message
      console.error('Failed to fetch reviews:', err)
    } finally {
      loading.value = false
    }
  }

  async function createReview(submissionId, content, rating) {
    loading.value = true
    error.value = null
    try {
      const response = await reviewAPI.create({
        submissionId,
        content,
        rating
      })
      reviews.value.unshift(response.data)
      return response.data
    } catch (err) {
      error.value = err.message
      console.error('Failed to create review:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateReview(reviewId, content, rating) {
    loading.value = true
    error.value = null
    try {
      const response = await reviewAPI.update(reviewId, {
        content,
        rating
      })
      const index = reviews.value.findIndex(r => r.id === reviewId)
      if (index !== -1) {
        reviews.value[index] = response.data
      }
      return response.data
    } catch (err) {
      error.value = err.message
      console.error('Failed to update review:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteReview(reviewId) {
    loading.value = true
    error.value = null
    try {
      await reviewAPI.delete(reviewId)
      reviews.value = reviews.value.filter(r => r.id !== reviewId)
    } catch (err) {
      error.value = err.message
      console.error('Failed to delete review:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchComments(reviewId) {
    try {
      const response = await reviewAPI.getComments(reviewId)
      comments.value[reviewId] = response.data
    } catch (err) {
      console.error('Failed to fetch comments:', err)
    }
  }

  async function createComment(reviewId, content) {
    try {
      const response = await reviewAPI.createComment(reviewId, { content })
      if (!comments.value[reviewId]) {
        comments.value[reviewId] = []
      }
      comments.value[reviewId].push(response.data)
      return response.data
    } catch (err) {
      console.error('Failed to create comment:', err)
      throw err
    }
  }

  return {
    reviews,
    comments,
    loading,
    error,
    fetchReviewsBySubmission,
    createReview,
    updateReview,
    deleteReview,
    fetchComments,
    createComment
  }
})

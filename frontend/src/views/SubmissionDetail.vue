<template>
  <div>
    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500">로딩 중...</p>
    </div>

    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-500">{{ error }}</p>
    </div>

    <div v-else-if="submission">
      <!-- 제출 정보 -->
      <div class="card mb-6">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h1 class="text-2xl font-bold">
              {{ submission.problemTitle || `${submission.site} ${submission.problemId}` }}
            </h1>
            <p class="text-gray-600 mt-2">
              {{ submission.userName }} · {{ submission.language }} · {{ formatDate(submission.submittedAt) }}
            </p>
          </div>
          <span
            class="px-4 py-2 rounded-full text-sm font-semibold"
            :class="{
              'bg-green-100 text-green-800': submission.status === 'AC',
              'bg-red-100 text-red-800': submission.status !== 'AC'
            }"
          >
            {{ submission.status }}
          </span>
        </div>

        <!-- 코드 -->
        <div class="mt-6">
          <h2 class="text-lg font-semibold mb-3">제출 코드</h2>
          <div class="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre class="text-gray-100 text-sm"><code>{{ submission.code }}</code></pre>
          </div>
        </div>
      </div>

      <!-- 리뷰 작성 -->
      <div class="card mb-6">
        <h2 class="text-xl font-bold mb-4">리뷰 작성</h2>
        <form @submit.prevent="submitReview">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">별점</label>
            <div class="flex space-x-2">
              <button
                v-for="star in 5"
                :key="star"
                type="button"
                @click="newReview.rating = star"
                class="text-2xl"
                :class="{
                  'text-yellow-400': star <= newReview.rating,
                  'text-gray-300': star > newReview.rating
                }"
              >
                ★
              </button>
            </div>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">리뷰 내용</label>
            <textarea
              v-model="newReview.content"
              rows="4"
              class="input"
              placeholder="코드에 대한 피드백을 작성해주세요..."
              required
            ></textarea>
          </div>

          <button type="submit" class="btn btn-primary" :disabled="reviewLoading">
            {{ reviewLoading ? '작성 중...' : '리뷰 작성' }}
          </button>
        </form>
      </div>

      <!-- 리뷰 목록 -->
      <div class="card">
        <h2 class="text-xl font-bold mb-4">리뷰 ({{ reviews.length }})</h2>

        <div v-if="reviews.length === 0" class="text-center py-8 text-gray-500">
          아직 리뷰가 없습니다. 첫 번째 리뷰를 작성해보세요!
        </div>

        <div v-else class="space-y-6">
          <div
            v-for="review in reviews"
            :key="review.id"
            class="border-b border-gray-200 pb-6 last:border-b-0"
          >
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="font-semibold">{{ review.reviewerName }}</p>
                <div class="flex items-center mt-1">
                  <span v-for="star in 5" :key="star" class="text-yellow-400">
                    {{ star <= review.rating ? '★' : '☆' }}
                  </span>
                  <span class="text-sm text-gray-500 ml-2">
                    {{ formatDate(review.createdAt) }}
                  </span>
                </div>
              </div>
            </div>
            <p class="text-gray-700 mt-3 whitespace-pre-wrap">{{ review.content }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSubmissionStore } from '@/stores/submission'
import { useReviewStore } from '@/stores/review'

const route = useRoute()
const submissionStore = useSubmissionStore()
const reviewStore = useReviewStore()

const submission = computed(() => submissionStore.currentSubmission)
const loading = computed(() => submissionStore.loading)
const error = computed(() => submissionStore.error)
const reviews = computed(() => reviewStore.reviews)
const reviewLoading = computed(() => reviewStore.loading)

const newReview = ref({
  content: '',
  rating: 5
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR')
}

const submitReview = async () => {
  try {
    await reviewStore.createReview(
      submission.value.id,
      newReview.value.content,
      newReview.value.rating
    )
    newReview.value = { content: '', rating: 5 }
  } catch (err) {
    alert('리뷰 작성에 실패했습니다.')
  }
}

onMounted(async () => {
  const id = route.params.id
  await submissionStore.fetchSubmissionById(id)
  await reviewStore.fetchReviewsBySubmission(id)
})
</script>

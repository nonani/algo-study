<template>
  <div>
    <h1 class="text-3xl font-bold mb-8">대시보드</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-700 mb-2">총 제출 수</h3>
        <p class="text-3xl font-bold text-blue-600">{{ stats.totalSubmissions }}</p>
      </div>
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-700 mb-2">정답 수</h3>
        <p class="text-3xl font-bold text-green-600">{{ stats.acceptedSubmissions }}</p>
      </div>
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-700 mb-2">정답률</h3>
        <p class="text-3xl font-bold text-purple-600">{{ stats.acceptanceRate }}%</p>
      </div>
    </div>

    <div class="card">
      <h2 class="text-xl font-bold mb-4">최근 제출</h2>

      <div v-if="loading" class="text-center py-8">
        <p class="text-gray-500">로딩 중...</p>
      </div>

      <div v-else-if="error" class="text-center py-8">
        <p class="text-red-500">{{ error }}</p>
      </div>

      <div v-else-if="recentSubmissions.length === 0" class="text-center py-8">
        <p class="text-gray-500">아직 제출 기록이 없습니다.</p>
        <p class="text-sm text-gray-400 mt-2">
          크롬 익스텐션을 설치하고 백준 또는 프로그래머스에서 문제를 풀어보세요!
        </p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="submission in recentSubmissions"
          :key="submission.id"
          class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
          @click="goToSubmission(submission.id)"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h3 class="font-semibold text-lg">
                {{ submission.problemTitle || `${submission.site} ${submission.problemId}` }}
              </h3>
              <p class="text-sm text-gray-600 mt-1">
                {{ submission.userName }} · {{ submission.language }} · {{ formatDate(submission.submittedAt) }}
              </p>
            </div>
            <span
              class="px-3 py-1 rounded-full text-sm font-medium"
              :class="{
                'bg-green-100 text-green-800': submission.status === 'AC',
                'bg-red-100 text-red-800': submission.status !== 'AC'
              }"
            >
              {{ submission.status }}
            </span>
          </div>
        </div>
      </div>

      <div class="mt-6 text-center">
        <router-link to="/submissions" class="btn btn-primary">
          전체 제출 기록 보기
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSubmissionStore } from '@/stores/submission'

const router = useRouter()
const submissionStore = useSubmissionStore()

const loading = computed(() => submissionStore.loading)
const error = computed(() => submissionStore.error)
const recentSubmissions = computed(() => submissionStore.submissions.slice(0, 5))

const stats = computed(() => {
  const total = submissionStore.submissions.length
  const accepted = submissionStore.submissions.filter(s => s.status === 'AC').length
  return {
    totalSubmissions: total,
    acceptedSubmissions: accepted,
    acceptanceRate: total > 0 ? Math.round((accepted / total) * 100) : 0
  }
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  if (hours < 24) return `${hours}시간 전`
  if (days < 7) return `${days}일 전`

  return date.toLocaleDateString('ko-KR')
}

const goToSubmission = (id) => {
  router.push(`/submissions/${id}`)
}

onMounted(() => {
  submissionStore.fetchSubmissions(0, 20)
})
</script>

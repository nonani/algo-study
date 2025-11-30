<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">제출 기록</h1>
    </div>

    <div class="card">
      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-500">로딩 중...</p>
      </div>

      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-500">{{ error }}</p>
      </div>

      <div v-else-if="submissions.length === 0" class="text-center py-12">
        <p class="text-gray-500">제출 기록이 없습니다.</p>
      </div>

      <div v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  문제
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  사용자
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  언어
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  결과
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  제출 시간
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="submission in submissions"
                :key="submission.id"
                class="hover:bg-gray-50 cursor-pointer"
                @click="goToSubmission(submission.id)"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ submission.problemTitle || submission.problemId }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ submission.site }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ submission.userName }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ submission.language }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="{
                      'bg-green-100 text-green-800': submission.status === 'AC',
                      'bg-red-100 text-red-800': submission.status !== 'AC'
                    }"
                  >
                    {{ submission.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(submission.submittedAt) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="mt-6 flex justify-center space-x-2">
          <button
            v-for="page in totalPages"
            :key="page"
            @click="goToPage(page - 1)"
            class="px-4 py-2 rounded-lg transition-colors"
            :class="{
              'bg-blue-600 text-white': currentPage === page - 1,
              'bg-gray-200 text-gray-700 hover:bg-gray-300': currentPage !== page - 1
            }"
          >
            {{ page }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSubmissionStore } from '@/stores/submission'

const router = useRouter()
const submissionStore = useSubmissionStore()

const loading = computed(() => submissionStore.loading)
const error = computed(() => submissionStore.error)
const submissions = computed(() => submissionStore.submissions)
const totalPages = computed(() => submissionStore.totalPages)
const currentPage = computed(() => submissionStore.currentPage)

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR')
}

const goToSubmission = (id) => {
  router.push(`/submissions/${id}`)
}

const goToPage = (page) => {
  submissionStore.fetchSubmissions(page, 20)
}

onMounted(() => {
  submissionStore.fetchSubmissions(0, 20)
})
</script>

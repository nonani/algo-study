import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import SubmissionList from '@/views/SubmissionList.vue'
import SubmissionDetail from '@/views/SubmissionDetail.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/submissions',
    name: 'SubmissionList',
    component: SubmissionList
  },
  {
    path: '/submissions/:id',
    name: 'SubmissionDetail',
    component: SubmissionDetail
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

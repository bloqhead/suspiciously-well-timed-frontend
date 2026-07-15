import { createRouter, createWebHistory } from 'vue-router'
import EntityListView from '../views/EntityListView.vue'
import TimelineView from '../views/TimelineView.vue'
import CorrelationReviewView from '../views/CorrelationReviewView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'entities', component: EntityListView },
    { path: '/entities/:id', name: 'timeline', component: TimelineView, props: true },
    { path: '/review', name: 'review', component: CorrelationReviewView },
  ],
})

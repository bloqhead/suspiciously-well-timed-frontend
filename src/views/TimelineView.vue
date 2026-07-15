<template>
  <div>
    <router-link to="/" class="back-link">← All entities</router-link>

    <h2 v-if="entity" class="entity-title">{{ entity.name }}</h2>
    <p v-if="entity" class="entity-sub">
      <span class="figure">{{ entity.ticker || entity.cik }}</span> · {{ entity.kind }}
    </p>

    <p v-if="loading" class="muted">Loading timeline…</p>
    <p v-else-if="error" class="error">{{ error }}</p>
    <p v-else-if="items.length === 0" class="muted">
      No filings or government actions recorded yet for this entity.
    </p>

    <ul v-else class="timeline">
      <TimelineEntry
        v-for="item in items"
        :key="`${item.itemType}-${item.itemId}`"
        :item="item"
        :correlation="correlationFor(item)"
      />
    </ul>

    <button v-if="hasMore" class="load-more" :disabled="loadingMore" @click="loadMore">
      {{ loadingMore ? 'Loading…' : 'Load more' }}
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TimelineEntry from '../components/TimelineEntry.vue'
import { getEntity, getTimeline, listCorrelations } from '../api/client'

const props = defineProps({ id: { type: [String, Number], required: true } })

const entity = ref(null)
const items = ref([])
const correlationMap = ref(new Map())
const loading = ref(true)
const loadingMore = ref(false)
const error = ref('')
const cursor = ref('')
const hasMore = ref(false)

// Correlations are fetched separately from the timeline (different table,
// different shape) and cross-referenced by (itemType, itemId) so the stamp
// can attach to whichever timeline row it belongs to.
function buildCorrelationMap(rows) {
  const map = new Map()
  for (const c of rows || []) {
    map.set(`filing-${c.filingId}`, { daysApart: c.daysApart, confidence: c.confidence, partnerDesc: c.govEventDescription })
    map.set(`gov_event-${c.govEventId}`, { daysApart: c.daysApart, confidence: c.confidence, partnerDesc: c.filingAccession })
  }
  return map
}

function correlationFor(item) {
  return correlationMap.value.get(`${item.itemType}-${item.itemId}`) || null
}

async function loadInitial() {
  try {
    const [entityRes, timelineRes, correlationsRes] = await Promise.all([
      getEntity(props.id),
      getTimeline(props.id),
      listCorrelations({ entityId: props.id }),
    ])
    entity.value = entityRes
    items.value = timelineRes.data || []
    cursor.value = timelineRes.nextCursor
    hasMore.value = timelineRes.hasMore
    correlationMap.value = buildCorrelationMap(correlationsRes.data)
  } catch (e) {
    error.value = 'Could not load this timeline. ' + e.message
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  loadingMore.value = true
  try {
    const res = await getTimeline(props.id, { cursor: cursor.value })
    items.value = items.value.concat(res.data || [])
    cursor.value = res.nextCursor
    hasMore.value = res.hasMore
  } catch (e) {
    error.value = 'Could not load more. ' + e.message
  } finally {
    loadingMore.value = false
  }
}

onMounted(loadInitial)
</script>

<style scoped>
.back-link {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--muted-ink);
  margin-bottom: 20px;
}

.entity-title {
  font-size: 22px;
  margin: 0 0 4px;
}

.entity-sub {
  color: var(--muted-ink);
  font-size: 13px;
  margin: 0 0 32px;
}

.timeline {
  list-style: none;
  margin: 0;
  padding: 0;
}

.load-more {
  margin-top: 24px;
  background: transparent;
  border: 1px solid var(--wire-blue);
  color: var(--wire-blue);
  padding: 10px 20px;
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 13px;
}
.load-more:hover:not(:disabled) {
  background: var(--wire-blue);
  color: var(--ink-navy);
}
.load-more:disabled {
  opacity: 0.5;
  cursor: default;
}

.muted {
  color: var(--muted-ink);
}
.error {
  color: var(--stamp-red);
}
</style>

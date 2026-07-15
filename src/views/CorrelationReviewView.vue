<template>
  <div>
    <h2 class="section-title">Review queue</h2>
    <p class="intro">
      Candidates the ingestion job flagged as close in time. Confirming marks a pair
      as curator-reviewed; nothing here is asserted as fact until you say so.
    </p>

    <p v-if="loading" class="muted">Loading…</p>
    <p v-else-if="error" class="error">{{ error }}</p>
    <p v-else-if="rows.length === 0" class="muted">Nothing pending review.</p>

    <ul v-else class="queue">
      <li v-for="row in rows" :key="row.id" class="card">
        <div class="card__stamp">
          <span class="card__days">{{ row.daysApart }}</span>
          <span class="card__days-label">days apart</span>
        </div>

        <div class="card__body">
          <p class="card__line">
            <span class="card__tag card__tag--filing">Filing</span>
            {{ row.filingAccession }}
            <a :href="row.filingUrl" target="_blank" rel="noopener">source ↗</a>
          </p>
          <p class="card__line">
            <span class="card__tag card__tag--gov">Gov action</span>
            {{ row.govEventDescription }}
            <a :href="row.govEventUrl" target="_blank" rel="noopener">source ↗</a>
          </p>
          <p class="card__meta figure">{{ row.confidence }}</p>
        </div>

        <div class="card__actions">
          <button class="btn btn--confirm" :disabled="busyId === row.id" @click="confirm(row)">
            Confirm
          </button>
          <button class="btn btn--reject" :disabled="busyId === row.id" @click="reject(row)">
            Reject
          </button>
        </div>
      </li>
    </ul>

    <button v-if="hasMore" class="load-more" :disabled="loadingMore" @click="loadMore">
      {{ loadingMore ? 'Loading…' : 'Load more' }}
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { listCorrelations, confirmCorrelation, rejectCorrelation } from '../api/client'

const rows = ref([])
const loading = ref(true)
const loadingMore = ref(false)
const error = ref('')
const cursor = ref('')
const hasMore = ref(false)
const busyId = ref(null)

async function load() {
  try {
    const res = await listCorrelations({ confidence: 'heuristic-strong' })
    rows.value = res.data
    cursor.value = res.nextCursor
    hasMore.value = res.hasMore
  } catch (e) {
    error.value = 'Could not load the review queue. ' + e.message
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  loadingMore.value = true
  try {
    const res = await listCorrelations({ confidence: 'heuristic-strong', cursor: cursor.value })
    rows.value = rows.value.concat(res.data)
    cursor.value = res.nextCursor
    hasMore.value = res.hasMore
  } finally {
    loadingMore.value = false
  }
}

async function confirm(row) {
  busyId.value = row.id
  try {
    await confirmCorrelation(row.id)
    rows.value = rows.value.filter((r) => r.id !== row.id)
  } catch (e) {
    error.value = 'Confirm failed. ' + e.message
  } finally {
    busyId.value = null
  }
}

async function reject(row) {
  busyId.value = row.id
  try {
    await rejectCorrelation(row.id)
    rows.value = rows.value.filter((r) => r.id !== row.id)
  } catch (e) {
    error.value = 'Reject failed. ' + e.message
  } finally {
    busyId.value = null
  }
}

onMounted(load)
</script>

<style scoped>
.section-title {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted-ink);
  margin: 0 0 8px;
}

.intro {
  color: var(--muted-ink);
  font-size: 13px;
  max-width: 60ch;
  margin: 0 0 28px;
}

.queue {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card {
  display: grid;
  grid-template-columns: 90px 1fr auto;
  gap: 20px;
  align-items: center;
  padding: 18px 20px;
  border: 1px solid var(--paper-dim);
  border-radius: var(--radius);
}

.card__stamp {
  text-align: center;
  color: var(--stamp-red);
}
.card__days {
  display: block;
  font-family: var(--font-mono);
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
}
.card__days-label {
  display: block;
  font-family: var(--font-mono);
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.card__line {
  margin: 0 0 6px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.card__line a {
  font-size: 11px;
}

.card__tag {
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: var(--radius);
}
.card__tag--filing {
  color: var(--wire-blue);
  border: 1px solid var(--wire-blue);
}
.card__tag--gov {
  color: var(--seal-gold);
  border: 1px solid var(--seal-gold);
}

.card__meta {
  margin: 4px 0 0;
  font-size: 11px;
  color: var(--muted-ink);
  text-transform: uppercase;
}

.card__actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn {
  font-family: var(--font-mono);
  font-size: 12px;
  padding: 8px 16px;
  border-radius: var(--radius);
  cursor: pointer;
  border: 1px solid transparent;
}
.btn:disabled {
  opacity: 0.5;
  cursor: default;
}
.btn--confirm {
  background: var(--wire-blue);
  color: var(--ink-navy);
}
.btn--reject {
  background: transparent;
  border-color: var(--stamp-red);
  color: var(--stamp-red);
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

.muted { color: var(--muted-ink); }
.error { color: var(--stamp-red); }

@media (max-width: 600px) {
  .card {
    grid-template-columns: 1fr;
  }
  .card__actions {
    flex-direction: row;
  }
}
</style>

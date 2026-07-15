<template>
  <div>
    <h2 class="section-title">Tracked entities</h2>

    <p v-if="loading" class="muted">Loading…</p>
    <p v-else-if="error" class="error">{{ error }}</p>
    <p v-else-if="entities.length === 0" class="muted">
      Nothing tracked yet. The ingestion job populates this once it's run.
    </p>

    <ul v-else class="entity-list">
      <li v-for="e in entities" :key="e.id" class="entity-card">
        <router-link :to="{ name: 'timeline', params: { id: e.id } }" class="entity-card__link">
          <span class="entity-card__name">{{ e.name }}</span>
          <span class="entity-card__meta">
            <span class="entity-card__kind">{{ e.kind }}</span>
            <span v-if="e.ticker" class="figure">{{ e.ticker }}</span>
          </span>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { listEntities } from '../api/client'

const entities = ref([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const res = await listEntities()
    entities.value = res.data
  } catch (e) {
    error.value = 'Could not load entities. ' + e.message
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.section-title {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted-ink);
  margin: 0 0 20px;
}

.entity-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: var(--paper-dim);
}

.entity-card {
  background: var(--ink-navy);
}

.entity-card__link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  color: var(--paper);
  text-decoration: none;
  border-left: 3px solid transparent;
  transition: border-color 0.15s ease, background 0.15s ease;
}
.entity-card__link:hover {
  border-left-color: var(--wire-blue);
  background: var(--ink-navy-deep);
  text-decoration: none;
}

.entity-card__name {
  font-family: var(--font-mono);
  font-size: 16px;
  font-weight: 500;
}

.entity-card__meta {
  display: flex;
  gap: 12px;
  align-items: center;
  color: var(--muted-ink);
  font-size: 13px;
}

.entity-card__kind {
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.muted {
  color: var(--muted-ink);
}
.error {
  color: var(--stamp-red);
}
</style>

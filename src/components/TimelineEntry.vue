<template>
  <li class="entry" :class="`entry--${item.itemType}`">
    <div class="entry__rail">
      <span class="entry__dot"></span>
    </div>

    <div class="entry__body">
      <div class="entry__head">
        <span class="entry__type">{{ typeLabel }}</span>
        <time class="entry__date figure">{{ formattedDate }}</time>
      </div>

      <p class="entry__desc">{{ description }}</p>

      <div v-if="item.itemType === 'filing'" class="entry__figures figure">
        <span v-if="item.shares">{{ formatNumber(item.shares) }} shares</span>
        <span v-if="item.securityTitle" class="entry__security">of {{ item.securityTitle }}</span>
        <span v-if="item.pricePerShare">@ ${{ item.pricePerShare.toFixed(2) }}</span>
        <span v-if="item.subtype" class="entry__code">{{ item.subtype }}</span>
      </div>
      <div v-else-if="item.amount" class="entry__figures figure">
        ${{ formatNumber(item.amount) }}
      </div>

      <a v-if="item.url" :href="item.url" target="_blank" rel="noopener" class="entry__link">
        source ↗
      </a>
    </div>

    <!-- The signature element: correlated pairs get an ink-stamp badge
         showing the day gap, the whole thesis of the tool made physical. -->
    <div v-if="correlation" class="stamp" :class="{ 'stamp--confirmed': correlation.confidence === 'manual' }">
      <span class="stamp__days">{{ correlation.daysApart }}</span>
      <span class="stamp__label">days apart</span>
    </div>
  </li>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  item: { type: Object, required: true },
  correlation: { type: Object, default: null },
})

const typeLabel = computed(() =>
  props.item.itemType === 'filing' ? 'SEC Filing' : 'Gov Action'
)

const description = computed(() => {
  if (props.item.itemType === 'filing') {
    const codes = { A: 'Acquired', D: 'Disposed', S: 'Sold', P: 'Purchased' }
    return codes[props.item.subtype] || props.item.subtype || 'Ownership change'
  }
  return props.item.description || 'Government action'
})

const formattedDate = computed(() =>
  new Date(props.item.occurredAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
)

function formatNumber(n) {
  return new Intl.NumberFormat('en-US').format(Math.round(n))
}
</script>

<style scoped>
.entry {
  display: grid;
  grid-template-columns: 24px 1fr auto;
  gap: 16px;
  position: relative;
  padding: 20px 0;
  border-bottom: 1px solid var(--paper-dim);
}
.entry:last-child {
  border-bottom: none;
}

.entry__rail {
  display: flex;
  justify-content: center;
}
.entry__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: 4px;
  background: var(--wire-blue);
}
.entry--gov_event .entry__dot {
  background: var(--seal-gold);
}

.entry__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 6px;
}

.entry__type {
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--wire-blue);
}
.entry--gov_event .entry__type {
  color: var(--seal-gold);
}

.entry__date {
  font-size: 12px;
  color: var(--muted-ink);
}

.entry__desc {
  margin: 0 0 8px;
  font-size: 14px;
}

.entry__figures {
  font-size: 13px;
  color: var(--muted-ink);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 12px;
}

.entry__code {
  padding: 1px 6px;
  border: 1px solid var(--muted-ink);
  border-radius: var(--radius);
  font-size: 11px;
  align-self: center;
  flex-shrink: 0;
  white-space: nowrap;
}

.entry__link {
  display: inline-block;
  margin-top: 8px;
  font-size: 12px;
}

/* the stamp */
.stamp {
  align-self: center;
  border: 2px solid var(--stamp-red);
  color: var(--stamp-red);
  border-radius: var(--radius);
  padding: 6px 10px;
  transform: rotate(-4deg);
  text-align: center;
  white-space: nowrap;
  opacity: 0.85;
}
.stamp--confirmed {
  opacity: 1;
  background: color-mix(in srgb, var(--stamp-red) 12%, transparent);
}
.stamp__days {
  display: block;
  font-family: var(--font-mono);
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
}
.stamp__label {
  display: block;
  font-family: var(--font-mono);
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

@media (max-width: 600px) {
  .entry {
    grid-template-columns: 16px 1fr;
  }
  .stamp {
    grid-column: 1 / -1;
    justify-self: start;
    transform: rotate(-2deg);
  }
}
</style>

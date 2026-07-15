<template>
  <div class="shell">
    <header class="masthead">
      <router-link to="/" class="masthead__title">
        Suspiciously<br />Well-Timed
      </router-link>
      <p class="masthead__tag">A timeline of public filings. Data, not verdicts.</p>
      <nav class="masthead__nav">
        <router-link to="/">Entities</router-link>
        <router-link to="/review">Review queue</router-link>
      </nav>
    </header>
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.shell {
  max-width: 920px;
  margin: 0 auto;
  padding: 0 24px;
}

.masthead {
  padding: 48px 0 32px;
  border-bottom: 1px solid var(--paper-dim);
  margin-bottom: 32px;
}

.masthead__title {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 28px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--paper);
  text-decoration: none;
}
.masthead__title:hover {
  text-decoration: none;
  color: var(--paper);
}

.masthead__tag {
  color: var(--muted-ink);
  font-size: 13px;
  margin: 12px 0 20px;
}

.masthead__nav {
  display: flex;
  gap: 20px;
}
.masthead__nav a {
  font-family: var(--font-mono);
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--wire-blue);
}

.content {
  padding-bottom: 80px;
}
</style>

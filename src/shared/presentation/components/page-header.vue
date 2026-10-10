<script setup>
/**
 * Breadcrumb, title, subtitle and actions shown at the top of every workspace page.
 */
defineProps({
  /** Breadcrumb items, already translated. */
  breadcrumb: { type: Array, default: () => [] },
  /** Page title. */
  title: { type: String, required: true },
  /** Short description below the title. */
  subtitle: { type: String, default: '' }
});
</script>

<template>
  <header class="page-header">
    <div>
      <p v-if="breadcrumb.length" class="breadcrumb">{{ breadcrumb.join(' / ') }}</p>
      <h1>{{ title }}</h1>
      <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
    </div>
    <div class="actions"><slot/></div>
  </header>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
}

.breadcrumb {
  margin-bottom: 6px;
  color: var(--muted);
  font-size: 13px;
}

.subtitle {
  margin-top: 8px;
  color: var(--muted);
  font-size: 15px;
}

.actions {
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  gap: 12px;
}

@media (max-width: 700px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

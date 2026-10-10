<script setup>
import {useI18n} from "vue-i18n";
import {workspaceEnvironments} from "../../../shared/presentation/workspace-environments.js";

const { t } = useI18n();

/** The three environments, with the first four features of each one. */
const environments = Object.values(workspaceEnvironments).map(item => ({...item, summary: item.features.slice(0, 4)}));

/** Plans section of the Landing Page. */
const plansUrl = `${import.meta.env.VITE_LANDING_PAGE_URL}#plans`;
</script>

<template>
  <section class="selection">
    <p class="overline">{{ t('iam.selection.overline') }}</p>
    <h1>{{ t('iam.selection.title') }}</h1>
    <p class="muted lead">{{ t('iam.selection.subtitle') }}</p>

    <div class="environments">
      <pv-card v-for="item in environments" :key="item.key" class="environment" :class="`accent-${item.accent}`">
        <template #content>
          <div class="flex flex-column gap-3 h-full">
            <span class="icon" aria-hidden="true"><i :class="item.icon"></i></span>
            <p class="label">{{ t(`environments.${item.key}.label`) }}</p>
            <h2>{{ t(`environments.${item.key}.role`) }}</h2>
            <p class="muted">{{ t(`environments.${item.key}.description`) }}</p>
            <ul class="features">
              <li v-for="feature in item.summary" :key="feature">
                <i class="pi pi-check-circle" aria-hidden="true"></i>{{ t(`environments.features.${feature}`) }}
              </li>
            </ul>
            <pv-button as-child v-slot="slotProps">
              <router-link :to="{ name: 'iam-sign-in', params: { environment: item.key } }" :class="[slotProps['class'], 'continue']">
                {{ t(`environments.${item.key}.continue`) }}
              </router-link>
            </pv-button>
          </div>
        </template>
      </pv-card>
    </div>

    <p class="links">
      <strong>{{ t('iam.selection.not-customer') }}</strong>
      <a :href="plansUrl">{{ t('iam.selection.see-plans') }} →</a>
    </p>
  </section>
</template>

<style scoped>
.selection {
  max-width: 1312px;
  margin: 0 auto;
  text-align: center;
}

.overline {
  color: var(--teal);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.selection h1 {
  margin: 10px 0 14px;
  font-size: 40px;
}

.lead {
  font-size: 17px;
}

.environments {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 32px;
  margin: 44px 0 40px;
  text-align: left;
}

.environment {
  border-top: 5px solid var(--accent);
}

.environment :deep(.p-card-body),
.environment :deep(.p-card-content) {
  flex: 1;
}

.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--accent-pale);
  color: var(--accent);
  font-size: 28px;
}

.icon i {
  font-size: 28px;
}

.label {
  color: var(--accent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.environment h2 {
  font-size: 24px;
}

.features {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  margin: 8px 0 12px;
  padding: 0;
  list-style: none;
}

.features li {
  display: flex;
  align-items: center;
  gap: 10px;
}

.features i {
  color: var(--accent);
}

.continue {
  justify-content: center;
  padding-block: 14px;
  border-color: var(--accent);
  background: var(--accent);
}

.links {
  margin-top: 12px;
  font-size: 15px;
}

.links a {
  margin-left: 6px;
}

@media (max-width: 1000px) {
  .environments {
    grid-template-columns: 1fr;
  }

  .selection h1 {
    font-size: 30px;
  }
}
</style>

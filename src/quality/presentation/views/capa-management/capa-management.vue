<script setup>
import {computed, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import PageHeader from "../../../../shared/presentation/components/page-header.vue";
import {formatDate} from "../../../../shared/presentation/format.js";
import useQualityStore from "../../../application/quality.store.js";
import {CapaAction} from "../../../domain/model/capa-action.entity.js";

/**
 * CAPA plan: actions and their evidence, root cause analysis, accountability and routing to an independent reviewer.
 */
const { t, locale } = useI18n();
const store = useQualityStore();

/** Code of the plan shown. */
const code = ref('CAPA-26009');
const plan = computed(() => store.capaPlans.find(item => item.code === code.value));
const actions = computed(() => store.actionsOf(code.value));
/** Actions whose evidence is attached. */
const attached = computed(() => actions.value.filter(action => action.evidenceAttached).length);
/** Deviation that originated the plan. */
const deviation = computed(() => store.deviations.find(item => item.code === plan.value?.sourceDeviation));
/** Reasons why the plan could not be routed; an empty array means it was routed. */
const rejection = ref(null);

/** Root cause of the plan, and whether it changed since it was saved. */
const rootCause = ref('');
const rootCauseDirty = ref(false);
/** New action title. */
const newAction = ref('');

/** Fills the root cause when the plan changes. */
watch(plan, current => {
  if (current && !rootCauseDirty.value) rootCause.value = current.rootCause;
}, { immediate: true });

/**
 * Color of an action status chip.
 * @param {string} status - Action status.
 * @returns {string} Chip class.
 */
const toneOf = (status) => ({ open: 'chip-warning', planned: 'chip-neutral', 'in-review': 'chip-teal', complete: 'chip-success' })[status] ?? 'chip-neutral';

/** Saves the root cause. */
const saveRootCause = () => {
  if (!plan.value) return;
  store.saveCapa(plan.value, { rootCause: rootCause.value.trim() });
  rootCauseDirty.value = false;
};

/** Routes the plan for approval, or shows why it cannot be routed. */
const route = () => {
  if (!plan.value) return;
  rejection.value = store.routeCapa({ ...plan.value, rootCause: rootCause.value.trim() });
  if (!rejection.value.length) rootCauseDirty.value = false;
};

/** Adds an action to the plan. */
const addAction = () => {
  const title = newAction.value.trim();
  if (!title) return;
  store.addAction(new CapaAction({
    capaCode: code.value, code: `PA-0${actions.value.length + 1}`, title, owner: plan.value?.owner ?? '',
    dueAt: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), status: 'open', evidence: 'Evidence of completion', evidenceAttached: false
  }));
  newAction.value = '';
};
</script>

<template>
  <section class="page">
    <template v-if="plan">
      <page-header :breadcrumb="[t('shell.workspace'), t('environments.qa.short'), t('quality.capa.title')]"
                   :title="t('quality.capa.title')"
                   :subtitle="`${plan.code} · ${plan.title} · ${t('quality.capa.source')} ${plan.sourceDeviation}`">
        <div class="route">
          <pv-button :label="t('quality.capa.route')" :disabled="plan.status === 'in-approval'" @click="route"/>
          <span class="small muted">{{ t('quality.capa.no-self-approve') }}</span>
        </div>
      </page-header>

      <div class="alert alert-info" role="status">
        <div><strong>{{ t('quality.capa.effectiveness') }}</strong><p>{{ plan.acceptanceCriterion }}</p></div>
      </div>
      <template v-if="rejection">
        <div v-if="rejection.length" class="alert alert-danger" role="alert">
          <div>
            <strong>{{ t('quality.capa.cannot-route') }}</strong>
            <p v-for="reason in rejection" :key="reason">• {{ t(`quality.capa.rejected.${reason}`) }}</p>
          </div>
        </div>
        <div v-else class="alert alert-info" role="status"><strong>{{ t('quality.capa.routed', { reviewer: plan.reviewer }) }}</strong></div>
      </template>

      <div class="columns">
        <div class="stack">
          <pv-card>
            <template #title>
              <div class="row justify-content-between">
                <span>{{ t('quality.capa.actions') }}</span>
                <span class="chip chip-teal">{{ t('quality.capa.attached', { count: attached, total: actions.length }) }}</span>
              </div>
            </template>
            <template #content>
              <pv-data-table :value="actions" data-key="id" scrollable :aria-label="t('quality.capa.actions')">
                <pv-column :header="t('quality.capa.action')">
                  <template #body="{ data }"><strong class="code">{{ data.code }}</strong><span class="sub">{{ data.title }}</span></template>
                </pv-column>
                <pv-column field="owner" :header="t('manufacturing.batches.owner')"/>
                <pv-column :header="t('quality.capa.due')">
                  <template #body="{ data }">{{ formatDate(data.dueAt, locale) }}</template>
                </pv-column>
                <pv-column :header="t('shell.status')">
                  <template #body="{ data }"><span class="chip" :class="toneOf(data.status)">{{ t(`quality.action-status.${data.status}`) }}</span></template>
                </pv-column>
                <pv-column :header="t('quality.capa.evidence')">
                  <template #body="{ data }">
                    <span v-if="data.evidenceAttached" class="chip chip-success"><i class="pi pi-check" aria-hidden="true"></i>{{ data.evidence }}</span>
                    <template v-else>
                      <pv-button :label="`${t('quality.capa.attach')} ↑`" severity="secondary" outlined size="small" @click="store.attachActionEvidence(data)"/>
                      <span class="sub">{{ data.evidence }}</span>
                    </template>
                  </template>
                </pv-column>
              </pv-data-table>
              <div class="add">
                <pv-input-text v-model="newAction" class="flex-1" :placeholder="t('quality.capa.new-action')" :aria-label="t('quality.capa.new-action')"
                               @keyup.enter="addAction"/>
                <pv-button :label="`+ ${t('quality.capa.add-action')}`" severity="secondary" outlined @click="addAction"/>
              </div>
            </template>
          </pv-card>

          <pv-card class="panel">
            <template #content>
              <h2>{{ t('quality.capa.root-cause-analysis') }}</h2>
              <div class="field">
                <label for="root-cause">{{ t('quality.capa.root-cause') }}</label>
                <pv-textarea id="root-cause" v-model="rootCause" rows="3" fluid @input="rootCauseDirty = true"/>
              </div>
              <pv-button class="align-self-start" :label="t('quality.capa.save-root-cause')" severity="secondary" outlined
                         :disabled="!rootCauseDirty" @click="saveRootCause"/>
              <div class="box teal">
                <strong>{{ t('quality.capa.check') }} · {{ formatDate(plan.effectivenessCheckAt, locale) }}</strong>
                <p>{{ t('quality.capa.check-text', { reviewer: plan.reviewer }) }}</p>
              </div>
              <div class="box orange">
                <strong>{{ t('quality.capa.closure-gate') }}</strong>
                <p>{{ t('quality.capa.closure-text') }}</p>
              </div>
            </template>
          </pv-card>
        </div>

        <aside class="stack">
          <pv-card class="panel">
            <template #content>
              <h2>{{ t('quality.capa.accountability') }}</h2>
              <p class="label">{{ t('quality.capa.owner') }}</p><p><strong>{{ plan.owner }}</strong></p>
              <p class="label">{{ t('quality.capa.risk') }}</p>
              <p v-if="deviation">
                <span class="chip chip-danger">{{ t(`quality.classification.${deviation.classification}`) }} · RPN {{ deviation.severity * deviation.likelihood * deviation.detectability }}</span>
              </p>
              <p class="label">{{ t('quality.capa.reviewer') }}</p><p><strong>{{ plan.reviewer }}</strong></p>
              <p class="label">{{ t('shell.status') }}</p><p>{{ t(`quality.capa-status.${plan.status}`) }}</p>
            </template>
          </pv-card>
          <pv-card class="panel">
            <template #content>
              <h2>{{ t('quality.capa.required-evidence') }}</h2>
              <p class="small muted">{{ t('quality.capa.required-text') }}</p>
              <div v-for="action in actions" :key="action.id" class="evidence-item">
                <span>{{ action.evidence }}</span>
                <span class="chip" :class="action.evidenceAttached ? 'chip-success' : 'chip-neutral'">
                  {{ t(action.evidenceAttached ? 'quality.capa.uploaded' : 'quality.capa.pending') }}
                </span>
              </div>
              <p class="small muted box">{{ t('quality.capa.uploaded-count', { count: attached, total: actions.length }) }}</p>
            </template>
          </pv-card>
        </aside>
      </div>
    </template>
  </section>
</template>

<style scoped>
.route {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.code {
  color: var(--teal);
}

.add {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 16px;
}

.label {
  color: var(--slate);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.box {
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--gray-bg);
}

.box.teal {
  border-color: var(--teal);
  background: var(--mint);
  color: var(--teal);
}

.box.orange {
  border-color: #fed7aa;
  background: #fff7ed;
  color: #9a3412;
}

.evidence-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
}

@media (max-width: 600px) {
  .add {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

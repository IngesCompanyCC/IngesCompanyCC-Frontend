<script setup>
import {computed, reactive, ref} from "vue";
import {useI18n} from "vue-i18n";
import PageHeader from "../../../../shared/presentation/components/page-header.vue";
import {formatDate, formatDateTime} from "../../../../shared/presentation/format.js";
import useQualityStore from "../../../application/quality.store.js";
import useIamStore from "../../../../iam/application/iam.store.js";
import {CollaborationTask} from "../../../domain/model/collaboration-task.entity.js";

/**
 * Tasks and collaboration shared by every environment: the team inbox, task assignment and the discussion of a record.
 */
const { t, locale } = useI18n();
const store = useQualityStore();
const iamStore = useIamStore();

/** Record whose discussion is shown. */
const recordCode = ref('DEV-26017');
/** Tasks of the signed-in user. */
const myTasks = computed(() => store.tasks.filter(task => task.owner === iamStore.currentUser?.fullName && task.status !== 'done'));
/** Tasks waiting for an approval. */
const approvals = computed(() => store.tasks.filter(task => task.title.startsWith('Approve')).length);
/** Comments of the record. */
const comments = computed(() => store.commentsOf(recordCode.value));
/** Comment being written. */
const comment = ref('');

/** People who can receive a task. */
const owners = ['María México', 'Lucía Paredes', 'Elena Paz', 'Alberto Valle', 'Jorge Salas'];
const emptyForm = () => ({ title: '', recordCode: recordCode.value, owner: '', dueAt: '' });
/** Task assignment form. */
const form = reactive(emptyForm());
const submitted = ref(false);
const errors = computed(() => ({
  title: submitted.value && !form.title.trim(),
  recordCode: submitted.value && !form.recordCode.trim(),
  owner: submitted.value && !form.owner,
  dueAt: submitted.value && !form.dueAt
}));

/**
 * Color of a task status chip.
 * @param {string} status - Task status.
 * @returns {string} Chip class.
 */
const toneOf = (status) => ({ 'in-review': 'chip-teal', ready: 'chip-success', pending: 'chip-warning', done: 'chip-success' })[status] ?? 'chip-neutral';

/** Assigns the task. */
const assign = () => {
  submitted.value = true;
  if (Object.values(errors.value).some(Boolean)) return;
  store.addTask(new CollaborationTask({
    title: form.title.trim(), recordCode: form.recordCode.trim(), detail: `Assigned by ${iamStore.currentUser?.fullName ?? ''}`,
    owner: form.owner, dueAt: new Date(form.dueAt).toISOString(), status: 'to-do'
  }));
  Object.assign(form, { ...emptyForm(), recordCode: form.recordCode });
  submitted.value = false;
};

/** Posts the comment in the discussion. */
const send = () => {
  const text = comment.value.trim();
  if (!text) return;
  store.addComment(recordCode.value, text);
  comment.value = '';
};
</script>

<template>
  <section class="page">
    <page-header :breadcrumb="[t('shell.workspace'), t('nav.tasks')]" :title="t('nav.tasks')" :subtitle="t('quality.tasks.subtitle')"/>

    <div class="stats">
      <pv-card class="stat"><template #content>
        <p class="stat-label">{{ t('quality.tasks.my-open') }}</p><p class="stat-value">{{ myTasks.length }}</p>
      </template></pv-card>
      <pv-card class="stat"><template #content>
        <p class="stat-label">{{ t('quality.tasks.team-open') }}</p><p class="stat-value">{{ store.tasks.length }}</p>
      </template></pv-card>
      <pv-card class="stat"><template #content>
        <p class="stat-label">{{ t('quality.tasks.approvals') }}</p><p class="stat-value">{{ approvals }}</p>
        <p class="stat-note">{{ t('quality.tasks.approvals-note') }}</p>
      </template></pv-card>
      <pv-card class="stat"><template #content>
        <p class="stat-label">{{ t('quality.tasks.comments') }}</p><p class="stat-value">{{ comments.length }}</p>
        <p class="stat-note">{{ recordCode }}</p>
      </template></pv-card>
    </div>

    <div class="columns">
      <pv-card>
        <template #title>{{ t('quality.tasks.inbox') }}</template>
        <template #subtitle>{{ t('quality.tasks.inbox-text') }}</template>
        <template #content>
          <pv-data-table :value="store.tasks" data-key="id" scrollable :aria-label="t('quality.tasks.inbox')"
                         :row-class="task => ({ highlight: task.recordCode.startsWith(recordCode) })">
            <pv-column :header="t('quality.tasks.task-record')">
              <template #body="{ data }"><strong>{{ data.title }}</strong><span class="sub">{{ data.recordCode }} · {{ data.detail }}</span></template>
            </pv-column>
            <pv-column field="owner" :header="t('manufacturing.batches.owner')"/>
            <pv-column :header="t('quality.capa.due')">
              <template #body="{ data }">{{ formatDate(data.dueAt, locale) }}</template>
            </pv-column>
            <pv-column :header="t('shell.status')">
              <template #body="{ data }"><span class="chip chip-dot" :class="toneOf(data.status)">{{ t(`quality.task-status.${data.status}`) }}</span></template>
            </pv-column>
            <pv-column>
              <template #body="{ data }">
                <pv-button :label="t('quality.tasks.discuss')" severity="secondary" outlined size="small"
                           @click="recordCode = data.recordCode.split(' ')[0]"/>
              </template>
            </pv-column>
          </pv-data-table>
        </template>
      </pv-card>

      <pv-card class="panel">
        <template #content>
          <form class="flex flex-column gap-3" novalidate @submit.prevent="assign">
            <div>
              <h2>{{ t('quality.tasks.new') }}</h2>
              <p class="small muted">{{ t('quality.tasks.new-text') }}</p>
            </div>
            <div class="field">
              <label for="task-title">{{ t('quality.tasks.title') }} *</label>
              <pv-input-text id="task-title" v-model="form.title" fluid :invalid="errors.title"/>
            </div>
            <div class="field">
              <label for="task-record">{{ t('quality.tasks.record') }} *</label>
              <pv-input-text id="task-record" v-model="form.recordCode" fluid :invalid="errors.recordCode"/>
            </div>
            <div class="field">
              <label for="task-owner">{{ t('manufacturing.batches.owner') }} *</label>
              <pv-select input-id="task-owner" v-model="form.owner" :options="owners" placeholder="—" fluid :invalid="errors.owner"/>
            </div>
            <div class="field">
              <label for="task-due">{{ t('quality.tasks.due') }} *</label>
              <pv-input-text id="task-due" v-model="form.dueAt" type="datetime-local" fluid :invalid="errors.dueAt"/>
            </div>
            <pv-button type="submit" :label="t('quality.tasks.assign')" fluid/>
          </form>
        </template>
      </pv-card>
    </div>

    <div class="columns">
      <pv-card class="panel">
        <template #content>
          <h2>{{ t('quality.tasks.discussion') }} · {{ recordCode }}</h2>
          <p class="small muted">{{ t('quality.tasks.discussion-text') }}</p>
          <div v-for="item in comments" :key="item.id" class="comment">
            <span class="avatar" aria-hidden="true">{{ item.initials }}</span>
            <div>
              <p><strong>{{ item.author }}</strong> <span class="small muted">· {{ formatDateTime(item.postedAt, locale) }} UTC</span></p>
              <p>{{ item.text }}</p>
            </div>
          </div>
          <p v-if="!comments.length" class="muted">{{ t('quality.tasks.no-comments') }}</p>
          <div class="row">
            <pv-input-text v-model="comment" class="flex-1" :placeholder="t('quality.tasks.comment-placeholder')"
                           :aria-label="t('quality.tasks.comment-placeholder')" @keyup.enter="send"/>
            <pv-button :label="t('quality.tasks.send')" @click="send"/>
          </div>
        </template>
      </pv-card>
      <pv-card class="panel">
        <template #content>
          <h2>{{ t('quality.tasks.controls') }}</h2>
          <strong>{{ t('quality.tasks.record-access') }}</strong><p class="small muted">{{ t('quality.tasks.record-access-text') }}</p>
          <strong>{{ t('quality.tasks.attribution') }}</strong><p class="small muted">{{ t('quality.tasks.attribution-text') }}</p>
          <strong>{{ t('quality.tasks.not-approval') }}</strong><p class="small muted">{{ t('quality.tasks.not-approval-text') }}</p>
        </template>
      </pv-card>
    </div>
  </section>
</template>

<style scoped>
.comment {
  display: flex;
  gap: 12px;
}

.avatar {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f1f5f9;
  color: var(--slate);
  font-size: 13px;
  font-weight: 700;
}
</style>

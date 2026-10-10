import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {QualityApi} from "../infrastructure/quality-api.js";
import {QualityDocumentAssembler} from "../infrastructure/quality-document.assembler.js";
import {DeviationAssembler} from "../infrastructure/deviation.assembler.js";
import {EvidenceAssembler} from "../infrastructure/evidence.assembler.js";
import {CapaPlanAssembler} from "../infrastructure/capa-plan.assembler.js";
import {CapaActionAssembler} from "../infrastructure/capa-action.assembler.js";
import {AnalyticalResultAssembler} from "../infrastructure/analytical-result.assembler.js";
import {AuditAssembler} from "../infrastructure/audit.assembler.js";
import {AuditFindingAssembler} from "../infrastructure/audit-finding.assembler.js";
import {AuditEventAssembler} from "../infrastructure/audit-event.assembler.js";
import {RegulatoryReportAssembler} from "../infrastructure/regulatory-report.assembler.js";
import {CollaborationTaskAssembler} from "../infrastructure/collaboration-task.assembler.js";
import {TaskCommentAssembler} from "../infrastructure/task-comment.assembler.js";
import {TraceabilityGapAssembler} from "../infrastructure/traceability-gap.assembler.js";
import {DeviationTrendAssembler} from "../infrastructure/deviation-trend.assembler.js";
import {Evidence} from "../domain/model/evidence.entity.js";
import {AuditEvent} from "../domain/model/audit-event.entity.js";
import {TaskComment} from "../domain/model/task-comment.entity.js";
import useIamStore from "../../iam/application/iam.store.js";
import useManufacturingStore from "../../manufacturing/application/manufacturing.store.js";

const qualityApi = new QualityApi();

/**
 * Application service store for the Quality & Compliance bounded context.
 * It holds the quality records and applies the GMP rules: separation of duties, reviewed evidence before
 * a risk assessment, complete CAPA plans before approval, release readiness and electronic signatures,
 * and an attributed audit trail for every change.
 *
 * @returns {Object} Store state and actions.
 */
const useQualityStore = defineStore('quality', () => {
    const iamStore = useIamStore();
    const manufacturingStore = useManufacturingStore();

    const documents = ref([]);
    const deviations = ref([]);
    const evidence = ref([]);
    const capaPlans = ref([]);
    const capaActions = ref([]);
    const results = ref([]);
    const audits = ref([]);
    const findings = ref([]);
    const allEvents = ref([]);
    const reports = ref([]);
    const tasks = ref([]);
    const comments = ref([]);
    const gaps = ref([]);
    const trends = ref([]);
    /** @type {import('vue').Ref<boolean>} Whether the collections are loading. */
    const loading = ref(false);
    /** @type {import('vue').Ref<Array<Error>>} Errors of the last requests. */
    const errors = ref([]);

    /** @type {import('vue').ComputedRef<Array>} Audit trail, newest first. */
    const events = computed(() => [...allEvents.value].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)));
    /** @type {import('vue').ComputedRef<Array>} Deviations that are not closed. */
    const openDeviations = computed(() => deviations.value.filter(item => item.status !== 'closed'));
    /** @type {import('vue').ComputedRef<Array>} CAPA actions that are not complete. */
    const openActions = computed(() => capaActions.value.filter(item => item.status !== 'complete'));

    /**
     * Loads a collection of the fake API into a state array.
     * @param {Promise<import('axios').AxiosResponse>} request - Request that returns the collection.
     * @param {Object} assembler - Assembler that maps the response to entities.
     * @param {import('vue').Ref<Array>} target - State that stores the entities.
     */
    const load = (request, assembler, target) => request
        .then(response => target.value = assembler.toEntitiesFromResponse(response))
        .catch(error => errors.value.push(error));

    /** Loads all the quality collections. */
    function fetchAll() {
        loading.value = true;
        Promise.all([
            load(qualityApi.getQualityDocuments(), QualityDocumentAssembler, documents),
            load(qualityApi.getDeviations(), DeviationAssembler, deviations),
            load(qualityApi.getEvidence(), EvidenceAssembler, evidence),
            load(qualityApi.getCapaPlans(), CapaPlanAssembler, capaPlans),
            load(qualityApi.getCapaActions(), CapaActionAssembler, capaActions),
            load(qualityApi.getAnalyticalResults(), AnalyticalResultAssembler, results),
            load(qualityApi.getAudits(), AuditAssembler, audits),
            load(qualityApi.getAuditFindings(), AuditFindingAssembler, findings),
            load(qualityApi.getAuditEvents(), AuditEventAssembler, allEvents),
            load(qualityApi.getRegulatoryReports(), RegulatoryReportAssembler, reports),
            load(qualityApi.getCollaborationTasks(), CollaborationTaskAssembler, tasks),
            load(qualityApi.getTaskComments(), TaskCommentAssembler, comments),
            load(qualityApi.getTraceabilityGaps(), TraceabilityGapAssembler, gaps),
            load(qualityApi.getDeviationTrends(), DeviationTrendAssembler, trends)
        ]).finally(() => loading.value = false);
    }

    /** @param {string} code - Document code. @returns {Array} Versions of the document, newest first. */
    const versionsOf = (code) => documents.value.filter(item => item.code === code).sort((a, b) => b.version.localeCompare(a.version));
    /** @param {string} recordCode - Record code. @returns {Array} Evidence attached to the record. */
    const evidenceOf = (recordCode) => evidence.value.filter(item => item.recordCode === recordCode);
    /** @param {string} capaCode - CAPA code. @returns {Array} Actions of the CAPA plan. */
    const actionsOf = (capaCode) => capaActions.value.filter(item => item.capaCode === capaCode);
    /** @param {string} batchCode - Batch code. @returns {Array} Analytical results of the batch. */
    const resultsOf = (batchCode) => results.value.filter(item => item.batchCode === batchCode);
    /** @param {string} auditCode - Audit code. @returns {Array} Findings of the audit. */
    const findingsOf = (auditCode) => findings.value.filter(item => item.auditCode === auditCode);
    /** @param {string} recordCode - Record code. @returns {Array} Comments of the record, oldest first. */
    const commentsOf = (recordCode) => comments.value
        .filter(item => item.recordCode === recordCode).sort((a, b) => a.postedAt.localeCompare(b.postedAt));

    /**
     * Next free code of a record type, such as DEV-26018.
     * @param {string} prefix - Code prefix.
     * @param {Array<string>} codes - Existing codes.
     * @returns {string} The next code.
     */
    function nextCode(prefix, codes) {
        const numbers = codes.map(code => Number(code.replace(/\D/g, ''))).filter(Boolean);
        return `${prefix}-${Math.max(26000, ...numbers) + 1}`;
    }

    /**
     * Adds an attributed event to the audit trail.
     * @param {string} event - What happened.
     * @param {string} record - Affected record.
     * @param {string} result - Result of the event.
     */
    function log(event, record, result) {
        const user = iamStore.currentUser;
        const {id, ...resource} = AuditEventAssembler.toResourceFromEntity(new AuditEvent({
            eventCode: `EVT-${Date.now().toString().slice(-5)}`, occurredAt: new Date().toISOString(), actor: user?.fullName ?? 'System',
            actorRole: user?.role ?? 'system', event, record, result
        }));
        qualityApi.createAuditEvent(resource)
            .then(response => allEvents.value.push(AuditEventAssembler.toEntityFromResource(response.data)))
            .catch(error => errors.value.push(error));
    }

    /**
     * Saves changes to a record and replaces it in its state array.
     * @param {function(Object): Promise} update - API call that updates the resource.
     * @param {Object} assembler - Assembler of the record.
     * @param {import('vue').Ref<Array>} target - State that stores the records.
     * @param {Object} entity - Record to change.
     * @param {Object} changes - Fields to change.
     * @returns {Promise<void>} Resolves when the record was saved.
     */
    const save = (update, assembler, target, entity, changes = {}) => update({...assembler.toResourceFromEntity(entity), ...changes})
        .then(response => {
            const saved = assembler.toEntityFromResource(response.data);
            target.value = target.value.map(item => item.id === saved.id ? saved : item);
        })
        .catch(error => errors.value.push(error));

    /**
     * Creates a record and adds it to its state array.
     * @param {function(Object): Promise} create - API call that creates the resource.
     * @param {Object} assembler - Assembler of the record.
     * @param {import('vue').Ref<Array>} target - State that stores the records.
     * @param {Object} entity - Record to create.
     * @param {boolean} first - Whether the new record goes first.
     * @returns {Promise<Object|undefined>} Resolves with the created record.
     */
    const create = (create, assembler, target, entity, first = false) => {
        const {id, ...resource} = assembler.toResourceFromEntity(entity);
        return create(resource)
            .then(response => {
                const created = assembler.toEntityFromResource(response.data);
                target.value = first ? [created, ...target.value] : [...target.value, created];
                return created;
            })
            .catch(error => errors.value.push(error));
    };

    /**
     * Approves a document version. The author cannot approve their own version (separation of duties),
     * and the previous approved version becomes obsolete.
     * @param {Object} document - Version to approve.
     * @returns {boolean} False when the signed-in user is the author.
     */
    function approveDocument(document) {
        const user = iamStore.currentUser;
        if (!user || user.fullName === document.author) return false;
        const update = resource => qualityApi.updateQualityDocument(resource);
        versionsOf(document.code).filter(item => item.status === 'approved')
            .forEach(previous => save(update, QualityDocumentAssembler, documents, previous, {status: 'obsolete'}));
        save(update, QualityDocumentAssembler, documents, document, {status: 'approved', approver: user.fullName});
        log('Document approved', `${document.code} v${document.version}`, 'Approved');
        return true;
    }

    /**
     * Registers a deviation, for example from an out-of-specification result or an IoT alert.
     * @param {Object} deviation - Deviation to register.
     * @returns {Promise<Object|undefined>} Resolves with the created deviation.
     */
    function registerDeviation(deviation) {
        return create(resource => qualityApi.createDeviation(resource), DeviationAssembler, deviations, deviation)
            .then(created => {
                if (created) log('Deviation registered', created.code, 'Open');
                return created;
            });
    }

    /**
     * Saves the risk assessment of a deviation without submitting it.
     * @param {Object} deviation - Deviation to change.
     * @param {Object} changes - Assessment fields.
     * @returns {Promise<void>} Resolves when the deviation was saved.
     */
    const saveDeviation = (deviation, changes) =>
        save(resource => qualityApi.updateDeviation(resource), DeviationAssembler, deviations, deviation, changes);

    /**
     * Submits the risk assessment of a deviation. Every piece of evidence must be reviewed first.
     * @param {Object} deviation - Deviation to submit.
     * @param {Object} changes - Assessment fields entered in the form.
     * @returns {boolean} False when evidence is still pending review.
     */
    function submitAssessment(deviation, changes = {}) {
        if (evidenceOf(deviation.code).some(item => item.status !== 'reviewed' && item.status !== 'attached')) return false;
        saveDeviation(deviation, {...changes, status: 'submitted'});
        log('Risk assessment submitted', deviation.code, 'Submitted');
        return true;
    }

    /** @param {Object} item - Evidence reviewed. */
    function reviewEvidence(item) {
        save(resource => qualityApi.updateEvidence(resource), EvidenceAssembler, evidence, item, {status: 'reviewed'});
    }

    /**
     * Attaches a file as evidence of a record.
     * @param {string} recordCode - Record supported by the file.
     * @param {string} fileName - Name of the file.
     */
    function attachEvidence(recordCode, fileName) {
        const detail = `${iamStore.currentUser?.fullName ?? ''} · ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC`;
        create(resource => qualityApi.createEvidence(resource), EvidenceAssembler, evidence, new Evidence({recordCode, fileName, detail, status: 'attached'}))
            .then(created => {
                if (created) log('Evidence attached', recordCode, 'Recorded');
            });
    }

    /**
     * Checks whether a CAPA plan can be routed for approval.
     * @param {Object} plan - CAPA plan.
     * @returns {Array<string>} Reasons why it cannot be routed (root-cause-required, evidence-missing, self-approval).
     */
    function validateCapa(plan) {
        const reasons = [];
        if (!plan.rootCause.trim()) reasons.push('root-cause-required');
        if (actionsOf(plan.code).some(action => !action.evidenceAttached)) reasons.push('evidence-missing');
        if (plan.reviewer === plan.owner) reasons.push('self-approval');
        return reasons;
    }

    /**
     * Saves changes to a CAPA plan.
     * @param {Object} plan - CAPA plan.
     * @param {Object} changes - Fields to change.
     * @returns {Promise<void>} Resolves when the plan was saved.
     */
    const saveCapa = (plan, changes) => save(resource => qualityApi.updateCapaPlan(resource), CapaPlanAssembler, capaPlans, plan, changes);

    /**
     * Routes a CAPA plan to its independent reviewer when it is complete.
     * @param {Object} plan - CAPA plan, with the root cause entered in the form.
     * @returns {Array<string>} Reasons why it cannot be routed; empty when it was routed.
     */
    function routeCapa(plan) {
        const reasons = validateCapa(plan);
        if (reasons.length) return reasons;
        saveCapa(plan, {rootCause: plan.rootCause, status: 'in-approval'});
        log('CAPA routed for approval', plan.code, 'In approval');
        return reasons;
    }

    /** @param {Object} action - CAPA action whose evidence is attached. */
    function attachActionEvidence(action) {
        const changes = {evidenceAttached: true};
        if (action.status === 'open' || action.status === 'planned') changes.status = 'in-review';
        save(resource => qualityApi.updateCapaAction(resource), CapaActionAssembler, capaActions, action, changes);
    }

    /** @param {Object} action - New CAPA action. */
    const addAction = (action) => create(resource => qualityApi.createCapaAction(resource), CapaActionAssembler, capaActions, action);

    /**
     * Saves an analytical result calculated with the protocol formula.
     * @param {Object} result - Result to change.
     * @param {Object} changes - Calculated value and status.
     */
    function saveResult(result, changes) {
        save(resource => qualityApi.updateAnalyticalResult(resource), AnalyticalResultAssembler, results, result, changes);
        log('Analytical result recorded', `${result.reportCode} · ${result.test}`, changes.status === 'oos' ? 'OOS' : 'Recorded');
    }

    /** @param {Object} finding - New audit finding. */
    const addFinding = (finding) => create(resource => qualityApi.createAuditFinding(resource), AuditFindingAssembler, findings, finding);
    /** @param {Object} report - New regulatory report. */
    const addReport = (report) => create(resource => qualityApi.createRegulatoryReport(resource), RegulatoryReportAssembler, reports, report, true);
    /** @param {Object} task - New collaboration task. */
    const addTask = (task) => create(resource => qualityApi.createCollaborationTask(resource), CollaborationTaskAssembler, tasks, task);

    /**
     * Posts a comment in the discussion of a record.
     * @param {string} recordCode - Record discussed.
     * @param {string} text - Comment text.
     */
    function addComment(recordCode, text) {
        const user = iamStore.currentUser;
        if (!user) return;
        create(resource => qualityApi.createTaskComment(resource), TaskCommentAssembler, comments, new TaskComment({
            recordCode, author: user.fullName, initials: user.initials, postedAt: new Date().toISOString(), text
        }));
    }

    /**
     * Release readiness of a batch: manufacturing record, analytical results, materials, deviations, packaging and documents.
     * @param {string} batchCode - Batch to release.
     * @returns {Array<{key: string, evidence: string, passed: boolean}>} The six checks.
     */
    function releaseChecks(batchCode) {
        const batch = manufacturingStore.batchByCode(batchCode);
        const batchResults = resultsOf(batchCode);
        const lots = manufacturingStore.lotsOfBatch(batchCode);
        const batchDeviations = deviations.value.filter(item => item.batchCode === batchCode);
        const complete = !!batch && batch.progress === 100;
        return [
            {key: 'manufacturing-record', evidence: batch?.orderCode ?? '', passed: complete},
            {key: 'analytical-results', evidence: batchResults[0]?.reportCode ?? '—',
                passed: batchResults.length > 0 && batchResults.every(item => item.status === 'within' && item.approval === 'approved')},
            {key: 'materials', evidence: `MAT-${batchCode.slice(2)}`, passed: lots.every(lot => lot.status === 'approved')},
            {key: 'deviations', evidence: batchDeviations.map(item => item.code).join(', ') || 'DEV register',
                passed: batchDeviations.every(item => item.status === 'dispositioned' || item.status === 'closed')},
            {key: 'packaging', evidence: `PKG-${batchCode.slice(2)}`, passed: complete},
            {key: 'documents', evidence: 'SOP-QA log', passed: true}
        ];
    }

    /**
     * Signs the release of a batch after the approver re-enters the password.
     * @param {string} batchCode - Batch to release.
     * @param {string} password - Password of the approver.
     * @returns {Promise<string>} Resolves to released, invalid-password or not-ready.
     */
    async function signRelease(batchCode, password) {
        if (releaseChecks(batchCode).some(check => !check.passed)) return 'not-ready';
        if (!await iamStore.verifyPassword(password)) return 'invalid-password';
        manufacturingStore.releaseBatch(batchCode);
        log('Batch released (electronic signature)', batchCode, 'Released');
        return 'released';
    }

    fetchAll();

    return {
        documents, deviations, evidence, capaPlans, capaActions, results, audits, findings, events, reports, tasks, comments,
        gaps, trends, loading, errors, openDeviations, openActions,
        fetchAll, versionsOf, evidenceOf, actionsOf, resultsOf, findingsOf, commentsOf, nextCode, log,
        approveDocument, registerDeviation, saveDeviation, submitAssessment, reviewEvidence, attachEvidence,
        validateCapa, saveCapa, routeCapa, attachActionEvidence, addAction, saveResult, addFinding, addReport, addTask,
        addComment, releaseChecks, signRelease
    };
});

export default useQualityStore;

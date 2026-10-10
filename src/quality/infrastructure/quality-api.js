import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

const qualityDocumentsEndpointPath = import.meta.env.VITE_QUALITY_DOCUMENTS_ENDPOINT_PATH;
const deviationsEndpointPath = import.meta.env.VITE_DEVIATIONS_ENDPOINT_PATH;
const evidenceEndpointPath = import.meta.env.VITE_EVIDENCE_ENDPOINT_PATH;
const capaPlansEndpointPath = import.meta.env.VITE_CAPA_PLANS_ENDPOINT_PATH;
const capaActionsEndpointPath = import.meta.env.VITE_CAPA_ACTIONS_ENDPOINT_PATH;
const analyticalResultsEndpointPath = import.meta.env.VITE_ANALYTICAL_RESULTS_ENDPOINT_PATH;
const auditsEndpointPath = import.meta.env.VITE_AUDITS_ENDPOINT_PATH;
const auditFindingsEndpointPath = import.meta.env.VITE_AUDIT_FINDINGS_ENDPOINT_PATH;
const auditEventsEndpointPath = import.meta.env.VITE_AUDIT_EVENTS_ENDPOINT_PATH;
const regulatoryReportsEndpointPath = import.meta.env.VITE_REGULATORY_REPORTS_ENDPOINT_PATH;
const collaborationTasksEndpointPath = import.meta.env.VITE_COLLABORATION_TASKS_ENDPOINT_PATH;
const taskCommentsEndpointPath = import.meta.env.VITE_TASK_COMMENTS_ENDPOINT_PATH;
const traceabilityGapsEndpointPath = import.meta.env.VITE_TRACEABILITY_GAPS_ENDPOINT_PATH;
const deviationTrendsEndpointPath = import.meta.env.VITE_DEVIATION_TRENDS_ENDPOINT_PATH;

/**
 * Infrastructure gateway for the Quality & Compliance endpoints.
 *
 * @class QualityApi
 * @extends BaseApi
 */
export class QualityApi extends BaseApi {
    #qualityDocumentsEndpoint;
    #deviationsEndpoint;
    #evidenceEndpoint;
    #capaPlansEndpoint;
    #capaActionsEndpoint;
    #analyticalResultsEndpoint;
    #auditsEndpoint;
    #auditFindingsEndpoint;
    #auditEventsEndpoint;
    #regulatoryReportsEndpoint;
    #collaborationTasksEndpoint;
    #taskCommentsEndpoint;
    #traceabilityGapsEndpoint;
    #deviationTrendsEndpoint;

    /** Creates one endpoint client per collection. */
    constructor() {
        super();
        this.#qualityDocumentsEndpoint = new BaseEndpoint(this, qualityDocumentsEndpointPath);
        this.#deviationsEndpoint = new BaseEndpoint(this, deviationsEndpointPath);
        this.#evidenceEndpoint = new BaseEndpoint(this, evidenceEndpointPath);
        this.#capaPlansEndpoint = new BaseEndpoint(this, capaPlansEndpointPath);
        this.#capaActionsEndpoint = new BaseEndpoint(this, capaActionsEndpointPath);
        this.#analyticalResultsEndpoint = new BaseEndpoint(this, analyticalResultsEndpointPath);
        this.#auditsEndpoint = new BaseEndpoint(this, auditsEndpointPath);
        this.#auditFindingsEndpoint = new BaseEndpoint(this, auditFindingsEndpointPath);
        this.#auditEventsEndpoint = new BaseEndpoint(this, auditEventsEndpointPath);
        this.#regulatoryReportsEndpoint = new BaseEndpoint(this, regulatoryReportsEndpointPath);
        this.#collaborationTasksEndpoint = new BaseEndpoint(this, collaborationTasksEndpointPath);
        this.#taskCommentsEndpoint = new BaseEndpoint(this, taskCommentsEndpointPath);
        this.#traceabilityGapsEndpoint = new BaseEndpoint(this, traceabilityGapsEndpointPath);
        this.#deviationTrendsEndpoint = new BaseEndpoint(this, deviationTrendsEndpointPath);
    }

    /**
     * Retrieves the quality documents.
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} HTTP response with the quality documents.
     */
    getQualityDocuments() {
        return this.#qualityDocumentsEndpoint.getAll();
    }

    /**
     * Updates a quality document resource.
     * @param {Object} resource - Resource built by the QualityDocumentAssembler.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} HTTP response with the saved resource.
     */
    updateQualityDocument(resource) {
        return this.#qualityDocumentsEndpoint.update(resource.id, resource);
    }

    /**
     * Retrieves the deviations.
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} HTTP response with the deviations.
     */
    getDeviations() {
        return this.#deviationsEndpoint.getAll();
    }

    /**
     * Creates a deviation resource.
     * @param {Object} resource - Resource built by the DeviationAssembler.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} HTTP response with the saved resource.
     */
    createDeviation(resource) {
        return this.#deviationsEndpoint.create(resource);
    }

    /**
     * Updates a deviation resource.
     * @param {Object} resource - Resource built by the DeviationAssembler.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} HTTP response with the saved resource.
     */
    updateDeviation(resource) {
        return this.#deviationsEndpoint.update(resource.id, resource);
    }

    /**
     * Retrieves the evidence.
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} HTTP response with the evidence.
     */
    getEvidence() {
        return this.#evidenceEndpoint.getAll();
    }

    /**
     * Creates a evidence resource.
     * @param {Object} resource - Resource built by the EvidenceAssembler.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} HTTP response with the saved resource.
     */
    createEvidence(resource) {
        return this.#evidenceEndpoint.create(resource);
    }

    /**
     * Updates a evidence resource.
     * @param {Object} resource - Resource built by the EvidenceAssembler.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} HTTP response with the saved resource.
     */
    updateEvidence(resource) {
        return this.#evidenceEndpoint.update(resource.id, resource);
    }

    /**
     * Retrieves the capa plans.
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} HTTP response with the capa plans.
     */
    getCapaPlans() {
        return this.#capaPlansEndpoint.getAll();
    }

    /**
     * Updates a capa plan resource.
     * @param {Object} resource - Resource built by the CapaPlanAssembler.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} HTTP response with the saved resource.
     */
    updateCapaPlan(resource) {
        return this.#capaPlansEndpoint.update(resource.id, resource);
    }

    /**
     * Retrieves the capa actions.
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} HTTP response with the capa actions.
     */
    getCapaActions() {
        return this.#capaActionsEndpoint.getAll();
    }

    /**
     * Creates a capa action resource.
     * @param {Object} resource - Resource built by the CapaActionAssembler.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} HTTP response with the saved resource.
     */
    createCapaAction(resource) {
        return this.#capaActionsEndpoint.create(resource);
    }

    /**
     * Updates a capa action resource.
     * @param {Object} resource - Resource built by the CapaActionAssembler.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} HTTP response with the saved resource.
     */
    updateCapaAction(resource) {
        return this.#capaActionsEndpoint.update(resource.id, resource);
    }

    /**
     * Retrieves the analytical results.
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} HTTP response with the analytical results.
     */
    getAnalyticalResults() {
        return this.#analyticalResultsEndpoint.getAll();
    }

    /**
     * Updates a analytical result resource.
     * @param {Object} resource - Resource built by the AnalyticalResultAssembler.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} HTTP response with the saved resource.
     */
    updateAnalyticalResult(resource) {
        return this.#analyticalResultsEndpoint.update(resource.id, resource);
    }

    /**
     * Retrieves the audits.
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} HTTP response with the audits.
     */
    getAudits() {
        return this.#auditsEndpoint.getAll();
    }

    /**
     * Retrieves the audit findings.
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} HTTP response with the audit findings.
     */
    getAuditFindings() {
        return this.#auditFindingsEndpoint.getAll();
    }

    /**
     * Creates a audit finding resource.
     * @param {Object} resource - Resource built by the AuditFindingAssembler.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} HTTP response with the saved resource.
     */
    createAuditFinding(resource) {
        return this.#auditFindingsEndpoint.create(resource);
    }

    /**
     * Retrieves the audit events.
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} HTTP response with the audit events.
     */
    getAuditEvents() {
        return this.#auditEventsEndpoint.getAll();
    }

    /**
     * Creates a audit event resource.
     * @param {Object} resource - Resource built by the AuditEventAssembler.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} HTTP response with the saved resource.
     */
    createAuditEvent(resource) {
        return this.#auditEventsEndpoint.create(resource);
    }

    /**
     * Retrieves the regulatory reports.
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} HTTP response with the regulatory reports.
     */
    getRegulatoryReports() {
        return this.#regulatoryReportsEndpoint.getAll();
    }

    /**
     * Creates a regulatory report resource.
     * @param {Object} resource - Resource built by the RegulatoryReportAssembler.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} HTTP response with the saved resource.
     */
    createRegulatoryReport(resource) {
        return this.#regulatoryReportsEndpoint.create(resource);
    }

    /**
     * Retrieves the collaboration tasks.
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} HTTP response with the collaboration tasks.
     */
    getCollaborationTasks() {
        return this.#collaborationTasksEndpoint.getAll();
    }

    /**
     * Creates a collaboration task resource.
     * @param {Object} resource - Resource built by the CollaborationTaskAssembler.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} HTTP response with the saved resource.
     */
    createCollaborationTask(resource) {
        return this.#collaborationTasksEndpoint.create(resource);
    }

    /**
     * Retrieves the task comments.
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} HTTP response with the task comments.
     */
    getTaskComments() {
        return this.#taskCommentsEndpoint.getAll();
    }

    /**
     * Creates a task comment resource.
     * @param {Object} resource - Resource built by the TaskCommentAssembler.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} HTTP response with the saved resource.
     */
    createTaskComment(resource) {
        return this.#taskCommentsEndpoint.create(resource);
    }

    /**
     * Retrieves the traceability gaps.
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} HTTP response with the traceability gaps.
     */
    getTraceabilityGaps() {
        return this.#traceabilityGapsEndpoint.getAll();
    }

    /**
     * Retrieves the deviation trends.
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} HTTP response with the deviation trends.
     */
    getDeviationTrends() {
        return this.#deviationTrendsEndpoint.getAll();
    }
}

/**
 * Represents a corrective and preventive action plan.
 *
 * @class CapaPlan
 */
export class CapaPlan {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} params.id - Unique identifier of the CAPA plan.
     * @param {string} params.code - CAPA code, such as CAPA-26009.
     * @param {string} params.title - Problem addressed.
     * @param {string} params.sourceDeviation - Deviation that originated the plan.
     * @param {string} params.owner - Plan owner.
     * @param {string} params.reviewer - Independent reviewer.
     * @param {string} params.rootCause - Root cause found.
     * @param {string} params.acceptanceCriterion - Effectiveness acceptance criterion.
     * @param {string} params.effectivenessCheckAt - Date of the effectiveness check (ISO 8601).
     * @param {string} params.status - Status (draft, in-progress, in-approval or closed).
     */
    constructor({id = 0, code = '', title = '', sourceDeviation = '', owner = '', reviewer = '', rootCause = '', acceptanceCriterion = '', effectivenessCheckAt = '', status = ''}) {
        this.id = id;
        this.code = code;
        this.title = title;
        this.sourceDeviation = sourceDeviation;
        this.owner = owner;
        this.reviewer = reviewer;
        this.rootCause = rootCause;
        this.acceptanceCriterion = acceptanceCriterion;
        this.effectivenessCheckAt = effectivenessCheckAt;
        this.status = status;
    }
}

/**
 * Represents a QC test result calculated with the formula of an approved analytical protocol.
 *
 * @class AnalyticalResult
 */
export class AnalyticalResult {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} params.id - Unique identifier of the analytical result.
     * @param {string} params.batchCode - Tested batch.
     * @param {string} params.sampleCode - Sample code.
     * @param {string} params.reportCode - Analytical report, such as AR-26041.
     * @param {string} params.test - Test name.
     * @param {string} params.protocol - Analytical protocol and version.
     * @param {string} params.result - Calculated result with its unit.
     * @param {string} params.specification - Specification.
     * @param {string} params.analyst - Analyst who submitted the result.
     * @param {string} params.status - Status (within, oos or pending).
     * @param {string} params.approval - Approval of the report (requested or approved).
     */
    constructor({id = 0, batchCode = '', sampleCode = '', reportCode = '', test = '', protocol = '', result = '', specification = '', analyst = '', status = '', approval = ''}) {
        this.id = id;
        this.batchCode = batchCode;
        this.sampleCode = sampleCode;
        this.reportCode = reportCode;
        this.test = test;
        this.protocol = protocol;
        this.result = result;
        this.specification = specification;
        this.analyst = analyst;
        this.status = status;
        this.approval = approval;
    }
}

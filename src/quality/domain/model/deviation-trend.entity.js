/**
 * Represents the number of closed deviations of a root cause in a month.
 *
 * @class DeviationTrend
 */
export class DeviationTrend {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} params.id - Unique identifier of the deviation trend.
     * @param {string} params.rootCause - Root-cause category.
     * @param {string} params.month - Month (YYYY-MM).
     * @param {number} params.count - Closed deviations.
     */
    constructor({id = 0, rootCause = '', month = '', count = 0}) {
        this.id = id;
        this.rootCause = rootCause;
        this.month = month;
        this.count = count;
    }
}

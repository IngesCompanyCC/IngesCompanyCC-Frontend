/**
 * Represents a subscription plan offered by DoofPlus.
 *
 * @class Plan
 */
export class Plan {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} params.id - Unique identifier of the plan.
     * @param {string} params.key - Plan key (standard-lab or enterprise).
     * @param {string} params.name - Display name of the plan.
     * @param {number} params.monthlyPrice - Price per month in US dollars.
     * @param {number} params.annualPrice - Price per year in US dollars (two months free).
     * @param {number} params.userLimit - Maximum number of users; 0 means unlimited.
     * @param {number} params.iotDeviceLimit - Maximum number of IoT devices; 0 means unlimited.
     */
    constructor({id = 0, key = '', name = '', monthlyPrice = 0, annualPrice = 0, userLimit = 0, iotDeviceLimit = 0}) {
        this.id = id;
        this.key = key;
        this.name = name;
        this.monthlyPrice = monthlyPrice;
        this.annualPrice = annualPrice;
        this.userLimit = userLimit;
        this.iotDeviceLimit = iotDeviceLimit;
    }
}

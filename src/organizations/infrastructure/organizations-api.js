import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

const organizationsEndpointPath = import.meta.env.VITE_ORGANIZATIONS_ENDPOINT_PATH;
const facilitiesEndpointPath = import.meta.env.VITE_FACILITIES_ENDPOINT_PATH;
const userProfilesEndpointPath = import.meta.env.VITE_USER_PROFILES_ENDPOINT_PATH;
const administrativeActivitiesEndpointPath = import.meta.env.VITE_ADMINISTRATIVE_ACTIVITIES_ENDPOINT_PATH;

/**
 * Infrastructure gateway for the Organization Management endpoints.
 *
 * @class OrganizationsApi
 * @extends BaseApi
 */
export class OrganizationsApi extends BaseApi {
    #organizationsEndpoint;
    #facilitiesEndpoint;
    #userProfilesEndpoint;
    #administrativeActivitiesEndpoint;

    /** Creates one endpoint client per collection. */
    constructor() {
        super();
        this.#organizationsEndpoint = new BaseEndpoint(this, organizationsEndpointPath);
        this.#facilitiesEndpoint = new BaseEndpoint(this, facilitiesEndpointPath);
        this.#userProfilesEndpoint = new BaseEndpoint(this, userProfilesEndpointPath);
        this.#administrativeActivitiesEndpoint = new BaseEndpoint(this, administrativeActivitiesEndpointPath);
    }

    /**
     * Retrieves the organizations.
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} HTTP response with the organizations.
     */
    getOrganizations() {
        return this.#organizationsEndpoint.getAll();
    }

    /**
     * Retrieves one organization.
     * @param {number} id - Identifier of the organization.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} HTTP response with the organization.
     */
    getOrganizationById(id) {
        return this.#organizationsEndpoint.getById(id);
    }

    /**
     * Finds the organizations registered with a RUC.
     * @param {string} ruc - RUC (tax ID) of the laboratory.
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} HTTP response with the matching organizations.
     */
    findOrganizationsByRuc(ruc) {
        return this.http.get(organizationsEndpointPath, {params: {ruc}});
    }

    /**
     * Creates an organization resource.
     * @param {Object} resource - Resource built by the OrganizationAssembler.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} HTTP response with the saved resource.
     */
    createOrganization(resource) {
        return this.#organizationsEndpoint.create(resource);
    }

    /**
     * Retrieves the facilities.
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} HTTP response with the facilities.
     */
    getFacilities() {
        return this.#facilitiesEndpoint.getAll();
    }

    /**
     * Creates a facility resource.
     * @param {Object} resource - Resource built by the FacilityAssembler.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} HTTP response with the saved resource.
     */
    createFacility(resource) {
        return this.#facilitiesEndpoint.create(resource);
    }

    /**
     * Retrieves the user profiles.
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} HTTP response with the user profiles.
     */
    getUserProfiles() {
        return this.#userProfilesEndpoint.getAll();
    }

    /**
     * Creates a user profile resource.
     * @param {Object} resource - Resource built by the UserProfileAssembler.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} HTTP response with the saved resource.
     */
    createUserProfile(resource) {
        return this.#userProfilesEndpoint.create(resource);
    }

    /**
     * Updates a user profile resource.
     * @param {Object} resource - Resource built by the UserProfileAssembler.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} HTTP response with the saved resource.
     */
    updateUserProfile(resource) {
        return this.#userProfilesEndpoint.update(resource.id, resource);
    }

    /**
     * Retrieves the administrative activities.
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} HTTP response with the administrative activities.
     */
    getAdministrativeActivities() {
        return this.#administrativeActivitiesEndpoint.getAll();
    }

    /**
     * Creates an administrative activity resource.
     * @param {Object} resource - Resource built by the AdministrativeActivityAssembler.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} HTTP response with the saved resource.
     */
    createAdministrativeActivity(resource) {
        return this.#administrativeActivitiesEndpoint.create(resource);
    }
}

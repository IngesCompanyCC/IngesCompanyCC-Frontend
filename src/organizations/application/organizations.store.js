import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {OrganizationsApi} from "../infrastructure/organizations-api.js";
import {OrganizationAssembler} from "../infrastructure/organization.assembler.js";
import {FacilityAssembler} from "../infrastructure/facility.assembler.js";
import {UserProfileAssembler} from "../infrastructure/user-profile.assembler.js";
import {AdministrativeActivityAssembler} from "../infrastructure/administrative-activity.assembler.js";
import {Organization} from "../domain/model/organization.entity.js";
import {Facility} from "../domain/model/facility.entity.js";
import useIamStore from "../../iam/application/iam.store.js";
import useSubscriptionsStore from "../../subscriptions/application/subscriptions.store.js";

const organizationsApi = new OrganizationsApi();

/**
 * Application service store for the Organization Management bounded context.
 * It holds the organization of the signed-in user, its facilities, the user profiles and the administrative
 * activity, and registers new organizations with their plan and first administrator.
 *
 * @returns {Object} Store state and actions.
 */
const useOrganizationsStore = defineStore('organizations', () => {
    const iamStore = useIamStore();
    const subscriptionsStore = useSubscriptionsStore();

    /** @type {import('vue').Ref<Organization|null>} Organization of the signed-in user. */
    const organization = ref(null);
    /** @type {import('vue').Ref<Array<Facility>>} Facilities of the organization. */
    const facilities = ref([]);
    /** @type {import('vue').Ref<Array<import('../domain/model/user-profile.entity.js').UserProfile>>} User profiles. */
    const profiles = ref([]);
    /** @type {import('vue').Ref<Array>} Administrative activity of the organization. */
    const allActivities = ref([]);
    /**
     * Current step of the registration: form, ruc-registered or verification.
     * @type {import('vue').Ref<string>}
     */
    const registrationStep = ref('form');
    /** @type {import('vue').Ref<boolean>} Whether a request is running. */
    const loading = ref(false);
    /** @type {import('vue').Ref<Array<Error>>} Errors of the last requests. */
    const errors = ref([]);

    /** @type {import('vue').ComputedRef<Array>} Administrative activity, newest first. */
    const activities = computed(() => [...allActivities.value].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)));
    /** @type {import('vue').ComputedRef<Object|undefined>} Profile of the signed-in user. */
    const currentProfile = computed(() => profiles.value.find(profile => profile.userId === iamStore.currentUser?.id));

    /** Loads the organization of the signed-in user, its facilities and its activity. */
    function fetchOrganization() {
        const user = iamStore.currentUser;
        if (!user) return;
        organizationsApi.getOrganizationById(user.organizationId)
            .then(response => organization.value = OrganizationAssembler.toEntityFromResource(response.data))
            .catch(error => errors.value.push(error));
        organizationsApi.getFacilities()
            .then(response => facilities.value = FacilityAssembler.toEntitiesFromResponse(response)
                .filter(facility => facility.organizationId === user.organizationId))
            .catch(error => errors.value.push(error));
        organizationsApi.getAdministrativeActivities()
            .then(response => allActivities.value = AdministrativeActivityAssembler.toEntitiesFromResponse(response))
            .catch(error => errors.value.push(error));
    }

    /** Loads the user profiles. */
    function fetchProfiles() {
        organizationsApi.getUserProfiles()
            .then(response => profiles.value = UserProfileAssembler.toEntitiesFromResponse(response))
            .catch(error => errors.value.push(error));
    }

    /**
     * Saves the personal data and preferences of a profile.
     * @param {import('../domain/model/user-profile.entity.js').UserProfile} profile - Profile with the new values.
     * @returns {Promise<void>} Resolves when the profile was saved.
     */
    function updateProfile(profile) {
        loading.value = true;
        return organizationsApi.updateUserProfile(UserProfileAssembler.toResourceFromEntity(profile))
            .then(response => {
                const updated = UserProfileAssembler.toEntityFromResource(response.data);
                profiles.value = profiles.value.map(item => item.id === updated.id ? updated : item);
            })
            .catch(error => errors.value.push(error))
            .finally(() => loading.value = false);
    }

    /**
     * Creates the organization and the records that depend on it: the primary plant, the pending
     * subscription and the first administrator, who must verify the email.
     * @param {import('../domain/model/register-organization.command.js').RegisterOrganizationCommand} command - Registration data.
     * @returns {Promise<void>} Resolves when the organization was created.
     */
    function createOrganization(command) {
        const {id, ...resource} = OrganizationAssembler.toResourceFromEntity(new Organization({
            legalName: command.legalName, ruc: command.ruc, region: 'Peru',
            ownerName: command.administratorName, status: 'pending-verification'
        }));
        return organizationsApi.createOrganization(resource).then(response => {
            const created = OrganizationAssembler.toEntityFromResource(response.data);
            const {id: facilityId, ...facility} = FacilityAssembler.toResourceFromEntity(new Facility({
                organizationId: created.id, name: command.facilityName, type: 'manufacturing',
                timezone: 'America/Lima', ownerName: command.administratorName, status: 'active'
            }));
            return Promise.all([
                organizationsApi.createFacility(facility),
                subscriptionsStore.subscribe(created.id, command.planKey, command.billingCycle, command.administratorEmail),
                iamStore.registerAdministrator({
                    organizationId: created.id, organizationName: created.legalName, plant: command.facilityName,
                    fullName: command.administratorName, email: command.administratorEmail, password: command.password
                })
            ]);
        });
    }

    /**
     * Registers a new organization when its RUC is not registered yet.
     * @param {import('../domain/model/register-organization.command.js').RegisterOrganizationCommand} command - Registration data.
     * @returns {Promise<void>} Resolves when the registration finished.
     */
    function register(command) {
        loading.value = true;
        return organizationsApi.findOrganizationsByRuc(command.ruc)
            .then(response => {
                if (OrganizationAssembler.toEntitiesFromResponse(response).length) {
                    registrationStep.value = 'ruc-registered';
                    return;
                }
                return createOrganization(command).then(() => registrationStep.value = 'verification');
            })
            .catch(error => errors.value.push(error))
            .finally(() => loading.value = false);
    }

    /** Returns the registration to the form. */
    function resetRegistration() {
        registrationStep.value = 'form';
    }

    return {
        organization,
        facilities,
        activities,
        currentProfile,
        registrationStep,
        loading,
        errors,
        fetchOrganization,
        fetchProfiles,
        updateProfile,
        register,
        resetRegistration
    };
});

export default useOrganizationsStore;

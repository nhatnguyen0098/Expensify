import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import CONFIG from '../CONFIG';
import CONST from '../CONST';
import * as Environment from './Environment/Environment';

// To avoid rebuilding native apps, native apps use production config for both staging and prod
// We use the async environment check because it works on all platforms
let ENV_NAME = CONST.ENVIRONMENT.PRODUCTION;
let stagingServerToggleState = false;
Environment.getEnvironment()
    .then((envName) => {
        ENV_NAME = envName;

        // We connect here, so we have the updated ENV_NAME when Onyx callback runs
        Onyx.connect({
            key: ONYXKEYS.USER,
            callback: (val) => {
                const defaultToggleState = ENV_NAME === CONST.ENVIRONMENT.STAGING;
                stagingServerToggleState = lodashGet(val, 'shouldUseStagingServer', defaultToggleState);
            },
        });
    });

/**
 * Helper method used to decide which API endpoint to call
 * Non PROD environments allow API switching via the {@link stagingServerToggleState}
 *
 * @returns {Boolean}
 */
function canUseStagingServer() {
    return ENV_NAME === CONST.ENVIRONMENT.PRODUCTION
        ? false
        : stagingServerToggleState;
}

/**
 * Get the currently used API endpoint
 * (Non-production environments allow for dynamically switching the API)
 *
 * @param {Object} [request]
 * @param {Boolean} [request.shouldUseSecure]
 * @returns {String}
 */
function getApiRoot(request) {
    const shouldUseSecure = lodashGet(request, 'shouldUseSecure', false);

    if (canUseStagingServer()) {
        return shouldUseSecure
            ? CONFIG.EXPENSIFY.STAGING_SECURE_API_ROOT
            : CONFIG.EXPENSIFY.STAGING_API_ROOT;
    }

    return shouldUseSecure
        ? CONFIG.EXPENSIFY.DEFAULT_SECURE_API_ROOT
        : CONFIG.EXPENSIFY.DEFAULT_API_ROOT;
}

/**
 * Get the command url for the given request
 *
 * @param {Object} request
 * @param {String} request.command - the name of the API command
 * @param {Boolean} [request.shouldUseSecure]
 * @returns {String}
 */
function getCommandURL(request) {
    return `${getApiRoot(request)}api?command=${request.command}`;
}

/**
 * Check if we're currently using the staging API root
 *
 * @returns {Boolean}
 */
function isUsingStagingApi() {
    return getApiRoot() === CONFIG.EXPENSIFY.STAGING_API_ROOT;
}

export {
    getApiRoot,
    getCommandURL,
    isUsingStagingApi,
};


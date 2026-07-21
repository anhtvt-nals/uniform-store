"use strict";
exports.id = 3;
exports.ids = [3];
exports.modules = {

/***/ 2608
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   fromProcess: () => (/* binding */ fromProcess)
/* harmony export */ });
/* harmony import */ var _smithy_core_config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1917);
/* harmony import */ var _smithy_core_config__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2582);
/* harmony import */ var _resolveProcessCredentials__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2609);


const fromProcess = (init = {}) => async ({ callerClientConfig } = {}) => {
    init.logger?.debug("@aws-sdk/credential-provider-process - fromProcess");
    const profiles = await (0,_smithy_core_config__WEBPACK_IMPORTED_MODULE_1__.parseKnownFiles)(init);
    return (0,_resolveProcessCredentials__WEBPACK_IMPORTED_MODULE_2__.resolveProcessCredentials)((0,_smithy_core_config__WEBPACK_IMPORTED_MODULE_0__.getProfileName)({
        profile: init.profile ?? callerClientConfig?.profile,
    }), profiles, init.logger);
};


/***/ },

/***/ 2612
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getValidatedProcessCredentials: () => (/* binding */ getValidatedProcessCredentials)
/* harmony export */ });
/* harmony import */ var _aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2057);

const getValidatedProcessCredentials = (profileName, data, profiles) => {
    if (data.Version !== 1) {
        throw Error(`Profile ${profileName} credential_process did not return Version 1.`);
    }
    if (data.AccessKeyId === undefined || data.SecretAccessKey === undefined) {
        throw Error(`Profile ${profileName} credential_process returned invalid credentials.`);
    }
    if (data.Expiration) {
        const currentTime = new Date();
        const expireTime = new Date(data.Expiration);
        if (expireTime < currentTime) {
            throw Error(`Profile ${profileName} credential_process returned expired credentials.`);
        }
    }
    let accountId = data.AccountId;
    if (!accountId && profiles?.[profileName]?.aws_account_id) {
        accountId = profiles[profileName].aws_account_id;
    }
    const credentials = {
        accessKeyId: data.AccessKeyId,
        secretAccessKey: data.SecretAccessKey,
        ...(data.SessionToken && { sessionToken: data.SessionToken }),
        ...(data.Expiration && { expiration: new Date(data.Expiration) }),
        ...(data.CredentialScope && { credentialScope: data.CredentialScope }),
        ...(accountId && { accountId }),
    };
    (0,_aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_0__.setCredentialFeature)(credentials, "CREDENTIALS_PROCESS", "w");
    return credentials;
};


/***/ },

/***/ 2607
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   fromProcess: () => (/* reexport safe */ _fromProcess__WEBPACK_IMPORTED_MODULE_0__.fromProcess)
/* harmony export */ });
/* harmony import */ var _fromProcess__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2608);



/***/ },

/***/ 2609
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   resolveProcessCredentials: () => (/* binding */ resolveProcessCredentials)
/* harmony export */ });
/* harmony import */ var _smithy_core_config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1914);
/* harmony import */ var _smithy_core_config__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2610);
/* harmony import */ var node_child_process__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2611);
/* harmony import */ var node_child_process__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(node_child_process__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var node_util__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(1561);
/* harmony import */ var node_util__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(node_util__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _getValidatedProcessCredentials__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(2612);




const resolveProcessCredentials = async (profileName, profiles, logger) => {
    const profile = profiles[profileName];
    if (profiles[profileName]) {
        const credentialProcess = profile["credential_process"];
        if (credentialProcess !== undefined) {
            const execPromise = (0,node_util__WEBPACK_IMPORTED_MODULE_3__.promisify)(_smithy_core_config__WEBPACK_IMPORTED_MODULE_1__.externalDataInterceptor?.getTokenRecord?.().exec ?? node_child_process__WEBPACK_IMPORTED_MODULE_2__.exec);
            try {
                const { stdout } = await execPromise(credentialProcess);
                let data;
                try {
                    data = JSON.parse(stdout.trim());
                }
                catch {
                    throw Error(`Profile ${profileName} credential_process returned invalid JSON.`);
                }
                return (0,_getValidatedProcessCredentials__WEBPACK_IMPORTED_MODULE_4__.getValidatedProcessCredentials)(profileName, data, profiles);
            }
            catch (error) {
                throw new _smithy_core_config__WEBPACK_IMPORTED_MODULE_0__.CredentialsProviderError(error.message, { logger });
            }
        }
        else {
            throw new _smithy_core_config__WEBPACK_IMPORTED_MODULE_0__.CredentialsProviderError(`Profile ${profileName} did not contain credential_process.`, { logger });
        }
    }
    else {
        throw new _smithy_core_config__WEBPACK_IMPORTED_MODULE_0__.CredentialsProviderError(`Profile ${profileName} could not be found in shared credentials file.`, {
            logger,
        });
    }
};


/***/ },

/***/ 2610
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   externalDataInterceptor: () => (/* binding */ externalDataInterceptor)
/* harmony export */ });
/* harmony import */ var _getSSOTokenFromFile__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2588);
/* harmony import */ var _readFile__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1927);


const externalDataInterceptor = {
    getFileRecord() {
        return _readFile__WEBPACK_IMPORTED_MODULE_1__.fileIntercept;
    },
    interceptFile(path, contents) {
        _readFile__WEBPACK_IMPORTED_MODULE_1__.fileIntercept[path] = Promise.resolve(contents);
    },
    getTokenRecord() {
        return _getSSOTokenFromFile__WEBPACK_IMPORTED_MODULE_0__.tokenIntercept;
    },
    interceptToken(id, contents) {
        _getSSOTokenFromFile__WEBPACK_IMPORTED_MODULE_0__.tokenIntercept[id] = contents;
    },
};


/***/ },

/***/ 2589
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getSSOTokenFilepath: () => (/* binding */ getSSOTokenFilepath)
/* harmony export */ });
/* harmony import */ var node_crypto__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1247);
/* harmony import */ var node_crypto__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(node_crypto__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var node_path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(982);
/* harmony import */ var node_path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(node_path__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _getHomeDir__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(1923);



const getSSOTokenFilepath = (id) => {
    const hasher = (0,node_crypto__WEBPACK_IMPORTED_MODULE_0__.createHash)("sha1");
    const cacheName = hasher.update(id).digest("hex");
    return (0,node_path__WEBPACK_IMPORTED_MODULE_1__.join)((0,_getHomeDir__WEBPACK_IMPORTED_MODULE_2__.getHomeDir)(), ".aws", "sso", "cache", `${cacheName}.json`);
};


/***/ },

/***/ 2588
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getSSOTokenFromFile: () => (/* binding */ getSSOTokenFromFile),
/* harmony export */   tokenIntercept: () => (/* binding */ tokenIntercept)
/* harmony export */ });
/* harmony import */ var node_fs_promises__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1928);
/* harmony import */ var node_fs_promises__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(node_fs_promises__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _getSSOTokenFilepath__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2589);


const tokenIntercept = {};
const getSSOTokenFromFile = async (id) => {
    if (tokenIntercept[id]) {
        return tokenIntercept[id];
    }
    const ssoTokenFilepath = (0,_getSSOTokenFilepath__WEBPACK_IMPORTED_MODULE_1__.getSSOTokenFilepath)(id);
    const ssoTokenText = await (0,node_fs_promises__WEBPACK_IMPORTED_MODULE_0__.readFile)(ssoTokenFilepath, "utf8");
    return JSON.parse(ssoTokenText);
};


/***/ },

/***/ 2583
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   mergeConfigFiles: () => (/* binding */ mergeConfigFiles)
/* harmony export */ });
const mergeConfigFiles = (...files) => {
    const merged = {};
    for (const file of files) {
        for (const [key, values] of Object.entries(file)) {
            if (merged[key] !== undefined) {
                Object.assign(merged[key], values);
            }
            else {
                merged[key] = values;
            }
        }
    }
    return merged;
};


/***/ },

/***/ 2582
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   parseKnownFiles: () => (/* binding */ parseKnownFiles)
/* harmony export */ });
/* harmony import */ var _loadSharedConfigFiles__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1918);
/* harmony import */ var _mergeConfigFiles__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2583);


const parseKnownFiles = async (init) => {
    const parsedFiles = await (0,_loadSharedConfigFiles__WEBPACK_IMPORTED_MODULE_0__.loadSharedConfigFiles)(init);
    return (0,_mergeConfigFiles__WEBPACK_IMPORTED_MODULE_1__.mergeConfigFiles)(parsedFiles.configFile, parsedFiles.credentialsFile);
};


/***/ }

};
;
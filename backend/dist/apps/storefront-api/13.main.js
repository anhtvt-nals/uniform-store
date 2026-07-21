"use strict";
exports.id = 13;
exports.ids = [13];
exports.modules = {

/***/ 2676
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SSOOIDC: () => (/* binding */ SSOOIDC)
/* harmony export */ });
/* harmony import */ var _smithy_core_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2228);
/* harmony import */ var _commands_CreateTokenCommand__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2677);
/* harmony import */ var _SSOOIDCClient__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2664);



const commands = {
    CreateTokenCommand: _commands_CreateTokenCommand__WEBPACK_IMPORTED_MODULE_1__.CreateTokenCommand,
};
class SSOOIDC extends _SSOOIDCClient__WEBPACK_IMPORTED_MODULE_2__.SSOOIDCClient {
}
(0,_smithy_core_client__WEBPACK_IMPORTED_MODULE_0__.createAggregatedClient)(commands, SSOOIDC);


/***/ },

/***/ 2664
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SSOOIDCClient: () => (/* binding */ SSOOIDCClient),
/* harmony export */   __Client: () => (/* reexport safe */ _smithy_core_client__WEBPACK_IMPORTED_MODULE_8__.Client)
/* harmony export */ });
/* harmony import */ var _aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1858);
/* harmony import */ var _aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1860);
/* harmony import */ var _aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(1861);
/* harmony import */ var _aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(1865);
/* harmony import */ var _aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(1867);
/* harmony import */ var _smithy_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(1896);
/* harmony import */ var _smithy_core__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(1897);
/* harmony import */ var _smithy_core__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(1887);
/* harmony import */ var _smithy_core_client__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(1900);
/* harmony import */ var _smithy_core_config__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(1902);
/* harmony import */ var _smithy_core_endpoints__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(1907);
/* harmony import */ var _smithy_core_protocols__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(1977);
/* harmony import */ var _smithy_core_retry__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(1978);
/* harmony import */ var _smithy_core_retry__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(2048);
/* harmony import */ var _smithy_core_schema__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(2050);
/* harmony import */ var _auth_httpAuthSchemeProvider__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(2665);
/* harmony import */ var _endpoint_EndpointParameters__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(2666);
/* harmony import */ var _runtimeConfig__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(2667);
/* harmony import */ var _runtimeExtensions__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(2674);













class SSOOIDCClient extends _smithy_core_client__WEBPACK_IMPORTED_MODULE_8__.Client {
    config;
    constructor(...[configuration]) {
        const _config_0 = (0,_runtimeConfig__WEBPACK_IMPORTED_MODULE_17__.getRuntimeConfig)(configuration || {});
        super(_config_0);
        this.initConfig = _config_0;
        const _config_1 = (0,_endpoint_EndpointParameters__WEBPACK_IMPORTED_MODULE_16__.resolveClientEndpointParameters)(_config_0);
        const _config_2 = (0,_aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_3__.resolveUserAgentConfig)(_config_1);
        const _config_3 = (0,_smithy_core_retry__WEBPACK_IMPORTED_MODULE_13__.resolveRetryConfig)(_config_2);
        const _config_4 = (0,_smithy_core_config__WEBPACK_IMPORTED_MODULE_9__.resolveRegionConfig)(_config_3);
        const _config_5 = (0,_aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_0__.resolveHostHeaderConfig)(_config_4);
        const _config_6 = (0,_smithy_core_endpoints__WEBPACK_IMPORTED_MODULE_10__.resolveEndpointConfig)(_config_5);
        const _config_7 = (0,_auth_httpAuthSchemeProvider__WEBPACK_IMPORTED_MODULE_15__.resolveHttpAuthSchemeConfig)(_config_6);
        const _config_8 = (0,_runtimeExtensions__WEBPACK_IMPORTED_MODULE_18__.resolveRuntimeExtensions)(_config_7, configuration?.extensions || []);
        this.config = _config_8;
        this.middlewareStack.use((0,_smithy_core_schema__WEBPACK_IMPORTED_MODULE_14__.getSchemaSerdePlugin)(this.config));
        this.middlewareStack.use((0,_aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_4__.getUserAgentPlugin)(this.config));
        this.middlewareStack.use((0,_smithy_core_retry__WEBPACK_IMPORTED_MODULE_12__.getRetryPlugin)(this.config));
        this.middlewareStack.use((0,_smithy_core_protocols__WEBPACK_IMPORTED_MODULE_11__.getContentLengthPlugin)(this.config));
        this.middlewareStack.use((0,_aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_0__.getHostHeaderPlugin)(this.config));
        this.middlewareStack.use((0,_aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_1__.getLoggerPlugin)(this.config));
        this.middlewareStack.use((0,_aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_2__.getRecursionDetectionPlugin)(this.config));
        this.middlewareStack.use((0,_smithy_core__WEBPACK_IMPORTED_MODULE_6__.getHttpAuthSchemeEndpointRuleSetPlugin)(this.config, {
            httpAuthSchemeParametersProvider: _auth_httpAuthSchemeProvider__WEBPACK_IMPORTED_MODULE_15__.defaultSSOOIDCHttpAuthSchemeParametersProvider,
            identityProviderConfigProvider: async (config) => new _smithy_core__WEBPACK_IMPORTED_MODULE_5__.DefaultIdentityProviderConfig({
                "aws.auth#sigv4": config.credentials,
            }),
        }));
        this.middlewareStack.use((0,_smithy_core__WEBPACK_IMPORTED_MODULE_7__.getHttpSigningPlugin)(this.config));
    }
    destroy() {
        super.destroy();
    }
}


/***/ },

/***/ 2675
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getHttpAuthExtensionConfiguration: () => (/* binding */ getHttpAuthExtensionConfiguration),
/* harmony export */   resolveHttpAuthRuntimeConfig: () => (/* binding */ resolveHttpAuthRuntimeConfig)
/* harmony export */ });
const getHttpAuthExtensionConfiguration = (runtimeConfig) => {
    const _httpAuthSchemes = runtimeConfig.httpAuthSchemes;
    let _httpAuthSchemeProvider = runtimeConfig.httpAuthSchemeProvider;
    let _credentials = runtimeConfig.credentials;
    return {
        setHttpAuthScheme(httpAuthScheme) {
            const index = _httpAuthSchemes.findIndex((scheme) => scheme.schemeId === httpAuthScheme.schemeId);
            if (index === -1) {
                _httpAuthSchemes.push(httpAuthScheme);
            }
            else {
                _httpAuthSchemes.splice(index, 1, httpAuthScheme);
            }
        },
        httpAuthSchemes() {
            return _httpAuthSchemes;
        },
        setHttpAuthSchemeProvider(httpAuthSchemeProvider) {
            _httpAuthSchemeProvider = httpAuthSchemeProvider;
        },
        httpAuthSchemeProvider() {
            return _httpAuthSchemeProvider;
        },
        setCredentials(credentials) {
            _credentials = credentials;
        },
        credentials() {
            return _credentials;
        },
    };
};
const resolveHttpAuthRuntimeConfig = (config) => {
    return {
        httpAuthSchemes: config.httpAuthSchemes(),
        httpAuthSchemeProvider: config.httpAuthSchemeProvider(),
        credentials: config.credentials(),
    };
};


/***/ },

/***/ 2665
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   defaultSSOOIDCHttpAuthSchemeParametersProvider: () => (/* binding */ defaultSSOOIDCHttpAuthSchemeParametersProvider),
/* harmony export */   defaultSSOOIDCHttpAuthSchemeProvider: () => (/* binding */ defaultSSOOIDCHttpAuthSchemeProvider),
/* harmony export */   resolveHttpAuthSchemeConfig: () => (/* binding */ resolveHttpAuthSchemeConfig)
/* harmony export */ });
/* harmony import */ var _aws_sdk_core_httpAuthSchemes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2056);
/* harmony import */ var _smithy_core_client__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1889);
/* harmony import */ var _smithy_core_client__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(1856);


const defaultSSOOIDCHttpAuthSchemeParametersProvider = async (config, context, input) => {
    return {
        operation: (0,_smithy_core_client__WEBPACK_IMPORTED_MODULE_1__.getSmithyContext)(context).operation,
        region: await (0,_smithy_core_client__WEBPACK_IMPORTED_MODULE_2__.normalizeProvider)(config.region)() || (() => {
            throw new Error("expected `region` to be configured for `aws.auth#sigv4`");
        })(),
    };
};
function createAwsAuthSigv4HttpAuthOption(authParameters) {
    return {
        schemeId: "aws.auth#sigv4",
        signingProperties: {
            name: "sso-oauth",
            region: authParameters.region,
        },
        propertiesExtractor: (config, context) => ({
            signingProperties: {
                config,
                context,
            },
        }),
    };
}
function createSmithyApiNoAuthHttpAuthOption(authParameters) {
    return {
        schemeId: "smithy.api#noAuth",
    };
}
const defaultSSOOIDCHttpAuthSchemeProvider = (authParameters) => {
    const options = [];
    switch (authParameters.operation) {
        case "CreateToken":
            {
                options.push(createSmithyApiNoAuthHttpAuthOption(authParameters));
                break;
            }
            ;
        default: {
            options.push(createAwsAuthSigv4HttpAuthOption(authParameters));
        }
    }
    return options;
};
const resolveHttpAuthSchemeConfig = (config) => {
    const config_0 = (0,_aws_sdk_core_httpAuthSchemes__WEBPACK_IMPORTED_MODULE_0__.resolveAwsSdkSigV4Config)(config);
    return Object.assign(config_0, {
        authSchemePreference: (0,_smithy_core_client__WEBPACK_IMPORTED_MODULE_2__.normalizeProvider)(config.authSchemePreference ?? []),
    });
};


/***/ },

/***/ 2678
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   _ep0: () => (/* binding */ _ep0),
/* harmony export */   _mw0: () => (/* binding */ _mw0),
/* harmony export */   command: () => (/* binding */ command)
/* harmony export */ });
/* harmony import */ var _smithy_core_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2112);
/* harmony import */ var _smithy_core_endpoints__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1907);
/* harmony import */ var _endpoint_EndpointParameters__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2666);



const command = (0,_smithy_core_client__WEBPACK_IMPORTED_MODULE_0__.makeBuilder)(_endpoint_EndpointParameters__WEBPACK_IMPORTED_MODULE_2__.commonParams, "AWSSSOOIDCService", "SSOOIDCClient", _smithy_core_endpoints__WEBPACK_IMPORTED_MODULE_1__.getEndpointPlugin);
const _ep0 = {};
const _mw0 = (Command, cs, config, o) => [];


/***/ },

/***/ 2677
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CreateTokenCommand: () => (/* binding */ CreateTokenCommand)
/* harmony export */ });
/* harmony import */ var _commandBuilder__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2678);
/* harmony import */ var _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2671);


class CreateTokenCommand extends (0,_commandBuilder__WEBPACK_IMPORTED_MODULE_0__.command)(_commandBuilder__WEBPACK_IMPORTED_MODULE_0__._ep0, _commandBuilder__WEBPACK_IMPORTED_MODULE_0__._mw0, "CreateToken", _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_1__.CreateToken$) {
}


/***/ },

/***/ 2679
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CreateTokenCommand: () => (/* reexport safe */ _CreateTokenCommand__WEBPACK_IMPORTED_MODULE_0__.CreateTokenCommand)
/* harmony export */ });
/* harmony import */ var _CreateTokenCommand__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2677);



/***/ },

/***/ 2666
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   commonParams: () => (/* binding */ commonParams),
/* harmony export */   resolveClientEndpointParameters: () => (/* binding */ resolveClientEndpointParameters)
/* harmony export */ });
const resolveClientEndpointParameters = (options) => {
    return Object.assign(options, {
        useDualstackEndpoint: options.useDualstackEndpoint ?? false,
        useFipsEndpoint: options.useFipsEndpoint ?? false,
        defaultSigningName: "sso-oauth",
    });
};
const commonParams = {
    UseFIPS: { type: "builtInParams", name: "useFipsEndpoint" },
    Endpoint: { type: "builtInParams", name: "endpoint" },
    Region: { type: "builtInParams", name: "region" },
    UseDualStack: { type: "builtInParams", name: "useDualstackEndpoint" },
};


/***/ },

/***/ 2670
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   bdd: () => (/* binding */ bdd)
/* harmony export */ });
/* harmony import */ var _smithy_core_endpoints__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1941);

const k = "ref";
const a = -1, b = true, c = "isSet", d = "PartitionResult", e = "booleanEquals", f = "getAttr", g = { [k]: "Endpoint" }, h = { [k]: d }, i = {}, j = [{ [k]: "Region" }];
const _data = {
    conditions: [
        [c, [g]],
        [c, j],
        ["aws.partition", j, d],
        [e, [{ [k]: "UseFIPS" }, b]],
        [e, [{ [k]: "UseDualStack" }, b]],
        [e, [{ fn: f, argv: [h, "supportsDualStack"] }, b]],
        [e, [{ fn: f, argv: [h, "supportsFIPS"] }, b]],
        ["stringEquals", [{ fn: f, argv: [h, "name"] }, "aws-us-gov"]]
    ],
    results: [
        [a],
        [a, "Invalid Configuration: FIPS and custom endpoint are not supported"],
        [a, "Invalid Configuration: Dualstack and custom endpoint are not supported"],
        [g, i],
        ["https://oidc-fips.{Region}.{PartitionResult#dualStackDnsSuffix}", i],
        [a, "FIPS and DualStack are enabled, but this partition does not support one or both"],
        ["https://oidc.{Region}.amazonaws.com", i],
        ["https://oidc-fips.{Region}.{PartitionResult#dnsSuffix}", i],
        [a, "FIPS is enabled but this partition does not support FIPS"],
        ["https://oidc.{Region}.{PartitionResult#dualStackDnsSuffix}", i],
        [a, "DualStack is enabled but this partition does not support DualStack"],
        ["https://oidc.{Region}.{PartitionResult#dnsSuffix}", i],
        [a, "Invalid Configuration: Missing Region"]
    ]
};
const root = 2;
const r = 100_000_000;
const nodes = new Int32Array([
    -1, 1, -1,
    0, 13, 3,
    1, 4, r + 12,
    2, 5, r + 12,
    3, 8, 6,
    4, 7, r + 11,
    5, r + 9, r + 10,
    4, 11, 9,
    6, 10, r + 8,
    7, r + 6, r + 7,
    5, 12, r + 5,
    6, r + 4, r + 5,
    3, r + 1, 14,
    4, r + 2, r + 3,
]);
const bdd = _smithy_core_endpoints__WEBPACK_IMPORTED_MODULE_0__.BinaryDecisionDiagram.from(nodes, root, _data.conditions, _data.results);


/***/ },

/***/ 2669
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   defaultEndpointResolver: () => (/* binding */ defaultEndpointResolver)
/* harmony export */ });
/* harmony import */ var _aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2077);
/* harmony import */ var _smithy_core_endpoints__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1942);
/* harmony import */ var _smithy_core_endpoints__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(1943);
/* harmony import */ var _smithy_core_endpoints__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(1949);
/* harmony import */ var _bdd__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(2670);



const cache = new _smithy_core_endpoints__WEBPACK_IMPORTED_MODULE_1__.EndpointCache({
    size: 50,
    params: ["Endpoint", "Region", "UseDualStack", "UseFIPS"],
});
const defaultEndpointResolver = (endpointParams, context = {}) => {
    return cache.get(endpointParams, () => (0,_smithy_core_endpoints__WEBPACK_IMPORTED_MODULE_2__.decideEndpoint)(_bdd__WEBPACK_IMPORTED_MODULE_4__.bdd, {
        endpointParams: endpointParams,
        logger: context.logger,
    }));
};
_smithy_core_endpoints__WEBPACK_IMPORTED_MODULE_3__.customEndpointFunctions.aws = _aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_0__.awsEndpointFunctions;


/***/ },

/***/ 2663
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   $Command: () => (/* reexport safe */ _smithy_core_client__WEBPACK_IMPORTED_MODULE_3__.Command),
/* harmony export */   AccessDeniedException: () => (/* reexport safe */ _models_errors__WEBPACK_IMPORTED_MODULE_6__.AccessDeniedException),
/* harmony export */   AccessDeniedException$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.AccessDeniedException$),
/* harmony export */   AccessDeniedExceptionReason: () => (/* reexport safe */ _models_enums__WEBPACK_IMPORTED_MODULE_5__.AccessDeniedExceptionReason),
/* harmony export */   AuthorizationPendingException: () => (/* reexport safe */ _models_errors__WEBPACK_IMPORTED_MODULE_6__.AuthorizationPendingException),
/* harmony export */   AuthorizationPendingException$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.AuthorizationPendingException$),
/* harmony export */   CreateToken$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.CreateToken$),
/* harmony export */   CreateTokenCommand: () => (/* reexport safe */ _commands__WEBPACK_IMPORTED_MODULE_2__.CreateTokenCommand),
/* harmony export */   CreateTokenRequest$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.CreateTokenRequest$),
/* harmony export */   CreateTokenResponse$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.CreateTokenResponse$),
/* harmony export */   ExpiredTokenException: () => (/* reexport safe */ _models_errors__WEBPACK_IMPORTED_MODULE_6__.ExpiredTokenException),
/* harmony export */   ExpiredTokenException$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.ExpiredTokenException$),
/* harmony export */   InternalServerException: () => (/* reexport safe */ _models_errors__WEBPACK_IMPORTED_MODULE_6__.InternalServerException),
/* harmony export */   InternalServerException$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.InternalServerException$),
/* harmony export */   InvalidClientException: () => (/* reexport safe */ _models_errors__WEBPACK_IMPORTED_MODULE_6__.InvalidClientException),
/* harmony export */   InvalidClientException$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.InvalidClientException$),
/* harmony export */   InvalidGrantException: () => (/* reexport safe */ _models_errors__WEBPACK_IMPORTED_MODULE_6__.InvalidGrantException),
/* harmony export */   InvalidGrantException$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.InvalidGrantException$),
/* harmony export */   InvalidRequestException: () => (/* reexport safe */ _models_errors__WEBPACK_IMPORTED_MODULE_6__.InvalidRequestException),
/* harmony export */   InvalidRequestException$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.InvalidRequestException$),
/* harmony export */   InvalidRequestExceptionReason: () => (/* reexport safe */ _models_enums__WEBPACK_IMPORTED_MODULE_5__.InvalidRequestExceptionReason),
/* harmony export */   InvalidScopeException: () => (/* reexport safe */ _models_errors__WEBPACK_IMPORTED_MODULE_6__.InvalidScopeException),
/* harmony export */   InvalidScopeException$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.InvalidScopeException$),
/* harmony export */   SSOOIDC: () => (/* reexport safe */ _SSOOIDC__WEBPACK_IMPORTED_MODULE_1__.SSOOIDC),
/* harmony export */   SSOOIDCClient: () => (/* reexport safe */ _SSOOIDCClient__WEBPACK_IMPORTED_MODULE_0__.SSOOIDCClient),
/* harmony export */   SSOOIDCServiceException: () => (/* reexport safe */ _models_SSOOIDCServiceException__WEBPACK_IMPORTED_MODULE_7__.SSOOIDCServiceException),
/* harmony export */   SSOOIDCServiceException$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.SSOOIDCServiceException$),
/* harmony export */   SlowDownException: () => (/* reexport safe */ _models_errors__WEBPACK_IMPORTED_MODULE_6__.SlowDownException),
/* harmony export */   SlowDownException$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.SlowDownException$),
/* harmony export */   UnauthorizedClientException: () => (/* reexport safe */ _models_errors__WEBPACK_IMPORTED_MODULE_6__.UnauthorizedClientException),
/* harmony export */   UnauthorizedClientException$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.UnauthorizedClientException$),
/* harmony export */   UnsupportedGrantTypeException: () => (/* reexport safe */ _models_errors__WEBPACK_IMPORTED_MODULE_6__.UnsupportedGrantTypeException),
/* harmony export */   UnsupportedGrantTypeException$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.UnsupportedGrantTypeException$),
/* harmony export */   __Client: () => (/* reexport safe */ _SSOOIDCClient__WEBPACK_IMPORTED_MODULE_0__.__Client),
/* harmony export */   errorTypeRegistries: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.errorTypeRegistries)
/* harmony export */ });
/* harmony import */ var _SSOOIDCClient__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2664);
/* harmony import */ var _SSOOIDC__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2676);
/* harmony import */ var _commands__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2679);
/* harmony import */ var _smithy_core_client__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(2113);
/* harmony import */ var _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(2671);
/* harmony import */ var _models_enums__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(2680);
/* harmony import */ var _models_errors__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(2672);
/* harmony import */ var _models_SSOOIDCServiceException__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(2673);











/***/ },

/***/ 2673
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SSOOIDCServiceException: () => (/* binding */ SSOOIDCServiceException),
/* harmony export */   __ServiceException: () => (/* reexport safe */ _smithy_core_client__WEBPACK_IMPORTED_MODULE_0__.ServiceException)
/* harmony export */ });
/* harmony import */ var _smithy_core_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2123);


class SSOOIDCServiceException extends _smithy_core_client__WEBPACK_IMPORTED_MODULE_0__.ServiceException {
    constructor(options) {
        super(options);
        Object.setPrototypeOf(this, SSOOIDCServiceException.prototype);
    }
}


/***/ },

/***/ 2680
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AccessDeniedExceptionReason: () => (/* binding */ AccessDeniedExceptionReason),
/* harmony export */   InvalidRequestExceptionReason: () => (/* binding */ InvalidRequestExceptionReason)
/* harmony export */ });
const AccessDeniedExceptionReason = {
    KMS_ACCESS_DENIED: "KMS_AccessDeniedException",
};
const InvalidRequestExceptionReason = {
    KMS_DISABLED_KEY: "KMS_DisabledException",
    KMS_INVALID_KEY_USAGE: "KMS_InvalidKeyUsageException",
    KMS_INVALID_STATE: "KMS_InvalidStateException",
    KMS_KEY_NOT_FOUND: "KMS_NotFoundException",
};


/***/ },

/***/ 2672
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AccessDeniedException: () => (/* binding */ AccessDeniedException),
/* harmony export */   AuthorizationPendingException: () => (/* binding */ AuthorizationPendingException),
/* harmony export */   ExpiredTokenException: () => (/* binding */ ExpiredTokenException),
/* harmony export */   InternalServerException: () => (/* binding */ InternalServerException),
/* harmony export */   InvalidClientException: () => (/* binding */ InvalidClientException),
/* harmony export */   InvalidGrantException: () => (/* binding */ InvalidGrantException),
/* harmony export */   InvalidRequestException: () => (/* binding */ InvalidRequestException),
/* harmony export */   InvalidScopeException: () => (/* binding */ InvalidScopeException),
/* harmony export */   SlowDownException: () => (/* binding */ SlowDownException),
/* harmony export */   UnauthorizedClientException: () => (/* binding */ UnauthorizedClientException),
/* harmony export */   UnsupportedGrantTypeException: () => (/* binding */ UnsupportedGrantTypeException)
/* harmony export */ });
/* harmony import */ var _SSOOIDCServiceException__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2673);

class AccessDeniedException extends _SSOOIDCServiceException__WEBPACK_IMPORTED_MODULE_0__.SSOOIDCServiceException {
    name = "AccessDeniedException";
    $fault = "client";
    error;
    reason;
    error_description;
    constructor(opts) {
        super({
            name: "AccessDeniedException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, AccessDeniedException.prototype);
        this.error = opts.error;
        this.reason = opts.reason;
        this.error_description = opts.error_description;
    }
}
class AuthorizationPendingException extends _SSOOIDCServiceException__WEBPACK_IMPORTED_MODULE_0__.SSOOIDCServiceException {
    name = "AuthorizationPendingException";
    $fault = "client";
    error;
    error_description;
    constructor(opts) {
        super({
            name: "AuthorizationPendingException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, AuthorizationPendingException.prototype);
        this.error = opts.error;
        this.error_description = opts.error_description;
    }
}
class ExpiredTokenException extends _SSOOIDCServiceException__WEBPACK_IMPORTED_MODULE_0__.SSOOIDCServiceException {
    name = "ExpiredTokenException";
    $fault = "client";
    error;
    error_description;
    constructor(opts) {
        super({
            name: "ExpiredTokenException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, ExpiredTokenException.prototype);
        this.error = opts.error;
        this.error_description = opts.error_description;
    }
}
class InternalServerException extends _SSOOIDCServiceException__WEBPACK_IMPORTED_MODULE_0__.SSOOIDCServiceException {
    name = "InternalServerException";
    $fault = "server";
    error;
    error_description;
    constructor(opts) {
        super({
            name: "InternalServerException",
            $fault: "server",
            ...opts,
        });
        Object.setPrototypeOf(this, InternalServerException.prototype);
        this.error = opts.error;
        this.error_description = opts.error_description;
    }
}
class InvalidClientException extends _SSOOIDCServiceException__WEBPACK_IMPORTED_MODULE_0__.SSOOIDCServiceException {
    name = "InvalidClientException";
    $fault = "client";
    error;
    error_description;
    constructor(opts) {
        super({
            name: "InvalidClientException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, InvalidClientException.prototype);
        this.error = opts.error;
        this.error_description = opts.error_description;
    }
}
class InvalidGrantException extends _SSOOIDCServiceException__WEBPACK_IMPORTED_MODULE_0__.SSOOIDCServiceException {
    name = "InvalidGrantException";
    $fault = "client";
    error;
    error_description;
    constructor(opts) {
        super({
            name: "InvalidGrantException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, InvalidGrantException.prototype);
        this.error = opts.error;
        this.error_description = opts.error_description;
    }
}
class InvalidRequestException extends _SSOOIDCServiceException__WEBPACK_IMPORTED_MODULE_0__.SSOOIDCServiceException {
    name = "InvalidRequestException";
    $fault = "client";
    error;
    reason;
    error_description;
    constructor(opts) {
        super({
            name: "InvalidRequestException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, InvalidRequestException.prototype);
        this.error = opts.error;
        this.reason = opts.reason;
        this.error_description = opts.error_description;
    }
}
class InvalidScopeException extends _SSOOIDCServiceException__WEBPACK_IMPORTED_MODULE_0__.SSOOIDCServiceException {
    name = "InvalidScopeException";
    $fault = "client";
    error;
    error_description;
    constructor(opts) {
        super({
            name: "InvalidScopeException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, InvalidScopeException.prototype);
        this.error = opts.error;
        this.error_description = opts.error_description;
    }
}
class SlowDownException extends _SSOOIDCServiceException__WEBPACK_IMPORTED_MODULE_0__.SSOOIDCServiceException {
    name = "SlowDownException";
    $fault = "client";
    error;
    error_description;
    constructor(opts) {
        super({
            name: "SlowDownException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, SlowDownException.prototype);
        this.error = opts.error;
        this.error_description = opts.error_description;
    }
}
class UnauthorizedClientException extends _SSOOIDCServiceException__WEBPACK_IMPORTED_MODULE_0__.SSOOIDCServiceException {
    name = "UnauthorizedClientException";
    $fault = "client";
    error;
    error_description;
    constructor(opts) {
        super({
            name: "UnauthorizedClientException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, UnauthorizedClientException.prototype);
        this.error = opts.error;
        this.error_description = opts.error_description;
    }
}
class UnsupportedGrantTypeException extends _SSOOIDCServiceException__WEBPACK_IMPORTED_MODULE_0__.SSOOIDCServiceException {
    name = "UnsupportedGrantTypeException";
    $fault = "client";
    error;
    error_description;
    constructor(opts) {
        super({
            name: "UnsupportedGrantTypeException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, UnsupportedGrantTypeException.prototype);
        this.error = opts.error;
        this.error_description = opts.error_description;
    }
}


/***/ },

/***/ 2667
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getRuntimeConfig: () => (/* binding */ getRuntimeConfig)
/* harmony export */ });
/* harmony import */ var _package_json__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2649);
/* harmony import */ var _aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2129);
/* harmony import */ var _aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2130);
/* harmony import */ var _aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(2135);
/* harmony import */ var _aws_sdk_core_httpAuthSchemes__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(2136);
/* harmony import */ var _smithy_core_client__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(2146);
/* harmony import */ var _smithy_core_client__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(2147);
/* harmony import */ var _smithy_core_config__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(1909);
/* harmony import */ var _smithy_core_config__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(2148);
/* harmony import */ var _smithy_core_config__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(2149);
/* harmony import */ var _smithy_core_config__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(2150);
/* harmony import */ var _smithy_core_config__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(2153);
/* harmony import */ var _smithy_core_retry__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(1871);
/* harmony import */ var _smithy_core_retry__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(2048);
/* harmony import */ var _smithy_core_serde__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(2002);
/* harmony import */ var _smithy_node_http_handler__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(2167);
/* harmony import */ var _smithy_node_http_handler__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(2029);
/* harmony import */ var _runtimeConfig_shared__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(2668);









const getRuntimeConfig = (config) => {
    (0,_smithy_core_client__WEBPACK_IMPORTED_MODULE_6__.emitWarningIfUnsupportedVersion)(process.version);
    const defaultsMode = (0,_smithy_core_config__WEBPACK_IMPORTED_MODULE_11__.resolveDefaultsModeConfig)(config);
    const defaultConfigProvider = () => defaultsMode().then(_smithy_core_client__WEBPACK_IMPORTED_MODULE_5__.loadConfigsForDefaultMode);
    const clientSharedValues = (0,_runtimeConfig_shared__WEBPACK_IMPORTED_MODULE_17__.getRuntimeConfig)(config);
    (0,_aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_1__.emitWarningIfUnsupportedVersion)(process.version);
    const loaderConfig = {
        profile: config?.profile,
        logger: clientSharedValues.logger,
    };
    return {
        ...clientSharedValues,
        ...config,
        runtime: "node",
        defaultsMode,
        authSchemePreference: config?.authSchemePreference ?? (0,_smithy_core_config__WEBPACK_IMPORTED_MODULE_7__.loadConfig)(_aws_sdk_core_httpAuthSchemes__WEBPACK_IMPORTED_MODULE_4__.NODE_AUTH_SCHEME_PREFERENCE_OPTIONS, loaderConfig),
        bodyLengthChecker: config?.bodyLengthChecker ?? _smithy_core_serde__WEBPACK_IMPORTED_MODULE_14__.calculateBodyLength,
        defaultUserAgentProvider: config?.defaultUserAgentProvider ?? (0,_aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_2__.createDefaultUserAgentProvider)({ serviceId: clientSharedValues.serviceId, clientVersion: _package_json__WEBPACK_IMPORTED_MODULE_0__.version }),
        maxAttempts: config?.maxAttempts ?? (0,_smithy_core_config__WEBPACK_IMPORTED_MODULE_7__.loadConfig)(_smithy_core_retry__WEBPACK_IMPORTED_MODULE_13__.NODE_MAX_ATTEMPT_CONFIG_OPTIONS, config),
        region: config?.region ?? (0,_smithy_core_config__WEBPACK_IMPORTED_MODULE_7__.loadConfig)(_smithy_core_config__WEBPACK_IMPORTED_MODULE_10__.NODE_REGION_CONFIG_OPTIONS, { ..._smithy_core_config__WEBPACK_IMPORTED_MODULE_10__.NODE_REGION_CONFIG_FILE_OPTIONS, ...loaderConfig }),
        requestHandler: _smithy_node_http_handler__WEBPACK_IMPORTED_MODULE_15__.NodeHttpHandler.create(config?.requestHandler ?? defaultConfigProvider),
        retryMode: config?.retryMode ??
            (0,_smithy_core_config__WEBPACK_IMPORTED_MODULE_7__.loadConfig)({
                ..._smithy_core_retry__WEBPACK_IMPORTED_MODULE_13__.NODE_RETRY_MODE_CONFIG_OPTIONS,
                default: async () => (await defaultConfigProvider()).retryMode || _smithy_core_retry__WEBPACK_IMPORTED_MODULE_12__.DEFAULT_RETRY_MODE,
            }, config),
        streamCollector: config?.streamCollector ?? _smithy_node_http_handler__WEBPACK_IMPORTED_MODULE_16__.streamCollector,
        useDualstackEndpoint: config?.useDualstackEndpoint ?? (0,_smithy_core_config__WEBPACK_IMPORTED_MODULE_7__.loadConfig)(_smithy_core_config__WEBPACK_IMPORTED_MODULE_8__.NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS, loaderConfig),
        useFipsEndpoint: config?.useFipsEndpoint ?? (0,_smithy_core_config__WEBPACK_IMPORTED_MODULE_7__.loadConfig)(_smithy_core_config__WEBPACK_IMPORTED_MODULE_9__.NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS, loaderConfig),
        userAgentAppId: config?.userAgentAppId ?? (0,_smithy_core_config__WEBPACK_IMPORTED_MODULE_7__.loadConfig)(_aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_3__.NODE_APP_ID_CONFIG_OPTIONS, loaderConfig),
    };
};


/***/ },

/***/ 2668
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getRuntimeConfig: () => (/* binding */ getRuntimeConfig)
/* harmony export */ });
/* harmony import */ var _aws_sdk_core_httpAuthSchemes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2182);
/* harmony import */ var _aws_sdk_core_protocols__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2651);
/* harmony import */ var _smithy_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2658);
/* harmony import */ var _smithy_core_checksum__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(2217);
/* harmony import */ var _smithy_core_client__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(1982);
/* harmony import */ var _smithy_core_protocols__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(1936);
/* harmony import */ var _smithy_core_serde__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(1984);
/* harmony import */ var _smithy_core_serde__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(1987);
/* harmony import */ var _smithy_core_serde__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(1988);
/* harmony import */ var _smithy_core_serde__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(1990);
/* harmony import */ var _auth_httpAuthSchemeProvider__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(2665);
/* harmony import */ var _endpoint_endpointResolver__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(2669);
/* harmony import */ var _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(2671);










const getRuntimeConfig = (config) => {
    return {
        apiVersion: "2019-06-10",
        base64Decoder: config?.base64Decoder ?? _smithy_core_serde__WEBPACK_IMPORTED_MODULE_6__.fromBase64,
        base64Encoder: config?.base64Encoder ?? _smithy_core_serde__WEBPACK_IMPORTED_MODULE_7__.toBase64,
        disableHostPrefix: config?.disableHostPrefix ?? false,
        endpointProvider: config?.endpointProvider ?? _endpoint_endpointResolver__WEBPACK_IMPORTED_MODULE_11__.defaultEndpointResolver,
        extensions: config?.extensions ?? [],
        httpAuthSchemeProvider: config?.httpAuthSchemeProvider ?? _auth_httpAuthSchemeProvider__WEBPACK_IMPORTED_MODULE_10__.defaultSSOOIDCHttpAuthSchemeProvider,
        httpAuthSchemes: config?.httpAuthSchemes ?? [
            {
                schemeId: "aws.auth#sigv4",
                identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4"),
                signer: new _aws_sdk_core_httpAuthSchemes__WEBPACK_IMPORTED_MODULE_0__.AwsSdkSigV4Signer(),
            },
            {
                schemeId: "smithy.api#noAuth",
                identityProvider: (ipc) => ipc.getIdentityProvider("smithy.api#noAuth") || (async () => ({})),
                signer: new _smithy_core__WEBPACK_IMPORTED_MODULE_2__.NoAuthSigner(),
            },
        ],
        logger: config?.logger ?? new _smithy_core_client__WEBPACK_IMPORTED_MODULE_4__.NoOpLogger(),
        protocol: config?.protocol ?? _aws_sdk_core_protocols__WEBPACK_IMPORTED_MODULE_1__.AwsRestJsonProtocol,
        protocolSettings: config?.protocolSettings ?? {
            defaultNamespace: "com.amazonaws.ssooidc",
            errorTypeRegistries: _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_12__.errorTypeRegistries,
            version: "2019-06-10",
            serviceTarget: "AWSSSOOIDCService",
        },
        serviceId: config?.serviceId ?? "SSO OIDC",
        sha256: config?.sha256 ?? _smithy_core_checksum__WEBPACK_IMPORTED_MODULE_3__.Sha256Node,
        urlParser: config?.urlParser ?? _smithy_core_protocols__WEBPACK_IMPORTED_MODULE_5__.parseUrl,
        utf8Decoder: config?.utf8Decoder ?? _smithy_core_serde__WEBPACK_IMPORTED_MODULE_8__.fromUtf8,
        utf8Encoder: config?.utf8Encoder ?? _smithy_core_serde__WEBPACK_IMPORTED_MODULE_9__.toUtf8,
    };
};


/***/ },

/***/ 2674
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   resolveRuntimeExtensions: () => (/* binding */ resolveRuntimeExtensions)
/* harmony export */ });
/* harmony import */ var _aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2220);
/* harmony import */ var _smithy_core_client__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2221);
/* harmony import */ var _smithy_core_protocols__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2225);
/* harmony import */ var _auth_httpAuthExtensionConfiguration__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(2675);




const resolveRuntimeExtensions = (runtimeConfig, extensions) => {
    const extensionConfiguration = Object.assign((0,_aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_0__.getAwsRegionExtensionConfiguration)(runtimeConfig), (0,_smithy_core_client__WEBPACK_IMPORTED_MODULE_1__.getDefaultExtensionConfiguration)(runtimeConfig), (0,_smithy_core_protocols__WEBPACK_IMPORTED_MODULE_2__.getHttpHandlerExtensionConfiguration)(runtimeConfig), (0,_auth_httpAuthExtensionConfiguration__WEBPACK_IMPORTED_MODULE_3__.getHttpAuthExtensionConfiguration)(runtimeConfig));
    extensions.forEach((extension) => extension.configure(extensionConfiguration));
    return Object.assign(runtimeConfig, (0,_aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_0__.resolveAwsRegionExtensionConfiguration)(extensionConfiguration), (0,_smithy_core_client__WEBPACK_IMPORTED_MODULE_1__.resolveDefaultRuntimeConfig)(extensionConfiguration), (0,_smithy_core_protocols__WEBPACK_IMPORTED_MODULE_2__.resolveHttpHandlerRuntimeConfig)(extensionConfiguration), (0,_auth_httpAuthExtensionConfiguration__WEBPACK_IMPORTED_MODULE_3__.resolveHttpAuthRuntimeConfig)(extensionConfiguration));
};


/***/ },

/***/ 2671
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AccessDeniedException$: () => (/* binding */ AccessDeniedException$),
/* harmony export */   AuthorizationPendingException$: () => (/* binding */ AuthorizationPendingException$),
/* harmony export */   CreateToken$: () => (/* binding */ CreateToken$),
/* harmony export */   CreateTokenRequest$: () => (/* binding */ CreateTokenRequest$),
/* harmony export */   CreateTokenResponse$: () => (/* binding */ CreateTokenResponse$),
/* harmony export */   ExpiredTokenException$: () => (/* binding */ ExpiredTokenException$),
/* harmony export */   InternalServerException$: () => (/* binding */ InternalServerException$),
/* harmony export */   InvalidClientException$: () => (/* binding */ InvalidClientException$),
/* harmony export */   InvalidGrantException$: () => (/* binding */ InvalidGrantException$),
/* harmony export */   InvalidRequestException$: () => (/* binding */ InvalidRequestException$),
/* harmony export */   InvalidScopeException$: () => (/* binding */ InvalidScopeException$),
/* harmony export */   SSOOIDCServiceException$: () => (/* binding */ SSOOIDCServiceException$),
/* harmony export */   SlowDownException$: () => (/* binding */ SlowDownException$),
/* harmony export */   UnauthorizedClientException$: () => (/* binding */ UnauthorizedClientException$),
/* harmony export */   UnsupportedGrantTypeException$: () => (/* binding */ UnsupportedGrantTypeException$),
/* harmony export */   errorTypeRegistries: () => (/* binding */ errorTypeRegistries)
/* harmony export */ });
/* harmony import */ var _smithy_core_schema__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2120);
/* harmony import */ var _models_errors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2672);
/* harmony import */ var _models_SSOOIDCServiceException__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2673);
const _ADE = "AccessDeniedException";
const _APE = "AuthorizationPendingException";
const _AT = "AccessToken";
const _CS = "ClientSecret";
const _CT = "CreateToken";
const _CTR = "CreateTokenRequest";
const _CTRr = "CreateTokenResponse";
const _CV = "CodeVerifier";
const _ETE = "ExpiredTokenException";
const _ICE = "InvalidClientException";
const _IGE = "InvalidGrantException";
const _IRE = "InvalidRequestException";
const _ISE = "InternalServerException";
const _ISEn = "InvalidScopeException";
const _IT = "IdToken";
const _RT = "RefreshToken";
const _SDE = "SlowDownException";
const _UCE = "UnauthorizedClientException";
const _UGTE = "UnsupportedGrantTypeException";
const _aT = "accessToken";
const _c = "client";
const _cI = "clientId";
const _cS = "clientSecret";
const _cV = "codeVerifier";
const _co = "code";
const _dC = "deviceCode";
const _e = "error";
const _eI = "expiresIn";
const _ed = "error_description";
const _gT = "grantType";
const _h = "http";
const _hE = "httpError";
const _iT = "idToken";
const _r = "reason";
const _rT = "refreshToken";
const _rU = "redirectUri";
const _s = "smithy.ts.sdk.synthetic.com.amazonaws.ssooidc";
const _sc = "scope";
const _se = "server";
const _tT = "tokenType";
const n0 = "com.amazonaws.ssooidc";



const _s_registry = _smithy_core_schema__WEBPACK_IMPORTED_MODULE_0__.TypeRegistry.for(_s);
var SSOOIDCServiceException$ = [-3, _s, "SSOOIDCServiceException", 0, [], []];
_s_registry.registerError(SSOOIDCServiceException$, _models_SSOOIDCServiceException__WEBPACK_IMPORTED_MODULE_2__.SSOOIDCServiceException);
const n0_registry = _smithy_core_schema__WEBPACK_IMPORTED_MODULE_0__.TypeRegistry.for(n0);
var AccessDeniedException$ = [-3, n0, _ADE,
    { [_e]: _c, [_hE]: 400 },
    [_e, _r, _ed],
    [0, 0, 0]
];
n0_registry.registerError(AccessDeniedException$, _models_errors__WEBPACK_IMPORTED_MODULE_1__.AccessDeniedException);
var AuthorizationPendingException$ = [-3, n0, _APE,
    { [_e]: _c, [_hE]: 400 },
    [_e, _ed],
    [0, 0]
];
n0_registry.registerError(AuthorizationPendingException$, _models_errors__WEBPACK_IMPORTED_MODULE_1__.AuthorizationPendingException);
var ExpiredTokenException$ = [-3, n0, _ETE,
    { [_e]: _c, [_hE]: 400 },
    [_e, _ed],
    [0, 0]
];
n0_registry.registerError(ExpiredTokenException$, _models_errors__WEBPACK_IMPORTED_MODULE_1__.ExpiredTokenException);
var InternalServerException$ = [-3, n0, _ISE,
    { [_e]: _se, [_hE]: 500 },
    [_e, _ed],
    [0, 0]
];
n0_registry.registerError(InternalServerException$, _models_errors__WEBPACK_IMPORTED_MODULE_1__.InternalServerException);
var InvalidClientException$ = [-3, n0, _ICE,
    { [_e]: _c, [_hE]: 401 },
    [_e, _ed],
    [0, 0]
];
n0_registry.registerError(InvalidClientException$, _models_errors__WEBPACK_IMPORTED_MODULE_1__.InvalidClientException);
var InvalidGrantException$ = [-3, n0, _IGE,
    { [_e]: _c, [_hE]: 400 },
    [_e, _ed],
    [0, 0]
];
n0_registry.registerError(InvalidGrantException$, _models_errors__WEBPACK_IMPORTED_MODULE_1__.InvalidGrantException);
var InvalidRequestException$ = [-3, n0, _IRE,
    { [_e]: _c, [_hE]: 400 },
    [_e, _r, _ed],
    [0, 0, 0]
];
n0_registry.registerError(InvalidRequestException$, _models_errors__WEBPACK_IMPORTED_MODULE_1__.InvalidRequestException);
var InvalidScopeException$ = [-3, n0, _ISEn,
    { [_e]: _c, [_hE]: 400 },
    [_e, _ed],
    [0, 0]
];
n0_registry.registerError(InvalidScopeException$, _models_errors__WEBPACK_IMPORTED_MODULE_1__.InvalidScopeException);
var SlowDownException$ = [-3, n0, _SDE,
    { [_e]: _c, [_hE]: 400 },
    [_e, _ed],
    [0, 0]
];
n0_registry.registerError(SlowDownException$, _models_errors__WEBPACK_IMPORTED_MODULE_1__.SlowDownException);
var UnauthorizedClientException$ = [-3, n0, _UCE,
    { [_e]: _c, [_hE]: 400 },
    [_e, _ed],
    [0, 0]
];
n0_registry.registerError(UnauthorizedClientException$, _models_errors__WEBPACK_IMPORTED_MODULE_1__.UnauthorizedClientException);
var UnsupportedGrantTypeException$ = [-3, n0, _UGTE,
    { [_e]: _c, [_hE]: 400 },
    [_e, _ed],
    [0, 0]
];
n0_registry.registerError(UnsupportedGrantTypeException$, _models_errors__WEBPACK_IMPORTED_MODULE_1__.UnsupportedGrantTypeException);
const errorTypeRegistries = [
    _s_registry,
    n0_registry,
];
var AccessToken = [0, n0, _AT, 8, 0];
var ClientSecret = [0, n0, _CS, 8, 0];
var CodeVerifier = [0, n0, _CV, 8, 0];
var IdToken = [0, n0, _IT, 8, 0];
var RefreshToken = [0, n0, _RT, 8, 0];
var CreateTokenRequest$ = [3, n0, _CTR,
    0,
    [_cI, _cS, _gT, _dC, _co, _rT, _sc, _rU, _cV],
    [0, [() => ClientSecret, 0], 0, 0, 0, [() => RefreshToken, 0], 64 | 0, 0, [() => CodeVerifier, 0]], 3
];
var CreateTokenResponse$ = [3, n0, _CTRr,
    0,
    [_aT, _tT, _eI, _rT, _iT],
    [[() => AccessToken, 0], 0, 1, [() => RefreshToken, 0], [() => IdToken, 0]]
];
var Scopes = 64 | 0;
var CreateToken$ = [9, n0, _CT,
    { [_h]: ["POST", "/token", 200] }, () => CreateTokenRequest$, () => CreateTokenResponse$
];


/***/ }

};
;
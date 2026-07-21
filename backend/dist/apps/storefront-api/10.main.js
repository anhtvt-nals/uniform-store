"use strict";
exports.id = 10;
exports.ids = [10];
exports.modules = {

/***/ 2639
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GetRoleCredentialsCommand: () => (/* reexport safe */ _aws_sdk_nested_clients_sso__WEBPACK_IMPORTED_MODULE_0__.GetRoleCredentialsCommand),
/* harmony export */   SSOClient: () => (/* reexport safe */ _aws_sdk_nested_clients_sso__WEBPACK_IMPORTED_MODULE_1__.SSOClient)
/* harmony export */ });
/* harmony import */ var _aws_sdk_nested_clients_sso__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2640);
/* harmony import */ var _aws_sdk_nested_clients_sso__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2646);




/***/ },

/***/ 2646
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SSOClient: () => (/* binding */ SSOClient),
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
/* harmony import */ var _auth_httpAuthSchemeProvider__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(2647);
/* harmony import */ var _endpoint_EndpointParameters__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(2642);
/* harmony import */ var _runtimeConfig__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(2648);
/* harmony import */ var _runtimeExtensions__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(2661);













class SSOClient extends _smithy_core_client__WEBPACK_IMPORTED_MODULE_8__.Client {
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
            httpAuthSchemeParametersProvider: _auth_httpAuthSchemeProvider__WEBPACK_IMPORTED_MODULE_15__.defaultSSOHttpAuthSchemeParametersProvider,
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

/***/ 2662
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

/***/ 2647
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   defaultSSOHttpAuthSchemeParametersProvider: () => (/* binding */ defaultSSOHttpAuthSchemeParametersProvider),
/* harmony export */   defaultSSOHttpAuthSchemeProvider: () => (/* binding */ defaultSSOHttpAuthSchemeProvider),
/* harmony export */   resolveHttpAuthSchemeConfig: () => (/* binding */ resolveHttpAuthSchemeConfig)
/* harmony export */ });
/* harmony import */ var _aws_sdk_core_httpAuthSchemes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2056);
/* harmony import */ var _smithy_core_client__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1889);
/* harmony import */ var _smithy_core_client__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(1856);


const defaultSSOHttpAuthSchemeParametersProvider = async (config, context, input) => {
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
            name: "awsssoportal",
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
const defaultSSOHttpAuthSchemeProvider = (authParameters) => {
    const options = [];
    switch (authParameters.operation) {
        case "GetRoleCredentials":
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

/***/ 2641
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   _ep0: () => (/* binding */ _ep0),
/* harmony export */   _mw0: () => (/* binding */ _mw0),
/* harmony export */   command: () => (/* binding */ command)
/* harmony export */ });
/* harmony import */ var _smithy_core_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2112);
/* harmony import */ var _smithy_core_endpoints__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1907);
/* harmony import */ var _endpoint_EndpointParameters__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2642);



const command = (0,_smithy_core_client__WEBPACK_IMPORTED_MODULE_0__.makeBuilder)(_endpoint_EndpointParameters__WEBPACK_IMPORTED_MODULE_2__.commonParams, "SWBPortalService", "SSOClient", _smithy_core_endpoints__WEBPACK_IMPORTED_MODULE_1__.getEndpointPlugin);
const _ep0 = {};
const _mw0 = (Command, cs, config, o) => [];


/***/ },

/***/ 2640
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GetRoleCredentialsCommand: () => (/* binding */ GetRoleCredentialsCommand)
/* harmony export */ });
/* harmony import */ var _commandBuilder__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2641);
/* harmony import */ var _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2643);


class GetRoleCredentialsCommand extends (0,_commandBuilder__WEBPACK_IMPORTED_MODULE_0__.command)(_commandBuilder__WEBPACK_IMPORTED_MODULE_0__._ep0, _commandBuilder__WEBPACK_IMPORTED_MODULE_0__._mw0, "GetRoleCredentials", _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_1__.GetRoleCredentials$) {
}


/***/ },

/***/ 2642
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
        defaultSigningName: "awsssoportal",
    });
};
const commonParams = {
    UseFIPS: { type: "builtInParams", name: "useFipsEndpoint" },
    Endpoint: { type: "builtInParams", name: "endpoint" },
    Region: { type: "builtInParams", name: "region" },
    UseDualStack: { type: "builtInParams", name: "useDualstackEndpoint" },
};


/***/ },

/***/ 2660
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
        ["https://portal.sso-fips.{Region}.{PartitionResult#dualStackDnsSuffix}", i],
        [a, "FIPS and DualStack are enabled, but this partition does not support one or both"],
        ["https://portal.sso.{Region}.amazonaws.com", i],
        ["https://portal.sso-fips.{Region}.{PartitionResult#dnsSuffix}", i],
        [a, "FIPS is enabled but this partition does not support FIPS"],
        ["https://portal.sso.{Region}.{PartitionResult#dualStackDnsSuffix}", i],
        [a, "DualStack is enabled but this partition does not support DualStack"],
        ["https://portal.sso.{Region}.{PartitionResult#dnsSuffix}", i],
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

/***/ 2659
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   defaultEndpointResolver: () => (/* binding */ defaultEndpointResolver)
/* harmony export */ });
/* harmony import */ var _aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2077);
/* harmony import */ var _smithy_core_endpoints__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1942);
/* harmony import */ var _smithy_core_endpoints__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(1943);
/* harmony import */ var _smithy_core_endpoints__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(1949);
/* harmony import */ var _bdd__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(2660);



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

/***/ 2645
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SSOServiceException: () => (/* binding */ SSOServiceException),
/* harmony export */   __ServiceException: () => (/* reexport safe */ _smithy_core_client__WEBPACK_IMPORTED_MODULE_0__.ServiceException)
/* harmony export */ });
/* harmony import */ var _smithy_core_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2123);


class SSOServiceException extends _smithy_core_client__WEBPACK_IMPORTED_MODULE_0__.ServiceException {
    constructor(options) {
        super(options);
        Object.setPrototypeOf(this, SSOServiceException.prototype);
    }
}


/***/ },

/***/ 2644
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   InvalidRequestException: () => (/* binding */ InvalidRequestException),
/* harmony export */   ResourceNotFoundException: () => (/* binding */ ResourceNotFoundException),
/* harmony export */   TooManyRequestsException: () => (/* binding */ TooManyRequestsException),
/* harmony export */   UnauthorizedException: () => (/* binding */ UnauthorizedException)
/* harmony export */ });
/* harmony import */ var _SSOServiceException__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2645);

class InvalidRequestException extends _SSOServiceException__WEBPACK_IMPORTED_MODULE_0__.SSOServiceException {
    name = "InvalidRequestException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "InvalidRequestException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, InvalidRequestException.prototype);
    }
}
class ResourceNotFoundException extends _SSOServiceException__WEBPACK_IMPORTED_MODULE_0__.SSOServiceException {
    name = "ResourceNotFoundException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "ResourceNotFoundException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, ResourceNotFoundException.prototype);
    }
}
class TooManyRequestsException extends _SSOServiceException__WEBPACK_IMPORTED_MODULE_0__.SSOServiceException {
    name = "TooManyRequestsException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "TooManyRequestsException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, TooManyRequestsException.prototype);
    }
}
class UnauthorizedException extends _SSOServiceException__WEBPACK_IMPORTED_MODULE_0__.SSOServiceException {
    name = "UnauthorizedException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "UnauthorizedException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, UnauthorizedException.prototype);
    }
}


/***/ },

/***/ 2648
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
/* harmony import */ var _runtimeConfig_shared__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(2650);









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

/***/ 2650
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
/* harmony import */ var _auth_httpAuthSchemeProvider__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(2647);
/* harmony import */ var _endpoint_endpointResolver__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(2659);
/* harmony import */ var _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(2643);










const getRuntimeConfig = (config) => {
    return {
        apiVersion: "2019-06-10",
        base64Decoder: config?.base64Decoder ?? _smithy_core_serde__WEBPACK_IMPORTED_MODULE_6__.fromBase64,
        base64Encoder: config?.base64Encoder ?? _smithy_core_serde__WEBPACK_IMPORTED_MODULE_7__.toBase64,
        disableHostPrefix: config?.disableHostPrefix ?? false,
        endpointProvider: config?.endpointProvider ?? _endpoint_endpointResolver__WEBPACK_IMPORTED_MODULE_11__.defaultEndpointResolver,
        extensions: config?.extensions ?? [],
        httpAuthSchemeProvider: config?.httpAuthSchemeProvider ?? _auth_httpAuthSchemeProvider__WEBPACK_IMPORTED_MODULE_10__.defaultSSOHttpAuthSchemeProvider,
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
            defaultNamespace: "com.amazonaws.sso",
            errorTypeRegistries: _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_12__.errorTypeRegistries,
            version: "2019-06-10",
            serviceTarget: "SWBPortalService",
        },
        serviceId: config?.serviceId ?? "SSO",
        sha256: config?.sha256 ?? _smithy_core_checksum__WEBPACK_IMPORTED_MODULE_3__.Sha256Node,
        urlParser: config?.urlParser ?? _smithy_core_protocols__WEBPACK_IMPORTED_MODULE_5__.parseUrl,
        utf8Decoder: config?.utf8Decoder ?? _smithy_core_serde__WEBPACK_IMPORTED_MODULE_8__.fromUtf8,
        utf8Encoder: config?.utf8Encoder ?? _smithy_core_serde__WEBPACK_IMPORTED_MODULE_9__.toUtf8,
    };
};


/***/ },

/***/ 2661
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   resolveRuntimeExtensions: () => (/* binding */ resolveRuntimeExtensions)
/* harmony export */ });
/* harmony import */ var _aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2220);
/* harmony import */ var _smithy_core_client__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2221);
/* harmony import */ var _smithy_core_protocols__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2225);
/* harmony import */ var _auth_httpAuthExtensionConfiguration__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(2662);




const resolveRuntimeExtensions = (runtimeConfig, extensions) => {
    const extensionConfiguration = Object.assign((0,_aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_0__.getAwsRegionExtensionConfiguration)(runtimeConfig), (0,_smithy_core_client__WEBPACK_IMPORTED_MODULE_1__.getDefaultExtensionConfiguration)(runtimeConfig), (0,_smithy_core_protocols__WEBPACK_IMPORTED_MODULE_2__.getHttpHandlerExtensionConfiguration)(runtimeConfig), (0,_auth_httpAuthExtensionConfiguration__WEBPACK_IMPORTED_MODULE_3__.getHttpAuthExtensionConfiguration)(runtimeConfig));
    extensions.forEach((extension) => extension.configure(extensionConfiguration));
    return Object.assign(runtimeConfig, (0,_aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_0__.resolveAwsRegionExtensionConfiguration)(extensionConfiguration), (0,_smithy_core_client__WEBPACK_IMPORTED_MODULE_1__.resolveDefaultRuntimeConfig)(extensionConfiguration), (0,_smithy_core_protocols__WEBPACK_IMPORTED_MODULE_2__.resolveHttpHandlerRuntimeConfig)(extensionConfiguration), (0,_auth_httpAuthExtensionConfiguration__WEBPACK_IMPORTED_MODULE_3__.resolveHttpAuthRuntimeConfig)(extensionConfiguration));
};


/***/ },

/***/ 2643
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GetRoleCredentials$: () => (/* binding */ GetRoleCredentials$),
/* harmony export */   GetRoleCredentialsRequest$: () => (/* binding */ GetRoleCredentialsRequest$),
/* harmony export */   GetRoleCredentialsResponse$: () => (/* binding */ GetRoleCredentialsResponse$),
/* harmony export */   InvalidRequestException$: () => (/* binding */ InvalidRequestException$),
/* harmony export */   ResourceNotFoundException$: () => (/* binding */ ResourceNotFoundException$),
/* harmony export */   RoleCredentials$: () => (/* binding */ RoleCredentials$),
/* harmony export */   SSOServiceException$: () => (/* binding */ SSOServiceException$),
/* harmony export */   TooManyRequestsException$: () => (/* binding */ TooManyRequestsException$),
/* harmony export */   UnauthorizedException$: () => (/* binding */ UnauthorizedException$),
/* harmony export */   errorTypeRegistries: () => (/* binding */ errorTypeRegistries)
/* harmony export */ });
/* harmony import */ var _smithy_core_schema__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2120);
/* harmony import */ var _models_errors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2644);
/* harmony import */ var _models_SSOServiceException__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2645);
const _ATT = "AccessTokenType";
const _GRC = "GetRoleCredentials";
const _GRCR = "GetRoleCredentialsRequest";
const _GRCRe = "GetRoleCredentialsResponse";
const _IRE = "InvalidRequestException";
const _RC = "RoleCredentials";
const _RNFE = "ResourceNotFoundException";
const _SAKT = "SecretAccessKeyType";
const _STT = "SessionTokenType";
const _TMRE = "TooManyRequestsException";
const _UE = "UnauthorizedException";
const _aI = "accountId";
const _aKI = "accessKeyId";
const _aT = "accessToken";
const _ai = "account_id";
const _c = "client";
const _e = "error";
const _ex = "expiration";
const _h = "http";
const _hE = "httpError";
const _hH = "httpHeader";
const _hQ = "httpQuery";
const _m = "message";
const _rC = "roleCredentials";
const _rN = "roleName";
const _rn = "role_name";
const _s = "smithy.ts.sdk.synthetic.com.amazonaws.sso";
const _sAK = "secretAccessKey";
const _sT = "sessionToken";
const _xasbt = "x-amz-sso_bearer_token";
const n0 = "com.amazonaws.sso";



const _s_registry = _smithy_core_schema__WEBPACK_IMPORTED_MODULE_0__.TypeRegistry.for(_s);
var SSOServiceException$ = [-3, _s, "SSOServiceException", 0, [], []];
_s_registry.registerError(SSOServiceException$, _models_SSOServiceException__WEBPACK_IMPORTED_MODULE_2__.SSOServiceException);
const n0_registry = _smithy_core_schema__WEBPACK_IMPORTED_MODULE_0__.TypeRegistry.for(n0);
var InvalidRequestException$ = [-3, n0, _IRE,
    { [_e]: _c, [_hE]: 400 },
    [_m],
    [0]
];
n0_registry.registerError(InvalidRequestException$, _models_errors__WEBPACK_IMPORTED_MODULE_1__.InvalidRequestException);
var ResourceNotFoundException$ = [-3, n0, _RNFE,
    { [_e]: _c, [_hE]: 404 },
    [_m],
    [0]
];
n0_registry.registerError(ResourceNotFoundException$, _models_errors__WEBPACK_IMPORTED_MODULE_1__.ResourceNotFoundException);
var TooManyRequestsException$ = [-3, n0, _TMRE,
    { [_e]: _c, [_hE]: 429 },
    [_m],
    [0]
];
n0_registry.registerError(TooManyRequestsException$, _models_errors__WEBPACK_IMPORTED_MODULE_1__.TooManyRequestsException);
var UnauthorizedException$ = [-3, n0, _UE,
    { [_e]: _c, [_hE]: 401 },
    [_m],
    [0]
];
n0_registry.registerError(UnauthorizedException$, _models_errors__WEBPACK_IMPORTED_MODULE_1__.UnauthorizedException);
const errorTypeRegistries = [
    _s_registry,
    n0_registry,
];
var AccessTokenType = [0, n0, _ATT, 8, 0];
var SecretAccessKeyType = [0, n0, _SAKT, 8, 0];
var SessionTokenType = [0, n0, _STT, 8, 0];
var GetRoleCredentialsRequest$ = [3, n0, _GRCR,
    0,
    [_rN, _aI, _aT],
    [[0, { [_hQ]: _rn }], [0, { [_hQ]: _ai }], [() => AccessTokenType, { [_hH]: _xasbt }]], 3
];
var GetRoleCredentialsResponse$ = [3, n0, _GRCRe,
    0,
    [_rC],
    [[() => RoleCredentials$, 0]]
];
var RoleCredentials$ = [3, n0, _RC,
    0,
    [_aKI, _sAK, _sT, _ex],
    [0, [() => SecretAccessKeyType, 0], [() => SessionTokenType, 0], 1]
];
var GetRoleCredentials$ = [9, n0, _GRC,
    { [_h]: ["GET", "/federation/credentials", 200] }, () => GetRoleCredentialsRequest$, () => GetRoleCredentialsResponse$
];


/***/ }

};
;
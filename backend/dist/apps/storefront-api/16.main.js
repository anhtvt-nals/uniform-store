"use strict";
exports.id = 16;
exports.ids = [16];
exports.modules = {

/***/ 2722
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Signin: () => (/* binding */ Signin)
/* harmony export */ });
/* harmony import */ var _smithy_core_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2228);
/* harmony import */ var _commands_CreateOAuth2TokenCommand__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2723);
/* harmony import */ var _commands_CreateOAuth2TokenWithIAMCommand__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2725);
/* harmony import */ var _SigninClient__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(2710);




const commands = {
    CreateOAuth2TokenCommand: _commands_CreateOAuth2TokenCommand__WEBPACK_IMPORTED_MODULE_1__.CreateOAuth2TokenCommand,
    CreateOAuth2TokenWithIAMCommand: _commands_CreateOAuth2TokenWithIAMCommand__WEBPACK_IMPORTED_MODULE_2__.CreateOAuth2TokenWithIAMCommand,
};
class Signin extends _SigninClient__WEBPACK_IMPORTED_MODULE_3__.SigninClient {
}
(0,_smithy_core_client__WEBPACK_IMPORTED_MODULE_0__.createAggregatedClient)(commands, Signin);


/***/ },

/***/ 2710
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SigninClient: () => (/* binding */ SigninClient),
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
/* harmony import */ var _auth_httpAuthSchemeProvider__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(2711);
/* harmony import */ var _endpoint_EndpointParameters__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(2712);
/* harmony import */ var _runtimeConfig__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(2713);
/* harmony import */ var _runtimeExtensions__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(2720);













class SigninClient extends _smithy_core_client__WEBPACK_IMPORTED_MODULE_8__.Client {
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
            httpAuthSchemeParametersProvider: _auth_httpAuthSchemeProvider__WEBPACK_IMPORTED_MODULE_15__.defaultSigninHttpAuthSchemeParametersProvider,
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

/***/ 2721
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

/***/ 2711
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   defaultSigninHttpAuthSchemeParametersProvider: () => (/* binding */ defaultSigninHttpAuthSchemeParametersProvider),
/* harmony export */   defaultSigninHttpAuthSchemeProvider: () => (/* binding */ defaultSigninHttpAuthSchemeProvider),
/* harmony export */   resolveHttpAuthSchemeConfig: () => (/* binding */ resolveHttpAuthSchemeConfig)
/* harmony export */ });
/* harmony import */ var _aws_sdk_core_httpAuthSchemes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2056);
/* harmony import */ var _smithy_core_client__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1889);
/* harmony import */ var _smithy_core_client__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(1856);


const defaultSigninHttpAuthSchemeParametersProvider = async (config, context, input) => {
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
            name: "signin",
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
const defaultSigninHttpAuthSchemeProvider = (authParameters) => {
    const options = [];
    switch (authParameters.operation) {
        case "CreateOAuth2Token":
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

/***/ 2724
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   _ep0: () => (/* binding */ _ep0),
/* harmony export */   _ep1: () => (/* binding */ _ep1),
/* harmony export */   _mw0: () => (/* binding */ _mw0),
/* harmony export */   command: () => (/* binding */ command)
/* harmony export */ });
/* harmony import */ var _smithy_core_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2112);
/* harmony import */ var _smithy_core_endpoints__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1907);
/* harmony import */ var _endpoint_EndpointParameters__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2712);



const command = (0,_smithy_core_client__WEBPACK_IMPORTED_MODULE_0__.makeBuilder)(_endpoint_EndpointParameters__WEBPACK_IMPORTED_MODULE_2__.commonParams, "Signin", "SigninClient", _smithy_core_endpoints__WEBPACK_IMPORTED_MODULE_1__.getEndpointPlugin);
const _ep0 = {
    IsControlPlane: { type: "staticContextParams", value: false },
};
const _ep1 = {
    IsOAuthEndpoint: { type: "staticContextParams", value: true },
};
const _mw0 = (Command, cs, config, o) => [];


/***/ },

/***/ 2723
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CreateOAuth2TokenCommand: () => (/* binding */ CreateOAuth2TokenCommand)
/* harmony export */ });
/* harmony import */ var _commandBuilder__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2724);
/* harmony import */ var _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2717);


class CreateOAuth2TokenCommand extends (0,_commandBuilder__WEBPACK_IMPORTED_MODULE_0__.command)(_commandBuilder__WEBPACK_IMPORTED_MODULE_0__._ep0, _commandBuilder__WEBPACK_IMPORTED_MODULE_0__._mw0, "CreateOAuth2Token", _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_1__.CreateOAuth2Token$) {
}


/***/ },

/***/ 2725
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CreateOAuth2TokenWithIAMCommand: () => (/* binding */ CreateOAuth2TokenWithIAMCommand)
/* harmony export */ });
/* harmony import */ var _commandBuilder__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2724);
/* harmony import */ var _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2717);


class CreateOAuth2TokenWithIAMCommand extends (0,_commandBuilder__WEBPACK_IMPORTED_MODULE_0__.command)(_commandBuilder__WEBPACK_IMPORTED_MODULE_0__._ep1, _commandBuilder__WEBPACK_IMPORTED_MODULE_0__._mw0, "CreateOAuth2TokenWithIAM", _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_1__.CreateOAuth2TokenWithIAM$) {
}


/***/ },

/***/ 2726
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CreateOAuth2TokenCommand: () => (/* reexport safe */ _CreateOAuth2TokenCommand__WEBPACK_IMPORTED_MODULE_0__.CreateOAuth2TokenCommand),
/* harmony export */   CreateOAuth2TokenWithIAMCommand: () => (/* reexport safe */ _CreateOAuth2TokenWithIAMCommand__WEBPACK_IMPORTED_MODULE_1__.CreateOAuth2TokenWithIAMCommand)
/* harmony export */ });
/* harmony import */ var _CreateOAuth2TokenCommand__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2723);
/* harmony import */ var _CreateOAuth2TokenWithIAMCommand__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2725);




/***/ },

/***/ 2712
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
        defaultSigningName: "signin",
    });
};
const commonParams = {
    UseFIPS: { type: "builtInParams", name: "useFipsEndpoint" },
    Endpoint: { type: "builtInParams", name: "endpoint" },
    Region: { type: "builtInParams", name: "region" },
    UseDualStack: { type: "builtInParams", name: "useDualstackEndpoint" },
};


/***/ },

/***/ 2716
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   bdd: () => (/* binding */ bdd)
/* harmony export */ });
/* harmony import */ var _smithy_core_endpoints__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1941);

const s = "ref";
const a = -1, b = false, c = true, d = "isSet", e = "booleanEquals", f = "coalesce", g = "PartitionResult", h = "stringEquals", i = "getAttr", j = "https://signin.{Region}.{PartitionResult#dualStackDnsSuffix}", k = { [s]: "Endpoint" }, l = { "fn": i, "argv": [{ [s]: g }, "name"] }, m = { [s]: "Region" }, n = { [s]: g }, o = { "authSchemes": [{ "name": "sigv4", "signingName": "signin", "signingRegion": "{Region}" }] }, p = {}, q = [m];
const _data = {
    conditions: [
        [d, q],
        [e, [{ fn: f, argv: [{ [s]: "IsControlPlane" }, b] }, c]],
        [d, [k]],
        ["aws.partition", q, g],
        [e, [{ [s]: "UseFIPS" }, c]],
        [h, [l, "aws"]],
        [e, [{ fn: f, argv: [{ [s]: "IsOAuthEndpoint" }, b] }, c]],
        [e, [{ [s]: "UseDualStack" }, c]],
        [h, [l, "aws-cn"]],
        [h, [m, "us-gov-west-1"]],
        [h, [l, "aws-us-gov"]],
        [e, [{ fn: i, argv: [n, "supportsFIPS"] }, c]],
        [h, [l, "aws-iso"]],
        [h, [l, "aws-iso-b"]],
        [h, [l, "aws-iso-f"]],
        [h, [l, "aws-iso-e"]],
        [h, [l, "aws-eusc"]],
        [e, [{ fn: i, argv: [n, "supportsDualStack"] }, c]]
    ],
    results: [
        [a],
        ["https://signin.{Region}.api.aws", o],
        ["https://signin.{Region}.api.amazonwebservices.com.cn", o],
        [j, o],
        [a, "FIPS endpoints are not supported for OAuth operations. Disable FIPS or use a non-OAuth operation."],
        ["https://{Region}.oauth.signin.aws", o],
        ["https://{Region}.signin.aws.amazon.com", p],
        ["https://{Region}.signin.amazonaws.cn", p],
        ["https://{Region}.signin.amazonaws-us-gov.com", p],
        ["https://{Region}.signin.c2shome.ic.gov", p],
        ["https://{Region}.signin.sc2shome.sgov.gov", p],
        ["https://{Region}.signin.csphome.hci.ic.gov", p],
        ["https://{Region}.signin.csphome.adc-e.uk", p],
        ["https://{Region}.signin.amazonaws-eusc.eu", p],
        ["https://signin-fips.amazonaws-us-gov.com", p],
        ["https://{Region}.signin-fips.amazonaws-us-gov.com", p],
        ["https://{Region}.signin.{PartitionResult#dnsSuffix}", p],
        [a, "Invalid Configuration: FIPS and custom endpoint are not supported"],
        [a, "Invalid Configuration: Dualstack and custom endpoint are not supported"],
        [k, p],
        ["https://signin-fips.{Region}.{PartitionResult#dualStackDnsSuffix}", p],
        [a, "FIPS and DualStack are enabled, but this partition does not support one or both"],
        ["https://signin-fips.{Region}.{PartitionResult#dnsSuffix}", p],
        [a, "FIPS is enabled but this partition does not support FIPS"],
        [j, p],
        [a, "DualStack is enabled but this partition does not support DualStack"],
        ["https://signin.{Region}.{PartitionResult#dnsSuffix}", p],
        [a, "Invalid Configuration: Missing Region"]
    ]
};
const root = 2;
const r = 100_000_000;
const nodes = new Int32Array([
    -1, 1, -1,
    0, 6, 3,
    2, 36, 4,
    4, 5, r + 27,
    6, r + 4, r + 27,
    1, 29, 7,
    2, 36, 8,
    3, 9, 31,
    4, 22, 10,
    5, 19, 11,
    7, 21, 12,
    8, r + 7, 13,
    10, r + 8, 14,
    12, r + 9, 15,
    13, r + 10, 16,
    14, r + 11, 17,
    15, r + 12, 18,
    16, r + 13, r + 16,
    6, r + 5, 20,
    7, 21, r + 6,
    17, r + 24, r + 25,
    6, r + 4, 23,
    7, 27, 24,
    9, r + 14, 25,
    10, r + 15, 26,
    11, r + 22, r + 23,
    11, 28, r + 21,
    17, r + 20, r + 21,
    2, 35, 30,
    3, 39, 31,
    4, 32, r + 27,
    6, r + 4, 33,
    7, r + 27, 34,
    9, r + 14, r + 27,
    3, 39, 36,
    4, 38, 37,
    7, r + 18, r + 19,
    6, r + 4, r + 17,
    5, r + 1, 40,
    8, r + 2, r + 3,
]);
const bdd = _smithy_core_endpoints__WEBPACK_IMPORTED_MODULE_0__.BinaryDecisionDiagram.from(nodes, root, _data.conditions, _data.results);


/***/ },

/***/ 2715
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   defaultEndpointResolver: () => (/* binding */ defaultEndpointResolver)
/* harmony export */ });
/* harmony import */ var _aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2077);
/* harmony import */ var _smithy_core_endpoints__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1942);
/* harmony import */ var _smithy_core_endpoints__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(1943);
/* harmony import */ var _smithy_core_endpoints__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(1949);
/* harmony import */ var _bdd__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(2716);



const cache = new _smithy_core_endpoints__WEBPACK_IMPORTED_MODULE_1__.EndpointCache({
    size: 50,
    params: ["Endpoint", "IsControlPlane", "IsOAuthEndpoint", "Region", "UseDualStack", "UseFIPS"],
});
const defaultEndpointResolver = (endpointParams, context = {}) => {
    return cache.get(endpointParams, () => (0,_smithy_core_endpoints__WEBPACK_IMPORTED_MODULE_2__.decideEndpoint)(_bdd__WEBPACK_IMPORTED_MODULE_4__.bdd, {
        endpointParams: endpointParams,
        logger: context.logger,
    }));
};
_smithy_core_endpoints__WEBPACK_IMPORTED_MODULE_3__.customEndpointFunctions.aws = _aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_0__.awsEndpointFunctions;


/***/ },

/***/ 2709
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   $Command: () => (/* reexport safe */ _smithy_core_client__WEBPACK_IMPORTED_MODULE_3__.Command),
/* harmony export */   AccessDeniedException: () => (/* reexport safe */ _models_errors__WEBPACK_IMPORTED_MODULE_6__.AccessDeniedException),
/* harmony export */   AccessDeniedException$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.AccessDeniedException$),
/* harmony export */   AccessToken$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.AccessToken$),
/* harmony export */   CreateOAuth2Token$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.CreateOAuth2Token$),
/* harmony export */   CreateOAuth2TokenCommand: () => (/* reexport safe */ _commands__WEBPACK_IMPORTED_MODULE_2__.CreateOAuth2TokenCommand),
/* harmony export */   CreateOAuth2TokenRequest$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.CreateOAuth2TokenRequest$),
/* harmony export */   CreateOAuth2TokenRequestBody$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.CreateOAuth2TokenRequestBody$),
/* harmony export */   CreateOAuth2TokenResponse$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.CreateOAuth2TokenResponse$),
/* harmony export */   CreateOAuth2TokenResponseBody$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.CreateOAuth2TokenResponseBody$),
/* harmony export */   CreateOAuth2TokenWithIAM$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.CreateOAuth2TokenWithIAM$),
/* harmony export */   CreateOAuth2TokenWithIAMCommand: () => (/* reexport safe */ _commands__WEBPACK_IMPORTED_MODULE_2__.CreateOAuth2TokenWithIAMCommand),
/* harmony export */   CreateOAuth2TokenWithIAMRequest$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.CreateOAuth2TokenWithIAMRequest$),
/* harmony export */   CreateOAuth2TokenWithIAMResponse$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.CreateOAuth2TokenWithIAMResponse$),
/* harmony export */   InternalServerException: () => (/* reexport safe */ _models_errors__WEBPACK_IMPORTED_MODULE_6__.InternalServerException),
/* harmony export */   InternalServerException$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.InternalServerException$),
/* harmony export */   OAuth2ErrorCode: () => (/* reexport safe */ _models_enums__WEBPACK_IMPORTED_MODULE_5__.OAuth2ErrorCode),
/* harmony export */   Signin: () => (/* reexport safe */ _Signin__WEBPACK_IMPORTED_MODULE_1__.Signin),
/* harmony export */   SigninClient: () => (/* reexport safe */ _SigninClient__WEBPACK_IMPORTED_MODULE_0__.SigninClient),
/* harmony export */   SigninServiceException: () => (/* reexport safe */ _models_SigninServiceException__WEBPACK_IMPORTED_MODULE_7__.SigninServiceException),
/* harmony export */   SigninServiceException$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.SigninServiceException$),
/* harmony export */   TooManyRequestsError: () => (/* reexport safe */ _models_errors__WEBPACK_IMPORTED_MODULE_6__.TooManyRequestsError),
/* harmony export */   TooManyRequestsError$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.TooManyRequestsError$),
/* harmony export */   ValidationException: () => (/* reexport safe */ _models_errors__WEBPACK_IMPORTED_MODULE_6__.ValidationException),
/* harmony export */   ValidationException$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.ValidationException$),
/* harmony export */   __Client: () => (/* reexport safe */ _SigninClient__WEBPACK_IMPORTED_MODULE_0__.__Client),
/* harmony export */   errorTypeRegistries: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.errorTypeRegistries)
/* harmony export */ });
/* harmony import */ var _SigninClient__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2710);
/* harmony import */ var _Signin__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2722);
/* harmony import */ var _commands__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2726);
/* harmony import */ var _smithy_core_client__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(2113);
/* harmony import */ var _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(2717);
/* harmony import */ var _models_enums__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(2727);
/* harmony import */ var _models_errors__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(2718);
/* harmony import */ var _models_SigninServiceException__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(2719);











/***/ },

/***/ 2719
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SigninServiceException: () => (/* binding */ SigninServiceException),
/* harmony export */   __ServiceException: () => (/* reexport safe */ _smithy_core_client__WEBPACK_IMPORTED_MODULE_0__.ServiceException)
/* harmony export */ });
/* harmony import */ var _smithy_core_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2123);


class SigninServiceException extends _smithy_core_client__WEBPACK_IMPORTED_MODULE_0__.ServiceException {
    constructor(options) {
        super(options);
        Object.setPrototypeOf(this, SigninServiceException.prototype);
    }
}


/***/ },

/***/ 2727
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   OAuth2ErrorCode: () => (/* binding */ OAuth2ErrorCode)
/* harmony export */ });
const OAuth2ErrorCode = {
    AUTHCODE_EXPIRED: "AUTHCODE_EXPIRED",
    CONFLICT: "CONFLICT",
    INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",
    INVALID_REQUEST: "INVALID_REQUEST",
    RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
    SERVER_ERROR: "server_error",
    SERVICE_QUOTA_EXCEEDED: "SERVICE_QUOTA_EXCEEDED",
    TOKEN_EXPIRED: "TOKEN_EXPIRED",
    USER_CREDENTIALS_CHANGED: "USER_CREDENTIALS_CHANGED",
};


/***/ },

/***/ 2718
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AccessDeniedException: () => (/* binding */ AccessDeniedException),
/* harmony export */   InternalServerException: () => (/* binding */ InternalServerException),
/* harmony export */   TooManyRequestsError: () => (/* binding */ TooManyRequestsError),
/* harmony export */   ValidationException: () => (/* binding */ ValidationException)
/* harmony export */ });
/* harmony import */ var _SigninServiceException__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2719);

class AccessDeniedException extends _SigninServiceException__WEBPACK_IMPORTED_MODULE_0__.SigninServiceException {
    name = "AccessDeniedException";
    $fault = "client";
    error;
    constructor(opts) {
        super({
            name: "AccessDeniedException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, AccessDeniedException.prototype);
        this.error = opts.error;
    }
}
class InternalServerException extends _SigninServiceException__WEBPACK_IMPORTED_MODULE_0__.SigninServiceException {
    name = "InternalServerException";
    $fault = "server";
    error;
    constructor(opts) {
        super({
            name: "InternalServerException",
            $fault: "server",
            ...opts,
        });
        Object.setPrototypeOf(this, InternalServerException.prototype);
        this.error = opts.error;
    }
}
class TooManyRequestsError extends _SigninServiceException__WEBPACK_IMPORTED_MODULE_0__.SigninServiceException {
    name = "TooManyRequestsError";
    $fault = "client";
    error;
    constructor(opts) {
        super({
            name: "TooManyRequestsError",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, TooManyRequestsError.prototype);
        this.error = opts.error;
    }
}
class ValidationException extends _SigninServiceException__WEBPACK_IMPORTED_MODULE_0__.SigninServiceException {
    name = "ValidationException";
    $fault = "client";
    error;
    constructor(opts) {
        super({
            name: "ValidationException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, ValidationException.prototype);
        this.error = opts.error;
    }
}


/***/ },

/***/ 2713
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
/* harmony import */ var _runtimeConfig_shared__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(2714);









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

/***/ 2714
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
/* harmony import */ var _auth_httpAuthSchemeProvider__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(2711);
/* harmony import */ var _endpoint_endpointResolver__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(2715);
/* harmony import */ var _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(2717);










const getRuntimeConfig = (config) => {
    return {
        apiVersion: "2023-01-01",
        base64Decoder: config?.base64Decoder ?? _smithy_core_serde__WEBPACK_IMPORTED_MODULE_6__.fromBase64,
        base64Encoder: config?.base64Encoder ?? _smithy_core_serde__WEBPACK_IMPORTED_MODULE_7__.toBase64,
        disableHostPrefix: config?.disableHostPrefix ?? false,
        endpointProvider: config?.endpointProvider ?? _endpoint_endpointResolver__WEBPACK_IMPORTED_MODULE_11__.defaultEndpointResolver,
        extensions: config?.extensions ?? [],
        httpAuthSchemeProvider: config?.httpAuthSchemeProvider ?? _auth_httpAuthSchemeProvider__WEBPACK_IMPORTED_MODULE_10__.defaultSigninHttpAuthSchemeProvider,
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
            defaultNamespace: "com.amazonaws.signin",
            errorTypeRegistries: _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_12__.errorTypeRegistries,
            version: "2023-01-01",
            serviceTarget: "Signin",
        },
        serviceId: config?.serviceId ?? "Signin",
        sha256: config?.sha256 ?? _smithy_core_checksum__WEBPACK_IMPORTED_MODULE_3__.Sha256Node,
        urlParser: config?.urlParser ?? _smithy_core_protocols__WEBPACK_IMPORTED_MODULE_5__.parseUrl,
        utf8Decoder: config?.utf8Decoder ?? _smithy_core_serde__WEBPACK_IMPORTED_MODULE_8__.fromUtf8,
        utf8Encoder: config?.utf8Encoder ?? _smithy_core_serde__WEBPACK_IMPORTED_MODULE_9__.toUtf8,
    };
};


/***/ },

/***/ 2720
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   resolveRuntimeExtensions: () => (/* binding */ resolveRuntimeExtensions)
/* harmony export */ });
/* harmony import */ var _aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2220);
/* harmony import */ var _smithy_core_client__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2221);
/* harmony import */ var _smithy_core_protocols__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2225);
/* harmony import */ var _auth_httpAuthExtensionConfiguration__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(2721);




const resolveRuntimeExtensions = (runtimeConfig, extensions) => {
    const extensionConfiguration = Object.assign((0,_aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_0__.getAwsRegionExtensionConfiguration)(runtimeConfig), (0,_smithy_core_client__WEBPACK_IMPORTED_MODULE_1__.getDefaultExtensionConfiguration)(runtimeConfig), (0,_smithy_core_protocols__WEBPACK_IMPORTED_MODULE_2__.getHttpHandlerExtensionConfiguration)(runtimeConfig), (0,_auth_httpAuthExtensionConfiguration__WEBPACK_IMPORTED_MODULE_3__.getHttpAuthExtensionConfiguration)(runtimeConfig));
    extensions.forEach((extension) => extension.configure(extensionConfiguration));
    return Object.assign(runtimeConfig, (0,_aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_0__.resolveAwsRegionExtensionConfiguration)(extensionConfiguration), (0,_smithy_core_client__WEBPACK_IMPORTED_MODULE_1__.resolveDefaultRuntimeConfig)(extensionConfiguration), (0,_smithy_core_protocols__WEBPACK_IMPORTED_MODULE_2__.resolveHttpHandlerRuntimeConfig)(extensionConfiguration), (0,_auth_httpAuthExtensionConfiguration__WEBPACK_IMPORTED_MODULE_3__.resolveHttpAuthRuntimeConfig)(extensionConfiguration));
};


/***/ },

/***/ 2717
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AccessDeniedException$: () => (/* binding */ AccessDeniedException$),
/* harmony export */   AccessToken$: () => (/* binding */ AccessToken$),
/* harmony export */   CreateOAuth2Token$: () => (/* binding */ CreateOAuth2Token$),
/* harmony export */   CreateOAuth2TokenRequest$: () => (/* binding */ CreateOAuth2TokenRequest$),
/* harmony export */   CreateOAuth2TokenRequestBody$: () => (/* binding */ CreateOAuth2TokenRequestBody$),
/* harmony export */   CreateOAuth2TokenResponse$: () => (/* binding */ CreateOAuth2TokenResponse$),
/* harmony export */   CreateOAuth2TokenResponseBody$: () => (/* binding */ CreateOAuth2TokenResponseBody$),
/* harmony export */   CreateOAuth2TokenWithIAM$: () => (/* binding */ CreateOAuth2TokenWithIAM$),
/* harmony export */   CreateOAuth2TokenWithIAMRequest$: () => (/* binding */ CreateOAuth2TokenWithIAMRequest$),
/* harmony export */   CreateOAuth2TokenWithIAMResponse$: () => (/* binding */ CreateOAuth2TokenWithIAMResponse$),
/* harmony export */   InternalServerException$: () => (/* binding */ InternalServerException$),
/* harmony export */   SigninServiceException$: () => (/* binding */ SigninServiceException$),
/* harmony export */   TooManyRequestsError$: () => (/* binding */ TooManyRequestsError$),
/* harmony export */   ValidationException$: () => (/* binding */ ValidationException$),
/* harmony export */   errorTypeRegistries: () => (/* binding */ errorTypeRegistries)
/* harmony export */ });
/* harmony import */ var _smithy_core_schema__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2120);
/* harmony import */ var _models_errors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2718);
/* harmony import */ var _models_SigninServiceException__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2719);
const _ADE = "AccessDeniedException";
const _AT = "AccessToken";
const _COAT = "CreateOAuth2Token";
const _COATR = "CreateOAuth2TokenRequest";
const _COATRB = "CreateOAuth2TokenRequestBody";
const _COATRBr = "CreateOAuth2TokenResponseBody";
const _COATRr = "CreateOAuth2TokenResponse";
const _COATWIAM = "CreateOAuth2TokenWithIAM";
const _COATWIAMR = "CreateOAuth2TokenWithIAMRequest";
const _COATWIAMRr = "CreateOAuth2TokenWithIAMResponse";
const _ISE = "InternalServerException";
const _OAAT = "OAuthAccessToken";
const _RT = "RefreshToken";
const _TMRE = "TooManyRequestsError";
const _VE = "ValidationException";
const _aKI = "accessKeyId";
const _aT = "accessToken";
const _at = "access_token";
const _c = "client";
const _cI = "clientId";
const _cV = "codeVerifier";
const _co = "code";
const _e = "error";
const _eI = "expiresIn";
const _ei = "expires_in";
const _gT = "grantType";
const _gt = "grant_type";
const _h = "http";
const _hE = "httpError";
const _iT = "idToken";
const _jN = "jsonName";
const _m = "message";
const _r = "resource";
const _rT = "refreshToken";
const _rU = "redirectUri";
const _s = "smithy.ts.sdk.synthetic.com.amazonaws.signin";
const _sAK = "secretAccessKey";
const _sT = "sessionToken";
const _se = "server";
const _tI = "tokenInput";
const _tO = "tokenOutput";
const _tT = "tokenType";
const _tt = "token_type";
const n0 = "com.amazonaws.signin";



const _s_registry = _smithy_core_schema__WEBPACK_IMPORTED_MODULE_0__.TypeRegistry.for(_s);
var SigninServiceException$ = [-3, _s, "SigninServiceException", 0, [], []];
_s_registry.registerError(SigninServiceException$, _models_SigninServiceException__WEBPACK_IMPORTED_MODULE_2__.SigninServiceException);
const n0_registry = _smithy_core_schema__WEBPACK_IMPORTED_MODULE_0__.TypeRegistry.for(n0);
var AccessDeniedException$ = [-3, n0, _ADE,
    { [_e]: _c },
    [_e, _m],
    [0, 0], 2
];
n0_registry.registerError(AccessDeniedException$, _models_errors__WEBPACK_IMPORTED_MODULE_1__.AccessDeniedException);
var InternalServerException$ = [-3, n0, _ISE,
    { [_e]: _se, [_hE]: 500 },
    [_e, _m],
    [0, 0], 2
];
n0_registry.registerError(InternalServerException$, _models_errors__WEBPACK_IMPORTED_MODULE_1__.InternalServerException);
var TooManyRequestsError$ = [-3, n0, _TMRE,
    { [_e]: _c, [_hE]: 429 },
    [_e, _m],
    [0, 0], 2
];
n0_registry.registerError(TooManyRequestsError$, _models_errors__WEBPACK_IMPORTED_MODULE_1__.TooManyRequestsError);
var ValidationException$ = [-3, n0, _VE,
    { [_e]: _c, [_hE]: 400 },
    [_e, _m],
    [0, 0], 2
];
n0_registry.registerError(ValidationException$, _models_errors__WEBPACK_IMPORTED_MODULE_1__.ValidationException);
const errorTypeRegistries = [
    _s_registry,
    n0_registry,
];
var OAuthAccessToken = [0, n0, _OAAT, 8, 0];
var RefreshToken = [0, n0, _RT, 8, 0];
var AccessToken$ = [3, n0, _AT,
    8,
    [_aKI, _sAK, _sT],
    [[0, { [_jN]: _aKI }], [0, { [_jN]: _sAK }], [0, { [_jN]: _sT }]], 3
];
var CreateOAuth2TokenRequest$ = [3, n0, _COATR,
    0,
    [_tI],
    [[() => CreateOAuth2TokenRequestBody$, 16]], 1
];
var CreateOAuth2TokenRequestBody$ = [3, n0, _COATRB,
    0,
    [_cI, _gT, _co, _rU, _cV, _rT],
    [[0, { [_jN]: _cI }], [0, { [_jN]: _gT }], 0, [0, { [_jN]: _rU }], [0, { [_jN]: _cV }], [() => RefreshToken, { [_jN]: _rT }]], 2
];
var CreateOAuth2TokenResponse$ = [3, n0, _COATRr,
    0,
    [_tO],
    [[() => CreateOAuth2TokenResponseBody$, 16]], 1
];
var CreateOAuth2TokenResponseBody$ = [3, n0, _COATRBr,
    0,
    [_aT, _tT, _eI, _rT, _iT],
    [[() => AccessToken$, { [_jN]: _aT }], [0, { [_jN]: _tT }], [1, { [_jN]: _eI }], [() => RefreshToken, { [_jN]: _rT }], [0, { [_jN]: _iT }]], 4
];
var CreateOAuth2TokenWithIAMRequest$ = [3, n0, _COATWIAMR,
    0,
    [_gT, _r],
    [[0, { [_jN]: _gt }], 0], 2
];
var CreateOAuth2TokenWithIAMResponse$ = [3, n0, _COATWIAMRr,
    0,
    [_aT, _tT, _eI],
    [[() => OAuthAccessToken, { [_jN]: _at }], [0, { [_jN]: _tt }], [1, { [_jN]: _ei }]], 3
];
var CreateOAuth2Token$ = [9, n0, _COAT,
    { [_h]: ["POST", "/v1/token", 200] }, () => CreateOAuth2TokenRequest$, () => CreateOAuth2TokenResponse$
];
var CreateOAuth2TokenWithIAM$ = [9, n0, _COATWIAM,
    { [_h]: ["POST", "/v1/token?x-amz-client-auth-method=iam", 200] }, () => CreateOAuth2TokenWithIAMRequest$, () => CreateOAuth2TokenWithIAMResponse$
];


/***/ }

};
;
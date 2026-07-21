"use strict";
exports.id = 8;
exports.ids = [8];
exports.modules = {

/***/ 2633
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   checkUrl: () => (/* binding */ checkUrl)
/* harmony export */ });
/* harmony import */ var _smithy_core_config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1914);

const LOOPBACK_CIDR_IPv4 = "127.0.0.0/8";
const LOOPBACK_CIDR_IPv6 = "::1/128";
const ECS_CONTAINER_HOST = "169.254.170.2";
const EKS_CONTAINER_HOST_IPv4 = "169.254.170.23";
const EKS_CONTAINER_HOST_IPv6 = "[fd00:ec2::23]";
const checkUrl = (url, logger) => {
    if (url.protocol === "https:") {
        return;
    }
    if (url.hostname === ECS_CONTAINER_HOST ||
        url.hostname === EKS_CONTAINER_HOST_IPv4 ||
        url.hostname === EKS_CONTAINER_HOST_IPv6) {
        return;
    }
    if (url.hostname.includes("[")) {
        if (url.hostname === "[::1]" || url.hostname === "[0000:0000:0000:0000:0000:0000:0000:0001]") {
            return;
        }
    }
    else {
        if (url.hostname === "localhost") {
            return;
        }
        const ipComponents = url.hostname.split(".");
        const inRange = (component) => {
            const num = parseInt(component, 10);
            return 0 <= num && num <= 255;
        };
        if (ipComponents[0] === "127" &&
            inRange(ipComponents[1]) &&
            inRange(ipComponents[2]) &&
            inRange(ipComponents[3]) &&
            ipComponents.length === 4) {
            return;
        }
    }
    throw new _smithy_core_config__WEBPACK_IMPORTED_MODULE_0__.CredentialsProviderError(`URL not accepted. It must either be HTTPS or match one of the following:
  - loopback CIDR 127.0.0.0/8 or [::1/128]
  - ECS container host 169.254.170.2
  - EKS container host 169.254.170.23 or [fd00:ec2::23]`, { logger });
};


/***/ },

/***/ 2632
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   fromHttp: () => (/* binding */ fromHttp)
/* harmony export */ });
/* harmony import */ var _aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2057);
/* harmony import */ var _smithy_core_config__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1914);
/* harmony import */ var _smithy_node_http_handler__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2167);
/* harmony import */ var node_fs_promises__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(1928);
/* harmony import */ var node_fs_promises__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(node_fs_promises__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _checkUrl__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(2633);
/* harmony import */ var _requestHelpers__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(2634);
/* harmony import */ var _retry_wrapper__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(2635);







const AWS_CONTAINER_CREDENTIALS_RELATIVE_URI = "AWS_CONTAINER_CREDENTIALS_RELATIVE_URI";
const DEFAULT_LINK_LOCAL_HOST = "http://169.254.170.2";
const AWS_CONTAINER_CREDENTIALS_FULL_URI = "AWS_CONTAINER_CREDENTIALS_FULL_URI";
const AWS_CONTAINER_AUTHORIZATION_TOKEN_FILE = "AWS_CONTAINER_AUTHORIZATION_TOKEN_FILE";
const AWS_CONTAINER_AUTHORIZATION_TOKEN = "AWS_CONTAINER_AUTHORIZATION_TOKEN";
const fromHttp = (options = {}) => {
    options.logger?.debug("@aws-sdk/credential-provider-http - fromHttp");
    let host;
    const relative = options.awsContainerCredentialsRelativeUri ?? process.env[AWS_CONTAINER_CREDENTIALS_RELATIVE_URI];
    const full = options.awsContainerCredentialsFullUri ?? process.env[AWS_CONTAINER_CREDENTIALS_FULL_URI];
    const token = options.awsContainerAuthorizationToken ?? process.env[AWS_CONTAINER_AUTHORIZATION_TOKEN];
    const tokenFile = options.awsContainerAuthorizationTokenFile ?? process.env[AWS_CONTAINER_AUTHORIZATION_TOKEN_FILE];
    const warn = options.logger?.constructor?.name === "NoOpLogger" || !options.logger?.warn
        ? console.warn
        : options.logger.warn.bind(options.logger);
    if (relative && full) {
        warn("@aws-sdk/credential-provider-http: " +
            "you have set both awsContainerCredentialsRelativeUri and awsContainerCredentialsFullUri.");
        warn("awsContainerCredentialsRelativeUri will take precedence.");
    }
    if (token && tokenFile) {
        warn("@aws-sdk/credential-provider-http: " +
            "you have set both awsContainerAuthorizationToken and awsContainerAuthorizationTokenFile.");
        warn("awsContainerAuthorizationTokenFile will take precedence.");
    }
    if (relative) {
        host = `${DEFAULT_LINK_LOCAL_HOST}${relative}`;
    }
    else if (full) {
        host = full;
    }
    else {
        throw new _smithy_core_config__WEBPACK_IMPORTED_MODULE_1__.CredentialsProviderError(`No HTTP credential provider host provided.
Set AWS_CONTAINER_CREDENTIALS_FULL_URI or AWS_CONTAINER_CREDENTIALS_RELATIVE_URI.`, { logger: options.logger });
    }
    const url = new URL(host);
    (0,_checkUrl__WEBPACK_IMPORTED_MODULE_4__.checkUrl)(url, options.logger);
    const requestHandler = _smithy_node_http_handler__WEBPACK_IMPORTED_MODULE_2__.NodeHttpHandler.create({ connectionTimeout: options.timeout ?? 1000 });
    const requestTimeout = options.timeout ?? 1000;
    const provider = (0,_retry_wrapper__WEBPACK_IMPORTED_MODULE_6__.retryWrapper)(async () => {
        const request = (0,_requestHelpers__WEBPACK_IMPORTED_MODULE_5__.createGetRequest)(url);
        if (tokenFile) {
            request.headers.Authorization = validateToken((await node_fs_promises__WEBPACK_IMPORTED_MODULE_3___default().readFile(tokenFile)).toString());
        }
        else if (token) {
            request.headers.Authorization = validateToken(token);
        }
        try {
            const result = await requestHandler.handle(request, { requestTimeout });
            return (0,_requestHelpers__WEBPACK_IMPORTED_MODULE_5__.getCredentials)(result.response).then((creds) => (0,_aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_0__.setCredentialFeature)(creds, "CREDENTIALS_HTTP", "z"));
        }
        catch (e) {
            throw new _smithy_core_config__WEBPACK_IMPORTED_MODULE_1__.CredentialsProviderError(String(e), { logger: options.logger });
        }
    }, options.maxRetries ?? 3, options.timeout ?? 1000);
    return async () => {
        try {
            return await provider();
        }
        finally {
            requestHandler.destroy?.();
        }
    };
};
const validateToken = (token) => {
    if (token.includes("\r\n")) {
        throw new _smithy_core_config__WEBPACK_IMPORTED_MODULE_1__.CredentialsProviderError("Authorization token contains invalid \\r\\n sequence.");
    }
    return token;
};


/***/ },

/***/ 2634
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createGetRequest: () => (/* binding */ createGetRequest),
/* harmony export */   getCredentials: () => (/* binding */ getCredentials)
/* harmony export */ });
/* harmony import */ var _smithy_core_config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1914);
/* harmony import */ var _smithy_core_protocols__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1859);
/* harmony import */ var _smithy_core_serde__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(1993);
/* harmony import */ var _smithy_core_serde__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(2025);




function createGetRequest(url) {
    return new _smithy_core_protocols__WEBPACK_IMPORTED_MODULE_1__.HttpRequest({
        protocol: url.protocol,
        hostname: url.hostname,
        port: Number(url.port),
        path: url.pathname,
        query: Array.from(url.searchParams.entries()).reduce((acc, [k, v]) => {
            acc[k] = v;
            return acc;
        }, {}),
        fragment: url.hash,
    });
}
async function getCredentials(response, logger) {
    const stream = (0,_smithy_core_serde__WEBPACK_IMPORTED_MODULE_3__.sdkStreamMixin)(response.body);
    const str = await stream.transformToString();
    if (response.statusCode === 200) {
        const parsed = JSON.parse(str);
        if (typeof parsed.AccessKeyId !== "string" ||
            typeof parsed.SecretAccessKey !== "string" ||
            typeof parsed.Token !== "string" ||
            typeof parsed.Expiration !== "string") {
            throw new _smithy_core_config__WEBPACK_IMPORTED_MODULE_0__.CredentialsProviderError("HTTP credential provider response not of the required format, an object matching: " +
                "{ AccessKeyId: string, SecretAccessKey: string, Token: string, Expiration: string(rfc3339) }", { logger });
        }
        return {
            accessKeyId: parsed.AccessKeyId,
            secretAccessKey: parsed.SecretAccessKey,
            sessionToken: parsed.Token,
            expiration: (0,_smithy_core_serde__WEBPACK_IMPORTED_MODULE_2__.parseRfc3339DateTime)(parsed.Expiration),
        };
    }
    if (response.statusCode >= 400 && response.statusCode < 500) {
        let parsedBody = {};
        try {
            parsedBody = JSON.parse(str);
        }
        catch (e) { }
        throw Object.assign(new _smithy_core_config__WEBPACK_IMPORTED_MODULE_0__.CredentialsProviderError(`Server responded with status: ${response.statusCode}`, { logger }), {
            Code: parsedBody.Code,
            Message: parsedBody.Message,
        });
    }
    throw new _smithy_core_config__WEBPACK_IMPORTED_MODULE_0__.CredentialsProviderError(`Server responded with status: ${response.statusCode}`, { logger });
}


/***/ },

/***/ 2635
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   retryWrapper: () => (/* binding */ retryWrapper)
/* harmony export */ });
const retryWrapper = (toRetry, maxRetries, delayMs) => {
    return async () => {
        for (let i = 0; i < maxRetries; ++i) {
            try {
                return await toRetry();
            }
            catch (e) {
                await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
        }
        return await toRetry();
    };
};


/***/ },

/***/ 2631
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   fromHttp: () => (/* reexport safe */ _fromHttp_fromHttp__WEBPACK_IMPORTED_MODULE_0__.fromHttp)
/* harmony export */ });
/* harmony import */ var _fromHttp_fromHttp__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2632);



/***/ }

};
;
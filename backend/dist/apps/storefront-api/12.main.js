"use strict";
exports.id = 12;
exports.ids = [12];
exports.modules = {

/***/ 2704
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   stsRegionDefaultResolver: () => (/* binding */ stsRegionDefaultResolver),
/* harmony export */   warning: () => (/* binding */ warning)
/* harmony export */ });
/* harmony import */ var _smithy_core_config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1909);
/* harmony import */ var _smithy_core_config__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2150);

function stsRegionDefaultResolver(loaderConfig = {}) {
    return (0,_smithy_core_config__WEBPACK_IMPORTED_MODULE_0__.loadConfig)({
        ..._smithy_core_config__WEBPACK_IMPORTED_MODULE_1__.NODE_REGION_CONFIG_OPTIONS,
        async default() {
            if (!warning.silence) {
                console.warn("@aws-sdk - WARN - default STS region of us-east-1 used. See @aws-sdk/credential-providers README and set a region explicitly.");
            }
            return "us-east-1";
        },
    }, { ..._smithy_core_config__WEBPACK_IMPORTED_MODULE_1__.NODE_REGION_CONFIG_FILE_OPTIONS, ...loaderConfig });
}
const warning = {
    silence: false,
};


/***/ },

/***/ 2689
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AwsQueryProtocol: () => (/* binding */ AwsQueryProtocol)
/* harmony export */ });
/* harmony import */ var _smithy_core_protocols__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2194);
/* harmony import */ var _smithy_core_protocols__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2690);
/* harmony import */ var _smithy_core_schema__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2116);
/* harmony import */ var _smithy_core_schema__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(2115);
/* harmony import */ var _ProtocolLib__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(2201);
/* harmony import */ var _xml_XmlShapeDeserializer__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(2208);
/* harmony import */ var _QueryShapeSerializer__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(2691);





class AwsQueryProtocol extends _smithy_core_protocols__WEBPACK_IMPORTED_MODULE_1__.RpcProtocol {
    options;
    serializer;
    deserializer;
    mixin = new _ProtocolLib__WEBPACK_IMPORTED_MODULE_4__.ProtocolLib();
    constructor(options) {
        super({
            defaultNamespace: options.defaultNamespace,
            errorTypeRegistries: options.errorTypeRegistries,
        });
        this.options = options;
        const settings = {
            timestampFormat: {
                useTrait: true,
                default: 5,
            },
            httpBindings: false,
            xmlNamespace: options.xmlNamespace,
            serviceNamespace: options.defaultNamespace,
            serializeEmptyLists: true,
        };
        this.serializer = new _QueryShapeSerializer__WEBPACK_IMPORTED_MODULE_6__.QueryShapeSerializer(settings);
        this.deserializer = new _xml_XmlShapeDeserializer__WEBPACK_IMPORTED_MODULE_5__.XmlShapeDeserializer(settings);
    }
    getShapeId() {
        return "aws.protocols#awsQuery";
    }
    setSerdeContext(serdeContext) {
        this.serializer.setSerdeContext(serdeContext);
        this.deserializer.setSerdeContext(serdeContext);
    }
    getPayloadCodec() {
        throw new Error("AWSQuery protocol has no payload codec.");
    }
    async serializeRequest(operationSchema, input, context) {
        const request = await super.serializeRequest(operationSchema, input, context);
        if (!request.path.endsWith("/")) {
            request.path += "/";
        }
        request.headers["content-type"] = "application/x-www-form-urlencoded";
        if ((0,_smithy_core_schema__WEBPACK_IMPORTED_MODULE_2__.deref)(operationSchema.input) === "unit" || !request.body) {
            request.body = "";
        }
        const action = operationSchema.name.split("#")[1] ?? operationSchema.name;
        request.body = `Action=${action}&Version=${this.options.version}` + request.body;
        if (request.body.endsWith("&")) {
            request.body = request.body.slice(-1);
        }
        return request;
    }
    async deserializeResponse(operationSchema, context, response) {
        const deserializer = this.deserializer;
        const ns = _smithy_core_schema__WEBPACK_IMPORTED_MODULE_3__.NormalizedSchema.of(operationSchema.output);
        const dataObject = {};
        if (response.statusCode >= 300) {
            const bytes = await (0,_smithy_core_protocols__WEBPACK_IMPORTED_MODULE_0__.collectBody)(response.body, context);
            if (bytes.byteLength > 0) {
                Object.assign(dataObject, await deserializer.read(15, bytes));
            }
            await this.handleError(operationSchema, context, response, dataObject, this.deserializeMetadata(response));
        }
        for (const header in response.headers) {
            const value = response.headers[header];
            delete response.headers[header];
            response.headers[header.toLowerCase()] = value;
        }
        const shortName = operationSchema.name.split("#")[1] ?? operationSchema.name;
        const awsQueryResultKey = ns.isStructSchema() && this.useNestedResult() ? shortName + "Result" : undefined;
        const bytes = await (0,_smithy_core_protocols__WEBPACK_IMPORTED_MODULE_0__.collectBody)(response.body, context);
        if (bytes.byteLength > 0) {
            Object.assign(dataObject, await deserializer.read(ns, bytes, awsQueryResultKey));
        }
        dataObject.$metadata = this.deserializeMetadata(response);
        return dataObject;
    }
    useNestedResult() {
        return true;
    }
    async handleError(operationSchema, context, response, dataObject, metadata) {
        const errorIdentifier = this.loadQueryErrorCode(response, dataObject) ?? "Unknown";
        this.mixin.compose(this.compositeErrorRegistry, errorIdentifier, this.options.defaultNamespace);
        const errorData = this.loadQueryError(dataObject) ?? {};
        const message = this.loadQueryErrorMessage(dataObject);
        errorData.message = message;
        errorData.Error = {
            Type: errorData.Type,
            Code: errorData.Code,
            Message: message,
        };
        const { errorSchema, errorMetadata } = await this.mixin.getErrorSchemaOrThrowBaseException(errorIdentifier, this.options.defaultNamespace, response, errorData, metadata, this.mixin.findQueryCompatibleError);
        const ns = _smithy_core_schema__WEBPACK_IMPORTED_MODULE_3__.NormalizedSchema.of(errorSchema);
        const ErrorCtor = this.compositeErrorRegistry.getErrorCtor(errorSchema) ?? Error;
        const exception = new ErrorCtor({});
        const output = {
            Type: errorData.Error.Type,
            Code: errorData.Error.Code,
            Error: errorData.Error,
        };
        for (const [name, member] of ns.structIterator()) {
            const target = member.getMergedTraits().xmlName ?? name;
            const value = errorData[target] ?? dataObject[target];
            output[name] = this.deserializer.readSchema(member, value);
        }
        throw this.mixin.decorateServiceException(Object.assign(exception, errorMetadata, {
            $fault: ns.getMergedTraits().error,
            message,
        }, output), dataObject);
    }
    loadQueryErrorCode(output, data) {
        const code = (data.Errors?.[0]?.Error ?? data.Errors?.Error ?? data.Error)?.Code;
        if (code !== undefined) {
            return code;
        }
        if (output.statusCode == 404) {
            return "NotFound";
        }
    }
    loadQueryError(data) {
        return data.Errors?.[0]?.Error ?? data.Errors?.Error ?? data.Error;
    }
    loadQueryErrorMessage(data) {
        const errorData = this.loadQueryError(data);
        return errorData?.message ?? errorData?.Message ?? data.message ?? data.Message ?? "Unknown";
    }
    getDefaultContentType() {
        return "application/x-www-form-urlencoded";
    }
}


/***/ },

/***/ 2691
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   QueryShapeSerializer: () => (/* binding */ QueryShapeSerializer)
/* harmony export */ });
/* harmony import */ var _smithy_core_protocols__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2195);
/* harmony import */ var _smithy_core_protocols__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2198);
/* harmony import */ var _smithy_core_schema__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2115);
/* harmony import */ var _smithy_core_serde__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(1993);
/* harmony import */ var _smithy_core_serde__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(1983);
/* harmony import */ var _smithy_core_serde__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(1987);
/* harmony import */ var _smithy_core_serde__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(2000);
/* harmony import */ var _ConfigurableSerdeContext__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(2207);





class QueryShapeSerializer extends _ConfigurableSerdeContext__WEBPACK_IMPORTED_MODULE_7__.SerdeContextConfig {
    settings;
    buffer;
    constructor(settings) {
        super();
        this.settings = settings;
    }
    write(schema, value, prefix = "") {
        if (this.buffer === undefined) {
            this.buffer = "";
        }
        const ns = _smithy_core_schema__WEBPACK_IMPORTED_MODULE_2__.NormalizedSchema.of(schema);
        if (prefix && !prefix.endsWith(".")) {
            prefix += ".";
        }
        if (ns.isBlobSchema()) {
            if (typeof value === "string" || value instanceof Uint8Array) {
                this.writeKey(prefix);
                this.writeValue((this.serdeContext?.base64Encoder ?? _smithy_core_serde__WEBPACK_IMPORTED_MODULE_5__.toBase64)(value));
            }
        }
        else if (ns.isBooleanSchema() || ns.isNumericSchema() || ns.isStringSchema()) {
            if (value != null) {
                this.writeKey(prefix);
                this.writeValue(String(value));
            }
            else if (ns.isIdempotencyToken()) {
                this.writeKey(prefix);
                this.writeValue((0,_smithy_core_serde__WEBPACK_IMPORTED_MODULE_4__.generateIdempotencyToken)());
            }
        }
        else if (ns.isBigIntegerSchema()) {
            if (value != null) {
                this.writeKey(prefix);
                this.writeValue(String(value));
            }
        }
        else if (ns.isBigDecimalSchema()) {
            if (value != null) {
                this.writeKey(prefix);
                this.writeValue(value instanceof _smithy_core_serde__WEBPACK_IMPORTED_MODULE_6__.NumericValue ? value.string : String(value));
            }
        }
        else if (ns.isTimestampSchema()) {
            if (value instanceof Date) {
                this.writeKey(prefix);
                const format = (0,_smithy_core_protocols__WEBPACK_IMPORTED_MODULE_1__.determineTimestampFormat)(ns, this.settings);
                switch (format) {
                    case 5:
                        this.writeValue(value.toISOString().replace(".000Z", "Z"));
                        break;
                    case 6:
                        this.writeValue((0,_smithy_core_serde__WEBPACK_IMPORTED_MODULE_3__.dateToUtcString)(value));
                        break;
                    case 7:
                        this.writeValue(String(value.getTime() / 1000));
                        break;
                }
            }
        }
        else if (ns.isDocumentSchema()) {
            if (Array.isArray(value)) {
                this.write(64 | 15, value, prefix);
            }
            else if (value instanceof Date) {
                this.write(4, value, prefix);
            }
            else if (value instanceof Uint8Array) {
                this.write(21, value, prefix);
            }
            else if (value && typeof value === "object") {
                this.write(128 | 15, value, prefix);
            }
            else {
                this.writeKey(prefix);
                this.writeValue(String(value));
            }
        }
        else if (ns.isListSchema()) {
            if (Array.isArray(value)) {
                if (value.length === 0) {
                    if (this.settings.serializeEmptyLists) {
                        this.writeKey(prefix);
                        this.writeValue("");
                    }
                }
                else {
                    const member = ns.getValueSchema();
                    const flat = this.settings.flattenLists || ns.getMergedTraits().xmlFlattened;
                    let i = 1;
                    for (const item of value) {
                        if (item == null) {
                            continue;
                        }
                        const traits = member.getMergedTraits();
                        const suffix = this.getKey("member", traits.xmlName, traits.ec2QueryName);
                        const key = flat ? `${prefix}${i}` : `${prefix}${suffix}.${i}`;
                        this.write(member, item, key);
                        ++i;
                    }
                }
            }
        }
        else if (ns.isMapSchema()) {
            if (value && typeof value === "object") {
                const keySchema = ns.getKeySchema();
                const memberSchema = ns.getValueSchema();
                const flat = ns.getMergedTraits().xmlFlattened;
                let i = 1;
                for (const k in value) {
                    const v = value[k];
                    if (v == null) {
                        continue;
                    }
                    const keyTraits = keySchema.getMergedTraits();
                    const keySuffix = this.getKey("key", keyTraits.xmlName, keyTraits.ec2QueryName);
                    const key = flat ? `${prefix}${i}.${keySuffix}` : `${prefix}entry.${i}.${keySuffix}`;
                    const valTraits = memberSchema.getMergedTraits();
                    const valueSuffix = this.getKey("value", valTraits.xmlName, valTraits.ec2QueryName);
                    const valueKey = flat ? `${prefix}${i}.${valueSuffix}` : `${prefix}entry.${i}.${valueSuffix}`;
                    this.write(keySchema, k, key);
                    this.write(memberSchema, v, valueKey);
                    ++i;
                }
            }
        }
        else if (ns.isStructSchema()) {
            if (value && typeof value === "object") {
                let didWriteMember = false;
                for (const [memberName, member] of ns.structIterator()) {
                    if (value[memberName] == null && !member.isIdempotencyToken()) {
                        continue;
                    }
                    const traits = member.getMergedTraits();
                    const suffix = this.getKey(memberName, traits.xmlName, traits.ec2QueryName, "struct");
                    const key = `${prefix}${suffix}`;
                    this.write(member, value[memberName], key);
                    didWriteMember = true;
                }
                if (!didWriteMember && ns.isUnionSchema()) {
                    const { $unknown } = value;
                    if (Array.isArray($unknown)) {
                        const [k, v] = $unknown;
                        const key = `${prefix}${k}`;
                        this.write(15, v, key);
                    }
                }
            }
        }
        else if (ns.isUnitSchema()) {
        }
        else {
            throw new Error(`@aws-sdk/core/protocols - QuerySerializer unrecognized schema type ${ns.getName(true)}`);
        }
    }
    flush() {
        if (this.buffer === undefined) {
            throw new Error("@aws-sdk/core/protocols - QuerySerializer cannot flush with nothing written to buffer.");
        }
        const str = this.buffer;
        delete this.buffer;
        return str;
    }
    getKey(memberName, xmlName, ec2QueryName, keySource) {
        const { ec2, capitalizeKeys } = this.settings;
        if (ec2 && ec2QueryName) {
            return ec2QueryName;
        }
        const key = xmlName ?? memberName;
        if (capitalizeKeys && keySource === "struct") {
            return key[0].toUpperCase() + key.slice(1);
        }
        return key;
    }
    writeKey(key) {
        if (key.endsWith(".")) {
            key = key.slice(0, key.length - 1);
        }
        this.buffer += `&${(0,_smithy_core_protocols__WEBPACK_IMPORTED_MODULE_0__.extendedEncodeURIComponent)(key)}=`;
    }
    writeValue(value) {
        this.buffer += (0,_smithy_core_protocols__WEBPACK_IMPORTED_MODULE_0__.extendedEncodeURIComponent)(value);
    }
}


/***/ },

/***/ 2697
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   STS: () => (/* binding */ STS)
/* harmony export */ });
/* harmony import */ var _smithy_core_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2228);
/* harmony import */ var _commands_AssumeRoleCommand__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2698);
/* harmony import */ var _commands_AssumeRoleWithWebIdentityCommand__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2700);
/* harmony import */ var _STSClient__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(2682);




const commands = {
    AssumeRoleCommand: _commands_AssumeRoleCommand__WEBPACK_IMPORTED_MODULE_1__.AssumeRoleCommand,
    AssumeRoleWithWebIdentityCommand: _commands_AssumeRoleWithWebIdentityCommand__WEBPACK_IMPORTED_MODULE_2__.AssumeRoleWithWebIdentityCommand,
};
class STS extends _STSClient__WEBPACK_IMPORTED_MODULE_3__.STSClient {
}
(0,_smithy_core_client__WEBPACK_IMPORTED_MODULE_0__.createAggregatedClient)(commands, STS);


/***/ },

/***/ 2682
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   STSClient: () => (/* binding */ STSClient),
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
/* harmony import */ var _auth_httpAuthSchemeProvider__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(2683);
/* harmony import */ var _endpoint_EndpointParameters__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(2686);
/* harmony import */ var _runtimeConfig__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(2687);
/* harmony import */ var _runtimeExtensions__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(2695);













class STSClient extends _smithy_core_client__WEBPACK_IMPORTED_MODULE_8__.Client {
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
            httpAuthSchemeParametersProvider: _auth_httpAuthSchemeProvider__WEBPACK_IMPORTED_MODULE_15__.defaultSTSHttpAuthSchemeParametersProvider,
            identityProviderConfigProvider: async (config) => new _smithy_core__WEBPACK_IMPORTED_MODULE_5__.DefaultIdentityProviderConfig({
                "aws.auth#sigv4": config.credentials,
                "aws.auth#sigv4a": config.credentials,
            }),
        }));
        this.middlewareStack.use((0,_smithy_core__WEBPACK_IMPORTED_MODULE_7__.getHttpSigningPlugin)(this.config));
    }
    destroy() {
        super.destroy();
    }
}


/***/ },

/***/ 2696
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

/***/ 2683
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   defaultSTSHttpAuthSchemeParametersProvider: () => (/* binding */ defaultSTSHttpAuthSchemeParametersProvider),
/* harmony export */   defaultSTSHttpAuthSchemeProvider: () => (/* binding */ defaultSTSHttpAuthSchemeProvider),
/* harmony export */   resolveHttpAuthSchemeConfig: () => (/* binding */ resolveHttpAuthSchemeConfig)
/* harmony export */ });
/* harmony import */ var _aws_sdk_core_httpAuthSchemes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2055);
/* harmony import */ var _aws_sdk_core_httpAuthSchemes__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2056);
/* harmony import */ var _aws_sdk_signature_v4_multi_region__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2072);
/* harmony import */ var _smithy_core_client__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(1889);
/* harmony import */ var _smithy_core_client__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(1856);
/* harmony import */ var _smithy_core_endpoints__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(1932);
/* harmony import */ var _endpoint_endpointResolver__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(2684);





const createEndpointRuleSetHttpAuthSchemeParametersProvider = (defaultHttpAuthSchemeParametersProvider) => async (config, context, input) => {
    if (!input) {
        throw new Error("Could not find `input` for `defaultEndpointRuleSetHttpAuthSchemeParametersProvider`");
    }
    const defaultParameters = await defaultHttpAuthSchemeParametersProvider(config, context, input);
    const instructionsFn = (0,_smithy_core_client__WEBPACK_IMPORTED_MODULE_3__.getSmithyContext)(context)?.commandInstance?.constructor
        ?.getEndpointParameterInstructions;
    if (!instructionsFn) {
        throw new Error(`getEndpointParameterInstructions() is not defined on '${context.commandName}'`);
    }
    const endpointParameters = await (0,_smithy_core_endpoints__WEBPACK_IMPORTED_MODULE_5__.resolveParams)(input, { getEndpointParameterInstructions: instructionsFn }, config);
    return Object.assign(defaultParameters, endpointParameters);
};
const _defaultSTSHttpAuthSchemeParametersProvider = async (config, context, input) => {
    return {
        operation: (0,_smithy_core_client__WEBPACK_IMPORTED_MODULE_3__.getSmithyContext)(context).operation,
        region: await (0,_smithy_core_client__WEBPACK_IMPORTED_MODULE_4__.normalizeProvider)(config.region)() || (() => {
            throw new Error("expected `region` to be configured for `aws.auth#sigv4`");
        })(),
    };
};
const defaultSTSHttpAuthSchemeParametersProvider = createEndpointRuleSetHttpAuthSchemeParametersProvider(_defaultSTSHttpAuthSchemeParametersProvider);
function createAwsAuthSigv4HttpAuthOption(authParameters) {
    return {
        schemeId: "aws.auth#sigv4",
        signingProperties: {
            name: "sts",
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
function createAwsAuthSigv4aHttpAuthOption(authParameters) {
    return {
        schemeId: "aws.auth#sigv4a",
        signingProperties: {
            name: "sts",
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
const createEndpointRuleSetHttpAuthSchemeProvider = (defaultEndpointResolver, defaultHttpAuthSchemeResolver, createHttpAuthOptionFunctions) => {
    const endpointRuleSetHttpAuthSchemeProvider = (authParameters) => {
        const endpoint = defaultEndpointResolver(authParameters);
        const authSchemes = endpoint.properties?.authSchemes;
        if (!authSchemes) {
            return defaultHttpAuthSchemeResolver(authParameters);
        }
        const options = [];
        for (const scheme of authSchemes) {
            const { name: resolvedName, properties = {}, ...rest } = scheme;
            const name = resolvedName.toLowerCase();
            if (resolvedName !== name) {
                console.warn(`HttpAuthScheme has been normalized with lowercasing: '${resolvedName}' to '${name}'`);
            }
            let schemeId;
            if (name === "sigv4a") {
                schemeId = "aws.auth#sigv4a";
                const sigv4Present = authSchemes.find((s) => {
                    const name = s.name.toLowerCase();
                    return name !== "sigv4a" && name.startsWith("sigv4");
                });
                if (_aws_sdk_signature_v4_multi_region__WEBPACK_IMPORTED_MODULE_2__.SignatureV4MultiRegion.sigv4aDependency() === "none" && sigv4Present) {
                    continue;
                }
            }
            else if (name.startsWith("sigv4")) {
                schemeId = "aws.auth#sigv4";
            }
            else {
                throw new Error(`Unknown HttpAuthScheme found in '@smithy.rules#endpointRuleSet': '${name}'`);
            }
            const createOption = createHttpAuthOptionFunctions[schemeId];
            if (!createOption) {
                throw new Error(`Could not find HttpAuthOption create function for '${schemeId}'`);
            }
            const option = createOption(authParameters);
            option.schemeId = schemeId;
            option.signingProperties = { ...(option.signingProperties || {}), ...rest, ...properties };
            options.push(option);
        }
        return options;
    };
    return endpointRuleSetHttpAuthSchemeProvider;
};
const _defaultSTSHttpAuthSchemeProvider = (authParameters) => {
    const options = [];
    switch (authParameters.operation) {
        case "AssumeRoleWithWebIdentity": {
            options.push(createSmithyApiNoAuthHttpAuthOption(authParameters));
            options.push(createAwsAuthSigv4aHttpAuthOption(authParameters));
            break;
        }
        default: {
            options.push(createAwsAuthSigv4HttpAuthOption(authParameters));
            options.push(createAwsAuthSigv4aHttpAuthOption(authParameters));
        }
    }
    return options;
};
const defaultSTSHttpAuthSchemeProvider = createEndpointRuleSetHttpAuthSchemeProvider(_endpoint_endpointResolver__WEBPACK_IMPORTED_MODULE_6__.defaultEndpointResolver, _defaultSTSHttpAuthSchemeProvider, {
    "aws.auth#sigv4": createAwsAuthSigv4HttpAuthOption,
    "aws.auth#sigv4a": createAwsAuthSigv4aHttpAuthOption,
    "smithy.api#noAuth": createSmithyApiNoAuthHttpAuthOption,
});
const resolveHttpAuthSchemeConfig = (config) => {
    const config_0 = (0,_aws_sdk_core_httpAuthSchemes__WEBPACK_IMPORTED_MODULE_1__.resolveAwsSdkSigV4Config)(config);
    const config_1 = (0,_aws_sdk_core_httpAuthSchemes__WEBPACK_IMPORTED_MODULE_0__.resolveAwsSdkSigV4AConfig)(config_0);
    return Object.assign(config_1, {
        authSchemePreference: (0,_smithy_core_client__WEBPACK_IMPORTED_MODULE_4__.normalizeProvider)(config.authSchemePreference ?? []),
    });
};


/***/ },

/***/ 2699
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   _ep0: () => (/* binding */ _ep0),
/* harmony export */   _mw0: () => (/* binding */ _mw0),
/* harmony export */   command: () => (/* binding */ command)
/* harmony export */ });
/* harmony import */ var _smithy_core_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2112);
/* harmony import */ var _smithy_core_endpoints__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1907);
/* harmony import */ var _endpoint_EndpointParameters__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2686);



const command = (0,_smithy_core_client__WEBPACK_IMPORTED_MODULE_0__.makeBuilder)(_endpoint_EndpointParameters__WEBPACK_IMPORTED_MODULE_2__.commonParams, "AWSSecurityTokenServiceV20110615", "STSClient", _smithy_core_endpoints__WEBPACK_IMPORTED_MODULE_1__.getEndpointPlugin);
const _ep0 = {};
const _mw0 = (Command, cs, config, o) => [];


/***/ },

/***/ 2698
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AssumeRoleCommand: () => (/* binding */ AssumeRoleCommand)
/* harmony export */ });
/* harmony import */ var _commandBuilder__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2699);
/* harmony import */ var _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2692);


class AssumeRoleCommand extends (0,_commandBuilder__WEBPACK_IMPORTED_MODULE_0__.command)(_commandBuilder__WEBPACK_IMPORTED_MODULE_0__._ep0, _commandBuilder__WEBPACK_IMPORTED_MODULE_0__._mw0, "AssumeRole", _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_1__.AssumeRole$) {
}


/***/ },

/***/ 2700
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AssumeRoleWithWebIdentityCommand: () => (/* binding */ AssumeRoleWithWebIdentityCommand)
/* harmony export */ });
/* harmony import */ var _commandBuilder__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2699);
/* harmony import */ var _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2692);


class AssumeRoleWithWebIdentityCommand extends (0,_commandBuilder__WEBPACK_IMPORTED_MODULE_0__.command)(_commandBuilder__WEBPACK_IMPORTED_MODULE_0__._ep0, _commandBuilder__WEBPACK_IMPORTED_MODULE_0__._mw0, "AssumeRoleWithWebIdentity", _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_1__.AssumeRoleWithWebIdentity$) {
}


/***/ },

/***/ 2701
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AssumeRoleCommand: () => (/* reexport safe */ _AssumeRoleCommand__WEBPACK_IMPORTED_MODULE_0__.AssumeRoleCommand),
/* harmony export */   AssumeRoleWithWebIdentityCommand: () => (/* reexport safe */ _AssumeRoleWithWebIdentityCommand__WEBPACK_IMPORTED_MODULE_1__.AssumeRoleWithWebIdentityCommand)
/* harmony export */ });
/* harmony import */ var _AssumeRoleCommand__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2698);
/* harmony import */ var _AssumeRoleWithWebIdentityCommand__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2700);




/***/ },

/***/ 2702
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   decorateDefaultCredentialProvider: () => (/* binding */ decorateDefaultCredentialProvider),
/* harmony export */   getDefaultRoleAssumer: () => (/* binding */ getDefaultRoleAssumer),
/* harmony export */   getDefaultRoleAssumerWithWebIdentity: () => (/* binding */ getDefaultRoleAssumerWithWebIdentity)
/* harmony export */ });
/* harmony import */ var _defaultStsRoleAssumers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2703);
/* harmony import */ var _STSClient__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2682);


const getCustomizableStsClientCtor = (baseCtor, customizations) => {
    if (!customizations)
        return baseCtor;
    else
        return class CustomizableSTSClient extends baseCtor {
            constructor(config) {
                super(config);
                for (const customization of customizations) {
                    this.middlewareStack.use(customization);
                }
            }
        };
};
const getDefaultRoleAssumer = (stsOptions = {}, stsPlugins) => (0,_defaultStsRoleAssumers__WEBPACK_IMPORTED_MODULE_0__.getDefaultRoleAssumer)(stsOptions, getCustomizableStsClientCtor(_STSClient__WEBPACK_IMPORTED_MODULE_1__.STSClient, stsPlugins));
const getDefaultRoleAssumerWithWebIdentity = (stsOptions = {}, stsPlugins) => (0,_defaultStsRoleAssumers__WEBPACK_IMPORTED_MODULE_0__.getDefaultRoleAssumerWithWebIdentity)(stsOptions, getCustomizableStsClientCtor(_STSClient__WEBPACK_IMPORTED_MODULE_1__.STSClient, stsPlugins));
const decorateDefaultCredentialProvider = (provider) => (input) => provider({
    roleAssumer: getDefaultRoleAssumer(input),
    roleAssumerWithWebIdentity: getDefaultRoleAssumerWithWebIdentity(input),
    ...input,
});


/***/ },

/***/ 2703
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getDefaultRoleAssumer: () => (/* binding */ getDefaultRoleAssumer),
/* harmony export */   getDefaultRoleAssumerWithWebIdentity: () => (/* binding */ getDefaultRoleAssumerWithWebIdentity)
/* harmony export */ });
/* harmony import */ var _aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2057);
/* harmony import */ var _aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2704);
/* harmony import */ var _commands_AssumeRoleCommand__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2698);
/* harmony import */ var _commands_AssumeRoleWithWebIdentityCommand__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(2700);



const getAccountIdFromAssumedRoleUser = (assumedRoleUser) => {
    if (typeof assumedRoleUser?.Arn === "string") {
        const arnComponents = assumedRoleUser.Arn.split(":");
        if (arnComponents.length > 4 && arnComponents[4] !== "") {
            return arnComponents[4];
        }
    }
    return undefined;
};
const resolveRegion = async (_region, _parentRegion, credentialProviderLogger, loaderConfig = {}) => {
    const region = typeof _region === "function" ? await _region() : _region;
    const parentRegion = typeof _parentRegion === "function" ? await _parentRegion() : _parentRegion;
    let stsDefaultRegion = "";
    const resolvedRegion = region ?? parentRegion ?? (stsDefaultRegion = await (0,_aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_1__.stsRegionDefaultResolver)(loaderConfig)());
    credentialProviderLogger?.debug?.("@aws-sdk/client-sts::resolveRegion", "accepting first of:", `${region} (credential provider clientConfig)`, `${parentRegion} (contextual client)`, `${stsDefaultRegion} (STS default: AWS_REGION, profile region, or us-east-1)`);
    return resolvedRegion;
};
const getDefaultRoleAssumer = (stsOptions, STSClient) => {
    let stsClient;
    let closureSourceCreds;
    return async (sourceCreds, params) => {
        closureSourceCreds = sourceCreds;
        if (!stsClient) {
            const { logger = stsOptions?.parentClientConfig?.logger, profile = stsOptions?.parentClientConfig?.profile, region, requestHandler = stsOptions?.parentClientConfig?.requestHandler, credentialProviderLogger, userAgentAppId = stsOptions?.parentClientConfig?.userAgentAppId, } = stsOptions;
            const resolvedRegion = await resolveRegion(region, stsOptions?.parentClientConfig?.region, credentialProviderLogger, {
                logger,
                profile,
            });
            const isCompatibleRequestHandler = !isH2(requestHandler);
            stsClient = new STSClient({
                ...stsOptions,
                userAgentAppId,
                profile,
                credentialDefaultProvider: () => async () => closureSourceCreds,
                region: resolvedRegion,
                requestHandler: isCompatibleRequestHandler ? requestHandler : undefined,
                logger: logger,
            });
        }
        const { Credentials, AssumedRoleUser } = await stsClient.send(new _commands_AssumeRoleCommand__WEBPACK_IMPORTED_MODULE_2__.AssumeRoleCommand(params));
        if (!Credentials || !Credentials.AccessKeyId || !Credentials.SecretAccessKey) {
            throw new Error(`Invalid response from STS.assumeRole call with role ${params.RoleArn}`);
        }
        const accountId = getAccountIdFromAssumedRoleUser(AssumedRoleUser);
        const credentials = {
            accessKeyId: Credentials.AccessKeyId,
            secretAccessKey: Credentials.SecretAccessKey,
            sessionToken: Credentials.SessionToken,
            expiration: Credentials.Expiration,
            ...(Credentials.CredentialScope && { credentialScope: Credentials.CredentialScope }),
            ...(accountId && { accountId }),
        };
        (0,_aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_0__.setCredentialFeature)(credentials, "CREDENTIALS_STS_ASSUME_ROLE", "i");
        return credentials;
    };
};
const getDefaultRoleAssumerWithWebIdentity = (stsOptions, STSClient) => {
    let stsClient;
    return async (params) => {
        if (!stsClient) {
            const { logger = stsOptions?.parentClientConfig?.logger, profile = stsOptions?.parentClientConfig?.profile, region, requestHandler = stsOptions?.parentClientConfig?.requestHandler, credentialProviderLogger, userAgentAppId = stsOptions?.parentClientConfig?.userAgentAppId, } = stsOptions;
            const resolvedRegion = await resolveRegion(region, stsOptions?.parentClientConfig?.region, credentialProviderLogger, {
                logger,
                profile,
            });
            const isCompatibleRequestHandler = !isH2(requestHandler);
            stsClient = new STSClient({
                ...stsOptions,
                userAgentAppId,
                profile,
                region: resolvedRegion,
                requestHandler: isCompatibleRequestHandler ? requestHandler : undefined,
                logger: logger,
            });
        }
        const { Credentials, AssumedRoleUser } = await stsClient.send(new _commands_AssumeRoleWithWebIdentityCommand__WEBPACK_IMPORTED_MODULE_3__.AssumeRoleWithWebIdentityCommand(params));
        if (!Credentials || !Credentials.AccessKeyId || !Credentials.SecretAccessKey) {
            throw new Error(`Invalid response from STS.assumeRoleWithWebIdentity call with role ${params.RoleArn}`);
        }
        const accountId = getAccountIdFromAssumedRoleUser(AssumedRoleUser);
        const credentials = {
            accessKeyId: Credentials.AccessKeyId,
            secretAccessKey: Credentials.SecretAccessKey,
            sessionToken: Credentials.SessionToken,
            expiration: Credentials.Expiration,
            ...(Credentials.CredentialScope && { credentialScope: Credentials.CredentialScope }),
            ...(accountId && { accountId }),
        };
        if (accountId) {
            (0,_aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_0__.setCredentialFeature)(credentials, "RESOLVED_ACCOUNT_ID", "T");
        }
        (0,_aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_0__.setCredentialFeature)(credentials, "CREDENTIALS_STS_ASSUME_ROLE_WEB_ID", "k");
        return credentials;
    };
};
const isH2 = (requestHandler) => {
    return requestHandler?.metadata?.handlerProtocol === "h2";
};


/***/ },

/***/ 2686
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
        useGlobalEndpoint: options.useGlobalEndpoint ?? false,
        defaultSigningName: "sts",
    });
};
const commonParams = {
    UseGlobalEndpoint: { type: "builtInParams", name: "useGlobalEndpoint" },
    UseFIPS: { type: "builtInParams", name: "useFipsEndpoint" },
    Endpoint: { type: "builtInParams", name: "endpoint" },
    Region: { type: "builtInParams", name: "region" },
    UseDualStack: { type: "builtInParams", name: "useDualstackEndpoint" },
};


/***/ },

/***/ 2685
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   bdd: () => (/* binding */ bdd)
/* harmony export */ });
/* harmony import */ var _smithy_core_endpoints__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1941);

const q = "ref";
const a = -1, b = true, c = "isSet", d = "PartitionResult", e = "booleanEquals", f = "stringEquals", g = "getAttr", h = "us-east-1", i = "sigv4", j = "sts", k = "https://sts.{Region}.{PartitionResult#dnsSuffix}", l = { [q]: "Endpoint" }, m = { [q]: "Region" }, n = { [q]: d }, o = {}, p = [m];
const _data = {
    conditions: [
        [c, [l]],
        [c, p],
        ["aws.partition", p, d],
        [e, [{ [q]: "UseFIPS" }, b]],
        [e, [{ [q]: "UseDualStack" }, b]],
        [f, [m, "aws-global"]],
        [e, [{ [q]: "UseGlobalEndpoint" }, b]],
        [f, [m, "eu-central-1"]],
        [e, [{ fn: g, argv: [n, "supportsDualStack"] }, b]],
        [e, [{ fn: g, argv: [n, "supportsFIPS"] }, b]],
        [f, [m, "ap-south-1"]],
        [f, [m, "eu-north-1"]],
        [f, [m, "eu-west-1"]],
        [f, [m, "eu-west-2"]],
        [f, [m, "eu-west-3"]],
        [f, [m, "sa-east-1"]],
        [f, [m, h]],
        [f, [m, "us-east-2"]],
        [f, [m, "us-west-2"]],
        [f, [m, "us-west-1"]],
        [f, [m, "ca-central-1"]],
        [f, [m, "ap-southeast-1"]],
        [f, [m, "ap-northeast-1"]],
        [f, [m, "ap-southeast-2"]],
        [f, [{ fn: g, argv: [n, "name"] }, "aws-us-gov"]]
    ],
    results: [
        [a],
        ["https://sts.amazonaws.com", { authSchemes: [{ name: i, signingName: j, signingRegion: h }] }],
        [k, { authSchemes: [{ name: i, signingName: j, signingRegion: "{Region}" }] }],
        [a, "Invalid Configuration: FIPS and custom endpoint are not supported"],
        [a, "Invalid Configuration: Dualstack and custom endpoint are not supported"],
        [l, o],
        ["https://sts-fips.{Region}.{PartitionResult#dualStackDnsSuffix}", o],
        [a, "FIPS and DualStack are enabled, but this partition does not support one or both"],
        ["https://sts.{Region}.amazonaws.com", o],
        ["https://sts-fips.{Region}.{PartitionResult#dnsSuffix}", o],
        [a, "FIPS is enabled but this partition does not support FIPS"],
        ["https://sts.{Region}.{PartitionResult#dualStackDnsSuffix}", o],
        [a, "DualStack is enabled but this partition does not support DualStack"],
        [k, o],
        [a, "Invalid Configuration: Missing Region"]
    ]
};
const root = 2;
const r = 100_000_000;
const nodes = new Int32Array([
    -1, 1, -1,
    0, 30, 3,
    1, 4, r + 14,
    2, 5, r + 14,
    3, 25, 6,
    4, 24, 7,
    5, r + 1, 8,
    6, 9, r + 13,
    7, r + 1, 10,
    10, r + 1, 11,
    11, r + 1, 12,
    12, r + 1, 13,
    13, r + 1, 14,
    14, r + 1, 15,
    15, r + 1, 16,
    16, r + 1, 17,
    17, r + 1, 18,
    18, r + 1, 19,
    19, r + 1, 20,
    20, r + 1, 21,
    21, r + 1, 22,
    22, r + 1, 23,
    23, r + 1, r + 2,
    8, r + 11, r + 12,
    4, 28, 26,
    9, 27, r + 10,
    24, r + 8, r + 9,
    8, 29, r + 7,
    9, r + 6, r + 7,
    3, r + 3, 31,
    4, r + 4, r + 5,
]);
const bdd = _smithy_core_endpoints__WEBPACK_IMPORTED_MODULE_0__.BinaryDecisionDiagram.from(nodes, root, _data.conditions, _data.results);


/***/ },

/***/ 2684
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   defaultEndpointResolver: () => (/* binding */ defaultEndpointResolver)
/* harmony export */ });
/* harmony import */ var _aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2077);
/* harmony import */ var _smithy_core_endpoints__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1942);
/* harmony import */ var _smithy_core_endpoints__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(1943);
/* harmony import */ var _smithy_core_endpoints__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(1949);
/* harmony import */ var _bdd__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(2685);



const cache = new _smithy_core_endpoints__WEBPACK_IMPORTED_MODULE_1__.EndpointCache({
    size: 50,
    params: ["Endpoint", "Region", "UseDualStack", "UseFIPS", "UseGlobalEndpoint"],
});
const defaultEndpointResolver = (endpointParams, context = {}) => {
    return cache.get(endpointParams, () => (0,_smithy_core_endpoints__WEBPACK_IMPORTED_MODULE_2__.decideEndpoint)(_bdd__WEBPACK_IMPORTED_MODULE_4__.bdd, {
        endpointParams: endpointParams,
        logger: context.logger,
    }));
};
_smithy_core_endpoints__WEBPACK_IMPORTED_MODULE_3__.customEndpointFunctions.aws = _aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_0__.awsEndpointFunctions;


/***/ },

/***/ 2681
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   $Command: () => (/* reexport safe */ _smithy_core_client__WEBPACK_IMPORTED_MODULE_3__.Command),
/* harmony export */   AssumeRole$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.AssumeRole$),
/* harmony export */   AssumeRoleCommand: () => (/* reexport safe */ _commands__WEBPACK_IMPORTED_MODULE_2__.AssumeRoleCommand),
/* harmony export */   AssumeRoleRequest$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.AssumeRoleRequest$),
/* harmony export */   AssumeRoleResponse$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.AssumeRoleResponse$),
/* harmony export */   AssumeRoleWithWebIdentity$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.AssumeRoleWithWebIdentity$),
/* harmony export */   AssumeRoleWithWebIdentityCommand: () => (/* reexport safe */ _commands__WEBPACK_IMPORTED_MODULE_2__.AssumeRoleWithWebIdentityCommand),
/* harmony export */   AssumeRoleWithWebIdentityRequest$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.AssumeRoleWithWebIdentityRequest$),
/* harmony export */   AssumeRoleWithWebIdentityResponse$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.AssumeRoleWithWebIdentityResponse$),
/* harmony export */   AssumedRoleUser$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.AssumedRoleUser$),
/* harmony export */   Credentials$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.Credentials$),
/* harmony export */   ExpiredTokenException: () => (/* reexport safe */ _models_errors__WEBPACK_IMPORTED_MODULE_5__.ExpiredTokenException),
/* harmony export */   ExpiredTokenException$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.ExpiredTokenException$),
/* harmony export */   IDPCommunicationErrorException: () => (/* reexport safe */ _models_errors__WEBPACK_IMPORTED_MODULE_5__.IDPCommunicationErrorException),
/* harmony export */   IDPCommunicationErrorException$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.IDPCommunicationErrorException$),
/* harmony export */   IDPRejectedClaimException: () => (/* reexport safe */ _models_errors__WEBPACK_IMPORTED_MODULE_5__.IDPRejectedClaimException),
/* harmony export */   IDPRejectedClaimException$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.IDPRejectedClaimException$),
/* harmony export */   InvalidIdentityTokenException: () => (/* reexport safe */ _models_errors__WEBPACK_IMPORTED_MODULE_5__.InvalidIdentityTokenException),
/* harmony export */   InvalidIdentityTokenException$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.InvalidIdentityTokenException$),
/* harmony export */   MalformedPolicyDocumentException: () => (/* reexport safe */ _models_errors__WEBPACK_IMPORTED_MODULE_5__.MalformedPolicyDocumentException),
/* harmony export */   MalformedPolicyDocumentException$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.MalformedPolicyDocumentException$),
/* harmony export */   PackedPolicyTooLargeException: () => (/* reexport safe */ _models_errors__WEBPACK_IMPORTED_MODULE_5__.PackedPolicyTooLargeException),
/* harmony export */   PackedPolicyTooLargeException$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.PackedPolicyTooLargeException$),
/* harmony export */   PolicyDescriptorType$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.PolicyDescriptorType$),
/* harmony export */   ProvidedContext$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.ProvidedContext$),
/* harmony export */   RegionDisabledException: () => (/* reexport safe */ _models_errors__WEBPACK_IMPORTED_MODULE_5__.RegionDisabledException),
/* harmony export */   RegionDisabledException$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.RegionDisabledException$),
/* harmony export */   STS: () => (/* reexport safe */ _STS__WEBPACK_IMPORTED_MODULE_1__.STS),
/* harmony export */   STSClient: () => (/* reexport safe */ _STSClient__WEBPACK_IMPORTED_MODULE_0__.STSClient),
/* harmony export */   STSServiceException: () => (/* reexport safe */ _models_STSServiceException__WEBPACK_IMPORTED_MODULE_7__.STSServiceException),
/* harmony export */   STSServiceException$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.STSServiceException$),
/* harmony export */   Tag$: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.Tag$),
/* harmony export */   __Client: () => (/* reexport safe */ _STSClient__WEBPACK_IMPORTED_MODULE_0__.__Client),
/* harmony export */   decorateDefaultCredentialProvider: () => (/* reexport safe */ _defaultRoleAssumers__WEBPACK_IMPORTED_MODULE_6__.decorateDefaultCredentialProvider),
/* harmony export */   errorTypeRegistries: () => (/* reexport safe */ _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__.errorTypeRegistries),
/* harmony export */   getDefaultRoleAssumer: () => (/* reexport safe */ _defaultRoleAssumers__WEBPACK_IMPORTED_MODULE_6__.getDefaultRoleAssumer),
/* harmony export */   getDefaultRoleAssumerWithWebIdentity: () => (/* reexport safe */ _defaultRoleAssumers__WEBPACK_IMPORTED_MODULE_6__.getDefaultRoleAssumerWithWebIdentity)
/* harmony export */ });
/* harmony import */ var _STSClient__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2682);
/* harmony import */ var _STS__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2697);
/* harmony import */ var _commands__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2701);
/* harmony import */ var _smithy_core_client__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(2113);
/* harmony import */ var _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(2692);
/* harmony import */ var _models_errors__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(2693);
/* harmony import */ var _defaultRoleAssumers__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(2702);
/* harmony import */ var _models_STSServiceException__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(2694);











/***/ },

/***/ 2694
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   STSServiceException: () => (/* binding */ STSServiceException),
/* harmony export */   __ServiceException: () => (/* reexport safe */ _smithy_core_client__WEBPACK_IMPORTED_MODULE_0__.ServiceException)
/* harmony export */ });
/* harmony import */ var _smithy_core_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2123);


class STSServiceException extends _smithy_core_client__WEBPACK_IMPORTED_MODULE_0__.ServiceException {
    constructor(options) {
        super(options);
        Object.setPrototypeOf(this, STSServiceException.prototype);
    }
}


/***/ },

/***/ 2693
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ExpiredTokenException: () => (/* binding */ ExpiredTokenException),
/* harmony export */   IDPCommunicationErrorException: () => (/* binding */ IDPCommunicationErrorException),
/* harmony export */   IDPRejectedClaimException: () => (/* binding */ IDPRejectedClaimException),
/* harmony export */   InvalidIdentityTokenException: () => (/* binding */ InvalidIdentityTokenException),
/* harmony export */   MalformedPolicyDocumentException: () => (/* binding */ MalformedPolicyDocumentException),
/* harmony export */   PackedPolicyTooLargeException: () => (/* binding */ PackedPolicyTooLargeException),
/* harmony export */   RegionDisabledException: () => (/* binding */ RegionDisabledException)
/* harmony export */ });
/* harmony import */ var _STSServiceException__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2694);

class ExpiredTokenException extends _STSServiceException__WEBPACK_IMPORTED_MODULE_0__.STSServiceException {
    name = "ExpiredTokenException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "ExpiredTokenException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, ExpiredTokenException.prototype);
    }
}
class MalformedPolicyDocumentException extends _STSServiceException__WEBPACK_IMPORTED_MODULE_0__.STSServiceException {
    name = "MalformedPolicyDocumentException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "MalformedPolicyDocumentException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, MalformedPolicyDocumentException.prototype);
    }
}
class PackedPolicyTooLargeException extends _STSServiceException__WEBPACK_IMPORTED_MODULE_0__.STSServiceException {
    name = "PackedPolicyTooLargeException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "PackedPolicyTooLargeException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, PackedPolicyTooLargeException.prototype);
    }
}
class RegionDisabledException extends _STSServiceException__WEBPACK_IMPORTED_MODULE_0__.STSServiceException {
    name = "RegionDisabledException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "RegionDisabledException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, RegionDisabledException.prototype);
    }
}
class IDPRejectedClaimException extends _STSServiceException__WEBPACK_IMPORTED_MODULE_0__.STSServiceException {
    name = "IDPRejectedClaimException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "IDPRejectedClaimException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, IDPRejectedClaimException.prototype);
    }
}
class InvalidIdentityTokenException extends _STSServiceException__WEBPACK_IMPORTED_MODULE_0__.STSServiceException {
    name = "InvalidIdentityTokenException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "InvalidIdentityTokenException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, InvalidIdentityTokenException.prototype);
    }
}
class IDPCommunicationErrorException extends _STSServiceException__WEBPACK_IMPORTED_MODULE_0__.STSServiceException {
    name = "IDPCommunicationErrorException";
    $fault = "client";
    $retryable = {};
    constructor(opts) {
        super({
            name: "IDPCommunicationErrorException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, IDPCommunicationErrorException.prototype);
    }
}


/***/ },

/***/ 2687
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getRuntimeConfig: () => (/* binding */ getRuntimeConfig)
/* harmony export */ });
/* harmony import */ var _package_json__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2649);
/* harmony import */ var _aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2129);
/* harmony import */ var _aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2130);
/* harmony import */ var _aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(2135);
/* harmony import */ var _aws_sdk_core_httpAuthSchemes__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(2182);
/* harmony import */ var _aws_sdk_core_httpAuthSchemes__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(2187);
/* harmony import */ var _aws_sdk_core_httpAuthSchemes__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(2136);
/* harmony import */ var _aws_sdk_core_httpAuthSchemes__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(2055);
/* harmony import */ var _smithy_core__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(2658);
/* harmony import */ var _smithy_core_client__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(2146);
/* harmony import */ var _smithy_core_client__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(2147);
/* harmony import */ var _smithy_core_config__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(1909);
/* harmony import */ var _smithy_core_config__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(2148);
/* harmony import */ var _smithy_core_config__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(2149);
/* harmony import */ var _smithy_core_config__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(2150);
/* harmony import */ var _smithy_core_config__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(2153);
/* harmony import */ var _smithy_core_retry__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(1871);
/* harmony import */ var _smithy_core_retry__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(2048);
/* harmony import */ var _smithy_core_serde__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(2002);
/* harmony import */ var _smithy_node_http_handler__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(2167);
/* harmony import */ var _smithy_node_http_handler__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(2029);
/* harmony import */ var _runtimeConfig_shared__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(2688);










const getRuntimeConfig = (config) => {
    (0,_smithy_core_client__WEBPACK_IMPORTED_MODULE_10__.emitWarningIfUnsupportedVersion)(process.version);
    const defaultsMode = (0,_smithy_core_config__WEBPACK_IMPORTED_MODULE_15__.resolveDefaultsModeConfig)(config);
    const defaultConfigProvider = () => defaultsMode().then(_smithy_core_client__WEBPACK_IMPORTED_MODULE_9__.loadConfigsForDefaultMode);
    const clientSharedValues = (0,_runtimeConfig_shared__WEBPACK_IMPORTED_MODULE_21__.getRuntimeConfig)(config);
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
        authSchemePreference: config?.authSchemePreference ?? (0,_smithy_core_config__WEBPACK_IMPORTED_MODULE_11__.loadConfig)(_aws_sdk_core_httpAuthSchemes__WEBPACK_IMPORTED_MODULE_6__.NODE_AUTH_SCHEME_PREFERENCE_OPTIONS, loaderConfig),
        bodyLengthChecker: config?.bodyLengthChecker ?? _smithy_core_serde__WEBPACK_IMPORTED_MODULE_18__.calculateBodyLength,
        defaultUserAgentProvider: config?.defaultUserAgentProvider ?? (0,_aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_2__.createDefaultUserAgentProvider)({ serviceId: clientSharedValues.serviceId, clientVersion: _package_json__WEBPACK_IMPORTED_MODULE_0__.version }),
        httpAuthSchemes: config?.httpAuthSchemes ?? [
            {
                schemeId: "aws.auth#sigv4",
                identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4") || (async (idProps) => await config.credentialDefaultProvider(idProps?.__config || {})()),
                signer: new _aws_sdk_core_httpAuthSchemes__WEBPACK_IMPORTED_MODULE_4__.AwsSdkSigV4Signer(),
            },
            {
                schemeId: "aws.auth#sigv4a",
                identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4a"),
                signer: new _aws_sdk_core_httpAuthSchemes__WEBPACK_IMPORTED_MODULE_5__.AwsSdkSigV4ASigner(),
            },
            {
                schemeId: "smithy.api#noAuth",
                identityProvider: (ipc) => ipc.getIdentityProvider("smithy.api#noAuth") || (async () => ({})),
                signer: new _smithy_core__WEBPACK_IMPORTED_MODULE_8__.NoAuthSigner(),
            },
        ],
        maxAttempts: config?.maxAttempts ?? (0,_smithy_core_config__WEBPACK_IMPORTED_MODULE_11__.loadConfig)(_smithy_core_retry__WEBPACK_IMPORTED_MODULE_17__.NODE_MAX_ATTEMPT_CONFIG_OPTIONS, config),
        region: config?.region ?? (0,_smithy_core_config__WEBPACK_IMPORTED_MODULE_11__.loadConfig)(_smithy_core_config__WEBPACK_IMPORTED_MODULE_14__.NODE_REGION_CONFIG_OPTIONS, { ..._smithy_core_config__WEBPACK_IMPORTED_MODULE_14__.NODE_REGION_CONFIG_FILE_OPTIONS, ...loaderConfig }),
        requestHandler: _smithy_node_http_handler__WEBPACK_IMPORTED_MODULE_19__.NodeHttpHandler.create(config?.requestHandler ?? defaultConfigProvider),
        retryMode: config?.retryMode ??
            (0,_smithy_core_config__WEBPACK_IMPORTED_MODULE_11__.loadConfig)({
                ..._smithy_core_retry__WEBPACK_IMPORTED_MODULE_17__.NODE_RETRY_MODE_CONFIG_OPTIONS,
                default: async () => (await defaultConfigProvider()).retryMode || _smithy_core_retry__WEBPACK_IMPORTED_MODULE_16__.DEFAULT_RETRY_MODE,
            }, config),
        sigv4aSigningRegionSet: config?.sigv4aSigningRegionSet ?? (0,_smithy_core_config__WEBPACK_IMPORTED_MODULE_11__.loadConfig)(_aws_sdk_core_httpAuthSchemes__WEBPACK_IMPORTED_MODULE_7__.NODE_SIGV4A_CONFIG_OPTIONS, loaderConfig),
        streamCollector: config?.streamCollector ?? _smithy_node_http_handler__WEBPACK_IMPORTED_MODULE_20__.streamCollector,
        useDualstackEndpoint: config?.useDualstackEndpoint ?? (0,_smithy_core_config__WEBPACK_IMPORTED_MODULE_11__.loadConfig)(_smithy_core_config__WEBPACK_IMPORTED_MODULE_12__.NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS, loaderConfig),
        useFipsEndpoint: config?.useFipsEndpoint ?? (0,_smithy_core_config__WEBPACK_IMPORTED_MODULE_11__.loadConfig)(_smithy_core_config__WEBPACK_IMPORTED_MODULE_13__.NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS, loaderConfig),
        userAgentAppId: config?.userAgentAppId ?? (0,_smithy_core_config__WEBPACK_IMPORTED_MODULE_11__.loadConfig)(_aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_3__.NODE_APP_ID_CONFIG_OPTIONS, loaderConfig),
    };
};


/***/ },

/***/ 2688
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getRuntimeConfig: () => (/* binding */ getRuntimeConfig)
/* harmony export */ });
/* harmony import */ var _aws_sdk_core_httpAuthSchemes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2182);
/* harmony import */ var _aws_sdk_core_httpAuthSchemes__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2187);
/* harmony import */ var _aws_sdk_core_protocols__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2689);
/* harmony import */ var _aws_sdk_signature_v4_multi_region__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(2072);
/* harmony import */ var _smithy_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(2658);
/* harmony import */ var _smithy_core_checksum__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(2217);
/* harmony import */ var _smithy_core_client__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(1982);
/* harmony import */ var _smithy_core_protocols__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(1936);
/* harmony import */ var _smithy_core_serde__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(1984);
/* harmony import */ var _smithy_core_serde__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(1987);
/* harmony import */ var _smithy_core_serde__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(1988);
/* harmony import */ var _smithy_core_serde__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(1990);
/* harmony import */ var _auth_httpAuthSchemeProvider__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(2683);
/* harmony import */ var _endpoint_endpointResolver__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(2684);
/* harmony import */ var _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(2692);











const getRuntimeConfig = (config) => {
    return {
        apiVersion: "2011-06-15",
        base64Decoder: config?.base64Decoder ?? _smithy_core_serde__WEBPACK_IMPORTED_MODULE_8__.fromBase64,
        base64Encoder: config?.base64Encoder ?? _smithy_core_serde__WEBPACK_IMPORTED_MODULE_9__.toBase64,
        disableHostPrefix: config?.disableHostPrefix ?? false,
        endpointProvider: config?.endpointProvider ?? _endpoint_endpointResolver__WEBPACK_IMPORTED_MODULE_13__.defaultEndpointResolver,
        extensions: config?.extensions ?? [],
        httpAuthSchemeProvider: config?.httpAuthSchemeProvider ?? _auth_httpAuthSchemeProvider__WEBPACK_IMPORTED_MODULE_12__.defaultSTSHttpAuthSchemeProvider,
        httpAuthSchemes: config?.httpAuthSchemes ?? [
            {
                schemeId: "aws.auth#sigv4",
                identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4"),
                signer: new _aws_sdk_core_httpAuthSchemes__WEBPACK_IMPORTED_MODULE_0__.AwsSdkSigV4Signer(),
            },
            {
                schemeId: "aws.auth#sigv4a",
                identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4a"),
                signer: new _aws_sdk_core_httpAuthSchemes__WEBPACK_IMPORTED_MODULE_1__.AwsSdkSigV4ASigner(),
            },
            {
                schemeId: "smithy.api#noAuth",
                identityProvider: (ipc) => ipc.getIdentityProvider("smithy.api#noAuth") || (async () => ({})),
                signer: new _smithy_core__WEBPACK_IMPORTED_MODULE_4__.NoAuthSigner(),
            },
        ],
        logger: config?.logger ?? new _smithy_core_client__WEBPACK_IMPORTED_MODULE_6__.NoOpLogger(),
        protocol: config?.protocol ?? _aws_sdk_core_protocols__WEBPACK_IMPORTED_MODULE_2__.AwsQueryProtocol,
        protocolSettings: config?.protocolSettings ?? {
            defaultNamespace: "com.amazonaws.sts",
            errorTypeRegistries: _schemas_schemas_0__WEBPACK_IMPORTED_MODULE_14__.errorTypeRegistries,
            xmlNamespace: "https://sts.amazonaws.com/doc/2011-06-15/",
            version: "2011-06-15",
            serviceTarget: "AWSSecurityTokenServiceV20110615",
        },
        serviceId: config?.serviceId ?? "STS",
        sha256: config?.sha256 ?? _smithy_core_checksum__WEBPACK_IMPORTED_MODULE_5__.Sha256Node,
        signerConstructor: config?.signerConstructor ?? _aws_sdk_signature_v4_multi_region__WEBPACK_IMPORTED_MODULE_3__.SignatureV4MultiRegion,
        urlParser: config?.urlParser ?? _smithy_core_protocols__WEBPACK_IMPORTED_MODULE_7__.parseUrl,
        utf8Decoder: config?.utf8Decoder ?? _smithy_core_serde__WEBPACK_IMPORTED_MODULE_10__.fromUtf8,
        utf8Encoder: config?.utf8Encoder ?? _smithy_core_serde__WEBPACK_IMPORTED_MODULE_11__.toUtf8,
    };
};


/***/ },

/***/ 2695
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   resolveRuntimeExtensions: () => (/* binding */ resolveRuntimeExtensions)
/* harmony export */ });
/* harmony import */ var _aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2220);
/* harmony import */ var _smithy_core_client__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2221);
/* harmony import */ var _smithy_core_protocols__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2225);
/* harmony import */ var _auth_httpAuthExtensionConfiguration__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(2696);




const resolveRuntimeExtensions = (runtimeConfig, extensions) => {
    const extensionConfiguration = Object.assign((0,_aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_0__.getAwsRegionExtensionConfiguration)(runtimeConfig), (0,_smithy_core_client__WEBPACK_IMPORTED_MODULE_1__.getDefaultExtensionConfiguration)(runtimeConfig), (0,_smithy_core_protocols__WEBPACK_IMPORTED_MODULE_2__.getHttpHandlerExtensionConfiguration)(runtimeConfig), (0,_auth_httpAuthExtensionConfiguration__WEBPACK_IMPORTED_MODULE_3__.getHttpAuthExtensionConfiguration)(runtimeConfig));
    extensions.forEach((extension) => extension.configure(extensionConfiguration));
    return Object.assign(runtimeConfig, (0,_aws_sdk_core_client__WEBPACK_IMPORTED_MODULE_0__.resolveAwsRegionExtensionConfiguration)(extensionConfiguration), (0,_smithy_core_client__WEBPACK_IMPORTED_MODULE_1__.resolveDefaultRuntimeConfig)(extensionConfiguration), (0,_smithy_core_protocols__WEBPACK_IMPORTED_MODULE_2__.resolveHttpHandlerRuntimeConfig)(extensionConfiguration), (0,_auth_httpAuthExtensionConfiguration__WEBPACK_IMPORTED_MODULE_3__.resolveHttpAuthRuntimeConfig)(extensionConfiguration));
};


/***/ },

/***/ 2692
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AssumeRole$: () => (/* binding */ AssumeRole$),
/* harmony export */   AssumeRoleRequest$: () => (/* binding */ AssumeRoleRequest$),
/* harmony export */   AssumeRoleResponse$: () => (/* binding */ AssumeRoleResponse$),
/* harmony export */   AssumeRoleWithWebIdentity$: () => (/* binding */ AssumeRoleWithWebIdentity$),
/* harmony export */   AssumeRoleWithWebIdentityRequest$: () => (/* binding */ AssumeRoleWithWebIdentityRequest$),
/* harmony export */   AssumeRoleWithWebIdentityResponse$: () => (/* binding */ AssumeRoleWithWebIdentityResponse$),
/* harmony export */   AssumedRoleUser$: () => (/* binding */ AssumedRoleUser$),
/* harmony export */   Credentials$: () => (/* binding */ Credentials$),
/* harmony export */   ExpiredTokenException$: () => (/* binding */ ExpiredTokenException$),
/* harmony export */   IDPCommunicationErrorException$: () => (/* binding */ IDPCommunicationErrorException$),
/* harmony export */   IDPRejectedClaimException$: () => (/* binding */ IDPRejectedClaimException$),
/* harmony export */   InvalidIdentityTokenException$: () => (/* binding */ InvalidIdentityTokenException$),
/* harmony export */   MalformedPolicyDocumentException$: () => (/* binding */ MalformedPolicyDocumentException$),
/* harmony export */   PackedPolicyTooLargeException$: () => (/* binding */ PackedPolicyTooLargeException$),
/* harmony export */   PolicyDescriptorType$: () => (/* binding */ PolicyDescriptorType$),
/* harmony export */   ProvidedContext$: () => (/* binding */ ProvidedContext$),
/* harmony export */   RegionDisabledException$: () => (/* binding */ RegionDisabledException$),
/* harmony export */   STSServiceException$: () => (/* binding */ STSServiceException$),
/* harmony export */   Tag$: () => (/* binding */ Tag$),
/* harmony export */   errorTypeRegistries: () => (/* binding */ errorTypeRegistries)
/* harmony export */ });
/* harmony import */ var _smithy_core_schema__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2120);
/* harmony import */ var _models_errors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2693);
/* harmony import */ var _models_STSServiceException__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2694);
const _A = "Arn";
const _AKI = "AccessKeyId";
const _AR = "AssumeRole";
const _ARI = "AssumedRoleId";
const _ARR = "AssumeRoleRequest";
const _ARRs = "AssumeRoleResponse";
const _ARU = "AssumedRoleUser";
const _ARWWI = "AssumeRoleWithWebIdentity";
const _ARWWIR = "AssumeRoleWithWebIdentityRequest";
const _ARWWIRs = "AssumeRoleWithWebIdentityResponse";
const _Au = "Audience";
const _C = "Credentials";
const _CA = "ContextAssertion";
const _DS = "DurationSeconds";
const _E = "Expiration";
const _EI = "ExternalId";
const _ETE = "ExpiredTokenException";
const _IDPCEE = "IDPCommunicationErrorException";
const _IDPRCE = "IDPRejectedClaimException";
const _IITE = "InvalidIdentityTokenException";
const _K = "Key";
const _MPDE = "MalformedPolicyDocumentException";
const _P = "Policy";
const _PA = "PolicyArns";
const _PAr = "ProviderArn";
const _PC = "ProvidedContexts";
const _PCLT = "ProvidedContextsListType";
const _PCr = "ProvidedContext";
const _PDT = "PolicyDescriptorType";
const _PI = "ProviderId";
const _PPS = "PackedPolicySize";
const _PPTLE = "PackedPolicyTooLargeException";
const _Pr = "Provider";
const _RA = "RoleArn";
const _RDE = "RegionDisabledException";
const _RSN = "RoleSessionName";
const _SAK = "SecretAccessKey";
const _SFWIT = "SubjectFromWebIdentityToken";
const _SI = "SourceIdentity";
const _SN = "SerialNumber";
const _ST = "SessionToken";
const _T = "Tags";
const _TC = "TokenCode";
const _TTK = "TransitiveTagKeys";
const _Ta = "Tag";
const _V = "Value";
const _WIT = "WebIdentityToken";
const _a = "arn";
const _aKST = "accessKeySecretType";
const _aQE = "awsQueryError";
const _c = "client";
const _cTT = "clientTokenType";
const _e = "error";
const _hE = "httpError";
const _m = "message";
const _pDLT = "policyDescriptorListType";
const _s = "smithy.ts.sdk.synthetic.com.amazonaws.sts";
const _tLT = "tagListType";
const n0 = "com.amazonaws.sts";



const _s_registry = _smithy_core_schema__WEBPACK_IMPORTED_MODULE_0__.TypeRegistry.for(_s);
var STSServiceException$ = [-3, _s, "STSServiceException", 0, [], []];
_s_registry.registerError(STSServiceException$, _models_STSServiceException__WEBPACK_IMPORTED_MODULE_2__.STSServiceException);
const n0_registry = _smithy_core_schema__WEBPACK_IMPORTED_MODULE_0__.TypeRegistry.for(n0);
var ExpiredTokenException$ = [-3, n0, _ETE,
    { [_aQE]: [`ExpiredTokenException`, 400], [_e]: _c, [_hE]: 400 },
    [_m],
    [0]
];
n0_registry.registerError(ExpiredTokenException$, _models_errors__WEBPACK_IMPORTED_MODULE_1__.ExpiredTokenException);
var IDPCommunicationErrorException$ = [-3, n0, _IDPCEE,
    { [_aQE]: [`IDPCommunicationError`, 400], [_e]: _c, [_hE]: 400 },
    [_m],
    [0]
];
n0_registry.registerError(IDPCommunicationErrorException$, _models_errors__WEBPACK_IMPORTED_MODULE_1__.IDPCommunicationErrorException);
var IDPRejectedClaimException$ = [-3, n0, _IDPRCE,
    { [_aQE]: [`IDPRejectedClaim`, 403], [_e]: _c, [_hE]: 403 },
    [_m],
    [0]
];
n0_registry.registerError(IDPRejectedClaimException$, _models_errors__WEBPACK_IMPORTED_MODULE_1__.IDPRejectedClaimException);
var InvalidIdentityTokenException$ = [-3, n0, _IITE,
    { [_aQE]: [`InvalidIdentityToken`, 400], [_e]: _c, [_hE]: 400 },
    [_m],
    [0]
];
n0_registry.registerError(InvalidIdentityTokenException$, _models_errors__WEBPACK_IMPORTED_MODULE_1__.InvalidIdentityTokenException);
var MalformedPolicyDocumentException$ = [-3, n0, _MPDE,
    { [_aQE]: [`MalformedPolicyDocument`, 400], [_e]: _c, [_hE]: 400 },
    [_m],
    [0]
];
n0_registry.registerError(MalformedPolicyDocumentException$, _models_errors__WEBPACK_IMPORTED_MODULE_1__.MalformedPolicyDocumentException);
var PackedPolicyTooLargeException$ = [-3, n0, _PPTLE,
    { [_aQE]: [`PackedPolicyTooLarge`, 400], [_e]: _c, [_hE]: 400 },
    [_m],
    [0]
];
n0_registry.registerError(PackedPolicyTooLargeException$, _models_errors__WEBPACK_IMPORTED_MODULE_1__.PackedPolicyTooLargeException);
var RegionDisabledException$ = [-3, n0, _RDE,
    { [_aQE]: [`RegionDisabledException`, 403], [_e]: _c, [_hE]: 403 },
    [_m],
    [0]
];
n0_registry.registerError(RegionDisabledException$, _models_errors__WEBPACK_IMPORTED_MODULE_1__.RegionDisabledException);
const errorTypeRegistries = [
    _s_registry,
    n0_registry,
];
var accessKeySecretType = [0, n0, _aKST, 8, 0];
var clientTokenType = [0, n0, _cTT, 8, 0];
var AssumedRoleUser$ = [3, n0, _ARU,
    0,
    [_ARI, _A],
    [0, 0], 2
];
var AssumeRoleRequest$ = [3, n0, _ARR,
    0,
    [_RA, _RSN, _PA, _P, _DS, _T, _TTK, _EI, _SN, _TC, _SI, _PC],
    [0, 0, () => policyDescriptorListType, 0, 1, () => tagListType, 64 | 0, 0, 0, 0, 0, () => ProvidedContextsListType], 2
];
var AssumeRoleResponse$ = [3, n0, _ARRs,
    0,
    [_C, _ARU, _PPS, _SI],
    [[() => Credentials$, 0], () => AssumedRoleUser$, 1, 0]
];
var AssumeRoleWithWebIdentityRequest$ = [3, n0, _ARWWIR,
    0,
    [_RA, _RSN, _WIT, _PI, _PA, _P, _DS],
    [0, 0, [() => clientTokenType, 0], 0, () => policyDescriptorListType, 0, 1], 3
];
var AssumeRoleWithWebIdentityResponse$ = [3, n0, _ARWWIRs,
    0,
    [_C, _SFWIT, _ARU, _PPS, _Pr, _Au, _SI],
    [[() => Credentials$, 0], 0, () => AssumedRoleUser$, 1, 0, 0, 0]
];
var Credentials$ = [3, n0, _C,
    0,
    [_AKI, _SAK, _ST, _E],
    [0, [() => accessKeySecretType, 0], 0, 4], 4
];
var PolicyDescriptorType$ = [3, n0, _PDT,
    0,
    [_a],
    [0]
];
var ProvidedContext$ = [3, n0, _PCr,
    0,
    [_PAr, _CA],
    [0, 0]
];
var Tag$ = [3, n0, _Ta,
    0,
    [_K, _V],
    [0, 0], 2
];
var policyDescriptorListType = [1, n0, _pDLT,
    0, () => PolicyDescriptorType$
];
var ProvidedContextsListType = [1, n0, _PCLT,
    0, () => ProvidedContext$
];
var tagKeyListType = 64 | 0;
var tagListType = [1, n0, _tLT,
    0, () => Tag$
];
var AssumeRole$ = [9, n0, _AR,
    0, () => AssumeRoleRequest$, () => AssumeRoleResponse$
];
var AssumeRoleWithWebIdentity$ = [9, n0, _ARWWI,
    0, () => AssumeRoleWithWebIdentityRequest$, () => AssumeRoleWithWebIdentityResponse$
];


/***/ },

/***/ 2658
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NoAuthSigner: () => (/* binding */ NoAuthSigner)
/* harmony export */ });
class NoAuthSigner {
    async sign(httpRequest, identity, signingProperties) {
        return httpRequest;
    }
}


/***/ },

/***/ 2690
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RpcProtocol: () => (/* binding */ RpcProtocol)
/* harmony export */ });
/* harmony import */ var _smithy_core_schema__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2115);
/* harmony import */ var _smithy_core_transport__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1859);
/* harmony import */ var _HttpProtocol__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2191);
/* harmony import */ var _collect_stream_body__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(2194);




class RpcProtocol extends _HttpProtocol__WEBPACK_IMPORTED_MODULE_2__.HttpProtocol {
    async serializeRequest(operationSchema, _input, context) {
        const serializer = this.serializer;
        const query = {};
        const headers = {};
        const endpoint = await context.endpoint();
        const ns = _smithy_core_schema__WEBPACK_IMPORTED_MODULE_0__.NormalizedSchema.of(operationSchema?.input);
        const schema = ns.getSchema();
        let payload;
        const input = _input && typeof _input === "object" ? _input : {};
        const request = new _smithy_core_transport__WEBPACK_IMPORTED_MODULE_1__.HttpRequest({
            protocol: "",
            hostname: "",
            port: undefined,
            path: "/",
            fragment: undefined,
            query: query,
            headers: headers,
            body: undefined,
        });
        if (endpoint) {
            this.updateServiceEndpoint(request, endpoint);
            this.setHostPrefix(request, operationSchema, input);
        }
        if (input) {
            const eventStreamMember = ns.getEventStreamMember();
            if (eventStreamMember) {
                if (input[eventStreamMember]) {
                    const initialRequest = {};
                    for (const [memberName, memberSchema] of ns.structIterator()) {
                        if (memberName !== eventStreamMember && input[memberName]) {
                            serializer.write(memberSchema, input[memberName]);
                            initialRequest[memberName] = serializer.flush();
                        }
                    }
                    payload = await this.serializeEventStream({
                        eventStream: input[eventStreamMember],
                        requestSchema: ns,
                        initialRequest,
                    });
                }
            }
            else {
                serializer.write(schema, input);
                payload = serializer.flush();
            }
        }
        request.headers = Object.assign(request.headers, headers);
        request.query = query;
        request.body = payload;
        request.method = "POST";
        return request;
    }
    async deserializeResponse(operationSchema, context, response) {
        const deserializer = this.deserializer;
        const ns = _smithy_core_schema__WEBPACK_IMPORTED_MODULE_0__.NormalizedSchema.of(operationSchema.output);
        const dataObject = {};
        if (response.statusCode >= 300) {
            const bytes = await (0,_collect_stream_body__WEBPACK_IMPORTED_MODULE_3__.collectBody)(response.body, context);
            if (bytes.byteLength > 0) {
                Object.assign(dataObject, await deserializer.read(15, bytes));
            }
            await this.handleError(operationSchema, context, response, dataObject, this.deserializeMetadata(response));
            throw new Error("@smithy/core/protocols - RPC Protocol error handler failed to throw.");
        }
        for (const header in response.headers) {
            const value = response.headers[header];
            delete response.headers[header];
            response.headers[header.toLowerCase()] = value;
        }
        const eventStreamMember = ns.getEventStreamMember();
        if (eventStreamMember) {
            dataObject[eventStreamMember] = await this.deserializeEventStream({
                response,
                responseSchema: ns,
                initialResponseContainer: dataObject,
            });
        }
        else {
            const bytes = await (0,_collect_stream_body__WEBPACK_IMPORTED_MODULE_3__.collectBody)(response.body, context);
            if (bytes.byteLength > 0) {
                Object.assign(dataObject, await deserializer.read(ns, bytes));
            }
        }
        dataObject.$metadata = this.deserializeMetadata(response);
        return dataObject;
    }
}


/***/ },

/***/ 2649
(module) {

module.exports = /*#__PURE__*/JSON.parse('{"name":"@aws-sdk/nested-clients","version":"3.997.33","description":"Nested clients for AWS SDK packages.","homepage":"https://github.com/aws/aws-sdk-js-v3/tree/main/packages/nested-clients","license":"Apache-2.0","author":{"name":"AWS SDK for JavaScript Team","url":"https://aws.amazon.com/sdk-for-javascript/"},"repository":{"type":"git","url":"https://github.com/aws/aws-sdk-js-v3.git","directory":"packages/nested-clients"},"files":["./cognito-identity.d.ts","./cognito-identity.js","./signin.d.ts","./signin.js","./sso-oidc.d.ts","./sso-oidc.js","./sso.d.ts","./sso.js","./sts.d.ts","./sts.js","dist-*/**"],"sideEffects":false,"main":"./dist-cjs/index.js","module":"./dist-es/index.js","browser":{"./dist-es/submodules/cognito-identity/runtimeConfig":"./dist-es/submodules/cognito-identity/runtimeConfig.browser","./dist-es/submodules/signin/runtimeConfig":"./dist-es/submodules/signin/runtimeConfig.browser","./dist-es/submodules/sso-oidc/runtimeConfig":"./dist-es/submodules/sso-oidc/runtimeConfig.browser","./dist-es/submodules/sso/runtimeConfig":"./dist-es/submodules/sso/runtimeConfig.browser","./dist-es/submodules/sts/runtimeConfig":"./dist-es/submodules/sts/runtimeConfig.browser"},"types":"./dist-types/index.d.ts","typesVersions":{"<4.5":{"dist-types/*":["dist-types/ts3.4/*"],"*":["dist-types/ts3.4/submodules/*/index.d.ts"]}},"react-native":{},"exports":{"./package.json":"./package.json","./sso-oidc":{"types":"./dist-types/submodules/sso-oidc/index.d.ts","module":"./dist-es/submodules/sso-oidc/index.js","node":"./dist-cjs/submodules/sso-oidc/index.js","import":"./dist-es/submodules/sso-oidc/index.js","require":"./dist-cjs/submodules/sso-oidc/index.js"},"./sts":{"types":"./dist-types/submodules/sts/index.d.ts","module":"./dist-es/submodules/sts/index.js","node":"./dist-cjs/submodules/sts/index.js","import":"./dist-es/submodules/sts/index.js","require":"./dist-cjs/submodules/sts/index.js"},"./signin":{"types":"./dist-types/submodules/signin/index.d.ts","module":"./dist-es/submodules/signin/index.js","node":"./dist-cjs/submodules/signin/index.js","import":"./dist-es/submodules/signin/index.js","require":"./dist-cjs/submodules/signin/index.js"},"./cognito-identity":{"types":"./dist-types/submodules/cognito-identity/index.d.ts","module":"./dist-es/submodules/cognito-identity/index.js","node":"./dist-cjs/submodules/cognito-identity/index.js","import":"./dist-es/submodules/cognito-identity/index.js","require":"./dist-cjs/submodules/cognito-identity/index.js"},"./sso":{"types":"./dist-types/submodules/sso/index.d.ts","module":"./dist-es/submodules/sso/index.js","node":"./dist-cjs/submodules/sso/index.js","import":"./dist-es/submodules/sso/index.js","require":"./dist-cjs/submodules/sso/index.js"}},"scripts":{"build":"concurrently \'yarn:build:types\' \'yarn:build:es\' && yarn build:cjs","build:cjs":"node ../../scripts/compilation/inline","build:es":"premove dist-es && tsc -p tsconfig.es.json","build:include:deps":"yarn g:turbo run build -F=\\"$npm_package_name\\"","build:types":"premove dist-types && tsc -p tsconfig.types.json","build:types:downlevel":"downlevel-dts dist-types dist-types/ts3.4","clean":"premove dist-cjs dist-es dist-types","lint":"node ../../scripts/validation/submodules-linter.js","prebuild":"yarn lint","test":"yarn g:vitest run","test:watch":"yarn g:vitest watch"},"dependencies":{"@aws-sdk/core":"^3.975.3","@aws-sdk/signature-v4-multi-region":"^3.996.41","@aws-sdk/types":"^3.974.2","@smithy/core":"^3.29.4","@smithy/fetch-http-handler":"^5.6.6","@smithy/node-http-handler":"^4.9.6","@smithy/types":"^4.16.1","tslib":"^2.6.2"},"devDependencies":{"concurrently":"7.0.0","downlevel-dts":"0.10.1","premove":"4.0.0","typescript":"~5.8.3"},"engines":{"node":">=20.0.0"}}');

/***/ }

};
;
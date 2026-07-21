"use strict";
exports.id = 11;
exports.ids = [11];
exports.modules = {

/***/ 2651
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AwsRestJsonProtocol: () => (/* binding */ AwsRestJsonProtocol)
/* harmony export */ });
/* harmony import */ var _smithy_core_protocols__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2190);
/* harmony import */ var _smithy_core_protocols__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2196);
/* harmony import */ var _smithy_core_protocols__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2199);
/* harmony import */ var _smithy_core_schema__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(2115);
/* harmony import */ var _ProtocolLib__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(2201);
/* harmony import */ var _JsonCodec__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(2652);
/* harmony import */ var _parseJsonBody__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(2655);





class AwsRestJsonProtocol extends _smithy_core_protocols__WEBPACK_IMPORTED_MODULE_0__.HttpBindingProtocol {
    serializer;
    deserializer;
    codec;
    mixin = new _ProtocolLib__WEBPACK_IMPORTED_MODULE_4__.ProtocolLib();
    constructor({ defaultNamespace, errorTypeRegistries, }) {
        super({
            defaultNamespace,
            errorTypeRegistries,
        });
        const settings = {
            timestampFormat: {
                useTrait: true,
                default: 7,
            },
            httpBindings: true,
            jsonName: true,
        };
        this.codec = new _JsonCodec__WEBPACK_IMPORTED_MODULE_5__.JsonCodec(settings);
        this.serializer = new _smithy_core_protocols__WEBPACK_IMPORTED_MODULE_2__.HttpInterceptingShapeSerializer(this.codec.createSerializer(), settings);
        this.deserializer = new _smithy_core_protocols__WEBPACK_IMPORTED_MODULE_1__.HttpInterceptingShapeDeserializer(this.codec.createDeserializer(), settings);
    }
    getShapeId() {
        return "aws.protocols#restJson1";
    }
    getPayloadCodec() {
        return this.codec;
    }
    setSerdeContext(serdeContext) {
        this.codec.setSerdeContext(serdeContext);
        super.setSerdeContext(serdeContext);
    }
    async serializeRequest(operationSchema, input, context) {
        const request = await super.serializeRequest(operationSchema, input, context);
        const inputSchema = _smithy_core_schema__WEBPACK_IMPORTED_MODULE_3__.NormalizedSchema.of(operationSchema.input);
        if (!request.headers["content-type"]) {
            const contentType = this.mixin.resolveRestContentType(this.getDefaultContentType(), inputSchema);
            if (contentType) {
                request.headers["content-type"] = contentType;
            }
        }
        if (request.body == null && request.headers["content-type"] === this.getDefaultContentType()) {
            request.body = "{}";
        }
        return request;
    }
    async deserializeResponse(operationSchema, context, response) {
        const output = await super.deserializeResponse(operationSchema, context, response);
        const outputSchema = _smithy_core_schema__WEBPACK_IMPORTED_MODULE_3__.NormalizedSchema.of(operationSchema.output);
        for (const [name, member] of outputSchema.structIterator()) {
            if (member.getMemberTraits().httpPayload && !(name in output)) {
                output[name] = null;
            }
        }
        return output;
    }
    async handleError(operationSchema, context, response, dataObject, metadata) {
        const errorIdentifier = (0,_parseJsonBody__WEBPACK_IMPORTED_MODULE_6__.loadRestJsonErrorCode)(response, dataObject) ?? "Unknown";
        this.mixin.compose(this.compositeErrorRegistry, errorIdentifier, this.options.defaultNamespace);
        const { errorSchema, errorMetadata } = await this.mixin.getErrorSchemaOrThrowBaseException(errorIdentifier, this.options.defaultNamespace, response, dataObject, metadata);
        const ns = _smithy_core_schema__WEBPACK_IMPORTED_MODULE_3__.NormalizedSchema.of(errorSchema);
        const message = dataObject.message ?? dataObject.Message ?? "UnknownError";
        const ErrorCtor = this.compositeErrorRegistry.getErrorCtor(errorSchema) ?? Error;
        const exception = new ErrorCtor({});
        await this.deserializeHttpMessage(errorSchema, context, response, dataObject);
        const output = {};
        const errorDeserializer = this.codec.createDeserializer();
        for (const [name, member] of ns.structIterator()) {
            const target = member.getMergedTraits().jsonName ?? name;
            output[name] = errorDeserializer.readObject(member, dataObject[target]);
        }
        throw this.mixin.decorateServiceException(Object.assign(exception, errorMetadata, {
            $fault: ns.getMergedTraits().error,
            message,
        }, output), dataObject);
    }
    getDefaultContentType() {
        return "application/json";
    }
}


/***/ },

/***/ 2652
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   JsonCodec: () => (/* binding */ JsonCodec)
/* harmony export */ });
/* harmony import */ var _ConfigurableSerdeContext__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2207);
/* harmony import */ var _JsonShapeDeserializer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2653);
/* harmony import */ var _JsonShapeSerializer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2656);



class JsonCodec extends _ConfigurableSerdeContext__WEBPACK_IMPORTED_MODULE_0__.SerdeContextConfig {
    settings;
    constructor(settings) {
        super();
        this.settings = settings;
    }
    createSerializer() {
        const serializer = new _JsonShapeSerializer__WEBPACK_IMPORTED_MODULE_2__.JsonShapeSerializer(this.settings);
        serializer.setSerdeContext(this.serdeContext);
        return serializer;
    }
    createDeserializer() {
        const deserializer = new _JsonShapeDeserializer__WEBPACK_IMPORTED_MODULE_1__.JsonShapeDeserializer(this.settings);
        deserializer.setSerdeContext(this.serdeContext);
        return deserializer;
    }
}


/***/ },

/***/ 2653
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   JsonShapeDeserializer: () => (/* binding */ JsonShapeDeserializer)
/* harmony export */ });
/* harmony import */ var _smithy_core_protocols__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2198);
/* harmony import */ var _smithy_core_schema__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2115);
/* harmony import */ var _smithy_core_serde__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(1993);
/* harmony import */ var _smithy_core_serde__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(1995);
/* harmony import */ var _smithy_core_serde__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(2000);
/* harmony import */ var _smithy_core_serde__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(1984);
/* harmony import */ var _ConfigurableSerdeContext__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(2207);
/* harmony import */ var _UnionSerde__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(2209);
/* harmony import */ var _jsonReviver__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(2654);
/* harmony import */ var _parseJsonBody__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(2655);








class JsonShapeDeserializer extends _ConfigurableSerdeContext__WEBPACK_IMPORTED_MODULE_6__.SerdeContextConfig {
    settings;
    constructor(settings) {
        super();
        this.settings = settings;
    }
    async read(schema, data) {
        return this._read(schema, typeof data === "string" ? JSON.parse(data, _jsonReviver__WEBPACK_IMPORTED_MODULE_8__.jsonReviver) : await (0,_parseJsonBody__WEBPACK_IMPORTED_MODULE_9__.parseJsonBody)(data, this.serdeContext));
    }
    readObject(schema, data) {
        return this._read(schema, data);
    }
    _read(schema, value) {
        const isObject = value !== null && typeof value === "object";
        const ns = _smithy_core_schema__WEBPACK_IMPORTED_MODULE_1__.NormalizedSchema.of(schema);
        if (isObject) {
            if (ns.isStructSchema()) {
                const record = value;
                const union = ns.isUnionSchema();
                const out = {};
                let nameMap = void 0;
                const { jsonName } = this.settings;
                if (jsonName) {
                    nameMap = {};
                }
                let unionSerde;
                if (union) {
                    unionSerde = new _UnionSerde__WEBPACK_IMPORTED_MODULE_7__.UnionSerde(record, out);
                }
                for (const [memberName, memberSchema] of ns.structIterator()) {
                    let fromKey = memberName;
                    if (jsonName) {
                        fromKey = memberSchema.getMergedTraits().jsonName ?? fromKey;
                        nameMap[fromKey] = memberName;
                    }
                    if (union) {
                        unionSerde.mark(fromKey);
                    }
                    if (record[fromKey] != null) {
                        out[memberName] = this._read(memberSchema, record[fromKey]);
                    }
                }
                if (union) {
                    unionSerde.writeUnknown();
                }
                else if (typeof record.__type === "string") {
                    for (const k in record) {
                        const v = record[k];
                        const t = jsonName ? (nameMap[k] ?? k) : k;
                        if (!(t in out)) {
                            out[t] = v;
                        }
                    }
                }
                return out;
            }
            if (Array.isArray(value) && ns.isListSchema()) {
                const listMember = ns.getValueSchema();
                const out = [];
                for (const item of value) {
                    out.push(this._read(listMember, item));
                }
                return out;
            }
            if (ns.isMapSchema()) {
                const mapMember = ns.getValueSchema();
                const out = {};
                for (const _k in value) {
                    out[_k] = this._read(mapMember, value[_k]);
                }
                return out;
            }
        }
        if (ns.isBlobSchema() && typeof value === "string") {
            return (0,_smithy_core_serde__WEBPACK_IMPORTED_MODULE_5__.fromBase64)(value);
        }
        const mediaType = ns.getMergedTraits().mediaType;
        if (ns.isStringSchema() && typeof value === "string" && mediaType) {
            const isJson = mediaType === "application/json" || mediaType.endsWith("+json");
            if (isJson) {
                return _smithy_core_serde__WEBPACK_IMPORTED_MODULE_3__.LazyJsonString.from(value);
            }
            return value;
        }
        if (ns.isTimestampSchema() && value != null) {
            const format = (0,_smithy_core_protocols__WEBPACK_IMPORTED_MODULE_0__.determineTimestampFormat)(ns, this.settings);
            switch (format) {
                case 5:
                    return (0,_smithy_core_serde__WEBPACK_IMPORTED_MODULE_2__.parseRfc3339DateTimeWithOffset)(value);
                case 6:
                    return (0,_smithy_core_serde__WEBPACK_IMPORTED_MODULE_2__.parseRfc7231DateTime)(value);
                case 7:
                    return (0,_smithy_core_serde__WEBPACK_IMPORTED_MODULE_2__.parseEpochTimestamp)(value);
                default:
                    console.warn("Missing timestamp format, parsing value with Date constructor:", value);
                    return new Date(value);
            }
        }
        if (ns.isBigIntegerSchema() && (typeof value === "number" || typeof value === "string")) {
            return BigInt(value);
        }
        if (ns.isBigDecimalSchema() && value != undefined) {
            if (value instanceof _smithy_core_serde__WEBPACK_IMPORTED_MODULE_4__.NumericValue) {
                return value;
            }
            const untyped = value;
            if (untyped.type === "bigDecimal" && "string" in untyped) {
                return new _smithy_core_serde__WEBPACK_IMPORTED_MODULE_4__.NumericValue(untyped.string, untyped.type);
            }
            return new _smithy_core_serde__WEBPACK_IMPORTED_MODULE_4__.NumericValue(String(value), "bigDecimal");
        }
        if (ns.isNumericSchema() && typeof value === "string") {
            switch (value) {
                case "Infinity":
                    return Infinity;
                case "-Infinity":
                    return -Infinity;
                case "NaN":
                    return NaN;
            }
            return value;
        }
        if (ns.isDocumentSchema()) {
            if (isObject) {
                const out = Array.isArray(value) ? [] : {};
                for (const k in value) {
                    const v = value[k];
                    if (v instanceof _smithy_core_serde__WEBPACK_IMPORTED_MODULE_4__.NumericValue) {
                        out[k] = v;
                    }
                    else {
                        out[k] = this._read(ns, v);
                    }
                }
                return out;
            }
            else {
                return structuredClone(value);
            }
        }
        return value;
    }
}


/***/ },

/***/ 2656
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   JsonShapeSerializer: () => (/* binding */ JsonShapeSerializer)
/* harmony export */ });
/* harmony import */ var _smithy_core_protocols__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2198);
/* harmony import */ var _smithy_core_schema__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2115);
/* harmony import */ var _smithy_core_serde__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(1983);
/* harmony import */ var _smithy_core_serde__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(1987);
/* harmony import */ var _smithy_core_serde__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(1993);
/* harmony import */ var _smithy_core_serde__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(1995);
/* harmony import */ var _smithy_core_serde__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(2000);
/* harmony import */ var _ConfigurableSerdeContext__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(2207);
/* harmony import */ var _jsonReplacer__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(2657);





class JsonShapeSerializer extends _ConfigurableSerdeContext__WEBPACK_IMPORTED_MODULE_7__.SerdeContextConfig {
    settings;
    buffer;
    useReplacer = false;
    rootSchema;
    constructor(settings) {
        super();
        this.settings = settings;
    }
    write(schema, value) {
        this.rootSchema = _smithy_core_schema__WEBPACK_IMPORTED_MODULE_1__.NormalizedSchema.of(schema);
        this.buffer = this._write(this.rootSchema, value);
    }
    flush() {
        const { rootSchema, useReplacer } = this;
        this.rootSchema = undefined;
        this.useReplacer = false;
        if (rootSchema?.isStructSchema() || rootSchema?.isDocumentSchema()) {
            if (!useReplacer) {
                return JSON.stringify(this.buffer);
            }
            const replacer = new _jsonReplacer__WEBPACK_IMPORTED_MODULE_8__.JsonReplacer();
            return replacer.replaceInJson(JSON.stringify(this.buffer, replacer.createReplacer(), 0));
        }
        return this.buffer;
    }
    writeDiscriminatedDocument(schema, value) {
        this.write(schema, value);
        if (typeof this.buffer === "object") {
            this.buffer.__type = _smithy_core_schema__WEBPACK_IMPORTED_MODULE_1__.NormalizedSchema.of(schema).getName(true);
        }
    }
    _write(schema, value, container) {
        const isObject = value !== null && typeof value === "object";
        const ns = _smithy_core_schema__WEBPACK_IMPORTED_MODULE_1__.NormalizedSchema.of(schema);
        if (isObject) {
            if (ns.isStructSchema()) {
                const record = value;
                const out = {};
                const { jsonName } = this.settings;
                let nameMap = void 0;
                if (jsonName) {
                    nameMap = {};
                }
                let outCount = 0;
                for (const [memberName, memberSchema] of ns.structIterator()) {
                    const serializableValue = this._write(memberSchema, record[memberName], ns);
                    if (serializableValue !== undefined) {
                        let targetKey = memberName;
                        if (jsonName) {
                            targetKey = memberSchema.getMergedTraits().jsonName ?? memberName;
                            nameMap[memberName] = targetKey;
                        }
                        out[targetKey] = serializableValue;
                        outCount++;
                    }
                }
                if (ns.isUnionSchema() && outCount === 0) {
                    const { $unknown } = record;
                    if (Array.isArray($unknown)) {
                        const [k, v] = $unknown;
                        out[k] = this._write(15, v);
                    }
                }
                else if (typeof record.__type === "string") {
                    for (const k in record) {
                        const v = record[k];
                        const targetKey = jsonName ? (nameMap[k] ?? k) : k;
                        if (!(targetKey in out)) {
                            out[targetKey] = this._write(15, v);
                        }
                    }
                }
                return out;
            }
            if (Array.isArray(value) && ns.isListSchema()) {
                const listMember = ns.getValueSchema();
                const out = [];
                const sparse = !!ns.getMergedTraits().sparse;
                for (const item of value) {
                    if (sparse || item != null) {
                        out.push(this._write(listMember, item));
                    }
                }
                return out;
            }
            if (ns.isMapSchema()) {
                const mapMember = ns.getValueSchema();
                const out = {};
                const sparse = !!ns.getMergedTraits().sparse;
                for (const _k in value) {
                    const _v = value[_k];
                    if (sparse || _v != null) {
                        out[_k] = this._write(mapMember, _v);
                    }
                }
                return out;
            }
            if (value instanceof Uint8Array && (ns.isBlobSchema() || ns.isDocumentSchema())) {
                if (ns === this.rootSchema) {
                    return value;
                }
                return (this.serdeContext?.base64Encoder ?? _smithy_core_serde__WEBPACK_IMPORTED_MODULE_3__.toBase64)(value);
            }
            if (value instanceof Date && (ns.isTimestampSchema() || ns.isDocumentSchema())) {
                const format = (0,_smithy_core_protocols__WEBPACK_IMPORTED_MODULE_0__.determineTimestampFormat)(ns, this.settings);
                switch (format) {
                    case 5:
                        return value.toISOString().replace(".000Z", "Z");
                    case 6:
                        return (0,_smithy_core_serde__WEBPACK_IMPORTED_MODULE_4__.dateToUtcString)(value);
                    case 7:
                        return value.getTime() / 1000;
                    default:
                        console.warn("Missing timestamp format, using epoch seconds", value);
                        return value.getTime() / 1000;
                }
            }
            if (value instanceof _smithy_core_serde__WEBPACK_IMPORTED_MODULE_6__.NumericValue) {
                this.useReplacer = true;
            }
        }
        if (value === null && container?.isStructSchema()) {
            return void 0;
        }
        if (ns.isStringSchema()) {
            if (typeof value === "undefined" && ns.isIdempotencyToken()) {
                return (0,_smithy_core_serde__WEBPACK_IMPORTED_MODULE_2__.generateIdempotencyToken)();
            }
            const mediaType = ns.getMergedTraits().mediaType;
            if (value != null && mediaType) {
                const isJson = mediaType === "application/json" || mediaType.endsWith("+json");
                if (isJson) {
                    return _smithy_core_serde__WEBPACK_IMPORTED_MODULE_5__.LazyJsonString.from(value);
                }
            }
            return value;
        }
        if (typeof value === "number" && ns.isNumericSchema()) {
            if (Math.abs(value) === Infinity || isNaN(value)) {
                return String(value);
            }
            return value;
        }
        if (typeof value === "string" && ns.isBlobSchema()) {
            if (ns === this.rootSchema) {
                return value;
            }
            return (this.serdeContext?.base64Encoder ?? _smithy_core_serde__WEBPACK_IMPORTED_MODULE_3__.toBase64)(value);
        }
        if (typeof value === "bigint") {
            this.useReplacer = true;
        }
        if (ns.isDocumentSchema()) {
            if (isObject) {
                const out = Array.isArray(value) ? [] : {};
                for (const k in value) {
                    const v = value[k];
                    if (v instanceof _smithy_core_serde__WEBPACK_IMPORTED_MODULE_6__.NumericValue) {
                        this.useReplacer = true;
                        out[k] = v;
                    }
                    else {
                        out[k] = this._write(ns, v);
                    }
                }
                return out;
            }
            else {
                return structuredClone(value);
            }
        }
        return value;
    }
}


/***/ },

/***/ 2657
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   JsonReplacer: () => (/* binding */ JsonReplacer)
/* harmony export */ });
/* harmony import */ var _smithy_core_serde__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2000);

const NUMERIC_CONTROL_CHAR = String.fromCharCode(925);
class JsonReplacer {
    values = new Map();
    counter = 0;
    stage = 0;
    createReplacer() {
        if (this.stage === 1) {
            throw new Error("@aws-sdk/core/protocols - JsonReplacer already created.");
        }
        if (this.stage === 2) {
            throw new Error("@aws-sdk/core/protocols - JsonReplacer exhausted.");
        }
        this.stage = 1;
        return (key, value) => {
            if (value instanceof _smithy_core_serde__WEBPACK_IMPORTED_MODULE_0__.NumericValue) {
                const v = `${NUMERIC_CONTROL_CHAR + "nv" + this.counter++}_` + value.string;
                this.values.set(`"${v}"`, value.string);
                return v;
            }
            if (typeof value === "bigint") {
                const s = value.toString();
                const v = `${NUMERIC_CONTROL_CHAR + "b" + this.counter++}_` + s;
                this.values.set(`"${v}"`, s);
                return v;
            }
            return value;
        };
    }
    replaceInJson(json) {
        if (this.stage === 0) {
            throw new Error("@aws-sdk/core/protocols - JsonReplacer not created yet.");
        }
        if (this.stage === 2) {
            throw new Error("@aws-sdk/core/protocols - JsonReplacer exhausted.");
        }
        this.stage = 2;
        if (this.counter === 0) {
            return json;
        }
        for (const [key, value] of this.values) {
            json = json.replace(key, value);
        }
        return json;
    }
}


/***/ },

/***/ 2654
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   jsonReviver: () => (/* binding */ jsonReviver)
/* harmony export */ });
/* harmony import */ var _smithy_core_serde__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2000);

function jsonReviver(key, value, context) {
    if (context?.source) {
        const numericString = context.source;
        if (typeof value === "number") {
            if (value > Number.MAX_SAFE_INTEGER || value < Number.MIN_SAFE_INTEGER || numericString !== String(value)) {
                const isFractional = numericString.includes(".");
                if (isFractional) {
                    return new _smithy_core_serde__WEBPACK_IMPORTED_MODULE_0__.NumericValue(numericString, "bigDecimal");
                }
                else {
                    return BigInt(numericString);
                }
            }
        }
    }
    return value;
}


/***/ },

/***/ 2655
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   loadJsonRpcErrorCode: () => (/* binding */ loadJsonRpcErrorCode),
/* harmony export */   loadRestJsonErrorCode: () => (/* binding */ loadRestJsonErrorCode),
/* harmony export */   parseJsonBody: () => (/* binding */ parseJsonBody),
/* harmony export */   parseJsonErrorBody: () => (/* binding */ parseJsonErrorBody)
/* harmony export */ });
/* harmony import */ var _common__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2205);

const parseJsonBody = (streamBody, context) => (0,_common__WEBPACK_IMPORTED_MODULE_0__.collectBodyString)(streamBody, context).then((encoded) => {
    if (encoded.length) {
        try {
            return JSON.parse(encoded);
        }
        catch (e) {
            if (e?.name === "SyntaxError") {
                Object.defineProperty(e, "$responseBodyText", {
                    value: encoded,
                });
            }
            throw e;
        }
    }
    return {};
});
const parseJsonErrorBody = async (errorBody, context) => {
    const value = await parseJsonBody(errorBody, context);
    value.message = value.message ?? value.Message;
    return value;
};
const findKey = (object, key) => Object.keys(object).find((k) => k.toLowerCase() === key.toLowerCase());
const sanitizeErrorCode = (rawValue) => {
    let cleanValue = rawValue;
    if (typeof cleanValue === "number") {
        cleanValue = cleanValue.toString();
    }
    if (cleanValue.indexOf(",") >= 0) {
        cleanValue = cleanValue.split(",")[0];
    }
    if (cleanValue.indexOf(":") >= 0) {
        cleanValue = cleanValue.split(":")[0];
    }
    if (cleanValue.indexOf("#") >= 0) {
        cleanValue = cleanValue.split("#")[1];
    }
    return cleanValue;
};
const loadRestJsonErrorCode = (output, data) => {
    return loadErrorCode(output, data, ["header", "code", "type"]);
};
const loadJsonRpcErrorCode = (output, data, queryCompat = false) => {
    return loadErrorCode(output, data, queryCompat ? ["code", "header", "type"] : ["type", "code", "header"]);
};
const loadErrorCode = ({ headers }, data, order) => {
    while (order.length > 0) {
        const location = order.shift();
        switch (location) {
            case "header":
                const headerKey = findKey(headers ?? {}, "x-amzn-errortype");
                if (headerKey !== undefined) {
                    return sanitizeErrorCode(headers[headerKey]);
                }
                break;
            case "code":
                const codeKey = findKey(data ?? {}, "code");
                if (codeKey && data[codeKey] !== undefined) {
                    return sanitizeErrorCode(data[codeKey]);
                }
                break;
            case "type":
                if (data?.__type !== undefined) {
                    return sanitizeErrorCode(data.__type);
                }
                break;
        }
    }
};


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

/***/ 2649
(module) {

module.exports = /*#__PURE__*/JSON.parse('{"name":"@aws-sdk/nested-clients","version":"3.997.33","description":"Nested clients for AWS SDK packages.","homepage":"https://github.com/aws/aws-sdk-js-v3/tree/main/packages/nested-clients","license":"Apache-2.0","author":{"name":"AWS SDK for JavaScript Team","url":"https://aws.amazon.com/sdk-for-javascript/"},"repository":{"type":"git","url":"https://github.com/aws/aws-sdk-js-v3.git","directory":"packages/nested-clients"},"files":["./cognito-identity.d.ts","./cognito-identity.js","./signin.d.ts","./signin.js","./sso-oidc.d.ts","./sso-oidc.js","./sso.d.ts","./sso.js","./sts.d.ts","./sts.js","dist-*/**"],"sideEffects":false,"main":"./dist-cjs/index.js","module":"./dist-es/index.js","browser":{"./dist-es/submodules/cognito-identity/runtimeConfig":"./dist-es/submodules/cognito-identity/runtimeConfig.browser","./dist-es/submodules/signin/runtimeConfig":"./dist-es/submodules/signin/runtimeConfig.browser","./dist-es/submodules/sso-oidc/runtimeConfig":"./dist-es/submodules/sso-oidc/runtimeConfig.browser","./dist-es/submodules/sso/runtimeConfig":"./dist-es/submodules/sso/runtimeConfig.browser","./dist-es/submodules/sts/runtimeConfig":"./dist-es/submodules/sts/runtimeConfig.browser"},"types":"./dist-types/index.d.ts","typesVersions":{"<4.5":{"dist-types/*":["dist-types/ts3.4/*"],"*":["dist-types/ts3.4/submodules/*/index.d.ts"]}},"react-native":{},"exports":{"./package.json":"./package.json","./sso-oidc":{"types":"./dist-types/submodules/sso-oidc/index.d.ts","module":"./dist-es/submodules/sso-oidc/index.js","node":"./dist-cjs/submodules/sso-oidc/index.js","import":"./dist-es/submodules/sso-oidc/index.js","require":"./dist-cjs/submodules/sso-oidc/index.js"},"./sts":{"types":"./dist-types/submodules/sts/index.d.ts","module":"./dist-es/submodules/sts/index.js","node":"./dist-cjs/submodules/sts/index.js","import":"./dist-es/submodules/sts/index.js","require":"./dist-cjs/submodules/sts/index.js"},"./signin":{"types":"./dist-types/submodules/signin/index.d.ts","module":"./dist-es/submodules/signin/index.js","node":"./dist-cjs/submodules/signin/index.js","import":"./dist-es/submodules/signin/index.js","require":"./dist-cjs/submodules/signin/index.js"},"./cognito-identity":{"types":"./dist-types/submodules/cognito-identity/index.d.ts","module":"./dist-es/submodules/cognito-identity/index.js","node":"./dist-cjs/submodules/cognito-identity/index.js","import":"./dist-es/submodules/cognito-identity/index.js","require":"./dist-cjs/submodules/cognito-identity/index.js"},"./sso":{"types":"./dist-types/submodules/sso/index.d.ts","module":"./dist-es/submodules/sso/index.js","node":"./dist-cjs/submodules/sso/index.js","import":"./dist-es/submodules/sso/index.js","require":"./dist-cjs/submodules/sso/index.js"}},"scripts":{"build":"concurrently \'yarn:build:types\' \'yarn:build:es\' && yarn build:cjs","build:cjs":"node ../../scripts/compilation/inline","build:es":"premove dist-es && tsc -p tsconfig.es.json","build:include:deps":"yarn g:turbo run build -F=\\"$npm_package_name\\"","build:types":"premove dist-types && tsc -p tsconfig.types.json","build:types:downlevel":"downlevel-dts dist-types dist-types/ts3.4","clean":"premove dist-cjs dist-es dist-types","lint":"node ../../scripts/validation/submodules-linter.js","prebuild":"yarn lint","test":"yarn g:vitest run","test:watch":"yarn g:vitest watch"},"dependencies":{"@aws-sdk/core":"^3.975.3","@aws-sdk/signature-v4-multi-region":"^3.996.41","@aws-sdk/types":"^3.974.2","@smithy/core":"^3.29.4","@smithy/fetch-http-handler":"^5.6.6","@smithy/node-http-handler":"^4.9.6","@smithy/types":"^4.16.1","tslib":"^2.6.2"},"devDependencies":{"concurrently":"7.0.0","downlevel-dts":"0.10.1","premove":"4.0.0","typescript":"~5.8.3"},"engines":{"node":">=20.0.0"}}');

/***/ }

};
;
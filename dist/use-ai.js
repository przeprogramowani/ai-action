//#region rolldown:runtime
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function() {
	return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, { get: (a, b) => (typeof require !== "undefined" ? require : a)[b] }) : x)(function(x) {
	if (typeof require !== "undefined") return require.apply(this, arguments);
	throw Error("Calling `require` for \"" + x + "\" in an environment that doesn't expose the `require` function.");
});

//#endregion
//#region node_modules/@google/genai/dist/web/index.mjs
/**
* @license
* Copyright 2025 Google LLC
* SPDX-License-Identifier: Apache-2.0
*/
var BaseModule = class {};
function formatMap(templateString, valueMap) {
	const regex = /\{([^}]+)\}/g;
	return templateString.replace(regex, (match, key) => {
		if (Object.prototype.hasOwnProperty.call(valueMap, key)) {
			const value = valueMap[key];
			return value !== void 0 && value !== null ? String(value) : "";
		} else throw new Error(`Key '${key}' not found in valueMap.`);
	});
}
function setValueByPath(data, keys, value) {
	for (let i = 0; i < keys.length - 1; i++) {
		const key = keys[i];
		if (key.endsWith("[]")) {
			const keyName = key.slice(0, -2);
			if (!(keyName in data)) if (Array.isArray(value)) data[keyName] = Array.from({ length: value.length }, () => ({}));
			else throw new Error(`Value must be a list given an array path ${key}`);
			if (Array.isArray(data[keyName])) {
				const arrayData = data[keyName];
				if (Array.isArray(value)) for (let j = 0; j < arrayData.length; j++) {
					const entry = arrayData[j];
					setValueByPath(entry, keys.slice(i + 1), value[j]);
				}
				else for (const d of arrayData) setValueByPath(d, keys.slice(i + 1), value);
			}
			return;
		} else if (key.endsWith("[0]")) {
			const keyName = key.slice(0, -3);
			if (!(keyName in data)) data[keyName] = [{}];
			const arrayData = data[keyName];
			setValueByPath(arrayData[0], keys.slice(i + 1), value);
			return;
		}
		if (!data[key] || typeof data[key] !== "object") data[key] = {};
		data = data[key];
	}
	const keyToSet = keys[keys.length - 1];
	const existingData = data[keyToSet];
	if (existingData !== void 0) {
		if (!value || typeof value === "object" && Object.keys(value).length === 0) return;
		if (value === existingData) return;
		if (typeof existingData === "object" && typeof value === "object" && existingData !== null && value !== null) Object.assign(existingData, value);
		else throw new Error(`Cannot set value for an existing key. Key: ${keyToSet}`);
	} else data[keyToSet] = value;
}
function getValueByPath(data, keys) {
	try {
		if (keys.length === 1 && keys[0] === "_self") return data;
		for (let i = 0; i < keys.length; i++) {
			if (typeof data !== "object" || data === null) return void 0;
			const key = keys[i];
			if (key.endsWith("[]")) {
				const keyName = key.slice(0, -2);
				if (keyName in data) {
					const arrayData = data[keyName];
					if (!Array.isArray(arrayData)) return void 0;
					return arrayData.map((d) => getValueByPath(d, keys.slice(i + 1)));
				} else return void 0;
			} else data = data[key];
		}
		return data;
	} catch (error) {
		if (error instanceof TypeError) return void 0;
		throw error;
	}
}
/**
* @license
* Copyright 2025 Google LLC
* SPDX-License-Identifier: Apache-2.0
*/
function tModel(apiClient, model) {
	if (!model || typeof model !== "string") throw new Error("model is required and must be a string");
	if (apiClient.isVertexAI()) if (model.startsWith("publishers/") || model.startsWith("projects/") || model.startsWith("models/")) return model;
	else if (model.indexOf("/") >= 0) {
		const parts = model.split("/", 2);
		return `publishers/${parts[0]}/models/${parts[1]}`;
	} else return `publishers/google/models/${model}`;
	else if (model.startsWith("models/") || model.startsWith("tunedModels/")) return model;
	else return `models/${model}`;
}
function tCachesModel(apiClient, model) {
	const transformedModel = tModel(apiClient, model);
	if (!transformedModel) return "";
	if (transformedModel.startsWith("publishers/") && apiClient.isVertexAI()) return `projects/${apiClient.getProject()}/locations/${apiClient.getLocation()}/${transformedModel}`;
	else if (transformedModel.startsWith("models/") && apiClient.isVertexAI()) return `projects/${apiClient.getProject()}/locations/${apiClient.getLocation()}/publishers/google/${transformedModel}`;
	else return transformedModel;
}
function tPart(apiClient, origin) {
	if (origin === null || origin === void 0) throw new Error("PartUnion is required");
	if (typeof origin === "object") return origin;
	if (typeof origin === "string") return { text: origin };
	throw new Error(`Unsupported part type: ${typeof origin}`);
}
function tParts(apiClient, origin) {
	if (origin === null || origin === void 0 || Array.isArray(origin) && origin.length === 0) throw new Error("PartListUnion is required");
	if (Array.isArray(origin)) return origin.map((item) => tPart(apiClient, item));
	return [tPart(apiClient, origin)];
}
function _isContent(origin) {
	return origin !== null && origin !== void 0 && typeof origin === "object" && "parts" in origin && Array.isArray(origin.parts);
}
function _isFunctionCallPart(origin) {
	return origin !== null && origin !== void 0 && typeof origin === "object" && "functionCall" in origin;
}
function _isFunctionResponsePart(origin) {
	return origin !== null && origin !== void 0 && typeof origin === "object" && "functionResponse" in origin;
}
function tContent(apiClient, origin) {
	if (origin === null || origin === void 0) throw new Error("ContentUnion is required");
	if (_isContent(origin)) return origin;
	return {
		role: "user",
		parts: tParts(apiClient, origin)
	};
}
function tContentsForEmbed(apiClient, origin) {
	if (!origin) return [];
	if (apiClient.isVertexAI() && Array.isArray(origin)) return origin.flatMap((item) => {
		const content = tContent(apiClient, item);
		if (content.parts && content.parts.length > 0 && content.parts[0].text !== void 0) return [content.parts[0].text];
		return [];
	});
	else if (apiClient.isVertexAI()) {
		const content = tContent(apiClient, origin);
		if (content.parts && content.parts.length > 0 && content.parts[0].text !== void 0) return [content.parts[0].text];
		return [];
	}
	if (Array.isArray(origin)) return origin.map((item) => tContent(apiClient, item));
	return [tContent(apiClient, origin)];
}
function tContents(apiClient, origin) {
	if (origin === null || origin === void 0 || Array.isArray(origin) && origin.length === 0) throw new Error("contents are required");
	if (!Array.isArray(origin)) {
		if (_isFunctionCallPart(origin) || _isFunctionResponsePart(origin)) throw new Error("To specify functionCall or functionResponse parts, please wrap them in a Content object, specifying the role for them");
		return [tContent(apiClient, origin)];
	}
	const result = [];
	const accumulatedParts = [];
	const isContentArray = _isContent(origin[0]);
	for (const item of origin) {
		const isContent = _isContent(item);
		if (isContent != isContentArray) throw new Error("Mixing Content and Parts is not supported, please group the parts into a the appropriate Content objects and specify the roles for them");
		if (isContent) result.push(item);
		else if (_isFunctionCallPart(item) || _isFunctionResponsePart(item)) throw new Error("To specify functionCall or functionResponse parts, please wrap them, and any other parts, in Content objects as appropriate, specifying the role for them");
		else accumulatedParts.push(item);
	}
	if (!isContentArray) result.push({
		role: "user",
		parts: tParts(apiClient, accumulatedParts)
	});
	return result;
}
function processSchema(apiClient, schema) {
	if (!apiClient.isVertexAI()) {
		if ("default" in schema) throw new Error("Default value is not supported in the response schema for the Gemini API.");
	}
	if ("anyOf" in schema) {
		if (schema["anyOf"] !== void 0) for (const subSchema of schema["anyOf"]) processSchema(apiClient, subSchema);
	}
	if ("items" in schema) {
		if (schema["items"] !== void 0) processSchema(apiClient, schema["items"]);
	}
	if ("properties" in schema) {
		if (schema["properties"] !== void 0) for (const subSchema of Object.values(schema["properties"])) processSchema(apiClient, subSchema);
	}
}
function tSchema(apiClient, schema) {
	processSchema(apiClient, schema);
	return schema;
}
function tSpeechConfig(apiClient, speechConfig) {
	if (typeof speechConfig === "object" && "voiceConfig" in speechConfig) return speechConfig;
	else if (typeof speechConfig === "string") return { voiceConfig: { prebuiltVoiceConfig: { voiceName: speechConfig } } };
	else throw new Error(`Unsupported speechConfig type: ${typeof speechConfig}`);
}
function tTool(apiClient, tool) {
	return tool;
}
function tTools(apiClient, tool) {
	if (!Array.isArray(tool)) throw new Error("tool is required and must be an array of Tools");
	return tool;
}
/**
* Prepends resource name with project, location, resource_prefix if needed.
*
* @param client The API client.
* @param resourceName The resource name.
* @param resourcePrefix The resource prefix.
* @param splitsAfterPrefix The number of splits after the prefix.
* @returns The completed resource name.
*
* Examples:
*
* ```
* resource_name = '123'
* resource_prefix = 'cachedContents'
* splits_after_prefix = 1
* client.vertexai = True
* client.project = 'bar'
* client.location = 'us-west1'
* _resource_name(client, resource_name, resource_prefix, splits_after_prefix)
* returns: 'projects/bar/locations/us-west1/cachedContents/123'
* ```
*
* ```
* resource_name = 'projects/foo/locations/us-central1/cachedContents/123'
* resource_prefix = 'cachedContents'
* splits_after_prefix = 1
* client.vertexai = True
* client.project = 'bar'
* client.location = 'us-west1'
* _resource_name(client, resource_name, resource_prefix, splits_after_prefix)
* returns: 'projects/foo/locations/us-central1/cachedContents/123'
* ```
*
* ```
* resource_name = '123'
* resource_prefix = 'cachedContents'
* splits_after_prefix = 1
* client.vertexai = False
* _resource_name(client, resource_name, resource_prefix, splits_after_prefix)
* returns 'cachedContents/123'
* ```
*
* ```
* resource_name = 'some/wrong/cachedContents/resource/name/123'
* resource_prefix = 'cachedContents'
* splits_after_prefix = 1
* client.vertexai = False
* # client.vertexai = True
* _resource_name(client, resource_name, resource_prefix, splits_after_prefix)
* -> 'some/wrong/resource/name/123'
* ```
*/
function resourceName(client, resourceName$1, resourcePrefix, splitsAfterPrefix = 1) {
	const shouldAppendPrefix = !resourceName$1.startsWith(`${resourcePrefix}/`) && resourceName$1.split("/").length === splitsAfterPrefix;
	if (client.isVertexAI()) if (resourceName$1.startsWith("projects/")) return resourceName$1;
	else if (resourceName$1.startsWith("locations/")) return `projects/${client.getProject()}/${resourceName$1}`;
	else if (resourceName$1.startsWith(`${resourcePrefix}/`)) return `projects/${client.getProject()}/locations/${client.getLocation()}/${resourceName$1}`;
	else if (shouldAppendPrefix) return `projects/${client.getProject()}/locations/${client.getLocation()}/${resourcePrefix}/${resourceName$1}`;
	else return resourceName$1;
	if (shouldAppendPrefix) return `${resourcePrefix}/${resourceName$1}`;
	return resourceName$1;
}
function tCachedContentName(apiClient, name) {
	if (typeof name !== "string") throw new Error("name must be a string");
	return resourceName(apiClient, name, "cachedContents");
}
function tBytes(apiClient, fromImageBytes) {
	if (typeof fromImageBytes !== "string") throw new Error("fromImageBytes must be a string");
	return fromImageBytes;
}
function tFileName(apiClient, fromName) {
	if (typeof fromName !== "string") throw new Error("fromName must be a string");
	if (fromName.startsWith("files/")) return fromName.split("files/")[1];
	return fromName;
}
/**
* @license
* Copyright 2025 Google LLC
* SPDX-License-Identifier: Apache-2.0
*/
function partToMldev$2(apiClient, fromObject) {
	const toObject = {};
	if (getValueByPath(fromObject, ["videoMetadata"]) !== void 0) throw new Error("videoMetadata parameter is not supported in Gemini API.");
	const fromThought = getValueByPath(fromObject, ["thought"]);
	if (fromThought != null) setValueByPath(toObject, ["thought"], fromThought);
	const fromCodeExecutionResult = getValueByPath(fromObject, ["codeExecutionResult"]);
	if (fromCodeExecutionResult != null) setValueByPath(toObject, ["codeExecutionResult"], fromCodeExecutionResult);
	const fromExecutableCode = getValueByPath(fromObject, ["executableCode"]);
	if (fromExecutableCode != null) setValueByPath(toObject, ["executableCode"], fromExecutableCode);
	const fromFileData = getValueByPath(fromObject, ["fileData"]);
	if (fromFileData != null) setValueByPath(toObject, ["fileData"], fromFileData);
	const fromFunctionCall = getValueByPath(fromObject, ["functionCall"]);
	if (fromFunctionCall != null) setValueByPath(toObject, ["functionCall"], fromFunctionCall);
	const fromFunctionResponse = getValueByPath(fromObject, ["functionResponse"]);
	if (fromFunctionResponse != null) setValueByPath(toObject, ["functionResponse"], fromFunctionResponse);
	const fromInlineData = getValueByPath(fromObject, ["inlineData"]);
	if (fromInlineData != null) setValueByPath(toObject, ["inlineData"], fromInlineData);
	const fromText = getValueByPath(fromObject, ["text"]);
	if (fromText != null) setValueByPath(toObject, ["text"], fromText);
	return toObject;
}
function contentToMldev$2(apiClient, fromObject) {
	const toObject = {};
	const fromParts = getValueByPath(fromObject, ["parts"]);
	if (fromParts != null) if (Array.isArray(fromParts)) setValueByPath(toObject, ["parts"], fromParts.map((item) => {
		return partToMldev$2(apiClient, item);
	}));
	else setValueByPath(toObject, ["parts"], fromParts);
	const fromRole = getValueByPath(fromObject, ["role"]);
	if (fromRole != null) setValueByPath(toObject, ["role"], fromRole);
	return toObject;
}
function functionDeclarationToMldev$2(apiClient, fromObject) {
	const toObject = {};
	if (getValueByPath(fromObject, ["response"]) !== void 0) throw new Error("response parameter is not supported in Gemini API.");
	const fromDescription = getValueByPath(fromObject, ["description"]);
	if (fromDescription != null) setValueByPath(toObject, ["description"], fromDescription);
	const fromName = getValueByPath(fromObject, ["name"]);
	if (fromName != null) setValueByPath(toObject, ["name"], fromName);
	const fromParameters = getValueByPath(fromObject, ["parameters"]);
	if (fromParameters != null) setValueByPath(toObject, ["parameters"], fromParameters);
	return toObject;
}
function googleSearchToMldev$2() {
	const toObject = {};
	return toObject;
}
function dynamicRetrievalConfigToMldev$2(apiClient, fromObject) {
	const toObject = {};
	const fromMode = getValueByPath(fromObject, ["mode"]);
	if (fromMode != null) setValueByPath(toObject, ["mode"], fromMode);
	const fromDynamicThreshold = getValueByPath(fromObject, ["dynamicThreshold"]);
	if (fromDynamicThreshold != null) setValueByPath(toObject, ["dynamicThreshold"], fromDynamicThreshold);
	return toObject;
}
function googleSearchRetrievalToMldev$2(apiClient, fromObject) {
	const toObject = {};
	const fromDynamicRetrievalConfig = getValueByPath(fromObject, ["dynamicRetrievalConfig"]);
	if (fromDynamicRetrievalConfig != null) setValueByPath(toObject, ["dynamicRetrievalConfig"], dynamicRetrievalConfigToMldev$2(apiClient, fromDynamicRetrievalConfig));
	return toObject;
}
function toolToMldev$2(apiClient, fromObject) {
	const toObject = {};
	const fromFunctionDeclarations = getValueByPath(fromObject, ["functionDeclarations"]);
	if (fromFunctionDeclarations != null) if (Array.isArray(fromFunctionDeclarations)) setValueByPath(toObject, ["functionDeclarations"], fromFunctionDeclarations.map((item) => {
		return functionDeclarationToMldev$2(apiClient, item);
	}));
	else setValueByPath(toObject, ["functionDeclarations"], fromFunctionDeclarations);
	if (getValueByPath(fromObject, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
	const fromGoogleSearch = getValueByPath(fromObject, ["googleSearch"]);
	if (fromGoogleSearch != null) setValueByPath(toObject, ["googleSearch"], googleSearchToMldev$2());
	const fromGoogleSearchRetrieval = getValueByPath(fromObject, ["googleSearchRetrieval"]);
	if (fromGoogleSearchRetrieval != null) setValueByPath(toObject, ["googleSearchRetrieval"], googleSearchRetrievalToMldev$2(apiClient, fromGoogleSearchRetrieval));
	const fromCodeExecution = getValueByPath(fromObject, ["codeExecution"]);
	if (fromCodeExecution != null) setValueByPath(toObject, ["codeExecution"], fromCodeExecution);
	return toObject;
}
function functionCallingConfigToMldev$1(apiClient, fromObject) {
	const toObject = {};
	const fromMode = getValueByPath(fromObject, ["mode"]);
	if (fromMode != null) setValueByPath(toObject, ["mode"], fromMode);
	const fromAllowedFunctionNames = getValueByPath(fromObject, ["allowedFunctionNames"]);
	if (fromAllowedFunctionNames != null) setValueByPath(toObject, ["allowedFunctionNames"], fromAllowedFunctionNames);
	return toObject;
}
function toolConfigToMldev$1(apiClient, fromObject) {
	const toObject = {};
	const fromFunctionCallingConfig = getValueByPath(fromObject, ["functionCallingConfig"]);
	if (fromFunctionCallingConfig != null) setValueByPath(toObject, ["functionCallingConfig"], functionCallingConfigToMldev$1(apiClient, fromFunctionCallingConfig));
	return toObject;
}
function createCachedContentConfigToMldev(apiClient, fromObject, parentObject) {
	const toObject = {};
	const fromTtl = getValueByPath(fromObject, ["ttl"]);
	if (parentObject !== void 0 && fromTtl != null) setValueByPath(parentObject, ["ttl"], fromTtl);
	const fromExpireTime = getValueByPath(fromObject, ["expireTime"]);
	if (parentObject !== void 0 && fromExpireTime != null) setValueByPath(parentObject, ["expireTime"], fromExpireTime);
	const fromDisplayName = getValueByPath(fromObject, ["displayName"]);
	if (parentObject !== void 0 && fromDisplayName != null) setValueByPath(parentObject, ["displayName"], fromDisplayName);
	const fromContents = getValueByPath(fromObject, ["contents"]);
	if (parentObject !== void 0 && fromContents != null) if (Array.isArray(fromContents)) setValueByPath(parentObject, ["contents"], tContents(apiClient, tContents(apiClient, fromContents).map((item) => {
		return contentToMldev$2(apiClient, item);
	})));
	else setValueByPath(parentObject, ["contents"], tContents(apiClient, fromContents));
	const fromSystemInstruction = getValueByPath(fromObject, ["systemInstruction"]);
	if (parentObject !== void 0 && fromSystemInstruction != null) setValueByPath(parentObject, ["systemInstruction"], contentToMldev$2(apiClient, tContent(apiClient, fromSystemInstruction)));
	const fromTools = getValueByPath(fromObject, ["tools"]);
	if (parentObject !== void 0 && fromTools != null) if (Array.isArray(fromTools)) setValueByPath(parentObject, ["tools"], fromTools.map((item) => {
		return toolToMldev$2(apiClient, item);
	}));
	else setValueByPath(parentObject, ["tools"], fromTools);
	const fromToolConfig = getValueByPath(fromObject, ["toolConfig"]);
	if (parentObject !== void 0 && fromToolConfig != null) setValueByPath(parentObject, ["toolConfig"], toolConfigToMldev$1(apiClient, fromToolConfig));
	return toObject;
}
function createCachedContentParametersToMldev(apiClient, fromObject) {
	const toObject = {};
	const fromModel = getValueByPath(fromObject, ["model"]);
	if (fromModel != null) setValueByPath(toObject, ["model"], tCachesModel(apiClient, fromModel));
	const fromConfig = getValueByPath(fromObject, ["config"]);
	if (fromConfig != null) setValueByPath(toObject, ["config"], createCachedContentConfigToMldev(apiClient, fromConfig, toObject));
	return toObject;
}
function getCachedContentParametersToMldev(apiClient, fromObject) {
	const toObject = {};
	const fromName = getValueByPath(fromObject, ["name"]);
	if (fromName != null) setValueByPath(toObject, ["_url", "name"], tCachedContentName(apiClient, fromName));
	const fromConfig = getValueByPath(fromObject, ["config"]);
	if (fromConfig != null) setValueByPath(toObject, ["config"], fromConfig);
	return toObject;
}
function deleteCachedContentParametersToMldev(apiClient, fromObject) {
	const toObject = {};
	const fromName = getValueByPath(fromObject, ["name"]);
	if (fromName != null) setValueByPath(toObject, ["_url", "name"], tCachedContentName(apiClient, fromName));
	const fromConfig = getValueByPath(fromObject, ["config"]);
	if (fromConfig != null) setValueByPath(toObject, ["config"], fromConfig);
	return toObject;
}
function updateCachedContentConfigToMldev(apiClient, fromObject, parentObject) {
	const toObject = {};
	const fromTtl = getValueByPath(fromObject, ["ttl"]);
	if (parentObject !== void 0 && fromTtl != null) setValueByPath(parentObject, ["ttl"], fromTtl);
	const fromExpireTime = getValueByPath(fromObject, ["expireTime"]);
	if (parentObject !== void 0 && fromExpireTime != null) setValueByPath(parentObject, ["expireTime"], fromExpireTime);
	return toObject;
}
function updateCachedContentParametersToMldev(apiClient, fromObject) {
	const toObject = {};
	const fromName = getValueByPath(fromObject, ["name"]);
	if (fromName != null) setValueByPath(toObject, ["_url", "name"], tCachedContentName(apiClient, fromName));
	const fromConfig = getValueByPath(fromObject, ["config"]);
	if (fromConfig != null) setValueByPath(toObject, ["config"], updateCachedContentConfigToMldev(apiClient, fromConfig, toObject));
	return toObject;
}
function listCachedContentsConfigToMldev(apiClient, fromObject, parentObject) {
	const toObject = {};
	const fromPageSize = getValueByPath(fromObject, ["pageSize"]);
	if (parentObject !== void 0 && fromPageSize != null) setValueByPath(parentObject, ["_query", "pageSize"], fromPageSize);
	const fromPageToken = getValueByPath(fromObject, ["pageToken"]);
	if (parentObject !== void 0 && fromPageToken != null) setValueByPath(parentObject, ["_query", "pageToken"], fromPageToken);
	return toObject;
}
function listCachedContentsParametersToMldev(apiClient, fromObject) {
	const toObject = {};
	const fromConfig = getValueByPath(fromObject, ["config"]);
	if (fromConfig != null) setValueByPath(toObject, ["config"], listCachedContentsConfigToMldev(apiClient, fromConfig, toObject));
	return toObject;
}
function partToVertex$2(apiClient, fromObject) {
	const toObject = {};
	const fromVideoMetadata = getValueByPath(fromObject, ["videoMetadata"]);
	if (fromVideoMetadata != null) setValueByPath(toObject, ["videoMetadata"], fromVideoMetadata);
	const fromThought = getValueByPath(fromObject, ["thought"]);
	if (fromThought != null) setValueByPath(toObject, ["thought"], fromThought);
	const fromCodeExecutionResult = getValueByPath(fromObject, ["codeExecutionResult"]);
	if (fromCodeExecutionResult != null) setValueByPath(toObject, ["codeExecutionResult"], fromCodeExecutionResult);
	const fromExecutableCode = getValueByPath(fromObject, ["executableCode"]);
	if (fromExecutableCode != null) setValueByPath(toObject, ["executableCode"], fromExecutableCode);
	const fromFileData = getValueByPath(fromObject, ["fileData"]);
	if (fromFileData != null) setValueByPath(toObject, ["fileData"], fromFileData);
	const fromFunctionCall = getValueByPath(fromObject, ["functionCall"]);
	if (fromFunctionCall != null) setValueByPath(toObject, ["functionCall"], fromFunctionCall);
	const fromFunctionResponse = getValueByPath(fromObject, ["functionResponse"]);
	if (fromFunctionResponse != null) setValueByPath(toObject, ["functionResponse"], fromFunctionResponse);
	const fromInlineData = getValueByPath(fromObject, ["inlineData"]);
	if (fromInlineData != null) setValueByPath(toObject, ["inlineData"], fromInlineData);
	const fromText = getValueByPath(fromObject, ["text"]);
	if (fromText != null) setValueByPath(toObject, ["text"], fromText);
	return toObject;
}
function contentToVertex$2(apiClient, fromObject) {
	const toObject = {};
	const fromParts = getValueByPath(fromObject, ["parts"]);
	if (fromParts != null) if (Array.isArray(fromParts)) setValueByPath(toObject, ["parts"], fromParts.map((item) => {
		return partToVertex$2(apiClient, item);
	}));
	else setValueByPath(toObject, ["parts"], fromParts);
	const fromRole = getValueByPath(fromObject, ["role"]);
	if (fromRole != null) setValueByPath(toObject, ["role"], fromRole);
	return toObject;
}
function schemaToVertex$2(apiClient, fromObject) {
	const toObject = {};
	const fromExample = getValueByPath(fromObject, ["example"]);
	if (fromExample != null) setValueByPath(toObject, ["example"], fromExample);
	const fromPattern = getValueByPath(fromObject, ["pattern"]);
	if (fromPattern != null) setValueByPath(toObject, ["pattern"], fromPattern);
	const fromDefault = getValueByPath(fromObject, ["default"]);
	if (fromDefault != null) setValueByPath(toObject, ["default"], fromDefault);
	const fromMaxLength = getValueByPath(fromObject, ["maxLength"]);
	if (fromMaxLength != null) setValueByPath(toObject, ["maxLength"], fromMaxLength);
	const fromMinLength = getValueByPath(fromObject, ["minLength"]);
	if (fromMinLength != null) setValueByPath(toObject, ["minLength"], fromMinLength);
	const fromMinProperties = getValueByPath(fromObject, ["minProperties"]);
	if (fromMinProperties != null) setValueByPath(toObject, ["minProperties"], fromMinProperties);
	const fromMaxProperties = getValueByPath(fromObject, ["maxProperties"]);
	if (fromMaxProperties != null) setValueByPath(toObject, ["maxProperties"], fromMaxProperties);
	const fromAnyOf = getValueByPath(fromObject, ["anyOf"]);
	if (fromAnyOf != null) setValueByPath(toObject, ["anyOf"], fromAnyOf);
	const fromDescription = getValueByPath(fromObject, ["description"]);
	if (fromDescription != null) setValueByPath(toObject, ["description"], fromDescription);
	const fromEnum = getValueByPath(fromObject, ["enum"]);
	if (fromEnum != null) setValueByPath(toObject, ["enum"], fromEnum);
	const fromFormat = getValueByPath(fromObject, ["format"]);
	if (fromFormat != null) setValueByPath(toObject, ["format"], fromFormat);
	const fromItems = getValueByPath(fromObject, ["items"]);
	if (fromItems != null) setValueByPath(toObject, ["items"], fromItems);
	const fromMaxItems = getValueByPath(fromObject, ["maxItems"]);
	if (fromMaxItems != null) setValueByPath(toObject, ["maxItems"], fromMaxItems);
	const fromMaximum = getValueByPath(fromObject, ["maximum"]);
	if (fromMaximum != null) setValueByPath(toObject, ["maximum"], fromMaximum);
	const fromMinItems = getValueByPath(fromObject, ["minItems"]);
	if (fromMinItems != null) setValueByPath(toObject, ["minItems"], fromMinItems);
	const fromMinimum = getValueByPath(fromObject, ["minimum"]);
	if (fromMinimum != null) setValueByPath(toObject, ["minimum"], fromMinimum);
	const fromNullable = getValueByPath(fromObject, ["nullable"]);
	if (fromNullable != null) setValueByPath(toObject, ["nullable"], fromNullable);
	const fromProperties = getValueByPath(fromObject, ["properties"]);
	if (fromProperties != null) setValueByPath(toObject, ["properties"], fromProperties);
	const fromPropertyOrdering = getValueByPath(fromObject, ["propertyOrdering"]);
	if (fromPropertyOrdering != null) setValueByPath(toObject, ["propertyOrdering"], fromPropertyOrdering);
	const fromRequired = getValueByPath(fromObject, ["required"]);
	if (fromRequired != null) setValueByPath(toObject, ["required"], fromRequired);
	const fromTitle = getValueByPath(fromObject, ["title"]);
	if (fromTitle != null) setValueByPath(toObject, ["title"], fromTitle);
	const fromType = getValueByPath(fromObject, ["type"]);
	if (fromType != null) setValueByPath(toObject, ["type"], fromType);
	return toObject;
}
function functionDeclarationToVertex$2(apiClient, fromObject) {
	const toObject = {};
	const fromResponse = getValueByPath(fromObject, ["response"]);
	if (fromResponse != null) setValueByPath(toObject, ["response"], schemaToVertex$2(apiClient, fromResponse));
	const fromDescription = getValueByPath(fromObject, ["description"]);
	if (fromDescription != null) setValueByPath(toObject, ["description"], fromDescription);
	const fromName = getValueByPath(fromObject, ["name"]);
	if (fromName != null) setValueByPath(toObject, ["name"], fromName);
	const fromParameters = getValueByPath(fromObject, ["parameters"]);
	if (fromParameters != null) setValueByPath(toObject, ["parameters"], fromParameters);
	return toObject;
}
function googleSearchToVertex$2() {
	const toObject = {};
	return toObject;
}
function dynamicRetrievalConfigToVertex$2(apiClient, fromObject) {
	const toObject = {};
	const fromMode = getValueByPath(fromObject, ["mode"]);
	if (fromMode != null) setValueByPath(toObject, ["mode"], fromMode);
	const fromDynamicThreshold = getValueByPath(fromObject, ["dynamicThreshold"]);
	if (fromDynamicThreshold != null) setValueByPath(toObject, ["dynamicThreshold"], fromDynamicThreshold);
	return toObject;
}
function googleSearchRetrievalToVertex$2(apiClient, fromObject) {
	const toObject = {};
	const fromDynamicRetrievalConfig = getValueByPath(fromObject, ["dynamicRetrievalConfig"]);
	if (fromDynamicRetrievalConfig != null) setValueByPath(toObject, ["dynamicRetrievalConfig"], dynamicRetrievalConfigToVertex$2(apiClient, fromDynamicRetrievalConfig));
	return toObject;
}
function toolToVertex$2(apiClient, fromObject) {
	const toObject = {};
	const fromFunctionDeclarations = getValueByPath(fromObject, ["functionDeclarations"]);
	if (fromFunctionDeclarations != null) if (Array.isArray(fromFunctionDeclarations)) setValueByPath(toObject, ["functionDeclarations"], fromFunctionDeclarations.map((item) => {
		return functionDeclarationToVertex$2(apiClient, item);
	}));
	else setValueByPath(toObject, ["functionDeclarations"], fromFunctionDeclarations);
	const fromRetrieval = getValueByPath(fromObject, ["retrieval"]);
	if (fromRetrieval != null) setValueByPath(toObject, ["retrieval"], fromRetrieval);
	const fromGoogleSearch = getValueByPath(fromObject, ["googleSearch"]);
	if (fromGoogleSearch != null) setValueByPath(toObject, ["googleSearch"], googleSearchToVertex$2());
	const fromGoogleSearchRetrieval = getValueByPath(fromObject, ["googleSearchRetrieval"]);
	if (fromGoogleSearchRetrieval != null) setValueByPath(toObject, ["googleSearchRetrieval"], googleSearchRetrievalToVertex$2(apiClient, fromGoogleSearchRetrieval));
	const fromCodeExecution = getValueByPath(fromObject, ["codeExecution"]);
	if (fromCodeExecution != null) setValueByPath(toObject, ["codeExecution"], fromCodeExecution);
	return toObject;
}
function functionCallingConfigToVertex$1(apiClient, fromObject) {
	const toObject = {};
	const fromMode = getValueByPath(fromObject, ["mode"]);
	if (fromMode != null) setValueByPath(toObject, ["mode"], fromMode);
	const fromAllowedFunctionNames = getValueByPath(fromObject, ["allowedFunctionNames"]);
	if (fromAllowedFunctionNames != null) setValueByPath(toObject, ["allowedFunctionNames"], fromAllowedFunctionNames);
	return toObject;
}
function toolConfigToVertex$1(apiClient, fromObject) {
	const toObject = {};
	const fromFunctionCallingConfig = getValueByPath(fromObject, ["functionCallingConfig"]);
	if (fromFunctionCallingConfig != null) setValueByPath(toObject, ["functionCallingConfig"], functionCallingConfigToVertex$1(apiClient, fromFunctionCallingConfig));
	return toObject;
}
function createCachedContentConfigToVertex(apiClient, fromObject, parentObject) {
	const toObject = {};
	const fromTtl = getValueByPath(fromObject, ["ttl"]);
	if (parentObject !== void 0 && fromTtl != null) setValueByPath(parentObject, ["ttl"], fromTtl);
	const fromExpireTime = getValueByPath(fromObject, ["expireTime"]);
	if (parentObject !== void 0 && fromExpireTime != null) setValueByPath(parentObject, ["expireTime"], fromExpireTime);
	const fromDisplayName = getValueByPath(fromObject, ["displayName"]);
	if (parentObject !== void 0 && fromDisplayName != null) setValueByPath(parentObject, ["displayName"], fromDisplayName);
	const fromContents = getValueByPath(fromObject, ["contents"]);
	if (parentObject !== void 0 && fromContents != null) if (Array.isArray(fromContents)) setValueByPath(parentObject, ["contents"], tContents(apiClient, tContents(apiClient, fromContents).map((item) => {
		return contentToVertex$2(apiClient, item);
	})));
	else setValueByPath(parentObject, ["contents"], tContents(apiClient, fromContents));
	const fromSystemInstruction = getValueByPath(fromObject, ["systemInstruction"]);
	if (parentObject !== void 0 && fromSystemInstruction != null) setValueByPath(parentObject, ["systemInstruction"], contentToVertex$2(apiClient, tContent(apiClient, fromSystemInstruction)));
	const fromTools = getValueByPath(fromObject, ["tools"]);
	if (parentObject !== void 0 && fromTools != null) if (Array.isArray(fromTools)) setValueByPath(parentObject, ["tools"], fromTools.map((item) => {
		return toolToVertex$2(apiClient, item);
	}));
	else setValueByPath(parentObject, ["tools"], fromTools);
	const fromToolConfig = getValueByPath(fromObject, ["toolConfig"]);
	if (parentObject !== void 0 && fromToolConfig != null) setValueByPath(parentObject, ["toolConfig"], toolConfigToVertex$1(apiClient, fromToolConfig));
	return toObject;
}
function createCachedContentParametersToVertex(apiClient, fromObject) {
	const toObject = {};
	const fromModel = getValueByPath(fromObject, ["model"]);
	if (fromModel != null) setValueByPath(toObject, ["model"], tCachesModel(apiClient, fromModel));
	const fromConfig = getValueByPath(fromObject, ["config"]);
	if (fromConfig != null) setValueByPath(toObject, ["config"], createCachedContentConfigToVertex(apiClient, fromConfig, toObject));
	return toObject;
}
function getCachedContentParametersToVertex(apiClient, fromObject) {
	const toObject = {};
	const fromName = getValueByPath(fromObject, ["name"]);
	if (fromName != null) setValueByPath(toObject, ["_url", "name"], tCachedContentName(apiClient, fromName));
	const fromConfig = getValueByPath(fromObject, ["config"]);
	if (fromConfig != null) setValueByPath(toObject, ["config"], fromConfig);
	return toObject;
}
function deleteCachedContentParametersToVertex(apiClient, fromObject) {
	const toObject = {};
	const fromName = getValueByPath(fromObject, ["name"]);
	if (fromName != null) setValueByPath(toObject, ["_url", "name"], tCachedContentName(apiClient, fromName));
	const fromConfig = getValueByPath(fromObject, ["config"]);
	if (fromConfig != null) setValueByPath(toObject, ["config"], fromConfig);
	return toObject;
}
function updateCachedContentConfigToVertex(apiClient, fromObject, parentObject) {
	const toObject = {};
	const fromTtl = getValueByPath(fromObject, ["ttl"]);
	if (parentObject !== void 0 && fromTtl != null) setValueByPath(parentObject, ["ttl"], fromTtl);
	const fromExpireTime = getValueByPath(fromObject, ["expireTime"]);
	if (parentObject !== void 0 && fromExpireTime != null) setValueByPath(parentObject, ["expireTime"], fromExpireTime);
	return toObject;
}
function updateCachedContentParametersToVertex(apiClient, fromObject) {
	const toObject = {};
	const fromName = getValueByPath(fromObject, ["name"]);
	if (fromName != null) setValueByPath(toObject, ["_url", "name"], tCachedContentName(apiClient, fromName));
	const fromConfig = getValueByPath(fromObject, ["config"]);
	if (fromConfig != null) setValueByPath(toObject, ["config"], updateCachedContentConfigToVertex(apiClient, fromConfig, toObject));
	return toObject;
}
function listCachedContentsConfigToVertex(apiClient, fromObject, parentObject) {
	const toObject = {};
	const fromPageSize = getValueByPath(fromObject, ["pageSize"]);
	if (parentObject !== void 0 && fromPageSize != null) setValueByPath(parentObject, ["_query", "pageSize"], fromPageSize);
	const fromPageToken = getValueByPath(fromObject, ["pageToken"]);
	if (parentObject !== void 0 && fromPageToken != null) setValueByPath(parentObject, ["_query", "pageToken"], fromPageToken);
	return toObject;
}
function listCachedContentsParametersToVertex(apiClient, fromObject) {
	const toObject = {};
	const fromConfig = getValueByPath(fromObject, ["config"]);
	if (fromConfig != null) setValueByPath(toObject, ["config"], listCachedContentsConfigToVertex(apiClient, fromConfig, toObject));
	return toObject;
}
function cachedContentFromMldev(apiClient, fromObject) {
	const toObject = {};
	const fromName = getValueByPath(fromObject, ["name"]);
	if (fromName != null) setValueByPath(toObject, ["name"], fromName);
	const fromDisplayName = getValueByPath(fromObject, ["displayName"]);
	if (fromDisplayName != null) setValueByPath(toObject, ["displayName"], fromDisplayName);
	const fromModel = getValueByPath(fromObject, ["model"]);
	if (fromModel != null) setValueByPath(toObject, ["model"], fromModel);
	const fromCreateTime = getValueByPath(fromObject, ["createTime"]);
	if (fromCreateTime != null) setValueByPath(toObject, ["createTime"], fromCreateTime);
	const fromUpdateTime = getValueByPath(fromObject, ["updateTime"]);
	if (fromUpdateTime != null) setValueByPath(toObject, ["updateTime"], fromUpdateTime);
	const fromExpireTime = getValueByPath(fromObject, ["expireTime"]);
	if (fromExpireTime != null) setValueByPath(toObject, ["expireTime"], fromExpireTime);
	const fromUsageMetadata = getValueByPath(fromObject, ["usageMetadata"]);
	if (fromUsageMetadata != null) setValueByPath(toObject, ["usageMetadata"], fromUsageMetadata);
	return toObject;
}
function deleteCachedContentResponseFromMldev() {
	const toObject = {};
	return toObject;
}
function listCachedContentsResponseFromMldev(apiClient, fromObject) {
	const toObject = {};
	const fromNextPageToken = getValueByPath(fromObject, ["nextPageToken"]);
	if (fromNextPageToken != null) setValueByPath(toObject, ["nextPageToken"], fromNextPageToken);
	const fromCachedContents = getValueByPath(fromObject, ["cachedContents"]);
	if (fromCachedContents != null) if (Array.isArray(fromCachedContents)) setValueByPath(toObject, ["cachedContents"], fromCachedContents.map((item) => {
		return cachedContentFromMldev(apiClient, item);
	}));
	else setValueByPath(toObject, ["cachedContents"], fromCachedContents);
	return toObject;
}
function cachedContentFromVertex(apiClient, fromObject) {
	const toObject = {};
	const fromName = getValueByPath(fromObject, ["name"]);
	if (fromName != null) setValueByPath(toObject, ["name"], fromName);
	const fromDisplayName = getValueByPath(fromObject, ["displayName"]);
	if (fromDisplayName != null) setValueByPath(toObject, ["displayName"], fromDisplayName);
	const fromModel = getValueByPath(fromObject, ["model"]);
	if (fromModel != null) setValueByPath(toObject, ["model"], fromModel);
	const fromCreateTime = getValueByPath(fromObject, ["createTime"]);
	if (fromCreateTime != null) setValueByPath(toObject, ["createTime"], fromCreateTime);
	const fromUpdateTime = getValueByPath(fromObject, ["updateTime"]);
	if (fromUpdateTime != null) setValueByPath(toObject, ["updateTime"], fromUpdateTime);
	const fromExpireTime = getValueByPath(fromObject, ["expireTime"]);
	if (fromExpireTime != null) setValueByPath(toObject, ["expireTime"], fromExpireTime);
	const fromUsageMetadata = getValueByPath(fromObject, ["usageMetadata"]);
	if (fromUsageMetadata != null) setValueByPath(toObject, ["usageMetadata"], fromUsageMetadata);
	return toObject;
}
function deleteCachedContentResponseFromVertex() {
	const toObject = {};
	return toObject;
}
function listCachedContentsResponseFromVertex(apiClient, fromObject) {
	const toObject = {};
	const fromNextPageToken = getValueByPath(fromObject, ["nextPageToken"]);
	if (fromNextPageToken != null) setValueByPath(toObject, ["nextPageToken"], fromNextPageToken);
	const fromCachedContents = getValueByPath(fromObject, ["cachedContents"]);
	if (fromCachedContents != null) if (Array.isArray(fromCachedContents)) setValueByPath(toObject, ["cachedContents"], fromCachedContents.map((item) => {
		return cachedContentFromVertex(apiClient, item);
	}));
	else setValueByPath(toObject, ["cachedContents"], fromCachedContents);
	return toObject;
}
/**
* @license
* Copyright 2025 Google LLC
* SPDX-License-Identifier: Apache-2.0
*/
/**
* Pagers for the GenAI List APIs.
*/
var PagedItem;
(function(PagedItem$1) {
	PagedItem$1["PAGED_ITEM_BATCH_JOBS"] = "batchJobs";
	PagedItem$1["PAGED_ITEM_MODELS"] = "models";
	PagedItem$1["PAGED_ITEM_TUNING_JOBS"] = "tuningJobs";
	PagedItem$1["PAGED_ITEM_FILES"] = "files";
	PagedItem$1["PAGED_ITEM_CACHED_CONTENTS"] = "cachedContents";
})(PagedItem || (PagedItem = {}));
/**
* Pager class for iterating through paginated results.
*/
var Pager = class {
	constructor(name, request, response, params) {
		this.pageInternal = [];
		this.paramsInternal = {};
		this.requestInternal = request;
		this.init(name, response, params);
	}
	init(name, response, params) {
		var _a, _b;
		this.nameInternal = name;
		this.pageInternal = response[this.nameInternal] || [];
		this.idxInternal = 0;
		let requestParams = { config: {} };
		if (!params) requestParams = { config: {} };
		else if (typeof params === "object") requestParams = Object.assign({}, params);
		else requestParams = params;
		if (requestParams["config"]) requestParams["config"]["pageToken"] = response["nextPageToken"];
		this.paramsInternal = requestParams;
		this.pageInternalSize = (_b = (_a = requestParams["config"]) === null || _a === void 0 ? void 0 : _a["pageSize"]) !== null && _b !== void 0 ? _b : this.pageInternal.length;
	}
	initNextPage(response) {
		this.init(this.nameInternal, response, this.paramsInternal);
	}
	/**
	* Returns the current page, which is a list of items.
	*
	* @remarks
	* The first page is retrieved when the pager is created. The returned list of
	* items could be a subset of the entire list.
	*/
	get page() {
		return this.pageInternal;
	}
	/**
	* Returns the type of paged item (for example, ``batch_jobs``).
	*/
	get name() {
		return this.nameInternal;
	}
	/**
	* Returns the length of the page fetched each time by this pager.
	*
	* @remarks
	* The number of items in the page is less than or equal to the page length.
	*/
	get pageSize() {
		return this.pageInternalSize;
	}
	/**
	* Returns the parameters when making the API request for the next page.
	*
	* @remarks
	* Parameters contain a set of optional configs that can be
	* used to customize the API request. For example, the `pageToken` parameter
	* contains the token to request the next page.
	*/
	get params() {
		return this.paramsInternal;
	}
	/**
	* Returns the total number of items in the current page.
	*/
	get pageLength() {
		return this.pageInternal.length;
	}
	/**
	* Returns the item at the given index.
	*/
	getItem(index) {
		return this.pageInternal[index];
	}
	/**
	* Returns an async iterator that support iterating through all items
	* retrieved from the API.
	*
	* @remarks
	* The iterator will automatically fetch the next page if there are more items
	* to fetch from the API.
	*
	* @example
	*
	* ```ts
	* const pager = await ai.files.list({config: {pageSize: 10}});
	* for await (const file of pager) {
	*   console.log(file.name);
	* }
	* ```
	*/
	[Symbol.asyncIterator]() {
		return {
			next: async () => {
				if (this.idxInternal >= this.pageLength) if (this.hasNextPage()) await this.nextPage();
				else return {
					value: void 0,
					done: true
				};
				const item = this.getItem(this.idxInternal);
				this.idxInternal += 1;
				return {
					value: item,
					done: false
				};
			},
			return: async () => {
				return {
					value: void 0,
					done: true
				};
			}
		};
	}
	/**
	* Fetches the next page of items. This makes a new API request.
	*
	* @throws {Error} If there are no more pages to fetch.
	*
	* @example
	*
	* ```ts
	* const pager = await ai.files.list({config: {pageSize: 10}});
	* let page = pager.page;
	* while (true) {
	*   for (const file of page) {
	*     console.log(file.name);
	*   }
	*   if (!pager.hasNextPage()) {
	*     break;
	*   }
	*   page = await pager.nextPage();
	* }
	* ```
	*/
	async nextPage() {
		if (!this.hasNextPage()) throw new Error("No more pages to fetch.");
		const response = await this.requestInternal(this.params);
		this.initNextPage(response);
		return this.page;
	}
	/**
	* Returns true if there are more pages to fetch from the API.
	*/
	hasNextPage() {
		var _a;
		if (((_a = this.params["config"]) === null || _a === void 0 ? void 0 : _a["pageToken"]) !== void 0) return true;
		return false;
	}
};
/**
* @license
* Copyright 2025 Google LLC
* SPDX-License-Identifier: Apache-2.0
*/
/** Required. Outcome of the code execution. */
var Outcome;
(function(Outcome$1) {
	Outcome$1["OUTCOME_UNSPECIFIED"] = "OUTCOME_UNSPECIFIED";
	Outcome$1["OUTCOME_OK"] = "OUTCOME_OK";
	Outcome$1["OUTCOME_FAILED"] = "OUTCOME_FAILED";
	Outcome$1["OUTCOME_DEADLINE_EXCEEDED"] = "OUTCOME_DEADLINE_EXCEEDED";
})(Outcome || (Outcome = {}));
/** Required. Programming language of the `code`. */
var Language;
(function(Language$1) {
	Language$1["LANGUAGE_UNSPECIFIED"] = "LANGUAGE_UNSPECIFIED";
	Language$1["PYTHON"] = "PYTHON";
})(Language || (Language = {}));
/** Optional. The type of the data. */
var Type;
(function(Type$1) {
	Type$1["TYPE_UNSPECIFIED"] = "TYPE_UNSPECIFIED";
	Type$1["STRING"] = "STRING";
	Type$1["NUMBER"] = "NUMBER";
	Type$1["INTEGER"] = "INTEGER";
	Type$1["BOOLEAN"] = "BOOLEAN";
	Type$1["ARRAY"] = "ARRAY";
	Type$1["OBJECT"] = "OBJECT";
})(Type || (Type = {}));
/** Required. Harm category. */
var HarmCategory;
(function(HarmCategory$1) {
	HarmCategory$1["HARM_CATEGORY_UNSPECIFIED"] = "HARM_CATEGORY_UNSPECIFIED";
	HarmCategory$1["HARM_CATEGORY_HATE_SPEECH"] = "HARM_CATEGORY_HATE_SPEECH";
	HarmCategory$1["HARM_CATEGORY_DANGEROUS_CONTENT"] = "HARM_CATEGORY_DANGEROUS_CONTENT";
	HarmCategory$1["HARM_CATEGORY_HARASSMENT"] = "HARM_CATEGORY_HARASSMENT";
	HarmCategory$1["HARM_CATEGORY_SEXUALLY_EXPLICIT"] = "HARM_CATEGORY_SEXUALLY_EXPLICIT";
	HarmCategory$1["HARM_CATEGORY_CIVIC_INTEGRITY"] = "HARM_CATEGORY_CIVIC_INTEGRITY";
})(HarmCategory || (HarmCategory = {}));
/** Optional. Specify if the threshold is used for probability or severity score. If not specified, the threshold is used for probability score. */
var HarmBlockMethod;
(function(HarmBlockMethod$1) {
	HarmBlockMethod$1["HARM_BLOCK_METHOD_UNSPECIFIED"] = "HARM_BLOCK_METHOD_UNSPECIFIED";
	HarmBlockMethod$1["SEVERITY"] = "SEVERITY";
	HarmBlockMethod$1["PROBABILITY"] = "PROBABILITY";
})(HarmBlockMethod || (HarmBlockMethod = {}));
/** Required. The harm block threshold. */
var HarmBlockThreshold;
(function(HarmBlockThreshold$1) {
	HarmBlockThreshold$1["HARM_BLOCK_THRESHOLD_UNSPECIFIED"] = "HARM_BLOCK_THRESHOLD_UNSPECIFIED";
	HarmBlockThreshold$1["BLOCK_LOW_AND_ABOVE"] = "BLOCK_LOW_AND_ABOVE";
	HarmBlockThreshold$1["BLOCK_MEDIUM_AND_ABOVE"] = "BLOCK_MEDIUM_AND_ABOVE";
	HarmBlockThreshold$1["BLOCK_ONLY_HIGH"] = "BLOCK_ONLY_HIGH";
	HarmBlockThreshold$1["BLOCK_NONE"] = "BLOCK_NONE";
	HarmBlockThreshold$1["OFF"] = "OFF";
})(HarmBlockThreshold || (HarmBlockThreshold = {}));
/** The mode of the predictor to be used in dynamic retrieval. */
var Mode;
(function(Mode$1) {
	Mode$1["MODE_UNSPECIFIED"] = "MODE_UNSPECIFIED";
	Mode$1["MODE_DYNAMIC"] = "MODE_DYNAMIC";
})(Mode || (Mode = {}));
/** Output only. The reason why the model stopped generating tokens.

If empty, the model has not stopped generating the tokens.
*/
var FinishReason;
(function(FinishReason$1) {
	FinishReason$1["FINISH_REASON_UNSPECIFIED"] = "FINISH_REASON_UNSPECIFIED";
	FinishReason$1["STOP"] = "STOP";
	FinishReason$1["MAX_TOKENS"] = "MAX_TOKENS";
	FinishReason$1["SAFETY"] = "SAFETY";
	FinishReason$1["RECITATION"] = "RECITATION";
	FinishReason$1["OTHER"] = "OTHER";
	FinishReason$1["BLOCKLIST"] = "BLOCKLIST";
	FinishReason$1["PROHIBITED_CONTENT"] = "PROHIBITED_CONTENT";
	FinishReason$1["SPII"] = "SPII";
	FinishReason$1["MALFORMED_FUNCTION_CALL"] = "MALFORMED_FUNCTION_CALL";
	FinishReason$1["IMAGE_SAFETY"] = "IMAGE_SAFETY";
})(FinishReason || (FinishReason = {}));
/** Output only. Harm probability levels in the content. */
var HarmProbability;
(function(HarmProbability$1) {
	HarmProbability$1["HARM_PROBABILITY_UNSPECIFIED"] = "HARM_PROBABILITY_UNSPECIFIED";
	HarmProbability$1["NEGLIGIBLE"] = "NEGLIGIBLE";
	HarmProbability$1["LOW"] = "LOW";
	HarmProbability$1["MEDIUM"] = "MEDIUM";
	HarmProbability$1["HIGH"] = "HIGH";
})(HarmProbability || (HarmProbability = {}));
/** Output only. Harm severity levels in the content. */
var HarmSeverity;
(function(HarmSeverity$1) {
	HarmSeverity$1["HARM_SEVERITY_UNSPECIFIED"] = "HARM_SEVERITY_UNSPECIFIED";
	HarmSeverity$1["HARM_SEVERITY_NEGLIGIBLE"] = "HARM_SEVERITY_NEGLIGIBLE";
	HarmSeverity$1["HARM_SEVERITY_LOW"] = "HARM_SEVERITY_LOW";
	HarmSeverity$1["HARM_SEVERITY_MEDIUM"] = "HARM_SEVERITY_MEDIUM";
	HarmSeverity$1["HARM_SEVERITY_HIGH"] = "HARM_SEVERITY_HIGH";
})(HarmSeverity || (HarmSeverity = {}));
/** Output only. Blocked reason. */
var BlockedReason;
(function(BlockedReason$1) {
	BlockedReason$1["BLOCKED_REASON_UNSPECIFIED"] = "BLOCKED_REASON_UNSPECIFIED";
	BlockedReason$1["SAFETY"] = "SAFETY";
	BlockedReason$1["OTHER"] = "OTHER";
	BlockedReason$1["BLOCKLIST"] = "BLOCKLIST";
	BlockedReason$1["PROHIBITED_CONTENT"] = "PROHIBITED_CONTENT";
})(BlockedReason || (BlockedReason = {}));
/** Output only. Traffic type. This shows whether a request consumes Pay-As-You-Go or Provisioned Throughput quota. */
var TrafficType;
(function(TrafficType$1) {
	TrafficType$1["TRAFFIC_TYPE_UNSPECIFIED"] = "TRAFFIC_TYPE_UNSPECIFIED";
	TrafficType$1["ON_DEMAND"] = "ON_DEMAND";
	TrafficType$1["PROVISIONED_THROUGHPUT"] = "PROVISIONED_THROUGHPUT";
})(TrafficType || (TrafficType = {}));
/** Server content modalities. */
var Modality;
(function(Modality$1) {
	Modality$1["MODALITY_UNSPECIFIED"] = "MODALITY_UNSPECIFIED";
	Modality$1["TEXT"] = "TEXT";
	Modality$1["IMAGE"] = "IMAGE";
	Modality$1["AUDIO"] = "AUDIO";
})(Modality || (Modality = {}));
/** The media resolution to use. */
var MediaResolution;
(function(MediaResolution$1) {
	MediaResolution$1["MEDIA_RESOLUTION_UNSPECIFIED"] = "MEDIA_RESOLUTION_UNSPECIFIED";
	MediaResolution$1["MEDIA_RESOLUTION_LOW"] = "MEDIA_RESOLUTION_LOW";
	MediaResolution$1["MEDIA_RESOLUTION_MEDIUM"] = "MEDIA_RESOLUTION_MEDIUM";
	MediaResolution$1["MEDIA_RESOLUTION_HIGH"] = "MEDIA_RESOLUTION_HIGH";
})(MediaResolution || (MediaResolution = {}));
/** Options for feature selection preference. */
var FeatureSelectionPreference;
(function(FeatureSelectionPreference$1) {
	FeatureSelectionPreference$1["FEATURE_SELECTION_PREFERENCE_UNSPECIFIED"] = "FEATURE_SELECTION_PREFERENCE_UNSPECIFIED";
	FeatureSelectionPreference$1["PRIORITIZE_QUALITY"] = "PRIORITIZE_QUALITY";
	FeatureSelectionPreference$1["BALANCED"] = "BALANCED";
	FeatureSelectionPreference$1["PRIORITIZE_COST"] = "PRIORITIZE_COST";
})(FeatureSelectionPreference || (FeatureSelectionPreference = {}));
/** Config for the dynamic retrieval config mode. */
var DynamicRetrievalConfigMode;
(function(DynamicRetrievalConfigMode$1) {
	DynamicRetrievalConfigMode$1["MODE_UNSPECIFIED"] = "MODE_UNSPECIFIED";
	DynamicRetrievalConfigMode$1["MODE_DYNAMIC"] = "MODE_DYNAMIC";
})(DynamicRetrievalConfigMode || (DynamicRetrievalConfigMode = {}));
/** Config for the function calling config mode. */
var FunctionCallingConfigMode;
(function(FunctionCallingConfigMode$1) {
	FunctionCallingConfigMode$1["MODE_UNSPECIFIED"] = "MODE_UNSPECIFIED";
	FunctionCallingConfigMode$1["AUTO"] = "AUTO";
	FunctionCallingConfigMode$1["ANY"] = "ANY";
	FunctionCallingConfigMode$1["NONE"] = "NONE";
})(FunctionCallingConfigMode || (FunctionCallingConfigMode = {}));
/** Enum that controls the safety filter level for objectionable content. */
var SafetyFilterLevel;
(function(SafetyFilterLevel$1) {
	SafetyFilterLevel$1["BLOCK_LOW_AND_ABOVE"] = "BLOCK_LOW_AND_ABOVE";
	SafetyFilterLevel$1["BLOCK_MEDIUM_AND_ABOVE"] = "BLOCK_MEDIUM_AND_ABOVE";
	SafetyFilterLevel$1["BLOCK_ONLY_HIGH"] = "BLOCK_ONLY_HIGH";
	SafetyFilterLevel$1["BLOCK_NONE"] = "BLOCK_NONE";
})(SafetyFilterLevel || (SafetyFilterLevel = {}));
/** Enum that controls the generation of people. */
var PersonGeneration;
(function(PersonGeneration$1) {
	PersonGeneration$1["DONT_ALLOW"] = "DONT_ALLOW";
	PersonGeneration$1["ALLOW_ADULT"] = "ALLOW_ADULT";
	PersonGeneration$1["ALLOW_ALL"] = "ALLOW_ALL";
})(PersonGeneration || (PersonGeneration = {}));
/** Enum that specifies the language of the text in the prompt. */
var ImagePromptLanguage;
(function(ImagePromptLanguage$1) {
	ImagePromptLanguage$1["auto"] = "auto";
	ImagePromptLanguage$1["en"] = "en";
	ImagePromptLanguage$1["ja"] = "ja";
	ImagePromptLanguage$1["ko"] = "ko";
	ImagePromptLanguage$1["hi"] = "hi";
})(ImagePromptLanguage || (ImagePromptLanguage = {}));
/** State for the lifecycle of a File. */
var FileState;
(function(FileState$1) {
	FileState$1["STATE_UNSPECIFIED"] = "STATE_UNSPECIFIED";
	FileState$1["PROCESSING"] = "PROCESSING";
	FileState$1["ACTIVE"] = "ACTIVE";
	FileState$1["FAILED"] = "FAILED";
})(FileState || (FileState = {}));
/** Source of the File. */
var FileSource;
(function(FileSource$1) {
	FileSource$1["SOURCE_UNSPECIFIED"] = "SOURCE_UNSPECIFIED";
	FileSource$1["UPLOADED"] = "UPLOADED";
	FileSource$1["GENERATED"] = "GENERATED";
})(FileSource || (FileSource = {}));
/** Enum representing the mask mode of a mask reference image. */
var MaskReferenceMode;
(function(MaskReferenceMode$1) {
	MaskReferenceMode$1["MASK_MODE_DEFAULT"] = "MASK_MODE_DEFAULT";
	MaskReferenceMode$1["MASK_MODE_USER_PROVIDED"] = "MASK_MODE_USER_PROVIDED";
	MaskReferenceMode$1["MASK_MODE_BACKGROUND"] = "MASK_MODE_BACKGROUND";
	MaskReferenceMode$1["MASK_MODE_FOREGROUND"] = "MASK_MODE_FOREGROUND";
	MaskReferenceMode$1["MASK_MODE_SEMANTIC"] = "MASK_MODE_SEMANTIC";
})(MaskReferenceMode || (MaskReferenceMode = {}));
/** Enum representing the control type of a control reference image. */
var ControlReferenceType;
(function(ControlReferenceType$1) {
	ControlReferenceType$1["CONTROL_TYPE_DEFAULT"] = "CONTROL_TYPE_DEFAULT";
	ControlReferenceType$1["CONTROL_TYPE_CANNY"] = "CONTROL_TYPE_CANNY";
	ControlReferenceType$1["CONTROL_TYPE_SCRIBBLE"] = "CONTROL_TYPE_SCRIBBLE";
	ControlReferenceType$1["CONTROL_TYPE_FACE_MESH"] = "CONTROL_TYPE_FACE_MESH";
})(ControlReferenceType || (ControlReferenceType = {}));
/** Enum representing the subject type of a subject reference image. */
var SubjectReferenceType;
(function(SubjectReferenceType$1) {
	SubjectReferenceType$1["SUBJECT_TYPE_DEFAULT"] = "SUBJECT_TYPE_DEFAULT";
	SubjectReferenceType$1["SUBJECT_TYPE_PERSON"] = "SUBJECT_TYPE_PERSON";
	SubjectReferenceType$1["SUBJECT_TYPE_ANIMAL"] = "SUBJECT_TYPE_ANIMAL";
	SubjectReferenceType$1["SUBJECT_TYPE_PRODUCT"] = "SUBJECT_TYPE_PRODUCT";
})(SubjectReferenceType || (SubjectReferenceType = {}));
/** Server content modalities. */
var MediaModality;
(function(MediaModality$1) {
	MediaModality$1["MODALITY_UNSPECIFIED"] = "MODALITY_UNSPECIFIED";
	MediaModality$1["TEXT"] = "TEXT";
	MediaModality$1["IMAGE"] = "IMAGE";
	MediaModality$1["VIDEO"] = "VIDEO";
	MediaModality$1["AUDIO"] = "AUDIO";
	MediaModality$1["DOCUMENT"] = "DOCUMENT";
})(MediaModality || (MediaModality = {}));
/** Start of speech sensitivity. */
var StartSensitivity;
(function(StartSensitivity$1) {
	StartSensitivity$1["START_SENSITIVITY_UNSPECIFIED"] = "START_SENSITIVITY_UNSPECIFIED";
	StartSensitivity$1["START_SENSITIVITY_HIGH"] = "START_SENSITIVITY_HIGH";
	StartSensitivity$1["START_SENSITIVITY_LOW"] = "START_SENSITIVITY_LOW";
})(StartSensitivity || (StartSensitivity = {}));
/** End of speech sensitivity. */
var EndSensitivity;
(function(EndSensitivity$1) {
	EndSensitivity$1["END_SENSITIVITY_UNSPECIFIED"] = "END_SENSITIVITY_UNSPECIFIED";
	EndSensitivity$1["END_SENSITIVITY_HIGH"] = "END_SENSITIVITY_HIGH";
	EndSensitivity$1["END_SENSITIVITY_LOW"] = "END_SENSITIVITY_LOW";
})(EndSensitivity || (EndSensitivity = {}));
/** The different ways of handling user activity. */
var ActivityHandling;
(function(ActivityHandling$1) {
	ActivityHandling$1["ACTIVITY_HANDLING_UNSPECIFIED"] = "ACTIVITY_HANDLING_UNSPECIFIED";
	ActivityHandling$1["START_OF_ACTIVITY_INTERRUPTS"] = "START_OF_ACTIVITY_INTERRUPTS";
	ActivityHandling$1["NO_INTERRUPTION"] = "NO_INTERRUPTION";
})(ActivityHandling || (ActivityHandling = {}));
/** Options about which input is included in the user's turn. */
var TurnCoverage;
(function(TurnCoverage$1) {
	TurnCoverage$1["TURN_COVERAGE_UNSPECIFIED"] = "TURN_COVERAGE_UNSPECIFIED";
	TurnCoverage$1["TURN_INCLUDES_ONLY_ACTIVITY"] = "TURN_INCLUDES_ONLY_ACTIVITY";
	TurnCoverage$1["TURN_INCLUDES_ALL_INPUT"] = "TURN_INCLUDES_ALL_INPUT";
})(TurnCoverage || (TurnCoverage = {}));
/** Response message for PredictionService.GenerateContent. */
var GenerateContentResponse = class {
	/**
	* Returns the concatenation of all text parts from the first candidate in the response.
	*
	* @remarks
	* If there are multiple candidates in the response, the text from the first
	* one will be returned.
	* If there are non-text parts in the response, the concatenation of all text
	* parts will be returned, and a warning will be logged.
	* If there are thought parts in the response, the concatenation of all text
	* parts excluding the thought parts will be returned.
	*
	* @example
	* ```ts
	* const response = await ai.models.generateContent({
	*   model: 'gemini-2.0-flash',
	*   contents:
	*     'Why is the sky blue?',
	* });
	*
	* console.debug(response.text);
	* ```
	*/
	get text() {
		var _a, _b, _c, _d, _e, _f, _g, _h;
		if (((_d = (_c = (_b = (_a = this.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d.length) === 0) return void 0;
		if (this.candidates && this.candidates.length > 1) console.warn("there are multiple candidates in the response, returning text from the first one.");
		let text = "";
		let anyTextPartText = false;
		const nonTextParts = [];
		for (const part of (_h = (_g = (_f = (_e = this.candidates) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.content) === null || _g === void 0 ? void 0 : _g.parts) !== null && _h !== void 0 ? _h : []) {
			for (const [fieldName, fieldValue] of Object.entries(part)) if (fieldName !== "text" && fieldName !== "thought" && (fieldValue !== null || fieldValue !== void 0)) nonTextParts.push(fieldName);
			if (typeof part.text === "string") {
				if (typeof part.thought === "boolean" && part.thought) continue;
				anyTextPartText = true;
				text += part.text;
			}
		}
		if (nonTextParts.length > 0) console.warn(`there are non-text parts ${nonTextParts} in the response, returning concatenation of all text parts. Please refer to the non text parts for a full response from model.`);
		return anyTextPartText ? text : void 0;
	}
	/**
	* Returns the function calls from the first candidate in the response.
	*
	* @remarks
	* If there are multiple candidates in the response, the function calls from
	* the first one will be returned.
	* If there are no function calls in the response, undefined will be returned.
	*
	* @example
	* ```ts
	* const controlLightFunctionDeclaration: FunctionDeclaration = {
	*   name: 'controlLight',
	*   parameters: {
	*   type: Type.OBJECT,
	*   description: 'Set the brightness and color temperature of a room light.',
	*   properties: {
	*     brightness: {
	*       type: Type.NUMBER,
	*       description:
	*         'Light level from 0 to 100. Zero is off and 100 is full brightness.',
	*     },
	*     colorTemperature: {
	*       type: Type.STRING,
	*       description:
	*         'Color temperature of the light fixture which can be `daylight`, `cool` or `warm`.',
	*     },
	*   },
	*   required: ['brightness', 'colorTemperature'],
	*  };
	*  const response = await ai.models.generateContent({
	*     model: 'gemini-2.0-flash',
	*     contents: 'Dim the lights so the room feels cozy and warm.',
	*     config: {
	*       tools: [{functionDeclarations: [controlLightFunctionDeclaration]}],
	*       toolConfig: {
	*         functionCallingConfig: {
	*           mode: FunctionCallingConfigMode.ANY,
	*           allowedFunctionNames: ['controlLight'],
	*         },
	*       },
	*     },
	*   });
	*  console.debug(JSON.stringify(response.functionCalls));
	* ```
	*/
	get functionCalls() {
		var _a, _b, _c, _d, _e, _f, _g, _h;
		if (((_d = (_c = (_b = (_a = this.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d.length) === 0) return void 0;
		if (this.candidates && this.candidates.length > 1) console.warn("there are multiple candidates in the response, returning function calls from the first one.");
		const functionCalls = (_h = (_g = (_f = (_e = this.candidates) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.content) === null || _g === void 0 ? void 0 : _g.parts) === null || _h === void 0 ? void 0 : _h.filter((part) => part.functionCall).map((part) => part.functionCall).filter((functionCall) => functionCall !== void 0);
		if ((functionCalls === null || functionCalls === void 0 ? void 0 : functionCalls.length) === 0) return void 0;
		return functionCalls;
	}
	/**
	* Returns the first executable code from the first candidate in the response.
	*
	* @remarks
	* If there are multiple candidates in the response, the executable code from
	* the first one will be returned.
	* If there are no executable code in the response, undefined will be
	* returned.
	*
	* @example
	* ```ts
	* const response = await ai.models.generateContent({
	*   model: 'gemini-2.0-flash',
	*   contents:
	*     'What is the sum of the first 50 prime numbers? Generate and run code for the calculation, and make sure you get all 50.'
	*   config: {
	*     tools: [{codeExecution: {}}],
	*   },
	* });
	*
	* console.debug(response.executableCode);
	* ```
	*/
	get executableCode() {
		var _a, _b, _c, _d, _e, _f, _g, _h, _j;
		if (((_d = (_c = (_b = (_a = this.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d.length) === 0) return void 0;
		if (this.candidates && this.candidates.length > 1) console.warn("there are multiple candidates in the response, returning executable code from the first one.");
		const executableCode = (_h = (_g = (_f = (_e = this.candidates) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.content) === null || _g === void 0 ? void 0 : _g.parts) === null || _h === void 0 ? void 0 : _h.filter((part) => part.executableCode).map((part) => part.executableCode).filter((executableCode$1) => executableCode$1 !== void 0);
		if ((executableCode === null || executableCode === void 0 ? void 0 : executableCode.length) === 0) return void 0;
		return (_j = executableCode === null || executableCode === void 0 ? void 0 : executableCode[0]) === null || _j === void 0 ? void 0 : _j.code;
	}
	/**
	* Returns the first code execution result from the first candidate in the response.
	*
	* @remarks
	* If there are multiple candidates in the response, the code execution result from
	* the first one will be returned.
	* If there are no code execution result in the response, undefined will be returned.
	*
	* @example
	* ```ts
	* const response = await ai.models.generateContent({
	*   model: 'gemini-2.0-flash',
	*   contents:
	*     'What is the sum of the first 50 prime numbers? Generate and run code for the calculation, and make sure you get all 50.'
	*   config: {
	*     tools: [{codeExecution: {}}],
	*   },
	* });
	*
	* console.debug(response.codeExecutionResult);
	* ```
	*/
	get codeExecutionResult() {
		var _a, _b, _c, _d, _e, _f, _g, _h, _j;
		if (((_d = (_c = (_b = (_a = this.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d.length) === 0) return void 0;
		if (this.candidates && this.candidates.length > 1) console.warn("there are multiple candidates in the response, returning code execution result from the first one.");
		const codeExecutionResult = (_h = (_g = (_f = (_e = this.candidates) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.content) === null || _g === void 0 ? void 0 : _g.parts) === null || _h === void 0 ? void 0 : _h.filter((part) => part.codeExecutionResult).map((part) => part.codeExecutionResult).filter((codeExecutionResult$1) => codeExecutionResult$1 !== void 0);
		if ((codeExecutionResult === null || codeExecutionResult === void 0 ? void 0 : codeExecutionResult.length) === 0) return void 0;
		return (_j = codeExecutionResult === null || codeExecutionResult === void 0 ? void 0 : codeExecutionResult[0]) === null || _j === void 0 ? void 0 : _j.output;
	}
};
/** Response for the embed_content method. */
var EmbedContentResponse = class {};
/** The output images response. */
var GenerateImagesResponse = class {};
/** Response for counting tokens. */
var CountTokensResponse = class {};
/** Response for computing tokens. */
var ComputeTokensResponse = class {};
/** Empty response for caches.delete method. */
var DeleteCachedContentResponse = class {};
var ListCachedContentsResponse = class {};
/** Response for the list files method. */
var ListFilesResponse = class {};
/** A wrapper class for the http response. */
var HttpResponse = class {
	constructor(response) {
		const headers = {};
		for (const pair of response.headers.entries()) headers[pair[0]] = pair[1];
		this.headers = headers;
		this.responseInternal = response;
	}
	json() {
		return this.responseInternal.json();
	}
};
/** Response for the create file method. */
var CreateFileResponse = class {};
/** Response for the delete file method. */
var DeleteFileResponse = class {};
/**
* @license
* Copyright 2025 Google LLC
* SPDX-License-Identifier: Apache-2.0
*/
var Caches = class extends BaseModule {
	constructor(apiClient) {
		super();
		this.apiClient = apiClient;
		/**
		* Lists cached content configurations.
		*
		* @param params - The parameters for the list request.
		* @return The paginated results of the list of cached contents.
		*
		* @example
		* ```ts
		* const cachedContents = await ai.caches.list({config: {'pageSize': 2}});
		* for (const cachedContent of cachedContents) {
		*   console.log(cachedContent);
		* }
		* ```
		*/
		this.list = async (params = {}) => {
			return new Pager(PagedItem.PAGED_ITEM_CACHED_CONTENTS, (x) => this.listInternal(x), await this.listInternal(params), params);
		};
	}
	/**
	* Creates a cached contents resource.
	*
	* @remarks
	* Context caching is only supported for specific models. See [Gemini
	* Developer API reference](https://ai.google.dev/gemini-api/docs/caching?lang=node/context-cac)
	* and [Vertex AI reference](https://cloud.google.com/vertex-ai/generative-ai/docs/context-cache/context-cache-overview#supported_models)
	* for more information.
	*
	* @param params - The parameters for the create request.
	* @return The created cached content.
	*
	* @example
	* ```ts
	* const contents = ...; // Initialize the content to cache.
	* const response = await ai.caches.create({
	*   model: 'gemini-1.5-flash',
	*   config: {
	*    'contents': contents,
	*    'displayName': 'test cache',
	*    'systemInstruction': 'What is the sum of the two pdfs?',
	*    'ttl': '86400s',
	*  }
	* });
	* ```
	*/
	async create(params) {
		var _a, _b;
		let response;
		let path$1 = "";
		let queryParams = {};
		if (this.apiClient.isVertexAI()) {
			const body = createCachedContentParametersToVertex(this.apiClient, params);
			path$1 = formatMap("cachedContents", body["_url"]);
			queryParams = body["_query"];
			delete body["config"];
			delete body["_url"];
			delete body["_query"];
			response = this.apiClient.request({
				path: path$1,
				queryParams,
				body: JSON.stringify(body),
				httpMethod: "POST",
				httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions
			}).then((httpResponse) => {
				return httpResponse.json();
			});
			return response.then((apiResponse) => {
				const resp = cachedContentFromVertex(this.apiClient, apiResponse);
				return resp;
			});
		} else {
			const body = createCachedContentParametersToMldev(this.apiClient, params);
			path$1 = formatMap("cachedContents", body["_url"]);
			queryParams = body["_query"];
			delete body["config"];
			delete body["_url"];
			delete body["_query"];
			response = this.apiClient.request({
				path: path$1,
				queryParams,
				body: JSON.stringify(body),
				httpMethod: "POST",
				httpOptions: (_b = params.config) === null || _b === void 0 ? void 0 : _b.httpOptions
			}).then((httpResponse) => {
				return httpResponse.json();
			});
			return response.then((apiResponse) => {
				const resp = cachedContentFromMldev(this.apiClient, apiResponse);
				return resp;
			});
		}
	}
	/**
	* Gets cached content configurations.
	*
	* @param params - The parameters for the get request.
	* @return The cached content.
	*
	* @example
	* ```ts
	* await ai.caches.get({name: 'gemini-1.5-flash'});
	* ```
	*/
	async get(params) {
		var _a, _b;
		let response;
		let path$1 = "";
		let queryParams = {};
		if (this.apiClient.isVertexAI()) {
			const body = getCachedContentParametersToVertex(this.apiClient, params);
			path$1 = formatMap("{name}", body["_url"]);
			queryParams = body["_query"];
			delete body["config"];
			delete body["_url"];
			delete body["_query"];
			response = this.apiClient.request({
				path: path$1,
				queryParams,
				body: JSON.stringify(body),
				httpMethod: "GET",
				httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions
			}).then((httpResponse) => {
				return httpResponse.json();
			});
			return response.then((apiResponse) => {
				const resp = cachedContentFromVertex(this.apiClient, apiResponse);
				return resp;
			});
		} else {
			const body = getCachedContentParametersToMldev(this.apiClient, params);
			path$1 = formatMap("{name}", body["_url"]);
			queryParams = body["_query"];
			delete body["config"];
			delete body["_url"];
			delete body["_query"];
			response = this.apiClient.request({
				path: path$1,
				queryParams,
				body: JSON.stringify(body),
				httpMethod: "GET",
				httpOptions: (_b = params.config) === null || _b === void 0 ? void 0 : _b.httpOptions
			}).then((httpResponse) => {
				return httpResponse.json();
			});
			return response.then((apiResponse) => {
				const resp = cachedContentFromMldev(this.apiClient, apiResponse);
				return resp;
			});
		}
	}
	/**
	* Deletes cached content.
	*
	* @param params - The parameters for the delete request.
	* @return The empty response returned by the API.
	*
	* @example
	* ```ts
	* await ai.caches.delete({name: 'gemini-1.5-flash'});
	* ```
	*/
	async delete(params) {
		var _a, _b;
		let response;
		let path$1 = "";
		let queryParams = {};
		if (this.apiClient.isVertexAI()) {
			const body = deleteCachedContentParametersToVertex(this.apiClient, params);
			path$1 = formatMap("{name}", body["_url"]);
			queryParams = body["_query"];
			delete body["config"];
			delete body["_url"];
			delete body["_query"];
			response = this.apiClient.request({
				path: path$1,
				queryParams,
				body: JSON.stringify(body),
				httpMethod: "DELETE",
				httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions
			}).then((httpResponse) => {
				return httpResponse.json();
			});
			return response.then(() => {
				const resp = deleteCachedContentResponseFromVertex();
				const typedResp = new DeleteCachedContentResponse();
				Object.assign(typedResp, resp);
				return typedResp;
			});
		} else {
			const body = deleteCachedContentParametersToMldev(this.apiClient, params);
			path$1 = formatMap("{name}", body["_url"]);
			queryParams = body["_query"];
			delete body["config"];
			delete body["_url"];
			delete body["_query"];
			response = this.apiClient.request({
				path: path$1,
				queryParams,
				body: JSON.stringify(body),
				httpMethod: "DELETE",
				httpOptions: (_b = params.config) === null || _b === void 0 ? void 0 : _b.httpOptions
			}).then((httpResponse) => {
				return httpResponse.json();
			});
			return response.then(() => {
				const resp = deleteCachedContentResponseFromMldev();
				const typedResp = new DeleteCachedContentResponse();
				Object.assign(typedResp, resp);
				return typedResp;
			});
		}
	}
	/**
	* Updates cached content configurations.
	*
	* @param params - The parameters for the update request.
	* @return The updated cached content.
	*
	* @example
	* ```ts
	* const response = await ai.caches.update({
	*   name: 'gemini-1.5-flash',
	*   config: {'ttl': '7600s'}
	* });
	* ```
	*/
	async update(params) {
		var _a, _b;
		let response;
		let path$1 = "";
		let queryParams = {};
		if (this.apiClient.isVertexAI()) {
			const body = updateCachedContentParametersToVertex(this.apiClient, params);
			path$1 = formatMap("{name}", body["_url"]);
			queryParams = body["_query"];
			delete body["config"];
			delete body["_url"];
			delete body["_query"];
			response = this.apiClient.request({
				path: path$1,
				queryParams,
				body: JSON.stringify(body),
				httpMethod: "PATCH",
				httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions
			}).then((httpResponse) => {
				return httpResponse.json();
			});
			return response.then((apiResponse) => {
				const resp = cachedContentFromVertex(this.apiClient, apiResponse);
				return resp;
			});
		} else {
			const body = updateCachedContentParametersToMldev(this.apiClient, params);
			path$1 = formatMap("{name}", body["_url"]);
			queryParams = body["_query"];
			delete body["config"];
			delete body["_url"];
			delete body["_query"];
			response = this.apiClient.request({
				path: path$1,
				queryParams,
				body: JSON.stringify(body),
				httpMethod: "PATCH",
				httpOptions: (_b = params.config) === null || _b === void 0 ? void 0 : _b.httpOptions
			}).then((httpResponse) => {
				return httpResponse.json();
			});
			return response.then((apiResponse) => {
				const resp = cachedContentFromMldev(this.apiClient, apiResponse);
				return resp;
			});
		}
	}
	async listInternal(params) {
		var _a, _b;
		let response;
		let path$1 = "";
		let queryParams = {};
		if (this.apiClient.isVertexAI()) {
			const body = listCachedContentsParametersToVertex(this.apiClient, params);
			path$1 = formatMap("cachedContents", body["_url"]);
			queryParams = body["_query"];
			delete body["config"];
			delete body["_url"];
			delete body["_query"];
			response = this.apiClient.request({
				path: path$1,
				queryParams,
				body: JSON.stringify(body),
				httpMethod: "GET",
				httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions
			}).then((httpResponse) => {
				return httpResponse.json();
			});
			return response.then((apiResponse) => {
				const resp = listCachedContentsResponseFromVertex(this.apiClient, apiResponse);
				const typedResp = new ListCachedContentsResponse();
				Object.assign(typedResp, resp);
				return typedResp;
			});
		} else {
			const body = listCachedContentsParametersToMldev(this.apiClient, params);
			path$1 = formatMap("cachedContents", body["_url"]);
			queryParams = body["_query"];
			delete body["config"];
			delete body["_url"];
			delete body["_query"];
			response = this.apiClient.request({
				path: path$1,
				queryParams,
				body: JSON.stringify(body),
				httpMethod: "GET",
				httpOptions: (_b = params.config) === null || _b === void 0 ? void 0 : _b.httpOptions
			}).then((httpResponse) => {
				return httpResponse.json();
			});
			return response.then((apiResponse) => {
				const resp = listCachedContentsResponseFromMldev(this.apiClient, apiResponse);
				const typedResp = new ListCachedContentsResponse();
				Object.assign(typedResp, resp);
				return typedResp;
			});
		}
	}
};
/******************************************************************************

Copyright (c) Microsoft Corporation.



Permission to use, copy, modify, and/or distribute this software for any

purpose with or without fee is hereby granted.



THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH

REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY

AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,

INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM

LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR

OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR

PERFORMANCE OF THIS SOFTWARE.

***************************************************************************** */
function __values(o) {
	var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
	if (m) return m.call(o);
	if (o && typeof o.length === "number") return { next: function() {
		if (o && i >= o.length) o = void 0;
		return {
			value: o && o[i++],
			done: !o
		};
	} };
	throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function __await(v) {
	return this instanceof __await ? (this.v = v, this) : new __await(v);
}
function __asyncGenerator(thisArg, _arguments, generator) {
	if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
	var g = generator.apply(thisArg, _arguments || []), i, q = [];
	return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function() {
		return this;
	}, i;
	function awaitReturn(f) {
		return function(v) {
			return Promise.resolve(v).then(f, reject);
		};
	}
	function verb(n, f) {
		if (g[n]) {
			i[n] = function(v) {
				return new Promise(function(a, b) {
					q.push([
						n,
						v,
						a,
						b
					]) > 1 || resume(n, v);
				});
			};
			if (f) i[n] = f(i[n]);
		}
	}
	function resume(n, v) {
		try {
			step(g[n](v));
		} catch (e) {
			settle(q[0][3], e);
		}
	}
	function step(r) {
		r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
	}
	function fulfill(value) {
		resume("next", value);
	}
	function reject(value) {
		resume("throw", value);
	}
	function settle(f, v) {
		if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]);
	}
}
function __asyncValues(o) {
	if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
	var m = o[Symbol.asyncIterator], i;
	return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
		return this;
	}, i);
	function verb(n) {
		i[n] = o[n] && function(v) {
			return new Promise(function(resolve, reject) {
				v = o[n](v), settle(resolve, reject, v.done, v.value);
			});
		};
	}
	function settle(resolve, reject, d, v) {
		Promise.resolve(v).then(function(v$1) {
			resolve({
				value: v$1,
				done: d
			});
		}, reject);
	}
}
/**
* @license
* Copyright 2025 Google LLC
* SPDX-License-Identifier: Apache-2.0
*/
/**
* Returns true if the response is valid, false otherwise.
*/
function isValidResponse(response) {
	var _a;
	if (response.candidates == void 0 || response.candidates.length === 0) return false;
	const content = (_a = response.candidates[0]) === null || _a === void 0 ? void 0 : _a.content;
	if (content === void 0) return false;
	return isValidContent(content);
}
function isValidContent(content) {
	if (content.parts === void 0 || content.parts.length === 0) return false;
	for (const part of content.parts) {
		if (part === void 0 || Object.keys(part).length === 0) return false;
		if (part.text !== void 0 && part.text === "") return false;
	}
	return true;
}
/**
* Validates the history contains the correct roles.
*
* @remarks
* Expects the history to start with a user turn and then alternate between
* user and model turns.
*
* @throws Error if the history does not start with a user turn.
* @throws Error if the history contains an invalid role.
*/
function validateHistory(history) {
	if (history.length === 0) return;
	if (history[0].role !== "user") throw new Error("History must start with a user turn.");
	for (const content of history) if (content.role !== "user" && content.role !== "model") throw new Error(`Role must be user or model, but got ${content.role}.`);
}
/**
* Extracts the curated (valid) history from a comprehensive history.
*
* @remarks
* The model may sometimes generate invalid or empty contents(e.g., due to safty
* filters or recitation). Extracting valid turns from the history
* ensures that subsequent requests could be accpeted by the model.
*/
function extractCuratedHistory(comprehensiveHistory) {
	if (comprehensiveHistory === void 0 || comprehensiveHistory.length === 0) return [];
	const curatedHistory = [];
	const length = comprehensiveHistory.length;
	let i = 0;
	let userInput = comprehensiveHistory[0];
	while (i < length) if (comprehensiveHistory[i].role === "user") {
		userInput = comprehensiveHistory[i];
		i++;
	} else {
		const modelOutput = [];
		let isValid = true;
		while (i < length && comprehensiveHistory[i].role === "model") {
			modelOutput.push(comprehensiveHistory[i]);
			if (isValid && !isValidContent(comprehensiveHistory[i])) isValid = false;
			i++;
		}
		if (isValid) {
			curatedHistory.push(userInput);
			curatedHistory.push(...modelOutput);
		}
	}
	return curatedHistory;
}
/**
* A utility class to create a chat session.
*/
var Chats = class {
	constructor(modelsModule, apiClient) {
		this.modelsModule = modelsModule;
		this.apiClient = apiClient;
	}
	/**
	* Creates a new chat session.
	*
	* @remarks
	* The config in the params will be used for all requests within the chat
	* session unless overridden by a per-request `config` in
	* @see {@link types.SendMessageParameters#config}.
	*
	* @param params - Parameters for creating a chat session.
	* @returns A new chat session.
	*
	* @example
	* ```ts
	* const chat = ai.chats.create({
	*   model: 'gemini-2.0-flash'
	*   config: {
	*     temperature: 0.5,
	*     maxOutputTokens: 1024,
	*   }
	* });
	* ```
	*/
	create(params) {
		return new Chat(this.apiClient, this.modelsModule, params.model, params.config, params.history);
	}
};
/**
* Chat session that enables sending messages to the model with previous
* conversation context.
*
* @remarks
* The session maintains all the turns between user and model.
*/
var Chat = class {
	constructor(apiClient, modelsModule, model, config$1 = {}, history = []) {
		this.apiClient = apiClient;
		this.modelsModule = modelsModule;
		this.model = model;
		this.config = config$1;
		this.history = history;
		this.sendPromise = Promise.resolve();
		validateHistory(history);
	}
	/**
	* Sends a message to the model and returns the response.
	*
	* @remarks
	* This method will wait for the previous message to be processed before
	* sending the next message.
	*
	* @see {@link Chat#sendMessageStream} for streaming method.
	* @param params - parameters for sending messages within a chat session.
	* @returns The model's response.
	*
	* @example
	* ```ts
	* const chat = ai.chats.create({model: 'gemini-2.0-flash'});
	* const response = await chat.sendMessage({
	*   message: 'Why is the sky blue?'
	* });
	* console.log(response.text);
	* ```
	*/
	async sendMessage(params) {
		var _a;
		await this.sendPromise;
		const inputContent = tContent(this.apiClient, params.message);
		const responsePromise = this.modelsModule.generateContent({
			model: this.model,
			contents: this.getHistory(true).concat(inputContent),
			config: (_a = params.config) !== null && _a !== void 0 ? _a : this.config
		});
		this.sendPromise = (async () => {
			var _a$1, _b;
			const response = await responsePromise;
			const outputContent = (_b = (_a$1 = response.candidates) === null || _a$1 === void 0 ? void 0 : _a$1[0]) === null || _b === void 0 ? void 0 : _b.content;
			const modelOutput = outputContent ? [outputContent] : [];
			this.recordHistory(inputContent, modelOutput);
			return;
		})();
		await this.sendPromise;
		return responsePromise;
	}
	/**
	* Sends a message to the model and returns the response in chunks.
	*
	* @remarks
	* This method will wait for the previous message to be processed before
	* sending the next message.
	*
	* @see {@link Chat#sendMessage} for non-streaming method.
	* @param params - parameters for sending the message.
	* @return The model's response.
	*
	* @example
	* ```ts
	* const chat = ai.chats.create({model: 'gemini-2.0-flash'});
	* const response = await chat.sendMessageStream({
	*   message: 'Why is the sky blue?'
	* });
	* for await (const chunk of response) {
	*   console.log(chunk.text);
	* }
	* ```
	*/
	async sendMessageStream(params) {
		var _a;
		await this.sendPromise;
		const inputContent = tContent(this.apiClient, params.message);
		const streamResponse = this.modelsModule.generateContentStream({
			model: this.model,
			contents: this.getHistory(true).concat(inputContent),
			config: (_a = params.config) !== null && _a !== void 0 ? _a : this.config
		});
		this.sendPromise = streamResponse.then(() => void 0);
		const response = await streamResponse;
		const result = this.processStreamResponse(response, inputContent);
		return result;
	}
	/**
	* Returns the chat history.
	*
	* @remarks
	* The history is a list of contents alternating between user and model.
	*
	* There are two types of history:
	* - The `curated history` contains only the valid turns between user and
	* model, which will be included in the subsequent requests sent to the model.
	* - The `comprehensive history` contains all turns, including invalid or
	*   empty model outputs, providing a complete record of the history.
	*
	* The history is updated after receiving the response from the model,
	* for streaming response, it means receiving the last chunk of the response.
	*
	* The `comprehensive history` is returned by default. To get the `curated
	* history`, set the `curated` parameter to `true`.
	*
	* @param curated - whether to return the curated history or the comprehensive
	*     history.
	* @return History contents alternating between user and model for the entire
	*     chat session.
	*/
	getHistory(curated = false) {
		return curated ? extractCuratedHistory(this.history) : this.history;
	}
	processStreamResponse(streamResponse, inputContent) {
		var _a, _b;
		return __asyncGenerator(this, arguments, function* processStreamResponse_1() {
			var _c, e_1, _d, _e;
			const outputContent = [];
			try {
				for (var _f = true, streamResponse_1 = __asyncValues(streamResponse), streamResponse_1_1; streamResponse_1_1 = yield __await(streamResponse_1.next()), _c = streamResponse_1_1.done, !_c; _f = true) {
					_e = streamResponse_1_1.value;
					_f = false;
					const chunk = _e;
					if (isValidResponse(chunk)) {
						const content = (_b = (_a = chunk.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content;
						if (content !== void 0) outputContent.push(content);
					}
					yield yield __await(chunk);
				}
			} catch (e_1_1) {
				e_1 = { error: e_1_1 };
			} finally {
				try {
					if (!_f && !_c && (_d = streamResponse_1.return)) yield __await(_d.call(streamResponse_1));
				} finally {
					if (e_1) throw e_1.error;
				}
			}
			this.recordHistory(inputContent, outputContent);
		});
	}
	recordHistory(userInput, modelOutput) {
		let outputContents = [];
		if (modelOutput.length > 0 && modelOutput.every((content) => content.role === "model")) outputContents = modelOutput;
		else outputContents.push({
			role: "model",
			parts: []
		});
		this.history.push(userInput);
		this.history.push(...outputContents);
	}
};
/**
* @license
* Copyright 2025 Google LLC
* SPDX-License-Identifier: Apache-2.0
*/
function listFilesConfigToMldev(apiClient, fromObject, parentObject) {
	const toObject = {};
	const fromPageSize = getValueByPath(fromObject, ["pageSize"]);
	if (parentObject !== void 0 && fromPageSize != null) setValueByPath(parentObject, ["_query", "pageSize"], fromPageSize);
	const fromPageToken = getValueByPath(fromObject, ["pageToken"]);
	if (parentObject !== void 0 && fromPageToken != null) setValueByPath(parentObject, ["_query", "pageToken"], fromPageToken);
	return toObject;
}
function listFilesParametersToMldev(apiClient, fromObject) {
	const toObject = {};
	const fromConfig = getValueByPath(fromObject, ["config"]);
	if (fromConfig != null) setValueByPath(toObject, ["config"], listFilesConfigToMldev(apiClient, fromConfig, toObject));
	return toObject;
}
function fileStatusToMldev(apiClient, fromObject) {
	const toObject = {};
	const fromDetails = getValueByPath(fromObject, ["details"]);
	if (fromDetails != null) setValueByPath(toObject, ["details"], fromDetails);
	const fromMessage = getValueByPath(fromObject, ["message"]);
	if (fromMessage != null) setValueByPath(toObject, ["message"], fromMessage);
	const fromCode = getValueByPath(fromObject, ["code"]);
	if (fromCode != null) setValueByPath(toObject, ["code"], fromCode);
	return toObject;
}
function fileToMldev(apiClient, fromObject) {
	const toObject = {};
	const fromName = getValueByPath(fromObject, ["name"]);
	if (fromName != null) setValueByPath(toObject, ["name"], fromName);
	const fromDisplayName = getValueByPath(fromObject, ["displayName"]);
	if (fromDisplayName != null) setValueByPath(toObject, ["displayName"], fromDisplayName);
	const fromMimeType = getValueByPath(fromObject, ["mimeType"]);
	if (fromMimeType != null) setValueByPath(toObject, ["mimeType"], fromMimeType);
	const fromSizeBytes = getValueByPath(fromObject, ["sizeBytes"]);
	if (fromSizeBytes != null) setValueByPath(toObject, ["sizeBytes"], fromSizeBytes);
	const fromCreateTime = getValueByPath(fromObject, ["createTime"]);
	if (fromCreateTime != null) setValueByPath(toObject, ["createTime"], fromCreateTime);
	const fromExpirationTime = getValueByPath(fromObject, ["expirationTime"]);
	if (fromExpirationTime != null) setValueByPath(toObject, ["expirationTime"], fromExpirationTime);
	const fromUpdateTime = getValueByPath(fromObject, ["updateTime"]);
	if (fromUpdateTime != null) setValueByPath(toObject, ["updateTime"], fromUpdateTime);
	const fromSha256Hash = getValueByPath(fromObject, ["sha256Hash"]);
	if (fromSha256Hash != null) setValueByPath(toObject, ["sha256Hash"], fromSha256Hash);
	const fromUri = getValueByPath(fromObject, ["uri"]);
	if (fromUri != null) setValueByPath(toObject, ["uri"], fromUri);
	const fromDownloadUri = getValueByPath(fromObject, ["downloadUri"]);
	if (fromDownloadUri != null) setValueByPath(toObject, ["downloadUri"], fromDownloadUri);
	const fromState = getValueByPath(fromObject, ["state"]);
	if (fromState != null) setValueByPath(toObject, ["state"], fromState);
	const fromSource = getValueByPath(fromObject, ["source"]);
	if (fromSource != null) setValueByPath(toObject, ["source"], fromSource);
	const fromVideoMetadata = getValueByPath(fromObject, ["videoMetadata"]);
	if (fromVideoMetadata != null) setValueByPath(toObject, ["videoMetadata"], fromVideoMetadata);
	const fromError = getValueByPath(fromObject, ["error"]);
	if (fromError != null) setValueByPath(toObject, ["error"], fileStatusToMldev(apiClient, fromError));
	return toObject;
}
function createFileParametersToMldev(apiClient, fromObject) {
	const toObject = {};
	const fromFile = getValueByPath(fromObject, ["file"]);
	if (fromFile != null) setValueByPath(toObject, ["file"], fileToMldev(apiClient, fromFile));
	const fromConfig = getValueByPath(fromObject, ["config"]);
	if (fromConfig != null) setValueByPath(toObject, ["config"], fromConfig);
	return toObject;
}
function getFileParametersToMldev(apiClient, fromObject) {
	const toObject = {};
	const fromName = getValueByPath(fromObject, ["name"]);
	if (fromName != null) setValueByPath(toObject, ["_url", "file"], tFileName(apiClient, fromName));
	const fromConfig = getValueByPath(fromObject, ["config"]);
	if (fromConfig != null) setValueByPath(toObject, ["config"], fromConfig);
	return toObject;
}
function deleteFileParametersToMldev(apiClient, fromObject) {
	const toObject = {};
	const fromName = getValueByPath(fromObject, ["name"]);
	if (fromName != null) setValueByPath(toObject, ["_url", "file"], tFileName(apiClient, fromName));
	const fromConfig = getValueByPath(fromObject, ["config"]);
	if (fromConfig != null) setValueByPath(toObject, ["config"], fromConfig);
	return toObject;
}
function fileStatusFromMldev(apiClient, fromObject) {
	const toObject = {};
	const fromDetails = getValueByPath(fromObject, ["details"]);
	if (fromDetails != null) setValueByPath(toObject, ["details"], fromDetails);
	const fromMessage = getValueByPath(fromObject, ["message"]);
	if (fromMessage != null) setValueByPath(toObject, ["message"], fromMessage);
	const fromCode = getValueByPath(fromObject, ["code"]);
	if (fromCode != null) setValueByPath(toObject, ["code"], fromCode);
	return toObject;
}
function fileFromMldev(apiClient, fromObject) {
	const toObject = {};
	const fromName = getValueByPath(fromObject, ["name"]);
	if (fromName != null) setValueByPath(toObject, ["name"], fromName);
	const fromDisplayName = getValueByPath(fromObject, ["displayName"]);
	if (fromDisplayName != null) setValueByPath(toObject, ["displayName"], fromDisplayName);
	const fromMimeType = getValueByPath(fromObject, ["mimeType"]);
	if (fromMimeType != null) setValueByPath(toObject, ["mimeType"], fromMimeType);
	const fromSizeBytes = getValueByPath(fromObject, ["sizeBytes"]);
	if (fromSizeBytes != null) setValueByPath(toObject, ["sizeBytes"], fromSizeBytes);
	const fromCreateTime = getValueByPath(fromObject, ["createTime"]);
	if (fromCreateTime != null) setValueByPath(toObject, ["createTime"], fromCreateTime);
	const fromExpirationTime = getValueByPath(fromObject, ["expirationTime"]);
	if (fromExpirationTime != null) setValueByPath(toObject, ["expirationTime"], fromExpirationTime);
	const fromUpdateTime = getValueByPath(fromObject, ["updateTime"]);
	if (fromUpdateTime != null) setValueByPath(toObject, ["updateTime"], fromUpdateTime);
	const fromSha256Hash = getValueByPath(fromObject, ["sha256Hash"]);
	if (fromSha256Hash != null) setValueByPath(toObject, ["sha256Hash"], fromSha256Hash);
	const fromUri = getValueByPath(fromObject, ["uri"]);
	if (fromUri != null) setValueByPath(toObject, ["uri"], fromUri);
	const fromDownloadUri = getValueByPath(fromObject, ["downloadUri"]);
	if (fromDownloadUri != null) setValueByPath(toObject, ["downloadUri"], fromDownloadUri);
	const fromState = getValueByPath(fromObject, ["state"]);
	if (fromState != null) setValueByPath(toObject, ["state"], fromState);
	const fromSource = getValueByPath(fromObject, ["source"]);
	if (fromSource != null) setValueByPath(toObject, ["source"], fromSource);
	const fromVideoMetadata = getValueByPath(fromObject, ["videoMetadata"]);
	if (fromVideoMetadata != null) setValueByPath(toObject, ["videoMetadata"], fromVideoMetadata);
	const fromError = getValueByPath(fromObject, ["error"]);
	if (fromError != null) setValueByPath(toObject, ["error"], fileStatusFromMldev(apiClient, fromError));
	return toObject;
}
function listFilesResponseFromMldev(apiClient, fromObject) {
	const toObject = {};
	const fromNextPageToken = getValueByPath(fromObject, ["nextPageToken"]);
	if (fromNextPageToken != null) setValueByPath(toObject, ["nextPageToken"], fromNextPageToken);
	const fromFiles = getValueByPath(fromObject, ["files"]);
	if (fromFiles != null) if (Array.isArray(fromFiles)) setValueByPath(toObject, ["files"], fromFiles.map((item) => {
		return fileFromMldev(apiClient, item);
	}));
	else setValueByPath(toObject, ["files"], fromFiles);
	return toObject;
}
function createFileResponseFromMldev() {
	const toObject = {};
	return toObject;
}
function deleteFileResponseFromMldev() {
	const toObject = {};
	return toObject;
}
/**
* @license
* Copyright 2025 Google LLC
* SPDX-License-Identifier: Apache-2.0
*/
var Files = class extends BaseModule {
	constructor(apiClient) {
		super();
		this.apiClient = apiClient;
		/**
		* Lists all current project files from the service.
		*
		* @param params - The parameters for the list request
		* @return The paginated results of the list of files
		*
		* @example
		* The following code prints the names of all files from the service, the
		* size of each page is 10.
		*
		* ```ts
		* const listResponse = await ai.files.list({config: {'pageSize': 10}});
		* for await (const file of listResponse) {
		*   console.log(file.name);
		* }
		* ```
		*/
		this.list = async (params = {}) => {
			return new Pager(PagedItem.PAGED_ITEM_FILES, (x) => this.listInternal(x), await this.listInternal(params), params);
		};
	}
	/**
	* Uploads a file asynchronously to the Gemini API.
	* This method is not available in Vertex AI.
	* Supported upload sources:
	* - Node.js: File path (string) or Blob object.
	* - Browser: Blob object (e.g., File).
	*
	* @remarks
	* The `mimeType` can be specified in the `config` parameter. If omitted:
	*  - For file path (string) inputs, the `mimeType` will be inferred from the
	*     file extension.
	*  - For Blob object inputs, the `mimeType` will be set to the Blob's `type`
	*     property.
	* Somex eamples for file extension to mimeType mapping:
	* .txt -> text/plain
	* .json -> application/json
	* .jpg  -> image/jpeg
	* .png -> image/png
	* .mp3 -> audio/mpeg
	* .mp4 -> video/mp4
	*
	* This section can contain multiple paragraphs and code examples.
	*
	* @param params - Optional parameters specified in the
	*        `types.UploadFileParameters` interface.
	*         @see {@link types.UploadFileParameters#config} for the optional
	*         config in the parameters.
	* @return A promise that resolves to a `types.File` object.
	* @throws An error if called on a Vertex AI client.
	* @throws An error if the `mimeType` is not provided and can not be inferred,
	* the `mimeType` can be provided in the `params.config` parameter.
	* @throws An error occurs if a suitable upload location cannot be established.
	*
	* @example
	* The following code uploads a file to Gemini API.
	*
	* ```ts
	* const file = await ai.files.upload({file: 'file.txt', config: {
	*   mimeType: 'text/plain',
	* }});
	* console.log(file.name);
	* ```
	*/
	async upload(params) {
		if (this.apiClient.isVertexAI()) throw new Error("Vertex AI does not support uploading files. You can share files through a GCS bucket.");
		return this.apiClient.uploadFile(params.file, params.config).then((response) => {
			const file = fileFromMldev(this.apiClient, response);
			return file;
		});
	}
	async listInternal(params) {
		var _a;
		let response;
		let path$1 = "";
		let queryParams = {};
		if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
		else {
			const body = listFilesParametersToMldev(this.apiClient, params);
			path$1 = formatMap("files", body["_url"]);
			queryParams = body["_query"];
			delete body["config"];
			delete body["_url"];
			delete body["_query"];
			response = this.apiClient.request({
				path: path$1,
				queryParams,
				body: JSON.stringify(body),
				httpMethod: "GET",
				httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions
			}).then((httpResponse) => {
				return httpResponse.json();
			});
			return response.then((apiResponse) => {
				const resp = listFilesResponseFromMldev(this.apiClient, apiResponse);
				const typedResp = new ListFilesResponse();
				Object.assign(typedResp, resp);
				return typedResp;
			});
		}
	}
	async createInternal(params) {
		var _a;
		let response;
		let path$1 = "";
		let queryParams = {};
		if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
		else {
			const body = createFileParametersToMldev(this.apiClient, params);
			path$1 = formatMap("upload/v1beta/files", body["_url"]);
			queryParams = body["_query"];
			delete body["config"];
			delete body["_url"];
			delete body["_query"];
			response = this.apiClient.request({
				path: path$1,
				queryParams,
				body: JSON.stringify(body),
				httpMethod: "POST",
				httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions
			}).then((httpResponse) => {
				return httpResponse.json();
			});
			return response.then(() => {
				const resp = createFileResponseFromMldev();
				const typedResp = new CreateFileResponse();
				Object.assign(typedResp, resp);
				return typedResp;
			});
		}
	}
	/**
	* Retrieves the file information from the service.
	*
	* @param params - The parameters for the get request
	* @return The Promise that resolves to the types.File object requested.
	*
	* @example
	* ```ts
	* const config: GetFileParameters = {
	*   name: fileName,
	* };
	* file = await ai.files.get(config);
	* console.log(file.name);
	* ```
	*/
	async get(params) {
		var _a;
		let response;
		let path$1 = "";
		let queryParams = {};
		if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
		else {
			const body = getFileParametersToMldev(this.apiClient, params);
			path$1 = formatMap("files/{file}", body["_url"]);
			queryParams = body["_query"];
			delete body["config"];
			delete body["_url"];
			delete body["_query"];
			response = this.apiClient.request({
				path: path$1,
				queryParams,
				body: JSON.stringify(body),
				httpMethod: "GET",
				httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions
			}).then((httpResponse) => {
				return httpResponse.json();
			});
			return response.then((apiResponse) => {
				const resp = fileFromMldev(this.apiClient, apiResponse);
				return resp;
			});
		}
	}
	/**
	* Deletes a remotely stored file.
	*
	* @param params - The parameters for the delete request.
	* @return The DeleteFileResponse, the response for the delete method.
	*
	* @example
	* The following code deletes an example file named "files/mehozpxf877d".
	*
	* ```ts
	* await ai.files.delete({name: file.name});
	* ```
	*/
	async delete(params) {
		var _a;
		let response;
		let path$1 = "";
		let queryParams = {};
		if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
		else {
			const body = deleteFileParametersToMldev(this.apiClient, params);
			path$1 = formatMap("files/{file}", body["_url"]);
			queryParams = body["_query"];
			delete body["config"];
			delete body["_url"];
			delete body["_query"];
			response = this.apiClient.request({
				path: path$1,
				queryParams,
				body: JSON.stringify(body),
				httpMethod: "DELETE",
				httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions
			}).then((httpResponse) => {
				return httpResponse.json();
			});
			return response.then(() => {
				const resp = deleteFileResponseFromMldev();
				const typedResp = new DeleteFileResponse();
				Object.assign(typedResp, resp);
				return typedResp;
			});
		}
	}
};
/**
* @license
* Copyright 2025 Google LLC
* SPDX-License-Identifier: Apache-2.0
*/
function partToMldev$1(apiClient, fromObject) {
	const toObject = {};
	if (getValueByPath(fromObject, ["videoMetadata"]) !== void 0) throw new Error("videoMetadata parameter is not supported in Gemini API.");
	const fromThought = getValueByPath(fromObject, ["thought"]);
	if (fromThought != null) setValueByPath(toObject, ["thought"], fromThought);
	const fromCodeExecutionResult = getValueByPath(fromObject, ["codeExecutionResult"]);
	if (fromCodeExecutionResult != null) setValueByPath(toObject, ["codeExecutionResult"], fromCodeExecutionResult);
	const fromExecutableCode = getValueByPath(fromObject, ["executableCode"]);
	if (fromExecutableCode != null) setValueByPath(toObject, ["executableCode"], fromExecutableCode);
	const fromFileData = getValueByPath(fromObject, ["fileData"]);
	if (fromFileData != null) setValueByPath(toObject, ["fileData"], fromFileData);
	const fromFunctionCall = getValueByPath(fromObject, ["functionCall"]);
	if (fromFunctionCall != null) setValueByPath(toObject, ["functionCall"], fromFunctionCall);
	const fromFunctionResponse = getValueByPath(fromObject, ["functionResponse"]);
	if (fromFunctionResponse != null) setValueByPath(toObject, ["functionResponse"], fromFunctionResponse);
	const fromInlineData = getValueByPath(fromObject, ["inlineData"]);
	if (fromInlineData != null) setValueByPath(toObject, ["inlineData"], fromInlineData);
	const fromText = getValueByPath(fromObject, ["text"]);
	if (fromText != null) setValueByPath(toObject, ["text"], fromText);
	return toObject;
}
function partToVertex$1(apiClient, fromObject) {
	const toObject = {};
	const fromVideoMetadata = getValueByPath(fromObject, ["videoMetadata"]);
	if (fromVideoMetadata != null) setValueByPath(toObject, ["videoMetadata"], fromVideoMetadata);
	const fromThought = getValueByPath(fromObject, ["thought"]);
	if (fromThought != null) setValueByPath(toObject, ["thought"], fromThought);
	const fromCodeExecutionResult = getValueByPath(fromObject, ["codeExecutionResult"]);
	if (fromCodeExecutionResult != null) setValueByPath(toObject, ["codeExecutionResult"], fromCodeExecutionResult);
	const fromExecutableCode = getValueByPath(fromObject, ["executableCode"]);
	if (fromExecutableCode != null) setValueByPath(toObject, ["executableCode"], fromExecutableCode);
	const fromFileData = getValueByPath(fromObject, ["fileData"]);
	if (fromFileData != null) setValueByPath(toObject, ["fileData"], fromFileData);
	const fromFunctionCall = getValueByPath(fromObject, ["functionCall"]);
	if (fromFunctionCall != null) setValueByPath(toObject, ["functionCall"], fromFunctionCall);
	const fromFunctionResponse = getValueByPath(fromObject, ["functionResponse"]);
	if (fromFunctionResponse != null) setValueByPath(toObject, ["functionResponse"], fromFunctionResponse);
	const fromInlineData = getValueByPath(fromObject, ["inlineData"]);
	if (fromInlineData != null) setValueByPath(toObject, ["inlineData"], fromInlineData);
	const fromText = getValueByPath(fromObject, ["text"]);
	if (fromText != null) setValueByPath(toObject, ["text"], fromText);
	return toObject;
}
function contentToMldev$1(apiClient, fromObject) {
	const toObject = {};
	const fromParts = getValueByPath(fromObject, ["parts"]);
	if (fromParts != null) if (Array.isArray(fromParts)) setValueByPath(toObject, ["parts"], fromParts.map((item) => {
		return partToMldev$1(apiClient, item);
	}));
	else setValueByPath(toObject, ["parts"], fromParts);
	const fromRole = getValueByPath(fromObject, ["role"]);
	if (fromRole != null) setValueByPath(toObject, ["role"], fromRole);
	return toObject;
}
function contentToVertex$1(apiClient, fromObject) {
	const toObject = {};
	const fromParts = getValueByPath(fromObject, ["parts"]);
	if (fromParts != null) if (Array.isArray(fromParts)) setValueByPath(toObject, ["parts"], fromParts.map((item) => {
		return partToVertex$1(apiClient, item);
	}));
	else setValueByPath(toObject, ["parts"], fromParts);
	const fromRole = getValueByPath(fromObject, ["role"]);
	if (fromRole != null) setValueByPath(toObject, ["role"], fromRole);
	return toObject;
}
function schemaToVertex$1(apiClient, fromObject) {
	const toObject = {};
	const fromExample = getValueByPath(fromObject, ["example"]);
	if (fromExample != null) setValueByPath(toObject, ["example"], fromExample);
	const fromPattern = getValueByPath(fromObject, ["pattern"]);
	if (fromPattern != null) setValueByPath(toObject, ["pattern"], fromPattern);
	const fromDefault = getValueByPath(fromObject, ["default"]);
	if (fromDefault != null) setValueByPath(toObject, ["default"], fromDefault);
	const fromMaxLength = getValueByPath(fromObject, ["maxLength"]);
	if (fromMaxLength != null) setValueByPath(toObject, ["maxLength"], fromMaxLength);
	const fromMinLength = getValueByPath(fromObject, ["minLength"]);
	if (fromMinLength != null) setValueByPath(toObject, ["minLength"], fromMinLength);
	const fromMinProperties = getValueByPath(fromObject, ["minProperties"]);
	if (fromMinProperties != null) setValueByPath(toObject, ["minProperties"], fromMinProperties);
	const fromMaxProperties = getValueByPath(fromObject, ["maxProperties"]);
	if (fromMaxProperties != null) setValueByPath(toObject, ["maxProperties"], fromMaxProperties);
	const fromAnyOf = getValueByPath(fromObject, ["anyOf"]);
	if (fromAnyOf != null) setValueByPath(toObject, ["anyOf"], fromAnyOf);
	const fromDescription = getValueByPath(fromObject, ["description"]);
	if (fromDescription != null) setValueByPath(toObject, ["description"], fromDescription);
	const fromEnum = getValueByPath(fromObject, ["enum"]);
	if (fromEnum != null) setValueByPath(toObject, ["enum"], fromEnum);
	const fromFormat = getValueByPath(fromObject, ["format"]);
	if (fromFormat != null) setValueByPath(toObject, ["format"], fromFormat);
	const fromItems = getValueByPath(fromObject, ["items"]);
	if (fromItems != null) setValueByPath(toObject, ["items"], fromItems);
	const fromMaxItems = getValueByPath(fromObject, ["maxItems"]);
	if (fromMaxItems != null) setValueByPath(toObject, ["maxItems"], fromMaxItems);
	const fromMaximum = getValueByPath(fromObject, ["maximum"]);
	if (fromMaximum != null) setValueByPath(toObject, ["maximum"], fromMaximum);
	const fromMinItems = getValueByPath(fromObject, ["minItems"]);
	if (fromMinItems != null) setValueByPath(toObject, ["minItems"], fromMinItems);
	const fromMinimum = getValueByPath(fromObject, ["minimum"]);
	if (fromMinimum != null) setValueByPath(toObject, ["minimum"], fromMinimum);
	const fromNullable = getValueByPath(fromObject, ["nullable"]);
	if (fromNullable != null) setValueByPath(toObject, ["nullable"], fromNullable);
	const fromProperties = getValueByPath(fromObject, ["properties"]);
	if (fromProperties != null) setValueByPath(toObject, ["properties"], fromProperties);
	const fromPropertyOrdering = getValueByPath(fromObject, ["propertyOrdering"]);
	if (fromPropertyOrdering != null) setValueByPath(toObject, ["propertyOrdering"], fromPropertyOrdering);
	const fromRequired = getValueByPath(fromObject, ["required"]);
	if (fromRequired != null) setValueByPath(toObject, ["required"], fromRequired);
	const fromTitle = getValueByPath(fromObject, ["title"]);
	if (fromTitle != null) setValueByPath(toObject, ["title"], fromTitle);
	const fromType = getValueByPath(fromObject, ["type"]);
	if (fromType != null) setValueByPath(toObject, ["type"], fromType);
	return toObject;
}
function functionDeclarationToMldev$1(apiClient, fromObject) {
	const toObject = {};
	if (getValueByPath(fromObject, ["response"]) !== void 0) throw new Error("response parameter is not supported in Gemini API.");
	const fromDescription = getValueByPath(fromObject, ["description"]);
	if (fromDescription != null) setValueByPath(toObject, ["description"], fromDescription);
	const fromName = getValueByPath(fromObject, ["name"]);
	if (fromName != null) setValueByPath(toObject, ["name"], fromName);
	const fromParameters = getValueByPath(fromObject, ["parameters"]);
	if (fromParameters != null) setValueByPath(toObject, ["parameters"], fromParameters);
	return toObject;
}
function functionDeclarationToVertex$1(apiClient, fromObject) {
	const toObject = {};
	const fromResponse = getValueByPath(fromObject, ["response"]);
	if (fromResponse != null) setValueByPath(toObject, ["response"], schemaToVertex$1(apiClient, fromResponse));
	const fromDescription = getValueByPath(fromObject, ["description"]);
	if (fromDescription != null) setValueByPath(toObject, ["description"], fromDescription);
	const fromName = getValueByPath(fromObject, ["name"]);
	if (fromName != null) setValueByPath(toObject, ["name"], fromName);
	const fromParameters = getValueByPath(fromObject, ["parameters"]);
	if (fromParameters != null) setValueByPath(toObject, ["parameters"], fromParameters);
	return toObject;
}
function googleSearchToMldev$1() {
	const toObject = {};
	return toObject;
}
function googleSearchToVertex$1() {
	const toObject = {};
	return toObject;
}
function dynamicRetrievalConfigToMldev$1(apiClient, fromObject) {
	const toObject = {};
	const fromMode = getValueByPath(fromObject, ["mode"]);
	if (fromMode != null) setValueByPath(toObject, ["mode"], fromMode);
	const fromDynamicThreshold = getValueByPath(fromObject, ["dynamicThreshold"]);
	if (fromDynamicThreshold != null) setValueByPath(toObject, ["dynamicThreshold"], fromDynamicThreshold);
	return toObject;
}
function dynamicRetrievalConfigToVertex$1(apiClient, fromObject) {
	const toObject = {};
	const fromMode = getValueByPath(fromObject, ["mode"]);
	if (fromMode != null) setValueByPath(toObject, ["mode"], fromMode);
	const fromDynamicThreshold = getValueByPath(fromObject, ["dynamicThreshold"]);
	if (fromDynamicThreshold != null) setValueByPath(toObject, ["dynamicThreshold"], fromDynamicThreshold);
	return toObject;
}
function googleSearchRetrievalToMldev$1(apiClient, fromObject) {
	const toObject = {};
	const fromDynamicRetrievalConfig = getValueByPath(fromObject, ["dynamicRetrievalConfig"]);
	if (fromDynamicRetrievalConfig != null) setValueByPath(toObject, ["dynamicRetrievalConfig"], dynamicRetrievalConfigToMldev$1(apiClient, fromDynamicRetrievalConfig));
	return toObject;
}
function googleSearchRetrievalToVertex$1(apiClient, fromObject) {
	const toObject = {};
	const fromDynamicRetrievalConfig = getValueByPath(fromObject, ["dynamicRetrievalConfig"]);
	if (fromDynamicRetrievalConfig != null) setValueByPath(toObject, ["dynamicRetrievalConfig"], dynamicRetrievalConfigToVertex$1(apiClient, fromDynamicRetrievalConfig));
	return toObject;
}
function toolToMldev$1(apiClient, fromObject) {
	const toObject = {};
	const fromFunctionDeclarations = getValueByPath(fromObject, ["functionDeclarations"]);
	if (fromFunctionDeclarations != null) if (Array.isArray(fromFunctionDeclarations)) setValueByPath(toObject, ["functionDeclarations"], fromFunctionDeclarations.map((item) => {
		return functionDeclarationToMldev$1(apiClient, item);
	}));
	else setValueByPath(toObject, ["functionDeclarations"], fromFunctionDeclarations);
	if (getValueByPath(fromObject, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
	const fromGoogleSearch = getValueByPath(fromObject, ["googleSearch"]);
	if (fromGoogleSearch != null) setValueByPath(toObject, ["googleSearch"], googleSearchToMldev$1());
	const fromGoogleSearchRetrieval = getValueByPath(fromObject, ["googleSearchRetrieval"]);
	if (fromGoogleSearchRetrieval != null) setValueByPath(toObject, ["googleSearchRetrieval"], googleSearchRetrievalToMldev$1(apiClient, fromGoogleSearchRetrieval));
	const fromCodeExecution = getValueByPath(fromObject, ["codeExecution"]);
	if (fromCodeExecution != null) setValueByPath(toObject, ["codeExecution"], fromCodeExecution);
	return toObject;
}
function toolToVertex$1(apiClient, fromObject) {
	const toObject = {};
	const fromFunctionDeclarations = getValueByPath(fromObject, ["functionDeclarations"]);
	if (fromFunctionDeclarations != null) if (Array.isArray(fromFunctionDeclarations)) setValueByPath(toObject, ["functionDeclarations"], fromFunctionDeclarations.map((item) => {
		return functionDeclarationToVertex$1(apiClient, item);
	}));
	else setValueByPath(toObject, ["functionDeclarations"], fromFunctionDeclarations);
	const fromRetrieval = getValueByPath(fromObject, ["retrieval"]);
	if (fromRetrieval != null) setValueByPath(toObject, ["retrieval"], fromRetrieval);
	const fromGoogleSearch = getValueByPath(fromObject, ["googleSearch"]);
	if (fromGoogleSearch != null) setValueByPath(toObject, ["googleSearch"], googleSearchToVertex$1());
	const fromGoogleSearchRetrieval = getValueByPath(fromObject, ["googleSearchRetrieval"]);
	if (fromGoogleSearchRetrieval != null) setValueByPath(toObject, ["googleSearchRetrieval"], googleSearchRetrievalToVertex$1(apiClient, fromGoogleSearchRetrieval));
	const fromCodeExecution = getValueByPath(fromObject, ["codeExecution"]);
	if (fromCodeExecution != null) setValueByPath(toObject, ["codeExecution"], fromCodeExecution);
	return toObject;
}
function sessionResumptionConfigToMldev(apiClient, fromObject) {
	const toObject = {};
	const fromHandle = getValueByPath(fromObject, ["handle"]);
	if (fromHandle != null) setValueByPath(toObject, ["handle"], fromHandle);
	if (getValueByPath(fromObject, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
	return toObject;
}
function sessionResumptionConfigToVertex(apiClient, fromObject) {
	const toObject = {};
	const fromHandle = getValueByPath(fromObject, ["handle"]);
	if (fromHandle != null) setValueByPath(toObject, ["handle"], fromHandle);
	const fromTransparent = getValueByPath(fromObject, ["transparent"]);
	if (fromTransparent != null) setValueByPath(toObject, ["transparent"], fromTransparent);
	return toObject;
}
function audioTranscriptionConfigToMldev() {
	const toObject = {};
	return toObject;
}
function audioTranscriptionConfigToVertex() {
	const toObject = {};
	return toObject;
}
function automaticActivityDetectionToMldev(apiClient, fromObject) {
	const toObject = {};
	const fromDisabled = getValueByPath(fromObject, ["disabled"]);
	if (fromDisabled != null) setValueByPath(toObject, ["disabled"], fromDisabled);
	const fromStartOfSpeechSensitivity = getValueByPath(fromObject, ["startOfSpeechSensitivity"]);
	if (fromStartOfSpeechSensitivity != null) setValueByPath(toObject, ["startOfSpeechSensitivity"], fromStartOfSpeechSensitivity);
	const fromEndOfSpeechSensitivity = getValueByPath(fromObject, ["endOfSpeechSensitivity"]);
	if (fromEndOfSpeechSensitivity != null) setValueByPath(toObject, ["endOfSpeechSensitivity"], fromEndOfSpeechSensitivity);
	const fromPrefixPaddingMs = getValueByPath(fromObject, ["prefixPaddingMs"]);
	if (fromPrefixPaddingMs != null) setValueByPath(toObject, ["prefixPaddingMs"], fromPrefixPaddingMs);
	const fromSilenceDurationMs = getValueByPath(fromObject, ["silenceDurationMs"]);
	if (fromSilenceDurationMs != null) setValueByPath(toObject, ["silenceDurationMs"], fromSilenceDurationMs);
	return toObject;
}
function automaticActivityDetectionToVertex(apiClient, fromObject) {
	const toObject = {};
	const fromDisabled = getValueByPath(fromObject, ["disabled"]);
	if (fromDisabled != null) setValueByPath(toObject, ["disabled"], fromDisabled);
	const fromStartOfSpeechSensitivity = getValueByPath(fromObject, ["startOfSpeechSensitivity"]);
	if (fromStartOfSpeechSensitivity != null) setValueByPath(toObject, ["startOfSpeechSensitivity"], fromStartOfSpeechSensitivity);
	const fromEndOfSpeechSensitivity = getValueByPath(fromObject, ["endOfSpeechSensitivity"]);
	if (fromEndOfSpeechSensitivity != null) setValueByPath(toObject, ["endOfSpeechSensitivity"], fromEndOfSpeechSensitivity);
	const fromPrefixPaddingMs = getValueByPath(fromObject, ["prefixPaddingMs"]);
	if (fromPrefixPaddingMs != null) setValueByPath(toObject, ["prefixPaddingMs"], fromPrefixPaddingMs);
	const fromSilenceDurationMs = getValueByPath(fromObject, ["silenceDurationMs"]);
	if (fromSilenceDurationMs != null) setValueByPath(toObject, ["silenceDurationMs"], fromSilenceDurationMs);
	return toObject;
}
function realtimeInputConfigToMldev(apiClient, fromObject) {
	const toObject = {};
	const fromAutomaticActivityDetection = getValueByPath(fromObject, ["automaticActivityDetection"]);
	if (fromAutomaticActivityDetection != null) setValueByPath(toObject, ["automaticActivityDetection"], automaticActivityDetectionToMldev(apiClient, fromAutomaticActivityDetection));
	const fromActivityHandling = getValueByPath(fromObject, ["activityHandling"]);
	if (fromActivityHandling != null) setValueByPath(toObject, ["activityHandling"], fromActivityHandling);
	const fromTurnCoverage = getValueByPath(fromObject, ["turnCoverage"]);
	if (fromTurnCoverage != null) setValueByPath(toObject, ["turnCoverage"], fromTurnCoverage);
	return toObject;
}
function realtimeInputConfigToVertex(apiClient, fromObject) {
	const toObject = {};
	const fromAutomaticActivityDetection = getValueByPath(fromObject, ["automaticActivityDetection"]);
	if (fromAutomaticActivityDetection != null) setValueByPath(toObject, ["automaticActivityDetection"], automaticActivityDetectionToVertex(apiClient, fromAutomaticActivityDetection));
	const fromActivityHandling = getValueByPath(fromObject, ["activityHandling"]);
	if (fromActivityHandling != null) setValueByPath(toObject, ["activityHandling"], fromActivityHandling);
	const fromTurnCoverage = getValueByPath(fromObject, ["turnCoverage"]);
	if (fromTurnCoverage != null) setValueByPath(toObject, ["turnCoverage"], fromTurnCoverage);
	return toObject;
}
function slidingWindowToMldev(apiClient, fromObject) {
	const toObject = {};
	const fromTargetTokens = getValueByPath(fromObject, ["targetTokens"]);
	if (fromTargetTokens != null) setValueByPath(toObject, ["targetTokens"], fromTargetTokens);
	return toObject;
}
function slidingWindowToVertex(apiClient, fromObject) {
	const toObject = {};
	const fromTargetTokens = getValueByPath(fromObject, ["targetTokens"]);
	if (fromTargetTokens != null) setValueByPath(toObject, ["targetTokens"], fromTargetTokens);
	return toObject;
}
function contextWindowCompressionConfigToMldev(apiClient, fromObject) {
	const toObject = {};
	const fromTriggerTokens = getValueByPath(fromObject, ["triggerTokens"]);
	if (fromTriggerTokens != null) setValueByPath(toObject, ["triggerTokens"], fromTriggerTokens);
	const fromSlidingWindow = getValueByPath(fromObject, ["slidingWindow"]);
	if (fromSlidingWindow != null) setValueByPath(toObject, ["slidingWindow"], slidingWindowToMldev(apiClient, fromSlidingWindow));
	return toObject;
}
function contextWindowCompressionConfigToVertex(apiClient, fromObject) {
	const toObject = {};
	const fromTriggerTokens = getValueByPath(fromObject, ["triggerTokens"]);
	if (fromTriggerTokens != null) setValueByPath(toObject, ["triggerTokens"], fromTriggerTokens);
	const fromSlidingWindow = getValueByPath(fromObject, ["slidingWindow"]);
	if (fromSlidingWindow != null) setValueByPath(toObject, ["slidingWindow"], slidingWindowToVertex(apiClient, fromSlidingWindow));
	return toObject;
}
function liveConnectConfigToMldev(apiClient, fromObject, parentObject) {
	const toObject = {};
	const fromGenerationConfig = getValueByPath(fromObject, ["generationConfig"]);
	if (parentObject !== void 0 && fromGenerationConfig != null) setValueByPath(parentObject, ["setup", "generationConfig"], fromGenerationConfig);
	const fromResponseModalities = getValueByPath(fromObject, ["responseModalities"]);
	if (parentObject !== void 0 && fromResponseModalities != null) setValueByPath(parentObject, [
		"setup",
		"generationConfig",
		"responseModalities"
	], fromResponseModalities);
	const fromTemperature = getValueByPath(fromObject, ["temperature"]);
	if (parentObject !== void 0 && fromTemperature != null) setValueByPath(parentObject, [
		"setup",
		"generationConfig",
		"temperature"
	], fromTemperature);
	const fromTopP = getValueByPath(fromObject, ["topP"]);
	if (parentObject !== void 0 && fromTopP != null) setValueByPath(parentObject, [
		"setup",
		"generationConfig",
		"topP"
	], fromTopP);
	const fromTopK = getValueByPath(fromObject, ["topK"]);
	if (parentObject !== void 0 && fromTopK != null) setValueByPath(parentObject, [
		"setup",
		"generationConfig",
		"topK"
	], fromTopK);
	const fromMaxOutputTokens = getValueByPath(fromObject, ["maxOutputTokens"]);
	if (parentObject !== void 0 && fromMaxOutputTokens != null) setValueByPath(parentObject, [
		"setup",
		"generationConfig",
		"maxOutputTokens"
	], fromMaxOutputTokens);
	const fromMediaResolution = getValueByPath(fromObject, ["mediaResolution"]);
	if (parentObject !== void 0 && fromMediaResolution != null) setValueByPath(parentObject, [
		"setup",
		"generationConfig",
		"mediaResolution"
	], fromMediaResolution);
	const fromSeed = getValueByPath(fromObject, ["seed"]);
	if (parentObject !== void 0 && fromSeed != null) setValueByPath(parentObject, [
		"setup",
		"generationConfig",
		"seed"
	], fromSeed);
	const fromSpeechConfig = getValueByPath(fromObject, ["speechConfig"]);
	if (parentObject !== void 0 && fromSpeechConfig != null) setValueByPath(parentObject, [
		"setup",
		"generationConfig",
		"speechConfig"
	], fromSpeechConfig);
	const fromSystemInstruction = getValueByPath(fromObject, ["systemInstruction"]);
	if (parentObject !== void 0 && fromSystemInstruction != null) setValueByPath(parentObject, ["setup", "systemInstruction"], contentToMldev$1(apiClient, tContent(apiClient, fromSystemInstruction)));
	const fromTools = getValueByPath(fromObject, ["tools"]);
	if (parentObject !== void 0 && fromTools != null) if (Array.isArray(fromTools)) setValueByPath(parentObject, ["setup", "tools"], tTools(apiClient, tTools(apiClient, fromTools).map((item) => {
		return toolToMldev$1(apiClient, tTool(apiClient, item));
	})));
	else setValueByPath(parentObject, ["setup", "tools"], tTools(apiClient, fromTools));
	const fromSessionResumption = getValueByPath(fromObject, ["sessionResumption"]);
	if (parentObject !== void 0 && fromSessionResumption != null) setValueByPath(parentObject, ["setup", "sessionResumption"], sessionResumptionConfigToMldev(apiClient, fromSessionResumption));
	if (getValueByPath(fromObject, ["inputAudioTranscription"]) !== void 0) throw new Error("inputAudioTranscription parameter is not supported in Gemini API.");
	const fromOutputAudioTranscription = getValueByPath(fromObject, ["outputAudioTranscription"]);
	if (parentObject !== void 0 && fromOutputAudioTranscription != null) setValueByPath(parentObject, ["setup", "outputAudioTranscription"], audioTranscriptionConfigToMldev());
	const fromRealtimeInputConfig = getValueByPath(fromObject, ["realtimeInputConfig"]);
	if (parentObject !== void 0 && fromRealtimeInputConfig != null) setValueByPath(parentObject, ["setup", "realtimeInputConfig"], realtimeInputConfigToMldev(apiClient, fromRealtimeInputConfig));
	const fromContextWindowCompression = getValueByPath(fromObject, ["contextWindowCompression"]);
	if (parentObject !== void 0 && fromContextWindowCompression != null) setValueByPath(parentObject, ["setup", "contextWindowCompression"], contextWindowCompressionConfigToMldev(apiClient, fromContextWindowCompression));
	return toObject;
}
function liveConnectConfigToVertex(apiClient, fromObject, parentObject) {
	const toObject = {};
	const fromGenerationConfig = getValueByPath(fromObject, ["generationConfig"]);
	if (parentObject !== void 0 && fromGenerationConfig != null) setValueByPath(parentObject, ["setup", "generationConfig"], fromGenerationConfig);
	const fromResponseModalities = getValueByPath(fromObject, ["responseModalities"]);
	if (parentObject !== void 0 && fromResponseModalities != null) setValueByPath(parentObject, [
		"setup",
		"generationConfig",
		"responseModalities"
	], fromResponseModalities);
	const fromTemperature = getValueByPath(fromObject, ["temperature"]);
	if (parentObject !== void 0 && fromTemperature != null) setValueByPath(parentObject, [
		"setup",
		"generationConfig",
		"temperature"
	], fromTemperature);
	const fromTopP = getValueByPath(fromObject, ["topP"]);
	if (parentObject !== void 0 && fromTopP != null) setValueByPath(parentObject, [
		"setup",
		"generationConfig",
		"topP"
	], fromTopP);
	const fromTopK = getValueByPath(fromObject, ["topK"]);
	if (parentObject !== void 0 && fromTopK != null) setValueByPath(parentObject, [
		"setup",
		"generationConfig",
		"topK"
	], fromTopK);
	const fromMaxOutputTokens = getValueByPath(fromObject, ["maxOutputTokens"]);
	if (parentObject !== void 0 && fromMaxOutputTokens != null) setValueByPath(parentObject, [
		"setup",
		"generationConfig",
		"maxOutputTokens"
	], fromMaxOutputTokens);
	const fromMediaResolution = getValueByPath(fromObject, ["mediaResolution"]);
	if (parentObject !== void 0 && fromMediaResolution != null) setValueByPath(parentObject, [
		"setup",
		"generationConfig",
		"mediaResolution"
	], fromMediaResolution);
	const fromSeed = getValueByPath(fromObject, ["seed"]);
	if (parentObject !== void 0 && fromSeed != null) setValueByPath(parentObject, [
		"setup",
		"generationConfig",
		"seed"
	], fromSeed);
	const fromSpeechConfig = getValueByPath(fromObject, ["speechConfig"]);
	if (parentObject !== void 0 && fromSpeechConfig != null) setValueByPath(parentObject, [
		"setup",
		"generationConfig",
		"speechConfig"
	], fromSpeechConfig);
	const fromSystemInstruction = getValueByPath(fromObject, ["systemInstruction"]);
	if (parentObject !== void 0 && fromSystemInstruction != null) setValueByPath(parentObject, ["setup", "systemInstruction"], contentToVertex$1(apiClient, tContent(apiClient, fromSystemInstruction)));
	const fromTools = getValueByPath(fromObject, ["tools"]);
	if (parentObject !== void 0 && fromTools != null) if (Array.isArray(fromTools)) setValueByPath(parentObject, ["setup", "tools"], tTools(apiClient, tTools(apiClient, fromTools).map((item) => {
		return toolToVertex$1(apiClient, tTool(apiClient, item));
	})));
	else setValueByPath(parentObject, ["setup", "tools"], tTools(apiClient, fromTools));
	const fromSessionResumption = getValueByPath(fromObject, ["sessionResumption"]);
	if (parentObject !== void 0 && fromSessionResumption != null) setValueByPath(parentObject, ["setup", "sessionResumption"], sessionResumptionConfigToVertex(apiClient, fromSessionResumption));
	const fromInputAudioTranscription = getValueByPath(fromObject, ["inputAudioTranscription"]);
	if (parentObject !== void 0 && fromInputAudioTranscription != null) setValueByPath(parentObject, ["setup", "inputAudioTranscription"], audioTranscriptionConfigToVertex());
	const fromOutputAudioTranscription = getValueByPath(fromObject, ["outputAudioTranscription"]);
	if (parentObject !== void 0 && fromOutputAudioTranscription != null) setValueByPath(parentObject, ["setup", "outputAudioTranscription"], audioTranscriptionConfigToVertex());
	const fromRealtimeInputConfig = getValueByPath(fromObject, ["realtimeInputConfig"]);
	if (parentObject !== void 0 && fromRealtimeInputConfig != null) setValueByPath(parentObject, ["setup", "realtimeInputConfig"], realtimeInputConfigToVertex(apiClient, fromRealtimeInputConfig));
	const fromContextWindowCompression = getValueByPath(fromObject, ["contextWindowCompression"]);
	if (parentObject !== void 0 && fromContextWindowCompression != null) setValueByPath(parentObject, ["setup", "contextWindowCompression"], contextWindowCompressionConfigToVertex(apiClient, fromContextWindowCompression));
	return toObject;
}
function liveConnectParametersToMldev(apiClient, fromObject) {
	const toObject = {};
	const fromModel = getValueByPath(fromObject, ["model"]);
	if (fromModel != null) setValueByPath(toObject, ["setup", "model"], tModel(apiClient, fromModel));
	const fromConfig = getValueByPath(fromObject, ["config"]);
	if (fromConfig != null) setValueByPath(toObject, ["config"], liveConnectConfigToMldev(apiClient, fromConfig, toObject));
	return toObject;
}
function liveConnectParametersToVertex(apiClient, fromObject) {
	const toObject = {};
	const fromModel = getValueByPath(fromObject, ["model"]);
	if (fromModel != null) setValueByPath(toObject, ["setup", "model"], tModel(apiClient, fromModel));
	const fromConfig = getValueByPath(fromObject, ["config"]);
	if (fromConfig != null) setValueByPath(toObject, ["config"], liveConnectConfigToVertex(apiClient, fromConfig, toObject));
	return toObject;
}
function liveServerSetupCompleteFromMldev() {
	const toObject = {};
	return toObject;
}
function liveServerSetupCompleteFromVertex() {
	const toObject = {};
	return toObject;
}
function partFromMldev$1(apiClient, fromObject) {
	const toObject = {};
	const fromThought = getValueByPath(fromObject, ["thought"]);
	if (fromThought != null) setValueByPath(toObject, ["thought"], fromThought);
	const fromCodeExecutionResult = getValueByPath(fromObject, ["codeExecutionResult"]);
	if (fromCodeExecutionResult != null) setValueByPath(toObject, ["codeExecutionResult"], fromCodeExecutionResult);
	const fromExecutableCode = getValueByPath(fromObject, ["executableCode"]);
	if (fromExecutableCode != null) setValueByPath(toObject, ["executableCode"], fromExecutableCode);
	const fromFileData = getValueByPath(fromObject, ["fileData"]);
	if (fromFileData != null) setValueByPath(toObject, ["fileData"], fromFileData);
	const fromFunctionCall = getValueByPath(fromObject, ["functionCall"]);
	if (fromFunctionCall != null) setValueByPath(toObject, ["functionCall"], fromFunctionCall);
	const fromFunctionResponse = getValueByPath(fromObject, ["functionResponse"]);
	if (fromFunctionResponse != null) setValueByPath(toObject, ["functionResponse"], fromFunctionResponse);
	const fromInlineData = getValueByPath(fromObject, ["inlineData"]);
	if (fromInlineData != null) setValueByPath(toObject, ["inlineData"], fromInlineData);
	const fromText = getValueByPath(fromObject, ["text"]);
	if (fromText != null) setValueByPath(toObject, ["text"], fromText);
	return toObject;
}
function partFromVertex$1(apiClient, fromObject) {
	const toObject = {};
	const fromVideoMetadata = getValueByPath(fromObject, ["videoMetadata"]);
	if (fromVideoMetadata != null) setValueByPath(toObject, ["videoMetadata"], fromVideoMetadata);
	const fromThought = getValueByPath(fromObject, ["thought"]);
	if (fromThought != null) setValueByPath(toObject, ["thought"], fromThought);
	const fromCodeExecutionResult = getValueByPath(fromObject, ["codeExecutionResult"]);
	if (fromCodeExecutionResult != null) setValueByPath(toObject, ["codeExecutionResult"], fromCodeExecutionResult);
	const fromExecutableCode = getValueByPath(fromObject, ["executableCode"]);
	if (fromExecutableCode != null) setValueByPath(toObject, ["executableCode"], fromExecutableCode);
	const fromFileData = getValueByPath(fromObject, ["fileData"]);
	if (fromFileData != null) setValueByPath(toObject, ["fileData"], fromFileData);
	const fromFunctionCall = getValueByPath(fromObject, ["functionCall"]);
	if (fromFunctionCall != null) setValueByPath(toObject, ["functionCall"], fromFunctionCall);
	const fromFunctionResponse = getValueByPath(fromObject, ["functionResponse"]);
	if (fromFunctionResponse != null) setValueByPath(toObject, ["functionResponse"], fromFunctionResponse);
	const fromInlineData = getValueByPath(fromObject, ["inlineData"]);
	if (fromInlineData != null) setValueByPath(toObject, ["inlineData"], fromInlineData);
	const fromText = getValueByPath(fromObject, ["text"]);
	if (fromText != null) setValueByPath(toObject, ["text"], fromText);
	return toObject;
}
function contentFromMldev$1(apiClient, fromObject) {
	const toObject = {};
	const fromParts = getValueByPath(fromObject, ["parts"]);
	if (fromParts != null) if (Array.isArray(fromParts)) setValueByPath(toObject, ["parts"], fromParts.map((item) => {
		return partFromMldev$1(apiClient, item);
	}));
	else setValueByPath(toObject, ["parts"], fromParts);
	const fromRole = getValueByPath(fromObject, ["role"]);
	if (fromRole != null) setValueByPath(toObject, ["role"], fromRole);
	return toObject;
}
function contentFromVertex$1(apiClient, fromObject) {
	const toObject = {};
	const fromParts = getValueByPath(fromObject, ["parts"]);
	if (fromParts != null) if (Array.isArray(fromParts)) setValueByPath(toObject, ["parts"], fromParts.map((item) => {
		return partFromVertex$1(apiClient, item);
	}));
	else setValueByPath(toObject, ["parts"], fromParts);
	const fromRole = getValueByPath(fromObject, ["role"]);
	if (fromRole != null) setValueByPath(toObject, ["role"], fromRole);
	return toObject;
}
function transcriptionFromMldev(apiClient, fromObject) {
	const toObject = {};
	const fromText = getValueByPath(fromObject, ["text"]);
	if (fromText != null) setValueByPath(toObject, ["text"], fromText);
	const fromFinished = getValueByPath(fromObject, ["finished"]);
	if (fromFinished != null) setValueByPath(toObject, ["finished"], fromFinished);
	return toObject;
}
function transcriptionFromVertex(apiClient, fromObject) {
	const toObject = {};
	const fromText = getValueByPath(fromObject, ["text"]);
	if (fromText != null) setValueByPath(toObject, ["text"], fromText);
	const fromFinished = getValueByPath(fromObject, ["finished"]);
	if (fromFinished != null) setValueByPath(toObject, ["finished"], fromFinished);
	return toObject;
}
function liveServerContentFromMldev(apiClient, fromObject) {
	const toObject = {};
	const fromModelTurn = getValueByPath(fromObject, ["modelTurn"]);
	if (fromModelTurn != null) setValueByPath(toObject, ["modelTurn"], contentFromMldev$1(apiClient, fromModelTurn));
	const fromTurnComplete = getValueByPath(fromObject, ["turnComplete"]);
	if (fromTurnComplete != null) setValueByPath(toObject, ["turnComplete"], fromTurnComplete);
	const fromInterrupted = getValueByPath(fromObject, ["interrupted"]);
	if (fromInterrupted != null) setValueByPath(toObject, ["interrupted"], fromInterrupted);
	const fromGenerationComplete = getValueByPath(fromObject, ["generationComplete"]);
	if (fromGenerationComplete != null) setValueByPath(toObject, ["generationComplete"], fromGenerationComplete);
	const fromInputTranscription = getValueByPath(fromObject, ["inputTranscription"]);
	if (fromInputTranscription != null) setValueByPath(toObject, ["inputTranscription"], transcriptionFromMldev(apiClient, fromInputTranscription));
	const fromOutputTranscription = getValueByPath(fromObject, ["outputTranscription"]);
	if (fromOutputTranscription != null) setValueByPath(toObject, ["outputTranscription"], transcriptionFromMldev(apiClient, fromOutputTranscription));
	return toObject;
}
function liveServerContentFromVertex(apiClient, fromObject) {
	const toObject = {};
	const fromModelTurn = getValueByPath(fromObject, ["modelTurn"]);
	if (fromModelTurn != null) setValueByPath(toObject, ["modelTurn"], contentFromVertex$1(apiClient, fromModelTurn));
	const fromTurnComplete = getValueByPath(fromObject, ["turnComplete"]);
	if (fromTurnComplete != null) setValueByPath(toObject, ["turnComplete"], fromTurnComplete);
	const fromInterrupted = getValueByPath(fromObject, ["interrupted"]);
	if (fromInterrupted != null) setValueByPath(toObject, ["interrupted"], fromInterrupted);
	const fromGenerationComplete = getValueByPath(fromObject, ["generationComplete"]);
	if (fromGenerationComplete != null) setValueByPath(toObject, ["generationComplete"], fromGenerationComplete);
	const fromInputTranscription = getValueByPath(fromObject, ["inputTranscription"]);
	if (fromInputTranscription != null) setValueByPath(toObject, ["inputTranscription"], transcriptionFromVertex(apiClient, fromInputTranscription));
	const fromOutputTranscription = getValueByPath(fromObject, ["outputTranscription"]);
	if (fromOutputTranscription != null) setValueByPath(toObject, ["outputTranscription"], transcriptionFromVertex(apiClient, fromOutputTranscription));
	return toObject;
}
function functionCallFromMldev(apiClient, fromObject) {
	const toObject = {};
	const fromId = getValueByPath(fromObject, ["id"]);
	if (fromId != null) setValueByPath(toObject, ["id"], fromId);
	const fromArgs = getValueByPath(fromObject, ["args"]);
	if (fromArgs != null) setValueByPath(toObject, ["args"], fromArgs);
	const fromName = getValueByPath(fromObject, ["name"]);
	if (fromName != null) setValueByPath(toObject, ["name"], fromName);
	return toObject;
}
function functionCallFromVertex(apiClient, fromObject) {
	const toObject = {};
	const fromArgs = getValueByPath(fromObject, ["args"]);
	if (fromArgs != null) setValueByPath(toObject, ["args"], fromArgs);
	const fromName = getValueByPath(fromObject, ["name"]);
	if (fromName != null) setValueByPath(toObject, ["name"], fromName);
	return toObject;
}
function liveServerToolCallFromMldev(apiClient, fromObject) {
	const toObject = {};
	const fromFunctionCalls = getValueByPath(fromObject, ["functionCalls"]);
	if (fromFunctionCalls != null) if (Array.isArray(fromFunctionCalls)) setValueByPath(toObject, ["functionCalls"], fromFunctionCalls.map((item) => {
		return functionCallFromMldev(apiClient, item);
	}));
	else setValueByPath(toObject, ["functionCalls"], fromFunctionCalls);
	return toObject;
}
function liveServerToolCallFromVertex(apiClient, fromObject) {
	const toObject = {};
	const fromFunctionCalls = getValueByPath(fromObject, ["functionCalls"]);
	if (fromFunctionCalls != null) if (Array.isArray(fromFunctionCalls)) setValueByPath(toObject, ["functionCalls"], fromFunctionCalls.map((item) => {
		return functionCallFromVertex(apiClient, item);
	}));
	else setValueByPath(toObject, ["functionCalls"], fromFunctionCalls);
	return toObject;
}
function liveServerToolCallCancellationFromMldev(apiClient, fromObject) {
	const toObject = {};
	const fromIds = getValueByPath(fromObject, ["ids"]);
	if (fromIds != null) setValueByPath(toObject, ["ids"], fromIds);
	return toObject;
}
function liveServerToolCallCancellationFromVertex(apiClient, fromObject) {
	const toObject = {};
	const fromIds = getValueByPath(fromObject, ["ids"]);
	if (fromIds != null) setValueByPath(toObject, ["ids"], fromIds);
	return toObject;
}
function modalityTokenCountFromMldev(apiClient, fromObject) {
	const toObject = {};
	const fromModality = getValueByPath(fromObject, ["modality"]);
	if (fromModality != null) setValueByPath(toObject, ["modality"], fromModality);
	const fromTokenCount = getValueByPath(fromObject, ["tokenCount"]);
	if (fromTokenCount != null) setValueByPath(toObject, ["tokenCount"], fromTokenCount);
	return toObject;
}
function modalityTokenCountFromVertex(apiClient, fromObject) {
	const toObject = {};
	const fromModality = getValueByPath(fromObject, ["modality"]);
	if (fromModality != null) setValueByPath(toObject, ["modality"], fromModality);
	const fromTokenCount = getValueByPath(fromObject, ["tokenCount"]);
	if (fromTokenCount != null) setValueByPath(toObject, ["tokenCount"], fromTokenCount);
	return toObject;
}
function usageMetadataFromMldev(apiClient, fromObject) {
	const toObject = {};
	const fromPromptTokenCount = getValueByPath(fromObject, ["promptTokenCount"]);
	if (fromPromptTokenCount != null) setValueByPath(toObject, ["promptTokenCount"], fromPromptTokenCount);
	const fromCachedContentTokenCount = getValueByPath(fromObject, ["cachedContentTokenCount"]);
	if (fromCachedContentTokenCount != null) setValueByPath(toObject, ["cachedContentTokenCount"], fromCachedContentTokenCount);
	const fromResponseTokenCount = getValueByPath(fromObject, ["responseTokenCount"]);
	if (fromResponseTokenCount != null) setValueByPath(toObject, ["responseTokenCount"], fromResponseTokenCount);
	const fromToolUsePromptTokenCount = getValueByPath(fromObject, ["toolUsePromptTokenCount"]);
	if (fromToolUsePromptTokenCount != null) setValueByPath(toObject, ["toolUsePromptTokenCount"], fromToolUsePromptTokenCount);
	const fromThoughtsTokenCount = getValueByPath(fromObject, ["thoughtsTokenCount"]);
	if (fromThoughtsTokenCount != null) setValueByPath(toObject, ["thoughtsTokenCount"], fromThoughtsTokenCount);
	const fromTotalTokenCount = getValueByPath(fromObject, ["totalTokenCount"]);
	if (fromTotalTokenCount != null) setValueByPath(toObject, ["totalTokenCount"], fromTotalTokenCount);
	const fromPromptTokensDetails = getValueByPath(fromObject, ["promptTokensDetails"]);
	if (fromPromptTokensDetails != null) if (Array.isArray(fromPromptTokensDetails)) setValueByPath(toObject, ["promptTokensDetails"], fromPromptTokensDetails.map((item) => {
		return modalityTokenCountFromMldev(apiClient, item);
	}));
	else setValueByPath(toObject, ["promptTokensDetails"], fromPromptTokensDetails);
	const fromCacheTokensDetails = getValueByPath(fromObject, ["cacheTokensDetails"]);
	if (fromCacheTokensDetails != null) if (Array.isArray(fromCacheTokensDetails)) setValueByPath(toObject, ["cacheTokensDetails"], fromCacheTokensDetails.map((item) => {
		return modalityTokenCountFromMldev(apiClient, item);
	}));
	else setValueByPath(toObject, ["cacheTokensDetails"], fromCacheTokensDetails);
	const fromResponseTokensDetails = getValueByPath(fromObject, ["responseTokensDetails"]);
	if (fromResponseTokensDetails != null) if (Array.isArray(fromResponseTokensDetails)) setValueByPath(toObject, ["responseTokensDetails"], fromResponseTokensDetails.map((item) => {
		return modalityTokenCountFromMldev(apiClient, item);
	}));
	else setValueByPath(toObject, ["responseTokensDetails"], fromResponseTokensDetails);
	const fromToolUsePromptTokensDetails = getValueByPath(fromObject, ["toolUsePromptTokensDetails"]);
	if (fromToolUsePromptTokensDetails != null) if (Array.isArray(fromToolUsePromptTokensDetails)) setValueByPath(toObject, ["toolUsePromptTokensDetails"], fromToolUsePromptTokensDetails.map((item) => {
		return modalityTokenCountFromMldev(apiClient, item);
	}));
	else setValueByPath(toObject, ["toolUsePromptTokensDetails"], fromToolUsePromptTokensDetails);
	return toObject;
}
function usageMetadataFromVertex(apiClient, fromObject) {
	const toObject = {};
	const fromPromptTokenCount = getValueByPath(fromObject, ["promptTokenCount"]);
	if (fromPromptTokenCount != null) setValueByPath(toObject, ["promptTokenCount"], fromPromptTokenCount);
	const fromCachedContentTokenCount = getValueByPath(fromObject, ["cachedContentTokenCount"]);
	if (fromCachedContentTokenCount != null) setValueByPath(toObject, ["cachedContentTokenCount"], fromCachedContentTokenCount);
	const fromResponseTokenCount = getValueByPath(fromObject, ["candidatesTokenCount"]);
	if (fromResponseTokenCount != null) setValueByPath(toObject, ["responseTokenCount"], fromResponseTokenCount);
	const fromToolUsePromptTokenCount = getValueByPath(fromObject, ["toolUsePromptTokenCount"]);
	if (fromToolUsePromptTokenCount != null) setValueByPath(toObject, ["toolUsePromptTokenCount"], fromToolUsePromptTokenCount);
	const fromThoughtsTokenCount = getValueByPath(fromObject, ["thoughtsTokenCount"]);
	if (fromThoughtsTokenCount != null) setValueByPath(toObject, ["thoughtsTokenCount"], fromThoughtsTokenCount);
	const fromTotalTokenCount = getValueByPath(fromObject, ["totalTokenCount"]);
	if (fromTotalTokenCount != null) setValueByPath(toObject, ["totalTokenCount"], fromTotalTokenCount);
	const fromPromptTokensDetails = getValueByPath(fromObject, ["promptTokensDetails"]);
	if (fromPromptTokensDetails != null) if (Array.isArray(fromPromptTokensDetails)) setValueByPath(toObject, ["promptTokensDetails"], fromPromptTokensDetails.map((item) => {
		return modalityTokenCountFromVertex(apiClient, item);
	}));
	else setValueByPath(toObject, ["promptTokensDetails"], fromPromptTokensDetails);
	const fromCacheTokensDetails = getValueByPath(fromObject, ["cacheTokensDetails"]);
	if (fromCacheTokensDetails != null) if (Array.isArray(fromCacheTokensDetails)) setValueByPath(toObject, ["cacheTokensDetails"], fromCacheTokensDetails.map((item) => {
		return modalityTokenCountFromVertex(apiClient, item);
	}));
	else setValueByPath(toObject, ["cacheTokensDetails"], fromCacheTokensDetails);
	const fromResponseTokensDetails = getValueByPath(fromObject, ["candidatesTokensDetails"]);
	if (fromResponseTokensDetails != null) if (Array.isArray(fromResponseTokensDetails)) setValueByPath(toObject, ["responseTokensDetails"], fromResponseTokensDetails.map((item) => {
		return modalityTokenCountFromVertex(apiClient, item);
	}));
	else setValueByPath(toObject, ["responseTokensDetails"], fromResponseTokensDetails);
	const fromToolUsePromptTokensDetails = getValueByPath(fromObject, ["toolUsePromptTokensDetails"]);
	if (fromToolUsePromptTokensDetails != null) if (Array.isArray(fromToolUsePromptTokensDetails)) setValueByPath(toObject, ["toolUsePromptTokensDetails"], fromToolUsePromptTokensDetails.map((item) => {
		return modalityTokenCountFromVertex(apiClient, item);
	}));
	else setValueByPath(toObject, ["toolUsePromptTokensDetails"], fromToolUsePromptTokensDetails);
	const fromTrafficType = getValueByPath(fromObject, ["trafficType"]);
	if (fromTrafficType != null) setValueByPath(toObject, ["trafficType"], fromTrafficType);
	return toObject;
}
function liveServerGoAwayFromMldev(apiClient, fromObject) {
	const toObject = {};
	const fromTimeLeft = getValueByPath(fromObject, ["timeLeft"]);
	if (fromTimeLeft != null) setValueByPath(toObject, ["timeLeft"], fromTimeLeft);
	return toObject;
}
function liveServerGoAwayFromVertex(apiClient, fromObject) {
	const toObject = {};
	const fromTimeLeft = getValueByPath(fromObject, ["timeLeft"]);
	if (fromTimeLeft != null) setValueByPath(toObject, ["timeLeft"], fromTimeLeft);
	return toObject;
}
function liveServerSessionResumptionUpdateFromMldev(apiClient, fromObject) {
	const toObject = {};
	const fromNewHandle = getValueByPath(fromObject, ["newHandle"]);
	if (fromNewHandle != null) setValueByPath(toObject, ["newHandle"], fromNewHandle);
	const fromResumable = getValueByPath(fromObject, ["resumable"]);
	if (fromResumable != null) setValueByPath(toObject, ["resumable"], fromResumable);
	const fromLastConsumedClientMessageIndex = getValueByPath(fromObject, ["lastConsumedClientMessageIndex"]);
	if (fromLastConsumedClientMessageIndex != null) setValueByPath(toObject, ["lastConsumedClientMessageIndex"], fromLastConsumedClientMessageIndex);
	return toObject;
}
function liveServerSessionResumptionUpdateFromVertex(apiClient, fromObject) {
	const toObject = {};
	const fromNewHandle = getValueByPath(fromObject, ["newHandle"]);
	if (fromNewHandle != null) setValueByPath(toObject, ["newHandle"], fromNewHandle);
	const fromResumable = getValueByPath(fromObject, ["resumable"]);
	if (fromResumable != null) setValueByPath(toObject, ["resumable"], fromResumable);
	const fromLastConsumedClientMessageIndex = getValueByPath(fromObject, ["lastConsumedClientMessageIndex"]);
	if (fromLastConsumedClientMessageIndex != null) setValueByPath(toObject, ["lastConsumedClientMessageIndex"], fromLastConsumedClientMessageIndex);
	return toObject;
}
function liveServerMessageFromMldev(apiClient, fromObject) {
	const toObject = {};
	const fromSetupComplete = getValueByPath(fromObject, ["setupComplete"]);
	if (fromSetupComplete != null) setValueByPath(toObject, ["setupComplete"], liveServerSetupCompleteFromMldev());
	const fromServerContent = getValueByPath(fromObject, ["serverContent"]);
	if (fromServerContent != null) setValueByPath(toObject, ["serverContent"], liveServerContentFromMldev(apiClient, fromServerContent));
	const fromToolCall = getValueByPath(fromObject, ["toolCall"]);
	if (fromToolCall != null) setValueByPath(toObject, ["toolCall"], liveServerToolCallFromMldev(apiClient, fromToolCall));
	const fromToolCallCancellation = getValueByPath(fromObject, ["toolCallCancellation"]);
	if (fromToolCallCancellation != null) setValueByPath(toObject, ["toolCallCancellation"], liveServerToolCallCancellationFromMldev(apiClient, fromToolCallCancellation));
	const fromUsageMetadata = getValueByPath(fromObject, ["usageMetadata"]);
	if (fromUsageMetadata != null) setValueByPath(toObject, ["usageMetadata"], usageMetadataFromMldev(apiClient, fromUsageMetadata));
	const fromGoAway = getValueByPath(fromObject, ["goAway"]);
	if (fromGoAway != null) setValueByPath(toObject, ["goAway"], liveServerGoAwayFromMldev(apiClient, fromGoAway));
	const fromSessionResumptionUpdate = getValueByPath(fromObject, ["sessionResumptionUpdate"]);
	if (fromSessionResumptionUpdate != null) setValueByPath(toObject, ["sessionResumptionUpdate"], liveServerSessionResumptionUpdateFromMldev(apiClient, fromSessionResumptionUpdate));
	return toObject;
}
function liveServerMessageFromVertex(apiClient, fromObject) {
	const toObject = {};
	const fromSetupComplete = getValueByPath(fromObject, ["setupComplete"]);
	if (fromSetupComplete != null) setValueByPath(toObject, ["setupComplete"], liveServerSetupCompleteFromVertex());
	const fromServerContent = getValueByPath(fromObject, ["serverContent"]);
	if (fromServerContent != null) setValueByPath(toObject, ["serverContent"], liveServerContentFromVertex(apiClient, fromServerContent));
	const fromToolCall = getValueByPath(fromObject, ["toolCall"]);
	if (fromToolCall != null) setValueByPath(toObject, ["toolCall"], liveServerToolCallFromVertex(apiClient, fromToolCall));
	const fromToolCallCancellation = getValueByPath(fromObject, ["toolCallCancellation"]);
	if (fromToolCallCancellation != null) setValueByPath(toObject, ["toolCallCancellation"], liveServerToolCallCancellationFromVertex(apiClient, fromToolCallCancellation));
	const fromUsageMetadata = getValueByPath(fromObject, ["usageMetadata"]);
	if (fromUsageMetadata != null) setValueByPath(toObject, ["usageMetadata"], usageMetadataFromVertex(apiClient, fromUsageMetadata));
	const fromGoAway = getValueByPath(fromObject, ["goAway"]);
	if (fromGoAway != null) setValueByPath(toObject, ["goAway"], liveServerGoAwayFromVertex(apiClient, fromGoAway));
	const fromSessionResumptionUpdate = getValueByPath(fromObject, ["sessionResumptionUpdate"]);
	if (fromSessionResumptionUpdate != null) setValueByPath(toObject, ["sessionResumptionUpdate"], liveServerSessionResumptionUpdateFromVertex(apiClient, fromSessionResumptionUpdate));
	return toObject;
}
/**
* @license
* Copyright 2025 Google LLC
* SPDX-License-Identifier: Apache-2.0
*/
function partToMldev(apiClient, fromObject) {
	const toObject = {};
	if (getValueByPath(fromObject, ["videoMetadata"]) !== void 0) throw new Error("videoMetadata parameter is not supported in Gemini API.");
	const fromThought = getValueByPath(fromObject, ["thought"]);
	if (fromThought != null) setValueByPath(toObject, ["thought"], fromThought);
	const fromCodeExecutionResult = getValueByPath(fromObject, ["codeExecutionResult"]);
	if (fromCodeExecutionResult != null) setValueByPath(toObject, ["codeExecutionResult"], fromCodeExecutionResult);
	const fromExecutableCode = getValueByPath(fromObject, ["executableCode"]);
	if (fromExecutableCode != null) setValueByPath(toObject, ["executableCode"], fromExecutableCode);
	const fromFileData = getValueByPath(fromObject, ["fileData"]);
	if (fromFileData != null) setValueByPath(toObject, ["fileData"], fromFileData);
	const fromFunctionCall = getValueByPath(fromObject, ["functionCall"]);
	if (fromFunctionCall != null) setValueByPath(toObject, ["functionCall"], fromFunctionCall);
	const fromFunctionResponse = getValueByPath(fromObject, ["functionResponse"]);
	if (fromFunctionResponse != null) setValueByPath(toObject, ["functionResponse"], fromFunctionResponse);
	const fromInlineData = getValueByPath(fromObject, ["inlineData"]);
	if (fromInlineData != null) setValueByPath(toObject, ["inlineData"], fromInlineData);
	const fromText = getValueByPath(fromObject, ["text"]);
	if (fromText != null) setValueByPath(toObject, ["text"], fromText);
	return toObject;
}
function contentToMldev(apiClient, fromObject) {
	const toObject = {};
	const fromParts = getValueByPath(fromObject, ["parts"]);
	if (fromParts != null) if (Array.isArray(fromParts)) setValueByPath(toObject, ["parts"], fromParts.map((item) => {
		return partToMldev(apiClient, item);
	}));
	else setValueByPath(toObject, ["parts"], fromParts);
	const fromRole = getValueByPath(fromObject, ["role"]);
	if (fromRole != null) setValueByPath(toObject, ["role"], fromRole);
	return toObject;
}
function schemaToMldev(apiClient, fromObject) {
	const toObject = {};
	if (getValueByPath(fromObject, ["example"]) !== void 0) throw new Error("example parameter is not supported in Gemini API.");
	if (getValueByPath(fromObject, ["pattern"]) !== void 0) throw new Error("pattern parameter is not supported in Gemini API.");
	if (getValueByPath(fromObject, ["default"]) !== void 0) throw new Error("default parameter is not supported in Gemini API.");
	if (getValueByPath(fromObject, ["maxLength"]) !== void 0) throw new Error("maxLength parameter is not supported in Gemini API.");
	if (getValueByPath(fromObject, ["minLength"]) !== void 0) throw new Error("minLength parameter is not supported in Gemini API.");
	if (getValueByPath(fromObject, ["minProperties"]) !== void 0) throw new Error("minProperties parameter is not supported in Gemini API.");
	if (getValueByPath(fromObject, ["maxProperties"]) !== void 0) throw new Error("maxProperties parameter is not supported in Gemini API.");
	const fromAnyOf = getValueByPath(fromObject, ["anyOf"]);
	if (fromAnyOf != null) setValueByPath(toObject, ["anyOf"], fromAnyOf);
	const fromDescription = getValueByPath(fromObject, ["description"]);
	if (fromDescription != null) setValueByPath(toObject, ["description"], fromDescription);
	const fromEnum = getValueByPath(fromObject, ["enum"]);
	if (fromEnum != null) setValueByPath(toObject, ["enum"], fromEnum);
	const fromFormat = getValueByPath(fromObject, ["format"]);
	if (fromFormat != null) setValueByPath(toObject, ["format"], fromFormat);
	const fromItems = getValueByPath(fromObject, ["items"]);
	if (fromItems != null) setValueByPath(toObject, ["items"], fromItems);
	const fromMaxItems = getValueByPath(fromObject, ["maxItems"]);
	if (fromMaxItems != null) setValueByPath(toObject, ["maxItems"], fromMaxItems);
	const fromMaximum = getValueByPath(fromObject, ["maximum"]);
	if (fromMaximum != null) setValueByPath(toObject, ["maximum"], fromMaximum);
	const fromMinItems = getValueByPath(fromObject, ["minItems"]);
	if (fromMinItems != null) setValueByPath(toObject, ["minItems"], fromMinItems);
	const fromMinimum = getValueByPath(fromObject, ["minimum"]);
	if (fromMinimum != null) setValueByPath(toObject, ["minimum"], fromMinimum);
	const fromNullable = getValueByPath(fromObject, ["nullable"]);
	if (fromNullable != null) setValueByPath(toObject, ["nullable"], fromNullable);
	const fromProperties = getValueByPath(fromObject, ["properties"]);
	if (fromProperties != null) setValueByPath(toObject, ["properties"], fromProperties);
	const fromPropertyOrdering = getValueByPath(fromObject, ["propertyOrdering"]);
	if (fromPropertyOrdering != null) setValueByPath(toObject, ["propertyOrdering"], fromPropertyOrdering);
	const fromRequired = getValueByPath(fromObject, ["required"]);
	if (fromRequired != null) setValueByPath(toObject, ["required"], fromRequired);
	const fromTitle = getValueByPath(fromObject, ["title"]);
	if (fromTitle != null) setValueByPath(toObject, ["title"], fromTitle);
	const fromType = getValueByPath(fromObject, ["type"]);
	if (fromType != null) setValueByPath(toObject, ["type"], fromType);
	return toObject;
}
function safetySettingToMldev(apiClient, fromObject) {
	const toObject = {};
	if (getValueByPath(fromObject, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
	const fromCategory = getValueByPath(fromObject, ["category"]);
	if (fromCategory != null) setValueByPath(toObject, ["category"], fromCategory);
	const fromThreshold = getValueByPath(fromObject, ["threshold"]);
	if (fromThreshold != null) setValueByPath(toObject, ["threshold"], fromThreshold);
	return toObject;
}
function functionDeclarationToMldev(apiClient, fromObject) {
	const toObject = {};
	if (getValueByPath(fromObject, ["response"]) !== void 0) throw new Error("response parameter is not supported in Gemini API.");
	const fromDescription = getValueByPath(fromObject, ["description"]);
	if (fromDescription != null) setValueByPath(toObject, ["description"], fromDescription);
	const fromName = getValueByPath(fromObject, ["name"]);
	if (fromName != null) setValueByPath(toObject, ["name"], fromName);
	const fromParameters = getValueByPath(fromObject, ["parameters"]);
	if (fromParameters != null) setValueByPath(toObject, ["parameters"], fromParameters);
	return toObject;
}
function googleSearchToMldev() {
	const toObject = {};
	return toObject;
}
function dynamicRetrievalConfigToMldev(apiClient, fromObject) {
	const toObject = {};
	const fromMode = getValueByPath(fromObject, ["mode"]);
	if (fromMode != null) setValueByPath(toObject, ["mode"], fromMode);
	const fromDynamicThreshold = getValueByPath(fromObject, ["dynamicThreshold"]);
	if (fromDynamicThreshold != null) setValueByPath(toObject, ["dynamicThreshold"], fromDynamicThreshold);
	return toObject;
}
function googleSearchRetrievalToMldev(apiClient, fromObject) {
	const toObject = {};
	const fromDynamicRetrievalConfig = getValueByPath(fromObject, ["dynamicRetrievalConfig"]);
	if (fromDynamicRetrievalConfig != null) setValueByPath(toObject, ["dynamicRetrievalConfig"], dynamicRetrievalConfigToMldev(apiClient, fromDynamicRetrievalConfig));
	return toObject;
}
function toolToMldev(apiClient, fromObject) {
	const toObject = {};
	const fromFunctionDeclarations = getValueByPath(fromObject, ["functionDeclarations"]);
	if (fromFunctionDeclarations != null) if (Array.isArray(fromFunctionDeclarations)) setValueByPath(toObject, ["functionDeclarations"], fromFunctionDeclarations.map((item) => {
		return functionDeclarationToMldev(apiClient, item);
	}));
	else setValueByPath(toObject, ["functionDeclarations"], fromFunctionDeclarations);
	if (getValueByPath(fromObject, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
	const fromGoogleSearch = getValueByPath(fromObject, ["googleSearch"]);
	if (fromGoogleSearch != null) setValueByPath(toObject, ["googleSearch"], googleSearchToMldev());
	const fromGoogleSearchRetrieval = getValueByPath(fromObject, ["googleSearchRetrieval"]);
	if (fromGoogleSearchRetrieval != null) setValueByPath(toObject, ["googleSearchRetrieval"], googleSearchRetrievalToMldev(apiClient, fromGoogleSearchRetrieval));
	const fromCodeExecution = getValueByPath(fromObject, ["codeExecution"]);
	if (fromCodeExecution != null) setValueByPath(toObject, ["codeExecution"], fromCodeExecution);
	return toObject;
}
function functionCallingConfigToMldev(apiClient, fromObject) {
	const toObject = {};
	const fromMode = getValueByPath(fromObject, ["mode"]);
	if (fromMode != null) setValueByPath(toObject, ["mode"], fromMode);
	const fromAllowedFunctionNames = getValueByPath(fromObject, ["allowedFunctionNames"]);
	if (fromAllowedFunctionNames != null) setValueByPath(toObject, ["allowedFunctionNames"], fromAllowedFunctionNames);
	return toObject;
}
function toolConfigToMldev(apiClient, fromObject) {
	const toObject = {};
	const fromFunctionCallingConfig = getValueByPath(fromObject, ["functionCallingConfig"]);
	if (fromFunctionCallingConfig != null) setValueByPath(toObject, ["functionCallingConfig"], functionCallingConfigToMldev(apiClient, fromFunctionCallingConfig));
	return toObject;
}
function prebuiltVoiceConfigToMldev(apiClient, fromObject) {
	const toObject = {};
	const fromVoiceName = getValueByPath(fromObject, ["voiceName"]);
	if (fromVoiceName != null) setValueByPath(toObject, ["voiceName"], fromVoiceName);
	return toObject;
}
function voiceConfigToMldev(apiClient, fromObject) {
	const toObject = {};
	const fromPrebuiltVoiceConfig = getValueByPath(fromObject, ["prebuiltVoiceConfig"]);
	if (fromPrebuiltVoiceConfig != null) setValueByPath(toObject, ["prebuiltVoiceConfig"], prebuiltVoiceConfigToMldev(apiClient, fromPrebuiltVoiceConfig));
	return toObject;
}
function speechConfigToMldev(apiClient, fromObject) {
	const toObject = {};
	const fromVoiceConfig = getValueByPath(fromObject, ["voiceConfig"]);
	if (fromVoiceConfig != null) setValueByPath(toObject, ["voiceConfig"], voiceConfigToMldev(apiClient, fromVoiceConfig));
	const fromLanguageCode = getValueByPath(fromObject, ["languageCode"]);
	if (fromLanguageCode != null) setValueByPath(toObject, ["languageCode"], fromLanguageCode);
	return toObject;
}
function thinkingConfigToMldev(apiClient, fromObject) {
	const toObject = {};
	const fromIncludeThoughts = getValueByPath(fromObject, ["includeThoughts"]);
	if (fromIncludeThoughts != null) setValueByPath(toObject, ["includeThoughts"], fromIncludeThoughts);
	const fromThinkingBudget = getValueByPath(fromObject, ["thinkingBudget"]);
	if (fromThinkingBudget != null) setValueByPath(toObject, ["thinkingBudget"], fromThinkingBudget);
	return toObject;
}
function generateContentConfigToMldev(apiClient, fromObject, parentObject) {
	const toObject = {};
	const fromSystemInstruction = getValueByPath(fromObject, ["systemInstruction"]);
	if (parentObject !== void 0 && fromSystemInstruction != null) setValueByPath(parentObject, ["systemInstruction"], contentToMldev(apiClient, tContent(apiClient, fromSystemInstruction)));
	const fromTemperature = getValueByPath(fromObject, ["temperature"]);
	if (fromTemperature != null) setValueByPath(toObject, ["temperature"], fromTemperature);
	const fromTopP = getValueByPath(fromObject, ["topP"]);
	if (fromTopP != null) setValueByPath(toObject, ["topP"], fromTopP);
	const fromTopK = getValueByPath(fromObject, ["topK"]);
	if (fromTopK != null) setValueByPath(toObject, ["topK"], fromTopK);
	const fromCandidateCount = getValueByPath(fromObject, ["candidateCount"]);
	if (fromCandidateCount != null) setValueByPath(toObject, ["candidateCount"], fromCandidateCount);
	const fromMaxOutputTokens = getValueByPath(fromObject, ["maxOutputTokens"]);
	if (fromMaxOutputTokens != null) setValueByPath(toObject, ["maxOutputTokens"], fromMaxOutputTokens);
	const fromStopSequences = getValueByPath(fromObject, ["stopSequences"]);
	if (fromStopSequences != null) setValueByPath(toObject, ["stopSequences"], fromStopSequences);
	const fromResponseLogprobs = getValueByPath(fromObject, ["responseLogprobs"]);
	if (fromResponseLogprobs != null) setValueByPath(toObject, ["responseLogprobs"], fromResponseLogprobs);
	const fromLogprobs = getValueByPath(fromObject, ["logprobs"]);
	if (fromLogprobs != null) setValueByPath(toObject, ["logprobs"], fromLogprobs);
	const fromPresencePenalty = getValueByPath(fromObject, ["presencePenalty"]);
	if (fromPresencePenalty != null) setValueByPath(toObject, ["presencePenalty"], fromPresencePenalty);
	const fromFrequencyPenalty = getValueByPath(fromObject, ["frequencyPenalty"]);
	if (fromFrequencyPenalty != null) setValueByPath(toObject, ["frequencyPenalty"], fromFrequencyPenalty);
	const fromSeed = getValueByPath(fromObject, ["seed"]);
	if (fromSeed != null) setValueByPath(toObject, ["seed"], fromSeed);
	const fromResponseMimeType = getValueByPath(fromObject, ["responseMimeType"]);
	if (fromResponseMimeType != null) setValueByPath(toObject, ["responseMimeType"], fromResponseMimeType);
	const fromResponseSchema = getValueByPath(fromObject, ["responseSchema"]);
	if (fromResponseSchema != null) setValueByPath(toObject, ["responseSchema"], schemaToMldev(apiClient, tSchema(apiClient, fromResponseSchema)));
	if (getValueByPath(fromObject, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
	if (getValueByPath(fromObject, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
	const fromSafetySettings = getValueByPath(fromObject, ["safetySettings"]);
	if (parentObject !== void 0 && fromSafetySettings != null) if (Array.isArray(fromSafetySettings)) setValueByPath(parentObject, ["safetySettings"], fromSafetySettings.map((item) => {
		return safetySettingToMldev(apiClient, item);
	}));
	else setValueByPath(parentObject, ["safetySettings"], fromSafetySettings);
	const fromTools = getValueByPath(fromObject, ["tools"]);
	if (parentObject !== void 0 && fromTools != null) if (Array.isArray(fromTools)) setValueByPath(parentObject, ["tools"], tTools(apiClient, tTools(apiClient, fromTools).map((item) => {
		return toolToMldev(apiClient, tTool(apiClient, item));
	})));
	else setValueByPath(parentObject, ["tools"], tTools(apiClient, fromTools));
	const fromToolConfig = getValueByPath(fromObject, ["toolConfig"]);
	if (parentObject !== void 0 && fromToolConfig != null) setValueByPath(parentObject, ["toolConfig"], toolConfigToMldev(apiClient, fromToolConfig));
	if (getValueByPath(fromObject, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
	const fromCachedContent = getValueByPath(fromObject, ["cachedContent"]);
	if (parentObject !== void 0 && fromCachedContent != null) setValueByPath(parentObject, ["cachedContent"], tCachedContentName(apiClient, fromCachedContent));
	const fromResponseModalities = getValueByPath(fromObject, ["responseModalities"]);
	if (fromResponseModalities != null) setValueByPath(toObject, ["responseModalities"], fromResponseModalities);
	const fromMediaResolution = getValueByPath(fromObject, ["mediaResolution"]);
	if (fromMediaResolution != null) setValueByPath(toObject, ["mediaResolution"], fromMediaResolution);
	const fromSpeechConfig = getValueByPath(fromObject, ["speechConfig"]);
	if (fromSpeechConfig != null) setValueByPath(toObject, ["speechConfig"], speechConfigToMldev(apiClient, tSpeechConfig(apiClient, fromSpeechConfig)));
	if (getValueByPath(fromObject, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
	const fromThinkingConfig = getValueByPath(fromObject, ["thinkingConfig"]);
	if (fromThinkingConfig != null) setValueByPath(toObject, ["thinkingConfig"], thinkingConfigToMldev(apiClient, fromThinkingConfig));
	return toObject;
}
function generateContentParametersToMldev(apiClient, fromObject) {
	const toObject = {};
	const fromModel = getValueByPath(fromObject, ["model"]);
	if (fromModel != null) setValueByPath(toObject, ["_url", "model"], tModel(apiClient, fromModel));
	const fromContents = getValueByPath(fromObject, ["contents"]);
	if (fromContents != null) if (Array.isArray(fromContents)) setValueByPath(toObject, ["contents"], tContents(apiClient, tContents(apiClient, fromContents).map((item) => {
		return contentToMldev(apiClient, item);
	})));
	else setValueByPath(toObject, ["contents"], tContents(apiClient, fromContents));
	const fromConfig = getValueByPath(fromObject, ["config"]);
	if (fromConfig != null) setValueByPath(toObject, ["generationConfig"], generateContentConfigToMldev(apiClient, fromConfig, toObject));
	return toObject;
}
function embedContentConfigToMldev(apiClient, fromObject, parentObject) {
	const toObject = {};
	const fromTaskType = getValueByPath(fromObject, ["taskType"]);
	if (parentObject !== void 0 && fromTaskType != null) setValueByPath(parentObject, ["requests[]", "taskType"], fromTaskType);
	const fromTitle = getValueByPath(fromObject, ["title"]);
	if (parentObject !== void 0 && fromTitle != null) setValueByPath(parentObject, ["requests[]", "title"], fromTitle);
	const fromOutputDimensionality = getValueByPath(fromObject, ["outputDimensionality"]);
	if (parentObject !== void 0 && fromOutputDimensionality != null) setValueByPath(parentObject, ["requests[]", "outputDimensionality"], fromOutputDimensionality);
	if (getValueByPath(fromObject, ["mimeType"]) !== void 0) throw new Error("mimeType parameter is not supported in Gemini API.");
	if (getValueByPath(fromObject, ["autoTruncate"]) !== void 0) throw new Error("autoTruncate parameter is not supported in Gemini API.");
	return toObject;
}
function embedContentParametersToMldev(apiClient, fromObject) {
	const toObject = {};
	const fromModel = getValueByPath(fromObject, ["model"]);
	if (fromModel != null) setValueByPath(toObject, ["_url", "model"], tModel(apiClient, fromModel));
	const fromContents = getValueByPath(fromObject, ["contents"]);
	if (fromContents != null) setValueByPath(toObject, ["requests[]", "content"], tContentsForEmbed(apiClient, fromContents));
	const fromConfig = getValueByPath(fromObject, ["config"]);
	if (fromConfig != null) setValueByPath(toObject, ["config"], embedContentConfigToMldev(apiClient, fromConfig, toObject));
	const fromModelForEmbedContent = getValueByPath(fromObject, ["model"]);
	if (fromModelForEmbedContent !== void 0) setValueByPath(toObject, ["requests[]", "model"], tModel(apiClient, fromModelForEmbedContent));
	return toObject;
}
function generateImagesConfigToMldev(apiClient, fromObject, parentObject) {
	const toObject = {};
	if (getValueByPath(fromObject, ["outputGcsUri"]) !== void 0) throw new Error("outputGcsUri parameter is not supported in Gemini API.");
	if (getValueByPath(fromObject, ["negativePrompt"]) !== void 0) throw new Error("negativePrompt parameter is not supported in Gemini API.");
	const fromNumberOfImages = getValueByPath(fromObject, ["numberOfImages"]);
	if (parentObject !== void 0 && fromNumberOfImages != null) setValueByPath(parentObject, ["parameters", "sampleCount"], fromNumberOfImages);
	const fromAspectRatio = getValueByPath(fromObject, ["aspectRatio"]);
	if (parentObject !== void 0 && fromAspectRatio != null) setValueByPath(parentObject, ["parameters", "aspectRatio"], fromAspectRatio);
	const fromGuidanceScale = getValueByPath(fromObject, ["guidanceScale"]);
	if (parentObject !== void 0 && fromGuidanceScale != null) setValueByPath(parentObject, ["parameters", "guidanceScale"], fromGuidanceScale);
	if (getValueByPath(fromObject, ["seed"]) !== void 0) throw new Error("seed parameter is not supported in Gemini API.");
	const fromSafetyFilterLevel = getValueByPath(fromObject, ["safetyFilterLevel"]);
	if (parentObject !== void 0 && fromSafetyFilterLevel != null) setValueByPath(parentObject, ["parameters", "safetySetting"], fromSafetyFilterLevel);
	const fromPersonGeneration = getValueByPath(fromObject, ["personGeneration"]);
	if (parentObject !== void 0 && fromPersonGeneration != null) setValueByPath(parentObject, ["parameters", "personGeneration"], fromPersonGeneration);
	const fromIncludeSafetyAttributes = getValueByPath(fromObject, ["includeSafetyAttributes"]);
	if (parentObject !== void 0 && fromIncludeSafetyAttributes != null) setValueByPath(parentObject, ["parameters", "includeSafetyAttributes"], fromIncludeSafetyAttributes);
	const fromIncludeRaiReason = getValueByPath(fromObject, ["includeRaiReason"]);
	if (parentObject !== void 0 && fromIncludeRaiReason != null) setValueByPath(parentObject, ["parameters", "includeRaiReason"], fromIncludeRaiReason);
	const fromLanguage = getValueByPath(fromObject, ["language"]);
	if (parentObject !== void 0 && fromLanguage != null) setValueByPath(parentObject, ["parameters", "language"], fromLanguage);
	const fromOutputMimeType = getValueByPath(fromObject, ["outputMimeType"]);
	if (parentObject !== void 0 && fromOutputMimeType != null) setValueByPath(parentObject, [
		"parameters",
		"outputOptions",
		"mimeType"
	], fromOutputMimeType);
	const fromOutputCompressionQuality = getValueByPath(fromObject, ["outputCompressionQuality"]);
	if (parentObject !== void 0 && fromOutputCompressionQuality != null) setValueByPath(parentObject, [
		"parameters",
		"outputOptions",
		"compressionQuality"
	], fromOutputCompressionQuality);
	if (getValueByPath(fromObject, ["addWatermark"]) !== void 0) throw new Error("addWatermark parameter is not supported in Gemini API.");
	if (getValueByPath(fromObject, ["enhancePrompt"]) !== void 0) throw new Error("enhancePrompt parameter is not supported in Gemini API.");
	return toObject;
}
function generateImagesParametersToMldev(apiClient, fromObject) {
	const toObject = {};
	const fromModel = getValueByPath(fromObject, ["model"]);
	if (fromModel != null) setValueByPath(toObject, ["_url", "model"], tModel(apiClient, fromModel));
	const fromPrompt = getValueByPath(fromObject, ["prompt"]);
	if (fromPrompt != null) setValueByPath(toObject, ["instances[0]", "prompt"], fromPrompt);
	const fromConfig = getValueByPath(fromObject, ["config"]);
	if (fromConfig != null) setValueByPath(toObject, ["config"], generateImagesConfigToMldev(apiClient, fromConfig, toObject));
	return toObject;
}
function getModelParametersToMldev(apiClient, fromObject) {
	const toObject = {};
	const fromModel = getValueByPath(fromObject, ["model"]);
	if (fromModel != null) setValueByPath(toObject, ["_url", "name"], tModel(apiClient, fromModel));
	const fromConfig = getValueByPath(fromObject, ["config"]);
	if (fromConfig != null) setValueByPath(toObject, ["config"], fromConfig);
	return toObject;
}
function countTokensConfigToMldev(apiClient, fromObject) {
	const toObject = {};
	if (getValueByPath(fromObject, ["systemInstruction"]) !== void 0) throw new Error("systemInstruction parameter is not supported in Gemini API.");
	if (getValueByPath(fromObject, ["tools"]) !== void 0) throw new Error("tools parameter is not supported in Gemini API.");
	if (getValueByPath(fromObject, ["generationConfig"]) !== void 0) throw new Error("generationConfig parameter is not supported in Gemini API.");
	return toObject;
}
function countTokensParametersToMldev(apiClient, fromObject) {
	const toObject = {};
	const fromModel = getValueByPath(fromObject, ["model"]);
	if (fromModel != null) setValueByPath(toObject, ["_url", "model"], tModel(apiClient, fromModel));
	const fromContents = getValueByPath(fromObject, ["contents"]);
	if (fromContents != null) if (Array.isArray(fromContents)) setValueByPath(toObject, ["contents"], tContents(apiClient, tContents(apiClient, fromContents).map((item) => {
		return contentToMldev(apiClient, item);
	})));
	else setValueByPath(toObject, ["contents"], tContents(apiClient, fromContents));
	const fromConfig = getValueByPath(fromObject, ["config"]);
	if (fromConfig != null) setValueByPath(toObject, ["config"], countTokensConfigToMldev(apiClient, fromConfig));
	return toObject;
}
function imageToMldev(apiClient, fromObject) {
	const toObject = {};
	if (getValueByPath(fromObject, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
	const fromImageBytes = getValueByPath(fromObject, ["imageBytes"]);
	if (fromImageBytes != null) setValueByPath(toObject, ["bytesBase64Encoded"], tBytes(apiClient, fromImageBytes));
	const fromMimeType = getValueByPath(fromObject, ["mimeType"]);
	if (fromMimeType != null) setValueByPath(toObject, ["mimeType"], fromMimeType);
	return toObject;
}
function generateVideosConfigToMldev(apiClient, fromObject, parentObject) {
	const toObject = {};
	const fromNumberOfVideos = getValueByPath(fromObject, ["numberOfVideos"]);
	if (parentObject !== void 0 && fromNumberOfVideos != null) setValueByPath(parentObject, ["parameters", "sampleCount"], fromNumberOfVideos);
	if (getValueByPath(fromObject, ["outputGcsUri"]) !== void 0) throw new Error("outputGcsUri parameter is not supported in Gemini API.");
	if (getValueByPath(fromObject, ["fps"]) !== void 0) throw new Error("fps parameter is not supported in Gemini API.");
	const fromDurationSeconds = getValueByPath(fromObject, ["durationSeconds"]);
	if (parentObject !== void 0 && fromDurationSeconds != null) setValueByPath(parentObject, ["parameters", "durationSeconds"], fromDurationSeconds);
	if (getValueByPath(fromObject, ["seed"]) !== void 0) throw new Error("seed parameter is not supported in Gemini API.");
	const fromAspectRatio = getValueByPath(fromObject, ["aspectRatio"]);
	if (parentObject !== void 0 && fromAspectRatio != null) setValueByPath(parentObject, ["parameters", "aspectRatio"], fromAspectRatio);
	if (getValueByPath(fromObject, ["resolution"]) !== void 0) throw new Error("resolution parameter is not supported in Gemini API.");
	const fromPersonGeneration = getValueByPath(fromObject, ["personGeneration"]);
	if (parentObject !== void 0 && fromPersonGeneration != null) setValueByPath(parentObject, ["parameters", "personGeneration"], fromPersonGeneration);
	if (getValueByPath(fromObject, ["pubsubTopic"]) !== void 0) throw new Error("pubsubTopic parameter is not supported in Gemini API.");
	const fromNegativePrompt = getValueByPath(fromObject, ["negativePrompt"]);
	if (parentObject !== void 0 && fromNegativePrompt != null) setValueByPath(parentObject, ["parameters", "negativePrompt"], fromNegativePrompt);
	if (getValueByPath(fromObject, ["enhancePrompt"]) !== void 0) throw new Error("enhancePrompt parameter is not supported in Gemini API.");
	return toObject;
}
function generateVideosParametersToMldev(apiClient, fromObject) {
	const toObject = {};
	const fromModel = getValueByPath(fromObject, ["model"]);
	if (fromModel != null) setValueByPath(toObject, ["_url", "model"], tModel(apiClient, fromModel));
	const fromPrompt = getValueByPath(fromObject, ["prompt"]);
	if (fromPrompt != null) setValueByPath(toObject, ["instances[0]", "prompt"], fromPrompt);
	const fromImage = getValueByPath(fromObject, ["image"]);
	if (fromImage != null) setValueByPath(toObject, ["instances[0]", "image"], imageToMldev(apiClient, fromImage));
	const fromConfig = getValueByPath(fromObject, ["config"]);
	if (fromConfig != null) setValueByPath(toObject, ["config"], generateVideosConfigToMldev(apiClient, fromConfig, toObject));
	return toObject;
}
function partToVertex(apiClient, fromObject) {
	const toObject = {};
	const fromVideoMetadata = getValueByPath(fromObject, ["videoMetadata"]);
	if (fromVideoMetadata != null) setValueByPath(toObject, ["videoMetadata"], fromVideoMetadata);
	const fromThought = getValueByPath(fromObject, ["thought"]);
	if (fromThought != null) setValueByPath(toObject, ["thought"], fromThought);
	const fromCodeExecutionResult = getValueByPath(fromObject, ["codeExecutionResult"]);
	if (fromCodeExecutionResult != null) setValueByPath(toObject, ["codeExecutionResult"], fromCodeExecutionResult);
	const fromExecutableCode = getValueByPath(fromObject, ["executableCode"]);
	if (fromExecutableCode != null) setValueByPath(toObject, ["executableCode"], fromExecutableCode);
	const fromFileData = getValueByPath(fromObject, ["fileData"]);
	if (fromFileData != null) setValueByPath(toObject, ["fileData"], fromFileData);
	const fromFunctionCall = getValueByPath(fromObject, ["functionCall"]);
	if (fromFunctionCall != null) setValueByPath(toObject, ["functionCall"], fromFunctionCall);
	const fromFunctionResponse = getValueByPath(fromObject, ["functionResponse"]);
	if (fromFunctionResponse != null) setValueByPath(toObject, ["functionResponse"], fromFunctionResponse);
	const fromInlineData = getValueByPath(fromObject, ["inlineData"]);
	if (fromInlineData != null) setValueByPath(toObject, ["inlineData"], fromInlineData);
	const fromText = getValueByPath(fromObject, ["text"]);
	if (fromText != null) setValueByPath(toObject, ["text"], fromText);
	return toObject;
}
function contentToVertex(apiClient, fromObject) {
	const toObject = {};
	const fromParts = getValueByPath(fromObject, ["parts"]);
	if (fromParts != null) if (Array.isArray(fromParts)) setValueByPath(toObject, ["parts"], fromParts.map((item) => {
		return partToVertex(apiClient, item);
	}));
	else setValueByPath(toObject, ["parts"], fromParts);
	const fromRole = getValueByPath(fromObject, ["role"]);
	if (fromRole != null) setValueByPath(toObject, ["role"], fromRole);
	return toObject;
}
function schemaToVertex(apiClient, fromObject) {
	const toObject = {};
	const fromExample = getValueByPath(fromObject, ["example"]);
	if (fromExample != null) setValueByPath(toObject, ["example"], fromExample);
	const fromPattern = getValueByPath(fromObject, ["pattern"]);
	if (fromPattern != null) setValueByPath(toObject, ["pattern"], fromPattern);
	const fromDefault = getValueByPath(fromObject, ["default"]);
	if (fromDefault != null) setValueByPath(toObject, ["default"], fromDefault);
	const fromMaxLength = getValueByPath(fromObject, ["maxLength"]);
	if (fromMaxLength != null) setValueByPath(toObject, ["maxLength"], fromMaxLength);
	const fromMinLength = getValueByPath(fromObject, ["minLength"]);
	if (fromMinLength != null) setValueByPath(toObject, ["minLength"], fromMinLength);
	const fromMinProperties = getValueByPath(fromObject, ["minProperties"]);
	if (fromMinProperties != null) setValueByPath(toObject, ["minProperties"], fromMinProperties);
	const fromMaxProperties = getValueByPath(fromObject, ["maxProperties"]);
	if (fromMaxProperties != null) setValueByPath(toObject, ["maxProperties"], fromMaxProperties);
	const fromAnyOf = getValueByPath(fromObject, ["anyOf"]);
	if (fromAnyOf != null) setValueByPath(toObject, ["anyOf"], fromAnyOf);
	const fromDescription = getValueByPath(fromObject, ["description"]);
	if (fromDescription != null) setValueByPath(toObject, ["description"], fromDescription);
	const fromEnum = getValueByPath(fromObject, ["enum"]);
	if (fromEnum != null) setValueByPath(toObject, ["enum"], fromEnum);
	const fromFormat = getValueByPath(fromObject, ["format"]);
	if (fromFormat != null) setValueByPath(toObject, ["format"], fromFormat);
	const fromItems = getValueByPath(fromObject, ["items"]);
	if (fromItems != null) setValueByPath(toObject, ["items"], fromItems);
	const fromMaxItems = getValueByPath(fromObject, ["maxItems"]);
	if (fromMaxItems != null) setValueByPath(toObject, ["maxItems"], fromMaxItems);
	const fromMaximum = getValueByPath(fromObject, ["maximum"]);
	if (fromMaximum != null) setValueByPath(toObject, ["maximum"], fromMaximum);
	const fromMinItems = getValueByPath(fromObject, ["minItems"]);
	if (fromMinItems != null) setValueByPath(toObject, ["minItems"], fromMinItems);
	const fromMinimum = getValueByPath(fromObject, ["minimum"]);
	if (fromMinimum != null) setValueByPath(toObject, ["minimum"], fromMinimum);
	const fromNullable = getValueByPath(fromObject, ["nullable"]);
	if (fromNullable != null) setValueByPath(toObject, ["nullable"], fromNullable);
	const fromProperties = getValueByPath(fromObject, ["properties"]);
	if (fromProperties != null) setValueByPath(toObject, ["properties"], fromProperties);
	const fromPropertyOrdering = getValueByPath(fromObject, ["propertyOrdering"]);
	if (fromPropertyOrdering != null) setValueByPath(toObject, ["propertyOrdering"], fromPropertyOrdering);
	const fromRequired = getValueByPath(fromObject, ["required"]);
	if (fromRequired != null) setValueByPath(toObject, ["required"], fromRequired);
	const fromTitle = getValueByPath(fromObject, ["title"]);
	if (fromTitle != null) setValueByPath(toObject, ["title"], fromTitle);
	const fromType = getValueByPath(fromObject, ["type"]);
	if (fromType != null) setValueByPath(toObject, ["type"], fromType);
	return toObject;
}
function modelSelectionConfigToVertex(apiClient, fromObject) {
	const toObject = {};
	const fromFeatureSelectionPreference = getValueByPath(fromObject, ["featureSelectionPreference"]);
	if (fromFeatureSelectionPreference != null) setValueByPath(toObject, ["featureSelectionPreference"], fromFeatureSelectionPreference);
	return toObject;
}
function safetySettingToVertex(apiClient, fromObject) {
	const toObject = {};
	const fromMethod = getValueByPath(fromObject, ["method"]);
	if (fromMethod != null) setValueByPath(toObject, ["method"], fromMethod);
	const fromCategory = getValueByPath(fromObject, ["category"]);
	if (fromCategory != null) setValueByPath(toObject, ["category"], fromCategory);
	const fromThreshold = getValueByPath(fromObject, ["threshold"]);
	if (fromThreshold != null) setValueByPath(toObject, ["threshold"], fromThreshold);
	return toObject;
}
function functionDeclarationToVertex(apiClient, fromObject) {
	const toObject = {};
	const fromResponse = getValueByPath(fromObject, ["response"]);
	if (fromResponse != null) setValueByPath(toObject, ["response"], schemaToVertex(apiClient, fromResponse));
	const fromDescription = getValueByPath(fromObject, ["description"]);
	if (fromDescription != null) setValueByPath(toObject, ["description"], fromDescription);
	const fromName = getValueByPath(fromObject, ["name"]);
	if (fromName != null) setValueByPath(toObject, ["name"], fromName);
	const fromParameters = getValueByPath(fromObject, ["parameters"]);
	if (fromParameters != null) setValueByPath(toObject, ["parameters"], fromParameters);
	return toObject;
}
function googleSearchToVertex() {
	const toObject = {};
	return toObject;
}
function dynamicRetrievalConfigToVertex(apiClient, fromObject) {
	const toObject = {};
	const fromMode = getValueByPath(fromObject, ["mode"]);
	if (fromMode != null) setValueByPath(toObject, ["mode"], fromMode);
	const fromDynamicThreshold = getValueByPath(fromObject, ["dynamicThreshold"]);
	if (fromDynamicThreshold != null) setValueByPath(toObject, ["dynamicThreshold"], fromDynamicThreshold);
	return toObject;
}
function googleSearchRetrievalToVertex(apiClient, fromObject) {
	const toObject = {};
	const fromDynamicRetrievalConfig = getValueByPath(fromObject, ["dynamicRetrievalConfig"]);
	if (fromDynamicRetrievalConfig != null) setValueByPath(toObject, ["dynamicRetrievalConfig"], dynamicRetrievalConfigToVertex(apiClient, fromDynamicRetrievalConfig));
	return toObject;
}
function toolToVertex(apiClient, fromObject) {
	const toObject = {};
	const fromFunctionDeclarations = getValueByPath(fromObject, ["functionDeclarations"]);
	if (fromFunctionDeclarations != null) if (Array.isArray(fromFunctionDeclarations)) setValueByPath(toObject, ["functionDeclarations"], fromFunctionDeclarations.map((item) => {
		return functionDeclarationToVertex(apiClient, item);
	}));
	else setValueByPath(toObject, ["functionDeclarations"], fromFunctionDeclarations);
	const fromRetrieval = getValueByPath(fromObject, ["retrieval"]);
	if (fromRetrieval != null) setValueByPath(toObject, ["retrieval"], fromRetrieval);
	const fromGoogleSearch = getValueByPath(fromObject, ["googleSearch"]);
	if (fromGoogleSearch != null) setValueByPath(toObject, ["googleSearch"], googleSearchToVertex());
	const fromGoogleSearchRetrieval = getValueByPath(fromObject, ["googleSearchRetrieval"]);
	if (fromGoogleSearchRetrieval != null) setValueByPath(toObject, ["googleSearchRetrieval"], googleSearchRetrievalToVertex(apiClient, fromGoogleSearchRetrieval));
	const fromCodeExecution = getValueByPath(fromObject, ["codeExecution"]);
	if (fromCodeExecution != null) setValueByPath(toObject, ["codeExecution"], fromCodeExecution);
	return toObject;
}
function functionCallingConfigToVertex(apiClient, fromObject) {
	const toObject = {};
	const fromMode = getValueByPath(fromObject, ["mode"]);
	if (fromMode != null) setValueByPath(toObject, ["mode"], fromMode);
	const fromAllowedFunctionNames = getValueByPath(fromObject, ["allowedFunctionNames"]);
	if (fromAllowedFunctionNames != null) setValueByPath(toObject, ["allowedFunctionNames"], fromAllowedFunctionNames);
	return toObject;
}
function toolConfigToVertex(apiClient, fromObject) {
	const toObject = {};
	const fromFunctionCallingConfig = getValueByPath(fromObject, ["functionCallingConfig"]);
	if (fromFunctionCallingConfig != null) setValueByPath(toObject, ["functionCallingConfig"], functionCallingConfigToVertex(apiClient, fromFunctionCallingConfig));
	return toObject;
}
function prebuiltVoiceConfigToVertex(apiClient, fromObject) {
	const toObject = {};
	const fromVoiceName = getValueByPath(fromObject, ["voiceName"]);
	if (fromVoiceName != null) setValueByPath(toObject, ["voiceName"], fromVoiceName);
	return toObject;
}
function voiceConfigToVertex(apiClient, fromObject) {
	const toObject = {};
	const fromPrebuiltVoiceConfig = getValueByPath(fromObject, ["prebuiltVoiceConfig"]);
	if (fromPrebuiltVoiceConfig != null) setValueByPath(toObject, ["prebuiltVoiceConfig"], prebuiltVoiceConfigToVertex(apiClient, fromPrebuiltVoiceConfig));
	return toObject;
}
function speechConfigToVertex(apiClient, fromObject) {
	const toObject = {};
	const fromVoiceConfig = getValueByPath(fromObject, ["voiceConfig"]);
	if (fromVoiceConfig != null) setValueByPath(toObject, ["voiceConfig"], voiceConfigToVertex(apiClient, fromVoiceConfig));
	const fromLanguageCode = getValueByPath(fromObject, ["languageCode"]);
	if (fromLanguageCode != null) setValueByPath(toObject, ["languageCode"], fromLanguageCode);
	return toObject;
}
function thinkingConfigToVertex(apiClient, fromObject) {
	const toObject = {};
	const fromIncludeThoughts = getValueByPath(fromObject, ["includeThoughts"]);
	if (fromIncludeThoughts != null) setValueByPath(toObject, ["includeThoughts"], fromIncludeThoughts);
	const fromThinkingBudget = getValueByPath(fromObject, ["thinkingBudget"]);
	if (fromThinkingBudget != null) setValueByPath(toObject, ["thinkingBudget"], fromThinkingBudget);
	return toObject;
}
function generateContentConfigToVertex(apiClient, fromObject, parentObject) {
	const toObject = {};
	const fromSystemInstruction = getValueByPath(fromObject, ["systemInstruction"]);
	if (parentObject !== void 0 && fromSystemInstruction != null) setValueByPath(parentObject, ["systemInstruction"], contentToVertex(apiClient, tContent(apiClient, fromSystemInstruction)));
	const fromTemperature = getValueByPath(fromObject, ["temperature"]);
	if (fromTemperature != null) setValueByPath(toObject, ["temperature"], fromTemperature);
	const fromTopP = getValueByPath(fromObject, ["topP"]);
	if (fromTopP != null) setValueByPath(toObject, ["topP"], fromTopP);
	const fromTopK = getValueByPath(fromObject, ["topK"]);
	if (fromTopK != null) setValueByPath(toObject, ["topK"], fromTopK);
	const fromCandidateCount = getValueByPath(fromObject, ["candidateCount"]);
	if (fromCandidateCount != null) setValueByPath(toObject, ["candidateCount"], fromCandidateCount);
	const fromMaxOutputTokens = getValueByPath(fromObject, ["maxOutputTokens"]);
	if (fromMaxOutputTokens != null) setValueByPath(toObject, ["maxOutputTokens"], fromMaxOutputTokens);
	const fromStopSequences = getValueByPath(fromObject, ["stopSequences"]);
	if (fromStopSequences != null) setValueByPath(toObject, ["stopSequences"], fromStopSequences);
	const fromResponseLogprobs = getValueByPath(fromObject, ["responseLogprobs"]);
	if (fromResponseLogprobs != null) setValueByPath(toObject, ["responseLogprobs"], fromResponseLogprobs);
	const fromLogprobs = getValueByPath(fromObject, ["logprobs"]);
	if (fromLogprobs != null) setValueByPath(toObject, ["logprobs"], fromLogprobs);
	const fromPresencePenalty = getValueByPath(fromObject, ["presencePenalty"]);
	if (fromPresencePenalty != null) setValueByPath(toObject, ["presencePenalty"], fromPresencePenalty);
	const fromFrequencyPenalty = getValueByPath(fromObject, ["frequencyPenalty"]);
	if (fromFrequencyPenalty != null) setValueByPath(toObject, ["frequencyPenalty"], fromFrequencyPenalty);
	const fromSeed = getValueByPath(fromObject, ["seed"]);
	if (fromSeed != null) setValueByPath(toObject, ["seed"], fromSeed);
	const fromResponseMimeType = getValueByPath(fromObject, ["responseMimeType"]);
	if (fromResponseMimeType != null) setValueByPath(toObject, ["responseMimeType"], fromResponseMimeType);
	const fromResponseSchema = getValueByPath(fromObject, ["responseSchema"]);
	if (fromResponseSchema != null) setValueByPath(toObject, ["responseSchema"], schemaToVertex(apiClient, tSchema(apiClient, fromResponseSchema)));
	const fromRoutingConfig = getValueByPath(fromObject, ["routingConfig"]);
	if (fromRoutingConfig != null) setValueByPath(toObject, ["routingConfig"], fromRoutingConfig);
	const fromModelSelectionConfig = getValueByPath(fromObject, ["modelSelectionConfig"]);
	if (fromModelSelectionConfig != null) setValueByPath(toObject, ["modelConfig"], modelSelectionConfigToVertex(apiClient, fromModelSelectionConfig));
	const fromSafetySettings = getValueByPath(fromObject, ["safetySettings"]);
	if (parentObject !== void 0 && fromSafetySettings != null) if (Array.isArray(fromSafetySettings)) setValueByPath(parentObject, ["safetySettings"], fromSafetySettings.map((item) => {
		return safetySettingToVertex(apiClient, item);
	}));
	else setValueByPath(parentObject, ["safetySettings"], fromSafetySettings);
	const fromTools = getValueByPath(fromObject, ["tools"]);
	if (parentObject !== void 0 && fromTools != null) if (Array.isArray(fromTools)) setValueByPath(parentObject, ["tools"], tTools(apiClient, tTools(apiClient, fromTools).map((item) => {
		return toolToVertex(apiClient, tTool(apiClient, item));
	})));
	else setValueByPath(parentObject, ["tools"], tTools(apiClient, fromTools));
	const fromToolConfig = getValueByPath(fromObject, ["toolConfig"]);
	if (parentObject !== void 0 && fromToolConfig != null) setValueByPath(parentObject, ["toolConfig"], toolConfigToVertex(apiClient, fromToolConfig));
	const fromLabels = getValueByPath(fromObject, ["labels"]);
	if (parentObject !== void 0 && fromLabels != null) setValueByPath(parentObject, ["labels"], fromLabels);
	const fromCachedContent = getValueByPath(fromObject, ["cachedContent"]);
	if (parentObject !== void 0 && fromCachedContent != null) setValueByPath(parentObject, ["cachedContent"], tCachedContentName(apiClient, fromCachedContent));
	const fromResponseModalities = getValueByPath(fromObject, ["responseModalities"]);
	if (fromResponseModalities != null) setValueByPath(toObject, ["responseModalities"], fromResponseModalities);
	const fromMediaResolution = getValueByPath(fromObject, ["mediaResolution"]);
	if (fromMediaResolution != null) setValueByPath(toObject, ["mediaResolution"], fromMediaResolution);
	const fromSpeechConfig = getValueByPath(fromObject, ["speechConfig"]);
	if (fromSpeechConfig != null) setValueByPath(toObject, ["speechConfig"], speechConfigToVertex(apiClient, tSpeechConfig(apiClient, fromSpeechConfig)));
	const fromAudioTimestamp = getValueByPath(fromObject, ["audioTimestamp"]);
	if (fromAudioTimestamp != null) setValueByPath(toObject, ["audioTimestamp"], fromAudioTimestamp);
	const fromThinkingConfig = getValueByPath(fromObject, ["thinkingConfig"]);
	if (fromThinkingConfig != null) setValueByPath(toObject, ["thinkingConfig"], thinkingConfigToVertex(apiClient, fromThinkingConfig));
	return toObject;
}
function generateContentParametersToVertex(apiClient, fromObject) {
	const toObject = {};
	const fromModel = getValueByPath(fromObject, ["model"]);
	if (fromModel != null) setValueByPath(toObject, ["_url", "model"], tModel(apiClient, fromModel));
	const fromContents = getValueByPath(fromObject, ["contents"]);
	if (fromContents != null) if (Array.isArray(fromContents)) setValueByPath(toObject, ["contents"], tContents(apiClient, tContents(apiClient, fromContents).map((item) => {
		return contentToVertex(apiClient, item);
	})));
	else setValueByPath(toObject, ["contents"], tContents(apiClient, fromContents));
	const fromConfig = getValueByPath(fromObject, ["config"]);
	if (fromConfig != null) setValueByPath(toObject, ["generationConfig"], generateContentConfigToVertex(apiClient, fromConfig, toObject));
	return toObject;
}
function embedContentConfigToVertex(apiClient, fromObject, parentObject) {
	const toObject = {};
	const fromTaskType = getValueByPath(fromObject, ["taskType"]);
	if (parentObject !== void 0 && fromTaskType != null) setValueByPath(parentObject, ["instances[]", "task_type"], fromTaskType);
	const fromTitle = getValueByPath(fromObject, ["title"]);
	if (parentObject !== void 0 && fromTitle != null) setValueByPath(parentObject, ["instances[]", "title"], fromTitle);
	const fromOutputDimensionality = getValueByPath(fromObject, ["outputDimensionality"]);
	if (parentObject !== void 0 && fromOutputDimensionality != null) setValueByPath(parentObject, ["parameters", "outputDimensionality"], fromOutputDimensionality);
	const fromMimeType = getValueByPath(fromObject, ["mimeType"]);
	if (parentObject !== void 0 && fromMimeType != null) setValueByPath(parentObject, ["instances[]", "mimeType"], fromMimeType);
	const fromAutoTruncate = getValueByPath(fromObject, ["autoTruncate"]);
	if (parentObject !== void 0 && fromAutoTruncate != null) setValueByPath(parentObject, ["parameters", "autoTruncate"], fromAutoTruncate);
	return toObject;
}
function embedContentParametersToVertex(apiClient, fromObject) {
	const toObject = {};
	const fromModel = getValueByPath(fromObject, ["model"]);
	if (fromModel != null) setValueByPath(toObject, ["_url", "model"], tModel(apiClient, fromModel));
	const fromContents = getValueByPath(fromObject, ["contents"]);
	if (fromContents != null) setValueByPath(toObject, ["instances[]", "content"], tContentsForEmbed(apiClient, fromContents));
	const fromConfig = getValueByPath(fromObject, ["config"]);
	if (fromConfig != null) setValueByPath(toObject, ["config"], embedContentConfigToVertex(apiClient, fromConfig, toObject));
	return toObject;
}
function generateImagesConfigToVertex(apiClient, fromObject, parentObject) {
	const toObject = {};
	const fromOutputGcsUri = getValueByPath(fromObject, ["outputGcsUri"]);
	if (parentObject !== void 0 && fromOutputGcsUri != null) setValueByPath(parentObject, ["parameters", "storageUri"], fromOutputGcsUri);
	const fromNegativePrompt = getValueByPath(fromObject, ["negativePrompt"]);
	if (parentObject !== void 0 && fromNegativePrompt != null) setValueByPath(parentObject, ["parameters", "negativePrompt"], fromNegativePrompt);
	const fromNumberOfImages = getValueByPath(fromObject, ["numberOfImages"]);
	if (parentObject !== void 0 && fromNumberOfImages != null) setValueByPath(parentObject, ["parameters", "sampleCount"], fromNumberOfImages);
	const fromAspectRatio = getValueByPath(fromObject, ["aspectRatio"]);
	if (parentObject !== void 0 && fromAspectRatio != null) setValueByPath(parentObject, ["parameters", "aspectRatio"], fromAspectRatio);
	const fromGuidanceScale = getValueByPath(fromObject, ["guidanceScale"]);
	if (parentObject !== void 0 && fromGuidanceScale != null) setValueByPath(parentObject, ["parameters", "guidanceScale"], fromGuidanceScale);
	const fromSeed = getValueByPath(fromObject, ["seed"]);
	if (parentObject !== void 0 && fromSeed != null) setValueByPath(parentObject, ["parameters", "seed"], fromSeed);
	const fromSafetyFilterLevel = getValueByPath(fromObject, ["safetyFilterLevel"]);
	if (parentObject !== void 0 && fromSafetyFilterLevel != null) setValueByPath(parentObject, ["parameters", "safetySetting"], fromSafetyFilterLevel);
	const fromPersonGeneration = getValueByPath(fromObject, ["personGeneration"]);
	if (parentObject !== void 0 && fromPersonGeneration != null) setValueByPath(parentObject, ["parameters", "personGeneration"], fromPersonGeneration);
	const fromIncludeSafetyAttributes = getValueByPath(fromObject, ["includeSafetyAttributes"]);
	if (parentObject !== void 0 && fromIncludeSafetyAttributes != null) setValueByPath(parentObject, ["parameters", "includeSafetyAttributes"], fromIncludeSafetyAttributes);
	const fromIncludeRaiReason = getValueByPath(fromObject, ["includeRaiReason"]);
	if (parentObject !== void 0 && fromIncludeRaiReason != null) setValueByPath(parentObject, ["parameters", "includeRaiReason"], fromIncludeRaiReason);
	const fromLanguage = getValueByPath(fromObject, ["language"]);
	if (parentObject !== void 0 && fromLanguage != null) setValueByPath(parentObject, ["parameters", "language"], fromLanguage);
	const fromOutputMimeType = getValueByPath(fromObject, ["outputMimeType"]);
	if (parentObject !== void 0 && fromOutputMimeType != null) setValueByPath(parentObject, [
		"parameters",
		"outputOptions",
		"mimeType"
	], fromOutputMimeType);
	const fromOutputCompressionQuality = getValueByPath(fromObject, ["outputCompressionQuality"]);
	if (parentObject !== void 0 && fromOutputCompressionQuality != null) setValueByPath(parentObject, [
		"parameters",
		"outputOptions",
		"compressionQuality"
	], fromOutputCompressionQuality);
	const fromAddWatermark = getValueByPath(fromObject, ["addWatermark"]);
	if (parentObject !== void 0 && fromAddWatermark != null) setValueByPath(parentObject, ["parameters", "addWatermark"], fromAddWatermark);
	const fromEnhancePrompt = getValueByPath(fromObject, ["enhancePrompt"]);
	if (parentObject !== void 0 && fromEnhancePrompt != null) setValueByPath(parentObject, ["parameters", "enhancePrompt"], fromEnhancePrompt);
	return toObject;
}
function generateImagesParametersToVertex(apiClient, fromObject) {
	const toObject = {};
	const fromModel = getValueByPath(fromObject, ["model"]);
	if (fromModel != null) setValueByPath(toObject, ["_url", "model"], tModel(apiClient, fromModel));
	const fromPrompt = getValueByPath(fromObject, ["prompt"]);
	if (fromPrompt != null) setValueByPath(toObject, ["instances[0]", "prompt"], fromPrompt);
	const fromConfig = getValueByPath(fromObject, ["config"]);
	if (fromConfig != null) setValueByPath(toObject, ["config"], generateImagesConfigToVertex(apiClient, fromConfig, toObject));
	return toObject;
}
function getModelParametersToVertex(apiClient, fromObject) {
	const toObject = {};
	const fromModel = getValueByPath(fromObject, ["model"]);
	if (fromModel != null) setValueByPath(toObject, ["_url", "name"], tModel(apiClient, fromModel));
	const fromConfig = getValueByPath(fromObject, ["config"]);
	if (fromConfig != null) setValueByPath(toObject, ["config"], fromConfig);
	return toObject;
}
function countTokensConfigToVertex(apiClient, fromObject, parentObject) {
	const toObject = {};
	const fromSystemInstruction = getValueByPath(fromObject, ["systemInstruction"]);
	if (parentObject !== void 0 && fromSystemInstruction != null) setValueByPath(parentObject, ["systemInstruction"], contentToVertex(apiClient, tContent(apiClient, fromSystemInstruction)));
	const fromTools = getValueByPath(fromObject, ["tools"]);
	if (parentObject !== void 0 && fromTools != null) if (Array.isArray(fromTools)) setValueByPath(parentObject, ["tools"], fromTools.map((item) => {
		return toolToVertex(apiClient, item);
	}));
	else setValueByPath(parentObject, ["tools"], fromTools);
	const fromGenerationConfig = getValueByPath(fromObject, ["generationConfig"]);
	if (parentObject !== void 0 && fromGenerationConfig != null) setValueByPath(parentObject, ["generationConfig"], fromGenerationConfig);
	return toObject;
}
function countTokensParametersToVertex(apiClient, fromObject) {
	const toObject = {};
	const fromModel = getValueByPath(fromObject, ["model"]);
	if (fromModel != null) setValueByPath(toObject, ["_url", "model"], tModel(apiClient, fromModel));
	const fromContents = getValueByPath(fromObject, ["contents"]);
	if (fromContents != null) if (Array.isArray(fromContents)) setValueByPath(toObject, ["contents"], tContents(apiClient, tContents(apiClient, fromContents).map((item) => {
		return contentToVertex(apiClient, item);
	})));
	else setValueByPath(toObject, ["contents"], tContents(apiClient, fromContents));
	const fromConfig = getValueByPath(fromObject, ["config"]);
	if (fromConfig != null) setValueByPath(toObject, ["config"], countTokensConfigToVertex(apiClient, fromConfig, toObject));
	return toObject;
}
function computeTokensParametersToVertex(apiClient, fromObject) {
	const toObject = {};
	const fromModel = getValueByPath(fromObject, ["model"]);
	if (fromModel != null) setValueByPath(toObject, ["_url", "model"], tModel(apiClient, fromModel));
	const fromContents = getValueByPath(fromObject, ["contents"]);
	if (fromContents != null) if (Array.isArray(fromContents)) setValueByPath(toObject, ["contents"], tContents(apiClient, tContents(apiClient, fromContents).map((item) => {
		return contentToVertex(apiClient, item);
	})));
	else setValueByPath(toObject, ["contents"], tContents(apiClient, fromContents));
	const fromConfig = getValueByPath(fromObject, ["config"]);
	if (fromConfig != null) setValueByPath(toObject, ["config"], fromConfig);
	return toObject;
}
function imageToVertex(apiClient, fromObject) {
	const toObject = {};
	const fromGcsUri = getValueByPath(fromObject, ["gcsUri"]);
	if (fromGcsUri != null) setValueByPath(toObject, ["gcsUri"], fromGcsUri);
	const fromImageBytes = getValueByPath(fromObject, ["imageBytes"]);
	if (fromImageBytes != null) setValueByPath(toObject, ["bytesBase64Encoded"], tBytes(apiClient, fromImageBytes));
	const fromMimeType = getValueByPath(fromObject, ["mimeType"]);
	if (fromMimeType != null) setValueByPath(toObject, ["mimeType"], fromMimeType);
	return toObject;
}
function generateVideosConfigToVertex(apiClient, fromObject, parentObject) {
	const toObject = {};
	const fromNumberOfVideos = getValueByPath(fromObject, ["numberOfVideos"]);
	if (parentObject !== void 0 && fromNumberOfVideos != null) setValueByPath(parentObject, ["parameters", "sampleCount"], fromNumberOfVideos);
	const fromOutputGcsUri = getValueByPath(fromObject, ["outputGcsUri"]);
	if (parentObject !== void 0 && fromOutputGcsUri != null) setValueByPath(parentObject, ["parameters", "storageUri"], fromOutputGcsUri);
	const fromFps = getValueByPath(fromObject, ["fps"]);
	if (parentObject !== void 0 && fromFps != null) setValueByPath(parentObject, ["parameters", "fps"], fromFps);
	const fromDurationSeconds = getValueByPath(fromObject, ["durationSeconds"]);
	if (parentObject !== void 0 && fromDurationSeconds != null) setValueByPath(parentObject, ["parameters", "durationSeconds"], fromDurationSeconds);
	const fromSeed = getValueByPath(fromObject, ["seed"]);
	if (parentObject !== void 0 && fromSeed != null) setValueByPath(parentObject, ["parameters", "seed"], fromSeed);
	const fromAspectRatio = getValueByPath(fromObject, ["aspectRatio"]);
	if (parentObject !== void 0 && fromAspectRatio != null) setValueByPath(parentObject, ["parameters", "aspectRatio"], fromAspectRatio);
	const fromResolution = getValueByPath(fromObject, ["resolution"]);
	if (parentObject !== void 0 && fromResolution != null) setValueByPath(parentObject, ["parameters", "resolution"], fromResolution);
	const fromPersonGeneration = getValueByPath(fromObject, ["personGeneration"]);
	if (parentObject !== void 0 && fromPersonGeneration != null) setValueByPath(parentObject, ["parameters", "personGeneration"], fromPersonGeneration);
	const fromPubsubTopic = getValueByPath(fromObject, ["pubsubTopic"]);
	if (parentObject !== void 0 && fromPubsubTopic != null) setValueByPath(parentObject, ["parameters", "pubsubTopic"], fromPubsubTopic);
	const fromNegativePrompt = getValueByPath(fromObject, ["negativePrompt"]);
	if (parentObject !== void 0 && fromNegativePrompt != null) setValueByPath(parentObject, ["parameters", "negativePrompt"], fromNegativePrompt);
	const fromEnhancePrompt = getValueByPath(fromObject, ["enhancePrompt"]);
	if (parentObject !== void 0 && fromEnhancePrompt != null) setValueByPath(parentObject, ["parameters", "enhancePrompt"], fromEnhancePrompt);
	return toObject;
}
function generateVideosParametersToVertex(apiClient, fromObject) {
	const toObject = {};
	const fromModel = getValueByPath(fromObject, ["model"]);
	if (fromModel != null) setValueByPath(toObject, ["_url", "model"], tModel(apiClient, fromModel));
	const fromPrompt = getValueByPath(fromObject, ["prompt"]);
	if (fromPrompt != null) setValueByPath(toObject, ["instances[0]", "prompt"], fromPrompt);
	const fromImage = getValueByPath(fromObject, ["image"]);
	if (fromImage != null) setValueByPath(toObject, ["instances[0]", "image"], imageToVertex(apiClient, fromImage));
	const fromConfig = getValueByPath(fromObject, ["config"]);
	if (fromConfig != null) setValueByPath(toObject, ["config"], generateVideosConfigToVertex(apiClient, fromConfig, toObject));
	return toObject;
}
function partFromMldev(apiClient, fromObject) {
	const toObject = {};
	const fromThought = getValueByPath(fromObject, ["thought"]);
	if (fromThought != null) setValueByPath(toObject, ["thought"], fromThought);
	const fromCodeExecutionResult = getValueByPath(fromObject, ["codeExecutionResult"]);
	if (fromCodeExecutionResult != null) setValueByPath(toObject, ["codeExecutionResult"], fromCodeExecutionResult);
	const fromExecutableCode = getValueByPath(fromObject, ["executableCode"]);
	if (fromExecutableCode != null) setValueByPath(toObject, ["executableCode"], fromExecutableCode);
	const fromFileData = getValueByPath(fromObject, ["fileData"]);
	if (fromFileData != null) setValueByPath(toObject, ["fileData"], fromFileData);
	const fromFunctionCall = getValueByPath(fromObject, ["functionCall"]);
	if (fromFunctionCall != null) setValueByPath(toObject, ["functionCall"], fromFunctionCall);
	const fromFunctionResponse = getValueByPath(fromObject, ["functionResponse"]);
	if (fromFunctionResponse != null) setValueByPath(toObject, ["functionResponse"], fromFunctionResponse);
	const fromInlineData = getValueByPath(fromObject, ["inlineData"]);
	if (fromInlineData != null) setValueByPath(toObject, ["inlineData"], fromInlineData);
	const fromText = getValueByPath(fromObject, ["text"]);
	if (fromText != null) setValueByPath(toObject, ["text"], fromText);
	return toObject;
}
function contentFromMldev(apiClient, fromObject) {
	const toObject = {};
	const fromParts = getValueByPath(fromObject, ["parts"]);
	if (fromParts != null) if (Array.isArray(fromParts)) setValueByPath(toObject, ["parts"], fromParts.map((item) => {
		return partFromMldev(apiClient, item);
	}));
	else setValueByPath(toObject, ["parts"], fromParts);
	const fromRole = getValueByPath(fromObject, ["role"]);
	if (fromRole != null) setValueByPath(toObject, ["role"], fromRole);
	return toObject;
}
function citationMetadataFromMldev(apiClient, fromObject) {
	const toObject = {};
	const fromCitations = getValueByPath(fromObject, ["citationSources"]);
	if (fromCitations != null) setValueByPath(toObject, ["citations"], fromCitations);
	return toObject;
}
function candidateFromMldev(apiClient, fromObject) {
	const toObject = {};
	const fromContent = getValueByPath(fromObject, ["content"]);
	if (fromContent != null) setValueByPath(toObject, ["content"], contentFromMldev(apiClient, fromContent));
	const fromCitationMetadata = getValueByPath(fromObject, ["citationMetadata"]);
	if (fromCitationMetadata != null) setValueByPath(toObject, ["citationMetadata"], citationMetadataFromMldev(apiClient, fromCitationMetadata));
	const fromTokenCount = getValueByPath(fromObject, ["tokenCount"]);
	if (fromTokenCount != null) setValueByPath(toObject, ["tokenCount"], fromTokenCount);
	const fromFinishReason = getValueByPath(fromObject, ["finishReason"]);
	if (fromFinishReason != null) setValueByPath(toObject, ["finishReason"], fromFinishReason);
	const fromAvgLogprobs = getValueByPath(fromObject, ["avgLogprobs"]);
	if (fromAvgLogprobs != null) setValueByPath(toObject, ["avgLogprobs"], fromAvgLogprobs);
	const fromGroundingMetadata = getValueByPath(fromObject, ["groundingMetadata"]);
	if (fromGroundingMetadata != null) setValueByPath(toObject, ["groundingMetadata"], fromGroundingMetadata);
	const fromIndex = getValueByPath(fromObject, ["index"]);
	if (fromIndex != null) setValueByPath(toObject, ["index"], fromIndex);
	const fromLogprobsResult = getValueByPath(fromObject, ["logprobsResult"]);
	if (fromLogprobsResult != null) setValueByPath(toObject, ["logprobsResult"], fromLogprobsResult);
	const fromSafetyRatings = getValueByPath(fromObject, ["safetyRatings"]);
	if (fromSafetyRatings != null) setValueByPath(toObject, ["safetyRatings"], fromSafetyRatings);
	return toObject;
}
function generateContentResponseFromMldev(apiClient, fromObject) {
	const toObject = {};
	const fromCandidates = getValueByPath(fromObject, ["candidates"]);
	if (fromCandidates != null) if (Array.isArray(fromCandidates)) setValueByPath(toObject, ["candidates"], fromCandidates.map((item) => {
		return candidateFromMldev(apiClient, item);
	}));
	else setValueByPath(toObject, ["candidates"], fromCandidates);
	const fromModelVersion = getValueByPath(fromObject, ["modelVersion"]);
	if (fromModelVersion != null) setValueByPath(toObject, ["modelVersion"], fromModelVersion);
	const fromPromptFeedback = getValueByPath(fromObject, ["promptFeedback"]);
	if (fromPromptFeedback != null) setValueByPath(toObject, ["promptFeedback"], fromPromptFeedback);
	const fromUsageMetadata = getValueByPath(fromObject, ["usageMetadata"]);
	if (fromUsageMetadata != null) setValueByPath(toObject, ["usageMetadata"], fromUsageMetadata);
	return toObject;
}
function contentEmbeddingFromMldev(apiClient, fromObject) {
	const toObject = {};
	const fromValues = getValueByPath(fromObject, ["values"]);
	if (fromValues != null) setValueByPath(toObject, ["values"], fromValues);
	return toObject;
}
function embedContentMetadataFromMldev() {
	const toObject = {};
	return toObject;
}
function embedContentResponseFromMldev(apiClient, fromObject) {
	const toObject = {};
	const fromEmbeddings = getValueByPath(fromObject, ["embeddings"]);
	if (fromEmbeddings != null) if (Array.isArray(fromEmbeddings)) setValueByPath(toObject, ["embeddings"], fromEmbeddings.map((item) => {
		return contentEmbeddingFromMldev(apiClient, item);
	}));
	else setValueByPath(toObject, ["embeddings"], fromEmbeddings);
	const fromMetadata = getValueByPath(fromObject, ["metadata"]);
	if (fromMetadata != null) setValueByPath(toObject, ["metadata"], embedContentMetadataFromMldev());
	return toObject;
}
function imageFromMldev(apiClient, fromObject) {
	const toObject = {};
	const fromImageBytes = getValueByPath(fromObject, ["bytesBase64Encoded"]);
	if (fromImageBytes != null) setValueByPath(toObject, ["imageBytes"], tBytes(apiClient, fromImageBytes));
	const fromMimeType = getValueByPath(fromObject, ["mimeType"]);
	if (fromMimeType != null) setValueByPath(toObject, ["mimeType"], fromMimeType);
	return toObject;
}
function safetyAttributesFromMldev(apiClient, fromObject) {
	const toObject = {};
	const fromCategories = getValueByPath(fromObject, ["safetyAttributes", "categories"]);
	if (fromCategories != null) setValueByPath(toObject, ["categories"], fromCategories);
	const fromScores = getValueByPath(fromObject, ["safetyAttributes", "scores"]);
	if (fromScores != null) setValueByPath(toObject, ["scores"], fromScores);
	const fromContentType = getValueByPath(fromObject, ["contentType"]);
	if (fromContentType != null) setValueByPath(toObject, ["contentType"], fromContentType);
	return toObject;
}
function generatedImageFromMldev(apiClient, fromObject) {
	const toObject = {};
	const fromImage = getValueByPath(fromObject, ["_self"]);
	if (fromImage != null) setValueByPath(toObject, ["image"], imageFromMldev(apiClient, fromImage));
	const fromRaiFilteredReason = getValueByPath(fromObject, ["raiFilteredReason"]);
	if (fromRaiFilteredReason != null) setValueByPath(toObject, ["raiFilteredReason"], fromRaiFilteredReason);
	const fromSafetyAttributes = getValueByPath(fromObject, ["_self"]);
	if (fromSafetyAttributes != null) setValueByPath(toObject, ["safetyAttributes"], safetyAttributesFromMldev(apiClient, fromSafetyAttributes));
	return toObject;
}
function generateImagesResponseFromMldev(apiClient, fromObject) {
	const toObject = {};
	const fromGeneratedImages = getValueByPath(fromObject, ["predictions"]);
	if (fromGeneratedImages != null) if (Array.isArray(fromGeneratedImages)) setValueByPath(toObject, ["generatedImages"], fromGeneratedImages.map((item) => {
		return generatedImageFromMldev(apiClient, item);
	}));
	else setValueByPath(toObject, ["generatedImages"], fromGeneratedImages);
	const fromPositivePromptSafetyAttributes = getValueByPath(fromObject, ["positivePromptSafetyAttributes"]);
	if (fromPositivePromptSafetyAttributes != null) setValueByPath(toObject, ["positivePromptSafetyAttributes"], safetyAttributesFromMldev(apiClient, fromPositivePromptSafetyAttributes));
	return toObject;
}
function tunedModelInfoFromMldev(apiClient, fromObject) {
	const toObject = {};
	const fromBaseModel = getValueByPath(fromObject, ["baseModel"]);
	if (fromBaseModel != null) setValueByPath(toObject, ["baseModel"], fromBaseModel);
	const fromCreateTime = getValueByPath(fromObject, ["createTime"]);
	if (fromCreateTime != null) setValueByPath(toObject, ["createTime"], fromCreateTime);
	const fromUpdateTime = getValueByPath(fromObject, ["updateTime"]);
	if (fromUpdateTime != null) setValueByPath(toObject, ["updateTime"], fromUpdateTime);
	return toObject;
}
function modelFromMldev(apiClient, fromObject) {
	const toObject = {};
	const fromName = getValueByPath(fromObject, ["name"]);
	if (fromName != null) setValueByPath(toObject, ["name"], fromName);
	const fromDisplayName = getValueByPath(fromObject, ["displayName"]);
	if (fromDisplayName != null) setValueByPath(toObject, ["displayName"], fromDisplayName);
	const fromDescription = getValueByPath(fromObject, ["description"]);
	if (fromDescription != null) setValueByPath(toObject, ["description"], fromDescription);
	const fromVersion = getValueByPath(fromObject, ["version"]);
	if (fromVersion != null) setValueByPath(toObject, ["version"], fromVersion);
	const fromTunedModelInfo = getValueByPath(fromObject, ["_self"]);
	if (fromTunedModelInfo != null) setValueByPath(toObject, ["tunedModelInfo"], tunedModelInfoFromMldev(apiClient, fromTunedModelInfo));
	const fromInputTokenLimit = getValueByPath(fromObject, ["inputTokenLimit"]);
	if (fromInputTokenLimit != null) setValueByPath(toObject, ["inputTokenLimit"], fromInputTokenLimit);
	const fromOutputTokenLimit = getValueByPath(fromObject, ["outputTokenLimit"]);
	if (fromOutputTokenLimit != null) setValueByPath(toObject, ["outputTokenLimit"], fromOutputTokenLimit);
	const fromSupportedActions = getValueByPath(fromObject, ["supportedGenerationMethods"]);
	if (fromSupportedActions != null) setValueByPath(toObject, ["supportedActions"], fromSupportedActions);
	return toObject;
}
function countTokensResponseFromMldev(apiClient, fromObject) {
	const toObject = {};
	const fromTotalTokens = getValueByPath(fromObject, ["totalTokens"]);
	if (fromTotalTokens != null) setValueByPath(toObject, ["totalTokens"], fromTotalTokens);
	const fromCachedContentTokenCount = getValueByPath(fromObject, ["cachedContentTokenCount"]);
	if (fromCachedContentTokenCount != null) setValueByPath(toObject, ["cachedContentTokenCount"], fromCachedContentTokenCount);
	return toObject;
}
function videoFromMldev$1(apiClient, fromObject) {
	const toObject = {};
	const fromUri = getValueByPath(fromObject, ["video", "uri"]);
	if (fromUri != null) setValueByPath(toObject, ["uri"], fromUri);
	const fromVideoBytes = getValueByPath(fromObject, ["video", "encodedVideo"]);
	if (fromVideoBytes != null) setValueByPath(toObject, ["videoBytes"], tBytes(apiClient, fromVideoBytes));
	const fromMimeType = getValueByPath(fromObject, ["encoding"]);
	if (fromMimeType != null) setValueByPath(toObject, ["mimeType"], fromMimeType);
	return toObject;
}
function generatedVideoFromMldev$1(apiClient, fromObject) {
	const toObject = {};
	const fromVideo = getValueByPath(fromObject, ["_self"]);
	if (fromVideo != null) setValueByPath(toObject, ["video"], videoFromMldev$1(apiClient, fromVideo));
	return toObject;
}
function generateVideosResponseFromMldev$1(apiClient, fromObject) {
	const toObject = {};
	const fromGeneratedVideos = getValueByPath(fromObject, ["generatedSamples"]);
	if (fromGeneratedVideos != null) if (Array.isArray(fromGeneratedVideos)) setValueByPath(toObject, ["generatedVideos"], fromGeneratedVideos.map((item) => {
		return generatedVideoFromMldev$1(apiClient, item);
	}));
	else setValueByPath(toObject, ["generatedVideos"], fromGeneratedVideos);
	const fromRaiMediaFilteredCount = getValueByPath(fromObject, ["raiMediaFilteredCount"]);
	if (fromRaiMediaFilteredCount != null) setValueByPath(toObject, ["raiMediaFilteredCount"], fromRaiMediaFilteredCount);
	const fromRaiMediaFilteredReasons = getValueByPath(fromObject, ["raiMediaFilteredReasons"]);
	if (fromRaiMediaFilteredReasons != null) setValueByPath(toObject, ["raiMediaFilteredReasons"], fromRaiMediaFilteredReasons);
	return toObject;
}
function generateVideosOperationFromMldev$1(apiClient, fromObject) {
	const toObject = {};
	const fromName = getValueByPath(fromObject, ["name"]);
	if (fromName != null) setValueByPath(toObject, ["name"], fromName);
	const fromMetadata = getValueByPath(fromObject, ["metadata"]);
	if (fromMetadata != null) setValueByPath(toObject, ["metadata"], fromMetadata);
	const fromDone = getValueByPath(fromObject, ["done"]);
	if (fromDone != null) setValueByPath(toObject, ["done"], fromDone);
	const fromError = getValueByPath(fromObject, ["error"]);
	if (fromError != null) setValueByPath(toObject, ["error"], fromError);
	const fromResponse = getValueByPath(fromObject, ["response", "generateVideoResponse"]);
	if (fromResponse != null) setValueByPath(toObject, ["response"], generateVideosResponseFromMldev$1(apiClient, fromResponse));
	return toObject;
}
function partFromVertex(apiClient, fromObject) {
	const toObject = {};
	const fromVideoMetadata = getValueByPath(fromObject, ["videoMetadata"]);
	if (fromVideoMetadata != null) setValueByPath(toObject, ["videoMetadata"], fromVideoMetadata);
	const fromThought = getValueByPath(fromObject, ["thought"]);
	if (fromThought != null) setValueByPath(toObject, ["thought"], fromThought);
	const fromCodeExecutionResult = getValueByPath(fromObject, ["codeExecutionResult"]);
	if (fromCodeExecutionResult != null) setValueByPath(toObject, ["codeExecutionResult"], fromCodeExecutionResult);
	const fromExecutableCode = getValueByPath(fromObject, ["executableCode"]);
	if (fromExecutableCode != null) setValueByPath(toObject, ["executableCode"], fromExecutableCode);
	const fromFileData = getValueByPath(fromObject, ["fileData"]);
	if (fromFileData != null) setValueByPath(toObject, ["fileData"], fromFileData);
	const fromFunctionCall = getValueByPath(fromObject, ["functionCall"]);
	if (fromFunctionCall != null) setValueByPath(toObject, ["functionCall"], fromFunctionCall);
	const fromFunctionResponse = getValueByPath(fromObject, ["functionResponse"]);
	if (fromFunctionResponse != null) setValueByPath(toObject, ["functionResponse"], fromFunctionResponse);
	const fromInlineData = getValueByPath(fromObject, ["inlineData"]);
	if (fromInlineData != null) setValueByPath(toObject, ["inlineData"], fromInlineData);
	const fromText = getValueByPath(fromObject, ["text"]);
	if (fromText != null) setValueByPath(toObject, ["text"], fromText);
	return toObject;
}
function contentFromVertex(apiClient, fromObject) {
	const toObject = {};
	const fromParts = getValueByPath(fromObject, ["parts"]);
	if (fromParts != null) if (Array.isArray(fromParts)) setValueByPath(toObject, ["parts"], fromParts.map((item) => {
		return partFromVertex(apiClient, item);
	}));
	else setValueByPath(toObject, ["parts"], fromParts);
	const fromRole = getValueByPath(fromObject, ["role"]);
	if (fromRole != null) setValueByPath(toObject, ["role"], fromRole);
	return toObject;
}
function citationMetadataFromVertex(apiClient, fromObject) {
	const toObject = {};
	const fromCitations = getValueByPath(fromObject, ["citations"]);
	if (fromCitations != null) setValueByPath(toObject, ["citations"], fromCitations);
	return toObject;
}
function candidateFromVertex(apiClient, fromObject) {
	const toObject = {};
	const fromContent = getValueByPath(fromObject, ["content"]);
	if (fromContent != null) setValueByPath(toObject, ["content"], contentFromVertex(apiClient, fromContent));
	const fromCitationMetadata = getValueByPath(fromObject, ["citationMetadata"]);
	if (fromCitationMetadata != null) setValueByPath(toObject, ["citationMetadata"], citationMetadataFromVertex(apiClient, fromCitationMetadata));
	const fromFinishMessage = getValueByPath(fromObject, ["finishMessage"]);
	if (fromFinishMessage != null) setValueByPath(toObject, ["finishMessage"], fromFinishMessage);
	const fromFinishReason = getValueByPath(fromObject, ["finishReason"]);
	if (fromFinishReason != null) setValueByPath(toObject, ["finishReason"], fromFinishReason);
	const fromAvgLogprobs = getValueByPath(fromObject, ["avgLogprobs"]);
	if (fromAvgLogprobs != null) setValueByPath(toObject, ["avgLogprobs"], fromAvgLogprobs);
	const fromGroundingMetadata = getValueByPath(fromObject, ["groundingMetadata"]);
	if (fromGroundingMetadata != null) setValueByPath(toObject, ["groundingMetadata"], fromGroundingMetadata);
	const fromIndex = getValueByPath(fromObject, ["index"]);
	if (fromIndex != null) setValueByPath(toObject, ["index"], fromIndex);
	const fromLogprobsResult = getValueByPath(fromObject, ["logprobsResult"]);
	if (fromLogprobsResult != null) setValueByPath(toObject, ["logprobsResult"], fromLogprobsResult);
	const fromSafetyRatings = getValueByPath(fromObject, ["safetyRatings"]);
	if (fromSafetyRatings != null) setValueByPath(toObject, ["safetyRatings"], fromSafetyRatings);
	return toObject;
}
function generateContentResponseFromVertex(apiClient, fromObject) {
	const toObject = {};
	const fromCandidates = getValueByPath(fromObject, ["candidates"]);
	if (fromCandidates != null) if (Array.isArray(fromCandidates)) setValueByPath(toObject, ["candidates"], fromCandidates.map((item) => {
		return candidateFromVertex(apiClient, item);
	}));
	else setValueByPath(toObject, ["candidates"], fromCandidates);
	const fromCreateTime = getValueByPath(fromObject, ["createTime"]);
	if (fromCreateTime != null) setValueByPath(toObject, ["createTime"], fromCreateTime);
	const fromResponseId = getValueByPath(fromObject, ["responseId"]);
	if (fromResponseId != null) setValueByPath(toObject, ["responseId"], fromResponseId);
	const fromModelVersion = getValueByPath(fromObject, ["modelVersion"]);
	if (fromModelVersion != null) setValueByPath(toObject, ["modelVersion"], fromModelVersion);
	const fromPromptFeedback = getValueByPath(fromObject, ["promptFeedback"]);
	if (fromPromptFeedback != null) setValueByPath(toObject, ["promptFeedback"], fromPromptFeedback);
	const fromUsageMetadata = getValueByPath(fromObject, ["usageMetadata"]);
	if (fromUsageMetadata != null) setValueByPath(toObject, ["usageMetadata"], fromUsageMetadata);
	return toObject;
}
function contentEmbeddingStatisticsFromVertex(apiClient, fromObject) {
	const toObject = {};
	const fromTruncated = getValueByPath(fromObject, ["truncated"]);
	if (fromTruncated != null) setValueByPath(toObject, ["truncated"], fromTruncated);
	const fromTokenCount = getValueByPath(fromObject, ["token_count"]);
	if (fromTokenCount != null) setValueByPath(toObject, ["tokenCount"], fromTokenCount);
	return toObject;
}
function contentEmbeddingFromVertex(apiClient, fromObject) {
	const toObject = {};
	const fromValues = getValueByPath(fromObject, ["values"]);
	if (fromValues != null) setValueByPath(toObject, ["values"], fromValues);
	const fromStatistics = getValueByPath(fromObject, ["statistics"]);
	if (fromStatistics != null) setValueByPath(toObject, ["statistics"], contentEmbeddingStatisticsFromVertex(apiClient, fromStatistics));
	return toObject;
}
function embedContentMetadataFromVertex(apiClient, fromObject) {
	const toObject = {};
	const fromBillableCharacterCount = getValueByPath(fromObject, ["billableCharacterCount"]);
	if (fromBillableCharacterCount != null) setValueByPath(toObject, ["billableCharacterCount"], fromBillableCharacterCount);
	return toObject;
}
function embedContentResponseFromVertex(apiClient, fromObject) {
	const toObject = {};
	const fromEmbeddings = getValueByPath(fromObject, ["predictions[]", "embeddings"]);
	if (fromEmbeddings != null) if (Array.isArray(fromEmbeddings)) setValueByPath(toObject, ["embeddings"], fromEmbeddings.map((item) => {
		return contentEmbeddingFromVertex(apiClient, item);
	}));
	else setValueByPath(toObject, ["embeddings"], fromEmbeddings);
	const fromMetadata = getValueByPath(fromObject, ["metadata"]);
	if (fromMetadata != null) setValueByPath(toObject, ["metadata"], embedContentMetadataFromVertex(apiClient, fromMetadata));
	return toObject;
}
function imageFromVertex(apiClient, fromObject) {
	const toObject = {};
	const fromGcsUri = getValueByPath(fromObject, ["gcsUri"]);
	if (fromGcsUri != null) setValueByPath(toObject, ["gcsUri"], fromGcsUri);
	const fromImageBytes = getValueByPath(fromObject, ["bytesBase64Encoded"]);
	if (fromImageBytes != null) setValueByPath(toObject, ["imageBytes"], tBytes(apiClient, fromImageBytes));
	const fromMimeType = getValueByPath(fromObject, ["mimeType"]);
	if (fromMimeType != null) setValueByPath(toObject, ["mimeType"], fromMimeType);
	return toObject;
}
function safetyAttributesFromVertex(apiClient, fromObject) {
	const toObject = {};
	const fromCategories = getValueByPath(fromObject, ["safetyAttributes", "categories"]);
	if (fromCategories != null) setValueByPath(toObject, ["categories"], fromCategories);
	const fromScores = getValueByPath(fromObject, ["safetyAttributes", "scores"]);
	if (fromScores != null) setValueByPath(toObject, ["scores"], fromScores);
	const fromContentType = getValueByPath(fromObject, ["contentType"]);
	if (fromContentType != null) setValueByPath(toObject, ["contentType"], fromContentType);
	return toObject;
}
function generatedImageFromVertex(apiClient, fromObject) {
	const toObject = {};
	const fromImage = getValueByPath(fromObject, ["_self"]);
	if (fromImage != null) setValueByPath(toObject, ["image"], imageFromVertex(apiClient, fromImage));
	const fromRaiFilteredReason = getValueByPath(fromObject, ["raiFilteredReason"]);
	if (fromRaiFilteredReason != null) setValueByPath(toObject, ["raiFilteredReason"], fromRaiFilteredReason);
	const fromSafetyAttributes = getValueByPath(fromObject, ["_self"]);
	if (fromSafetyAttributes != null) setValueByPath(toObject, ["safetyAttributes"], safetyAttributesFromVertex(apiClient, fromSafetyAttributes));
	const fromEnhancedPrompt = getValueByPath(fromObject, ["prompt"]);
	if (fromEnhancedPrompt != null) setValueByPath(toObject, ["enhancedPrompt"], fromEnhancedPrompt);
	return toObject;
}
function generateImagesResponseFromVertex(apiClient, fromObject) {
	const toObject = {};
	const fromGeneratedImages = getValueByPath(fromObject, ["predictions"]);
	if (fromGeneratedImages != null) if (Array.isArray(fromGeneratedImages)) setValueByPath(toObject, ["generatedImages"], fromGeneratedImages.map((item) => {
		return generatedImageFromVertex(apiClient, item);
	}));
	else setValueByPath(toObject, ["generatedImages"], fromGeneratedImages);
	const fromPositivePromptSafetyAttributes = getValueByPath(fromObject, ["positivePromptSafetyAttributes"]);
	if (fromPositivePromptSafetyAttributes != null) setValueByPath(toObject, ["positivePromptSafetyAttributes"], safetyAttributesFromVertex(apiClient, fromPositivePromptSafetyAttributes));
	return toObject;
}
function endpointFromVertex(apiClient, fromObject) {
	const toObject = {};
	const fromName = getValueByPath(fromObject, ["endpoint"]);
	if (fromName != null) setValueByPath(toObject, ["name"], fromName);
	const fromDeployedModelId = getValueByPath(fromObject, ["deployedModelId"]);
	if (fromDeployedModelId != null) setValueByPath(toObject, ["deployedModelId"], fromDeployedModelId);
	return toObject;
}
function tunedModelInfoFromVertex(apiClient, fromObject) {
	const toObject = {};
	const fromBaseModel = getValueByPath(fromObject, ["labels", "google-vertex-llm-tuning-base-model-id"]);
	if (fromBaseModel != null) setValueByPath(toObject, ["baseModel"], fromBaseModel);
	const fromCreateTime = getValueByPath(fromObject, ["createTime"]);
	if (fromCreateTime != null) setValueByPath(toObject, ["createTime"], fromCreateTime);
	const fromUpdateTime = getValueByPath(fromObject, ["updateTime"]);
	if (fromUpdateTime != null) setValueByPath(toObject, ["updateTime"], fromUpdateTime);
	return toObject;
}
function modelFromVertex(apiClient, fromObject) {
	const toObject = {};
	const fromName = getValueByPath(fromObject, ["name"]);
	if (fromName != null) setValueByPath(toObject, ["name"], fromName);
	const fromDisplayName = getValueByPath(fromObject, ["displayName"]);
	if (fromDisplayName != null) setValueByPath(toObject, ["displayName"], fromDisplayName);
	const fromDescription = getValueByPath(fromObject, ["description"]);
	if (fromDescription != null) setValueByPath(toObject, ["description"], fromDescription);
	const fromVersion = getValueByPath(fromObject, ["versionId"]);
	if (fromVersion != null) setValueByPath(toObject, ["version"], fromVersion);
	const fromEndpoints = getValueByPath(fromObject, ["deployedModels"]);
	if (fromEndpoints != null) if (Array.isArray(fromEndpoints)) setValueByPath(toObject, ["endpoints"], fromEndpoints.map((item) => {
		return endpointFromVertex(apiClient, item);
	}));
	else setValueByPath(toObject, ["endpoints"], fromEndpoints);
	const fromLabels = getValueByPath(fromObject, ["labels"]);
	if (fromLabels != null) setValueByPath(toObject, ["labels"], fromLabels);
	const fromTunedModelInfo = getValueByPath(fromObject, ["_self"]);
	if (fromTunedModelInfo != null) setValueByPath(toObject, ["tunedModelInfo"], tunedModelInfoFromVertex(apiClient, fromTunedModelInfo));
	return toObject;
}
function countTokensResponseFromVertex(apiClient, fromObject) {
	const toObject = {};
	const fromTotalTokens = getValueByPath(fromObject, ["totalTokens"]);
	if (fromTotalTokens != null) setValueByPath(toObject, ["totalTokens"], fromTotalTokens);
	return toObject;
}
function computeTokensResponseFromVertex(apiClient, fromObject) {
	const toObject = {};
	const fromTokensInfo = getValueByPath(fromObject, ["tokensInfo"]);
	if (fromTokensInfo != null) setValueByPath(toObject, ["tokensInfo"], fromTokensInfo);
	return toObject;
}
function videoFromVertex$1(apiClient, fromObject) {
	const toObject = {};
	const fromUri = getValueByPath(fromObject, ["gcsUri"]);
	if (fromUri != null) setValueByPath(toObject, ["uri"], fromUri);
	const fromVideoBytes = getValueByPath(fromObject, ["bytesBase64Encoded"]);
	if (fromVideoBytes != null) setValueByPath(toObject, ["videoBytes"], tBytes(apiClient, fromVideoBytes));
	const fromMimeType = getValueByPath(fromObject, ["mimeType"]);
	if (fromMimeType != null) setValueByPath(toObject, ["mimeType"], fromMimeType);
	return toObject;
}
function generatedVideoFromVertex$1(apiClient, fromObject) {
	const toObject = {};
	const fromVideo = getValueByPath(fromObject, ["_self"]);
	if (fromVideo != null) setValueByPath(toObject, ["video"], videoFromVertex$1(apiClient, fromVideo));
	return toObject;
}
function generateVideosResponseFromVertex$1(apiClient, fromObject) {
	const toObject = {};
	const fromGeneratedVideos = getValueByPath(fromObject, ["videos"]);
	if (fromGeneratedVideos != null) if (Array.isArray(fromGeneratedVideos)) setValueByPath(toObject, ["generatedVideos"], fromGeneratedVideos.map((item) => {
		return generatedVideoFromVertex$1(apiClient, item);
	}));
	else setValueByPath(toObject, ["generatedVideos"], fromGeneratedVideos);
	const fromRaiMediaFilteredCount = getValueByPath(fromObject, ["raiMediaFilteredCount"]);
	if (fromRaiMediaFilteredCount != null) setValueByPath(toObject, ["raiMediaFilteredCount"], fromRaiMediaFilteredCount);
	const fromRaiMediaFilteredReasons = getValueByPath(fromObject, ["raiMediaFilteredReasons"]);
	if (fromRaiMediaFilteredReasons != null) setValueByPath(toObject, ["raiMediaFilteredReasons"], fromRaiMediaFilteredReasons);
	return toObject;
}
function generateVideosOperationFromVertex$1(apiClient, fromObject) {
	const toObject = {};
	const fromName = getValueByPath(fromObject, ["name"]);
	if (fromName != null) setValueByPath(toObject, ["name"], fromName);
	const fromMetadata = getValueByPath(fromObject, ["metadata"]);
	if (fromMetadata != null) setValueByPath(toObject, ["metadata"], fromMetadata);
	const fromDone = getValueByPath(fromObject, ["done"]);
	if (fromDone != null) setValueByPath(toObject, ["done"], fromDone);
	const fromError = getValueByPath(fromObject, ["error"]);
	if (fromError != null) setValueByPath(toObject, ["error"], fromError);
	const fromResponse = getValueByPath(fromObject, ["response"]);
	if (fromResponse != null) setValueByPath(toObject, ["response"], generateVideosResponseFromVertex$1(apiClient, fromResponse));
	return toObject;
}
/**
* @license
* Copyright 2025 Google LLC
* SPDX-License-Identifier: Apache-2.0
*/
const FUNCTION_RESPONSE_REQUIRES_ID = "FunctionResponse request must have an `id` field from the response of a ToolCall.FunctionalCalls in Google AI.";
/**
* Handles incoming messages from the WebSocket.
*
* @remarks
* This function is responsible for parsing incoming messages, transforming them
* into LiveServerMessages, and then calling the onmessage callback. Note that
* the first message which is received from the server is a setupComplete
* message.
*
* @param apiClient The ApiClient instance.
* @param onmessage The user-provided onmessage callback (if any).
* @param event The MessageEvent from the WebSocket.
*/
async function handleWebSocketMessage(apiClient, onmessage, event) {
	let serverMessage;
	let data;
	if (event.data instanceof Blob) data = JSON.parse(await event.data.text());
	else data = JSON.parse(event.data);
	if (apiClient.isVertexAI()) serverMessage = liveServerMessageFromVertex(apiClient, data);
	else serverMessage = liveServerMessageFromMldev(apiClient, data);
	onmessage(serverMessage);
}
/**
Live class encapsulates the configuration for live interaction with the
Generative Language API. It embeds ApiClient for general API settings.

@experimental
*/
var Live = class {
	constructor(apiClient, auth, webSocketFactory) {
		this.apiClient = apiClient;
		this.auth = auth;
		this.webSocketFactory = webSocketFactory;
	}
	/**
	Establishes a connection to the specified model with the given
	configuration and returns a Session object representing that connection.
	
	@experimental
	
	@remarks
	
	@param params - The parameters for establishing a connection to the model.
	@return A live session.
	
	@example
	```ts
	let model: string;
	if (GOOGLE_GENAI_USE_VERTEXAI) {
	model = 'gemini-2.0-flash-live-preview-04-09';
	} else {
	model = 'gemini-2.0-flash-live-001';
	}
	const session = await ai.live.connect({
	model: model,
	config: {
	responseModalities: [Modality.AUDIO],
	},
	callbacks: {
	onopen: () => {
	console.log('Connected to the socket.');
	},
	onmessage: (e: MessageEvent) => {
	console.log('Received message from the server: %s\n', debug(e.data));
	},
	onerror: (e: ErrorEvent) => {
	console.log('Error occurred: %s\n', debug(e.error));
	},
	onclose: (e: CloseEvent) => {
	console.log('Connection closed.');
	},
	},
	});
	```
	*/
	async connect(params) {
		var _a, _b, _c, _d;
		const websocketBaseUrl = this.apiClient.getWebsocketBaseUrl();
		const apiVersion = this.apiClient.getApiVersion();
		let url;
		const headers = mapToHeaders(this.apiClient.getDefaultHeaders());
		if (this.apiClient.isVertexAI()) {
			url = `${websocketBaseUrl}/ws/google.cloud.aiplatform.${apiVersion}.LlmBidiService/BidiGenerateContent`;
			await this.auth.addAuthHeaders(headers);
		} else {
			const apiKey = this.apiClient.getApiKey();
			url = `${websocketBaseUrl}/ws/google.ai.generativelanguage.${apiVersion}.GenerativeService.BidiGenerateContent?key=${apiKey}`;
		}
		let onopenResolve = () => {};
		const onopenPromise = new Promise((resolve) => {
			onopenResolve = resolve;
		});
		const callbacks = params.callbacks;
		const onopenAwaitedCallback = function() {
			var _a$1;
			(_a$1 = callbacks === null || callbacks === void 0 ? void 0 : callbacks.onopen) === null || _a$1 === void 0 || _a$1.call(callbacks);
			onopenResolve({});
		};
		const apiClient = this.apiClient;
		const websocketCallbacks = {
			onopen: onopenAwaitedCallback,
			onmessage: (event) => {
				handleWebSocketMessage(apiClient, callbacks.onmessage, event);
			},
			onerror: (_a = callbacks === null || callbacks === void 0 ? void 0 : callbacks.onerror) !== null && _a !== void 0 ? _a : function(e) {},
			onclose: (_b = callbacks === null || callbacks === void 0 ? void 0 : callbacks.onclose) !== null && _b !== void 0 ? _b : function(e) {}
		};
		const conn = this.webSocketFactory.create(url, headersToMap(headers), websocketCallbacks);
		conn.connect();
		await onopenPromise;
		let transformedModel = tModel(this.apiClient, params.model);
		if (this.apiClient.isVertexAI() && transformedModel.startsWith("publishers/")) {
			const project = this.apiClient.getProject();
			const location = this.apiClient.getLocation();
			transformedModel = `projects/${project}/locations/${location}/` + transformedModel;
		}
		let clientMessage = {};
		if (this.apiClient.isVertexAI() && ((_c = params.config) === null || _c === void 0 ? void 0 : _c.responseModalities) === void 0) if (params.config === void 0) params.config = { responseModalities: [Modality.AUDIO] };
		else params.config.responseModalities = [Modality.AUDIO];
		if ((_d = params.config) === null || _d === void 0 ? void 0 : _d.generationConfig) console.warn("Setting `LiveConnectConfig.generation_config` is deprecated, please set the fields on `LiveConnectConfig` directly. This will become an error in a future version (not before Q3 2025).");
		const liveConnectParameters = {
			model: transformedModel,
			config: params.config,
			callbacks: params.callbacks
		};
		if (this.apiClient.isVertexAI()) clientMessage = liveConnectParametersToVertex(this.apiClient, liveConnectParameters);
		else clientMessage = liveConnectParametersToMldev(this.apiClient, liveConnectParameters);
		delete clientMessage["config"];
		conn.send(JSON.stringify(clientMessage));
		return new Session(conn, this.apiClient);
	}
};
const defaultLiveSendClientContentParamerters = { turnComplete: true };
/**
Represents a connection to the API.

@experimental
*/
var Session = class {
	constructor(conn, apiClient) {
		this.conn = conn;
		this.apiClient = apiClient;
	}
	tLiveClientContent(apiClient, params) {
		if (params.turns !== null && params.turns !== void 0) {
			let contents = [];
			try {
				contents = tContents(apiClient, params.turns);
				if (apiClient.isVertexAI()) contents = contents.map((item) => contentToVertex(apiClient, item));
				else contents = contents.map((item) => contentToMldev(apiClient, item));
			} catch (_a) {
				throw new Error(`Failed to parse client content "turns", type: '${typeof params.turns}'`);
			}
			return { clientContent: {
				turns: contents,
				turnComplete: params.turnComplete
			} };
		}
		return { clientContent: { turnComplete: params.turnComplete } };
	}
	tLiveClientRealtimeInput(apiClient, params) {
		let clientMessage = {};
		if (!("media" in params) || !params.media) throw new Error(`Failed to convert realtime input "media", type: '${typeof params.media}'`);
		clientMessage = { realtimeInput: {
			mediaChunks: [params.media],
			activityStart: params.activityStart,
			activityEnd: params.activityEnd
		} };
		return clientMessage;
	}
	tLiveClienttToolResponse(apiClient, params) {
		let functionResponses = [];
		if (params.functionResponses == null) throw new Error("functionResponses is required.");
		if (!Array.isArray(params.functionResponses)) functionResponses = [params.functionResponses];
		else functionResponses = params.functionResponses;
		if (functionResponses.length === 0) throw new Error("functionResponses is required.");
		for (const functionResponse of functionResponses) {
			if (typeof functionResponse !== "object" || functionResponse === null || !("name" in functionResponse) || !("response" in functionResponse)) throw new Error(`Could not parse function response, type '${typeof functionResponse}'.`);
			if (!apiClient.isVertexAI() && !("id" in functionResponse)) throw new Error(FUNCTION_RESPONSE_REQUIRES_ID);
		}
		const clientMessage = { toolResponse: { functionResponses } };
		return clientMessage;
	}
	/**
	Send a message over the established connection.
	
	@param params - Contains two **optional** properties, `turns` and
	`turnComplete`.
	
	- `turns` will be converted to a `Content[]`
	- `turnComplete: true` [default] indicates that you are done sending
	content and expect a response. If `turnComplete: false`, the server
	will wait for additional messages before starting generation.
	
	@experimental
	
	@remarks
	There are two ways to send messages to the live API:
	`sendClientContent` and `sendRealtimeInput`.
	
	`sendClientContent` messages are added to the model context **in order**.
	Having a conversation using `sendClientContent` messages is roughly
	equivalent to using the `Chat.sendMessageStream`, except that the state of
	the `chat` history is stored on the API server instead of locally.
	
	Because of `sendClientContent`'s order guarantee, the model cannot respons
	as quickly to `sendClientContent` messages as to `sendRealtimeInput`
	messages. This makes the biggest difference when sending objects that have
	significant preprocessing time (typically images).
	
	The `sendClientContent` message sends a `Content[]`
	which has more options than the `Blob` sent by `sendRealtimeInput`.
	
	So the main use-cases for `sendClientContent` over `sendRealtimeInput` are:
	
	- Sending anything that can't be represented as a `Blob` (text,
	`sendClientContent({turns="Hello?"}`)).
	- Managing turns when not using audio input and voice activity detection.
	(`sendClientContent({turnComplete:true})` or the short form
	`sendClientContent()`)
	- Prefilling a conversation context
	```
	sendClientContent({
	turns: [
	Content({role:user, parts:...}),
	Content({role:user, parts:...}),
	...
	]
	})
	```
	@experimental
	*/
	sendClientContent(params) {
		params = Object.assign(Object.assign({}, defaultLiveSendClientContentParamerters), params);
		const clientMessage = this.tLiveClientContent(this.apiClient, params);
		this.conn.send(JSON.stringify(clientMessage));
	}
	/**
	Send a realtime message over the established connection.
	
	@param params - Contains one property, `media`.
	
	- `media` will be converted to a `Blob`
	
	@experimental
	
	@remarks
	Use `sendRealtimeInput` for realtime audio chunks and video frames (images).
	
	With `sendRealtimeInput` the api will respond to audio automatically
	based on voice activity detection (VAD).
	
	`sendRealtimeInput` is optimized for responsivness at the expense of
	deterministic ordering guarantees. Audio and video tokens are to the
	context when they become available.
	
	Note: The Call signature expects a `Blob` object, but only a subset
	of audio and image mimetypes are allowed.
	*/
	sendRealtimeInput(params) {
		if (params.media == null) throw new Error("Media is required.");
		const clientMessage = this.tLiveClientRealtimeInput(this.apiClient, params);
		this.conn.send(JSON.stringify(clientMessage));
	}
	/**
	Send a function response message over the established connection.
	
	@param params - Contains property `functionResponses`.
	
	- `functionResponses` will be converted to a `functionResponses[]`
	
	@remarks
	Use `sendFunctionResponse` to reply to `LiveServerToolCall` from the server.
	
	Use {@link types.LiveConnectConfig#tools} to configure the callable functions.
	
	@experimental
	*/
	sendToolResponse(params) {
		if (params.functionResponses == null) throw new Error("Tool response parameters are required.");
		const clientMessage = this.tLiveClienttToolResponse(this.apiClient, params);
		this.conn.send(JSON.stringify(clientMessage));
	}
	/**
	Terminates the WebSocket connection.
	
	@experimental
	
	@example
	```ts
	let model: string;
	if (GOOGLE_GENAI_USE_VERTEXAI) {
	model = 'gemini-2.0-flash-live-preview-04-09';
	} else {
	model = 'gemini-2.0-flash-live-001';
	}
	const session = await ai.live.connect({
	model: model,
	config: {
	responseModalities: [Modality.AUDIO],
	}
	});
	
	session.close();
	```
	*/
	close() {
		this.conn.close();
	}
};
function headersToMap(headers) {
	const headerMap = {};
	headers.forEach((value, key) => {
		headerMap[key] = value;
	});
	return headerMap;
}
function mapToHeaders(map) {
	const headers = new Headers();
	for (const [key, value] of Object.entries(map)) headers.append(key, value);
	return headers;
}
/**
* @license
* Copyright 2025 Google LLC
* SPDX-License-Identifier: Apache-2.0
*/
var Models = class extends BaseModule {
	constructor(apiClient) {
		super();
		this.apiClient = apiClient;
		/**
		* Makes an API request to generate content with a given model.
		*
		* For the `model` parameter, supported formats for Vertex AI API include:
		* - The Gemini model ID, for example: 'gemini-2.0-flash'
		* - The full resource name starts with 'projects/', for example:
		*  'projects/my-project-id/locations/us-central1/publishers/google/models/gemini-2.0-flash'
		* - The partial resource name with 'publishers/', for example:
		*  'publishers/google/models/gemini-2.0-flash' or
		*  'publishers/meta/models/llama-3.1-405b-instruct-maas'
		* - `/` separated publisher and model name, for example:
		* 'google/gemini-2.0-flash' or 'meta/llama-3.1-405b-instruct-maas'
		*
		* For the `model` parameter, supported formats for Gemini API include:
		* - The Gemini model ID, for example: 'gemini-2.0-flash'
		* - The model name starts with 'models/', for example:
		*  'models/gemini-2.0-flash'
		* - For tuned models, the model name starts with 'tunedModels/',
		* for example:
		* 'tunedModels/1234567890123456789'
		*
		* Some models support multimodal input and output.
		*
		* @param params - The parameters for generating content.
		* @return The response from generating content.
		*
		* @example
		* ```ts
		* const response = await ai.models.generateContent({
		*   model: 'gemini-2.0-flash',
		*   contents: 'why is the sky blue?',
		*   config: {
		*     candidateCount: 2,
		*   }
		* });
		* console.log(response);
		* ```
		*/
		this.generateContent = async (params) => {
			return await this.generateContentInternal(params);
		};
		/**
		* Makes an API request to generate content with a given model and yields the
		* response in chunks.
		*
		* For the `model` parameter, supported formats for Vertex AI API include:
		* - The Gemini model ID, for example: 'gemini-2.0-flash'
		* - The full resource name starts with 'projects/', for example:
		*  'projects/my-project-id/locations/us-central1/publishers/google/models/gemini-2.0-flash'
		* - The partial resource name with 'publishers/', for example:
		*  'publishers/google/models/gemini-2.0-flash' or
		*  'publishers/meta/models/llama-3.1-405b-instruct-maas'
		* - `/` separated publisher and model name, for example:
		* 'google/gemini-2.0-flash' or 'meta/llama-3.1-405b-instruct-maas'
		*
		* For the `model` parameter, supported formats for Gemini API include:
		* - The Gemini model ID, for example: 'gemini-2.0-flash'
		* - The model name starts with 'models/', for example:
		*  'models/gemini-2.0-flash'
		* - For tuned models, the model name starts with 'tunedModels/',
		* for example:
		*  'tunedModels/1234567890123456789'
		*
		* Some models support multimodal input and output.
		*
		* @param params - The parameters for generating content with streaming response.
		* @return The response from generating content.
		*
		* @example
		* ```ts
		* const response = await ai.models.generateContentStream({
		*   model: 'gemini-2.0-flash',
		*   contents: 'why is the sky blue?',
		*   config: {
		*     maxOutputTokens: 200,
		*   }
		* });
		* for await (const chunk of response) {
		*   console.log(chunk);
		* }
		* ```
		*/
		this.generateContentStream = async (params) => {
			return await this.generateContentStreamInternal(params);
		};
		/**
		* Generates an image based on a text description and configuration.
		*
		* @param model - The model to use.
		* @param prompt - A text description of the image to generate.
		* @param [config] - The config for image generation.
		* @return The response from the API.
		*
		* @example
		* ```ts
		* const response = await client.models.generateImages({
		*  model: 'imagen-3.0-generate-002',
		*  prompt: 'Robot holding a red skateboard',
		*  config: {
		*    numberOfImages: 1,
		*    includeRaiReason: true,
		*  },
		* });
		* console.log(response?.generatedImages?.[0]?.image?.imageBytes);
		* ```
		*/
		this.generateImages = async (params) => {
			return await this.generateImagesInternal(params).then((apiResponse) => {
				var _a;
				let positivePromptSafetyAttributes;
				const generatedImages = [];
				if (apiResponse === null || apiResponse === void 0 ? void 0 : apiResponse.generatedImages) for (const generatedImage of apiResponse.generatedImages) if (generatedImage && (generatedImage === null || generatedImage === void 0 ? void 0 : generatedImage.safetyAttributes) && ((_a = generatedImage === null || generatedImage === void 0 ? void 0 : generatedImage.safetyAttributes) === null || _a === void 0 ? void 0 : _a.contentType) === "Positive Prompt") positivePromptSafetyAttributes = generatedImage === null || generatedImage === void 0 ? void 0 : generatedImage.safetyAttributes;
				else generatedImages.push(generatedImage);
				let response;
				if (positivePromptSafetyAttributes) response = {
					generatedImages,
					positivePromptSafetyAttributes
				};
				else response = { generatedImages };
				return response;
			});
		};
	}
	async generateContentInternal(params) {
		var _a, _b;
		let response;
		let path$1 = "";
		let queryParams = {};
		if (this.apiClient.isVertexAI()) {
			const body = generateContentParametersToVertex(this.apiClient, params);
			path$1 = formatMap("{model}:generateContent", body["_url"]);
			queryParams = body["_query"];
			delete body["config"];
			delete body["_url"];
			delete body["_query"];
			response = this.apiClient.request({
				path: path$1,
				queryParams,
				body: JSON.stringify(body),
				httpMethod: "POST",
				httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions
			}).then((httpResponse) => {
				return httpResponse.json();
			});
			return response.then((apiResponse) => {
				const resp = generateContentResponseFromVertex(this.apiClient, apiResponse);
				const typedResp = new GenerateContentResponse();
				Object.assign(typedResp, resp);
				return typedResp;
			});
		} else {
			const body = generateContentParametersToMldev(this.apiClient, params);
			path$1 = formatMap("{model}:generateContent", body["_url"]);
			queryParams = body["_query"];
			delete body["config"];
			delete body["_url"];
			delete body["_query"];
			response = this.apiClient.request({
				path: path$1,
				queryParams,
				body: JSON.stringify(body),
				httpMethod: "POST",
				httpOptions: (_b = params.config) === null || _b === void 0 ? void 0 : _b.httpOptions
			}).then((httpResponse) => {
				return httpResponse.json();
			});
			return response.then((apiResponse) => {
				const resp = generateContentResponseFromMldev(this.apiClient, apiResponse);
				const typedResp = new GenerateContentResponse();
				Object.assign(typedResp, resp);
				return typedResp;
			});
		}
	}
	async generateContentStreamInternal(params) {
		var _a, _b;
		let response;
		let path$1 = "";
		let queryParams = {};
		if (this.apiClient.isVertexAI()) {
			const body = generateContentParametersToVertex(this.apiClient, params);
			path$1 = formatMap("{model}:streamGenerateContent?alt=sse", body["_url"]);
			queryParams = body["_query"];
			delete body["config"];
			delete body["_url"];
			delete body["_query"];
			const apiClient = this.apiClient;
			response = apiClient.requestStream({
				path: path$1,
				queryParams,
				body: JSON.stringify(body),
				httpMethod: "POST",
				httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions
			});
			return response.then(function(apiResponse) {
				return __asyncGenerator(this, arguments, function* () {
					var _a$1, e_1, _b$1, _c;
					try {
						for (var _d = true, apiResponse_1 = __asyncValues(apiResponse), apiResponse_1_1; apiResponse_1_1 = yield __await(apiResponse_1.next()), _a$1 = apiResponse_1_1.done, !_a$1; _d = true) {
							_c = apiResponse_1_1.value;
							_d = false;
							const chunk = _c;
							const resp = generateContentResponseFromVertex(apiClient, yield __await(chunk.json()));
							const typedResp = new GenerateContentResponse();
							Object.assign(typedResp, resp);
							yield yield __await(typedResp);
						}
					} catch (e_1_1) {
						e_1 = { error: e_1_1 };
					} finally {
						try {
							if (!_d && !_a$1 && (_b$1 = apiResponse_1.return)) yield __await(_b$1.call(apiResponse_1));
						} finally {
							if (e_1) throw e_1.error;
						}
					}
				});
			});
		} else {
			const body = generateContentParametersToMldev(this.apiClient, params);
			path$1 = formatMap("{model}:streamGenerateContent?alt=sse", body["_url"]);
			queryParams = body["_query"];
			delete body["config"];
			delete body["_url"];
			delete body["_query"];
			const apiClient = this.apiClient;
			response = apiClient.requestStream({
				path: path$1,
				queryParams,
				body: JSON.stringify(body),
				httpMethod: "POST",
				httpOptions: (_b = params.config) === null || _b === void 0 ? void 0 : _b.httpOptions
			});
			return response.then(function(apiResponse) {
				return __asyncGenerator(this, arguments, function* () {
					var _a$1, e_2, _b$1, _c;
					try {
						for (var _d = true, apiResponse_2 = __asyncValues(apiResponse), apiResponse_2_1; apiResponse_2_1 = yield __await(apiResponse_2.next()), _a$1 = apiResponse_2_1.done, !_a$1; _d = true) {
							_c = apiResponse_2_1.value;
							_d = false;
							const chunk = _c;
							const resp = generateContentResponseFromMldev(apiClient, yield __await(chunk.json()));
							const typedResp = new GenerateContentResponse();
							Object.assign(typedResp, resp);
							yield yield __await(typedResp);
						}
					} catch (e_2_1) {
						e_2 = { error: e_2_1 };
					} finally {
						try {
							if (!_d && !_a$1 && (_b$1 = apiResponse_2.return)) yield __await(_b$1.call(apiResponse_2));
						} finally {
							if (e_2) throw e_2.error;
						}
					}
				});
			});
		}
	}
	/**
	* Calculates embeddings for the given contents. Only text is supported.
	*
	* @param params - The parameters for embedding contents.
	* @return The response from the API.
	*
	* @example
	* ```ts
	* const response = await ai.models.embedContent({
	*  model: 'text-embedding-004',
	*  contents: [
	*    'What is your name?',
	*    'What is your favorite color?',
	*  ],
	*  config: {
	*    outputDimensionality: 64,
	*  },
	* });
	* console.log(response);
	* ```
	*/
	async embedContent(params) {
		var _a, _b;
		let response;
		let path$1 = "";
		let queryParams = {};
		if (this.apiClient.isVertexAI()) {
			const body = embedContentParametersToVertex(this.apiClient, params);
			path$1 = formatMap("{model}:predict", body["_url"]);
			queryParams = body["_query"];
			delete body["config"];
			delete body["_url"];
			delete body["_query"];
			response = this.apiClient.request({
				path: path$1,
				queryParams,
				body: JSON.stringify(body),
				httpMethod: "POST",
				httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions
			}).then((httpResponse) => {
				return httpResponse.json();
			});
			return response.then((apiResponse) => {
				const resp = embedContentResponseFromVertex(this.apiClient, apiResponse);
				const typedResp = new EmbedContentResponse();
				Object.assign(typedResp, resp);
				return typedResp;
			});
		} else {
			const body = embedContentParametersToMldev(this.apiClient, params);
			path$1 = formatMap("{model}:batchEmbedContents", body["_url"]);
			queryParams = body["_query"];
			delete body["config"];
			delete body["_url"];
			delete body["_query"];
			response = this.apiClient.request({
				path: path$1,
				queryParams,
				body: JSON.stringify(body),
				httpMethod: "POST",
				httpOptions: (_b = params.config) === null || _b === void 0 ? void 0 : _b.httpOptions
			}).then((httpResponse) => {
				return httpResponse.json();
			});
			return response.then((apiResponse) => {
				const resp = embedContentResponseFromMldev(this.apiClient, apiResponse);
				const typedResp = new EmbedContentResponse();
				Object.assign(typedResp, resp);
				return typedResp;
			});
		}
	}
	/**
	* Generates an image based on a text description and configuration.
	*
	* @param params - The parameters for generating images.
	* @return The response from the API.
	*
	* @example
	* ```ts
	* const response = await ai.models.generateImages({
	*  model: 'imagen-3.0-generate-002',
	*  prompt: 'Robot holding a red skateboard',
	*  config: {
	*    numberOfImages: 1,
	*    includeRaiReason: true,
	*  },
	* });
	* console.log(response?.generatedImages?.[0]?.image?.imageBytes);
	* ```
	*/
	async generateImagesInternal(params) {
		var _a, _b;
		let response;
		let path$1 = "";
		let queryParams = {};
		if (this.apiClient.isVertexAI()) {
			const body = generateImagesParametersToVertex(this.apiClient, params);
			path$1 = formatMap("{model}:predict", body["_url"]);
			queryParams = body["_query"];
			delete body["config"];
			delete body["_url"];
			delete body["_query"];
			response = this.apiClient.request({
				path: path$1,
				queryParams,
				body: JSON.stringify(body),
				httpMethod: "POST",
				httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions
			}).then((httpResponse) => {
				return httpResponse.json();
			});
			return response.then((apiResponse) => {
				const resp = generateImagesResponseFromVertex(this.apiClient, apiResponse);
				const typedResp = new GenerateImagesResponse();
				Object.assign(typedResp, resp);
				return typedResp;
			});
		} else {
			const body = generateImagesParametersToMldev(this.apiClient, params);
			path$1 = formatMap("{model}:predict", body["_url"]);
			queryParams = body["_query"];
			delete body["config"];
			delete body["_url"];
			delete body["_query"];
			response = this.apiClient.request({
				path: path$1,
				queryParams,
				body: JSON.stringify(body),
				httpMethod: "POST",
				httpOptions: (_b = params.config) === null || _b === void 0 ? void 0 : _b.httpOptions
			}).then((httpResponse) => {
				return httpResponse.json();
			});
			return response.then((apiResponse) => {
				const resp = generateImagesResponseFromMldev(this.apiClient, apiResponse);
				const typedResp = new GenerateImagesResponse();
				Object.assign(typedResp, resp);
				return typedResp;
			});
		}
	}
	/**
	* Fetches information about a model by name.
	*
	* @example
	* ```ts
	* const modelInfo = await ai.models.get({model: 'gemini-2.0-flash'});
	* ```
	*/
	async get(params) {
		var _a, _b;
		let response;
		let path$1 = "";
		let queryParams = {};
		if (this.apiClient.isVertexAI()) {
			const body = getModelParametersToVertex(this.apiClient, params);
			path$1 = formatMap("{name}", body["_url"]);
			queryParams = body["_query"];
			delete body["config"];
			delete body["_url"];
			delete body["_query"];
			response = this.apiClient.request({
				path: path$1,
				queryParams,
				body: JSON.stringify(body),
				httpMethod: "GET",
				httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions
			}).then((httpResponse) => {
				return httpResponse.json();
			});
			return response.then((apiResponse) => {
				const resp = modelFromVertex(this.apiClient, apiResponse);
				return resp;
			});
		} else {
			const body = getModelParametersToMldev(this.apiClient, params);
			path$1 = formatMap("{name}", body["_url"]);
			queryParams = body["_query"];
			delete body["config"];
			delete body["_url"];
			delete body["_query"];
			response = this.apiClient.request({
				path: path$1,
				queryParams,
				body: JSON.stringify(body),
				httpMethod: "GET",
				httpOptions: (_b = params.config) === null || _b === void 0 ? void 0 : _b.httpOptions
			}).then((httpResponse) => {
				return httpResponse.json();
			});
			return response.then((apiResponse) => {
				const resp = modelFromMldev(this.apiClient, apiResponse);
				return resp;
			});
		}
	}
	/**
	* Counts the number of tokens in the given contents. Multimodal input is
	* supported for Gemini models.
	*
	* @param params - The parameters for counting tokens.
	* @return The response from the API.
	*
	* @example
	* ```ts
	* const response = await ai.models.countTokens({
	*  model: 'gemini-2.0-flash',
	*  contents: 'The quick brown fox jumps over the lazy dog.'
	* });
	* console.log(response);
	* ```
	*/
	async countTokens(params) {
		var _a, _b;
		let response;
		let path$1 = "";
		let queryParams = {};
		if (this.apiClient.isVertexAI()) {
			const body = countTokensParametersToVertex(this.apiClient, params);
			path$1 = formatMap("{model}:countTokens", body["_url"]);
			queryParams = body["_query"];
			delete body["config"];
			delete body["_url"];
			delete body["_query"];
			response = this.apiClient.request({
				path: path$1,
				queryParams,
				body: JSON.stringify(body),
				httpMethod: "POST",
				httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions
			}).then((httpResponse) => {
				return httpResponse.json();
			});
			return response.then((apiResponse) => {
				const resp = countTokensResponseFromVertex(this.apiClient, apiResponse);
				const typedResp = new CountTokensResponse();
				Object.assign(typedResp, resp);
				return typedResp;
			});
		} else {
			const body = countTokensParametersToMldev(this.apiClient, params);
			path$1 = formatMap("{model}:countTokens", body["_url"]);
			queryParams = body["_query"];
			delete body["config"];
			delete body["_url"];
			delete body["_query"];
			response = this.apiClient.request({
				path: path$1,
				queryParams,
				body: JSON.stringify(body),
				httpMethod: "POST",
				httpOptions: (_b = params.config) === null || _b === void 0 ? void 0 : _b.httpOptions
			}).then((httpResponse) => {
				return httpResponse.json();
			});
			return response.then((apiResponse) => {
				const resp = countTokensResponseFromMldev(this.apiClient, apiResponse);
				const typedResp = new CountTokensResponse();
				Object.assign(typedResp, resp);
				return typedResp;
			});
		}
	}
	/**
	* Given a list of contents, returns a corresponding TokensInfo containing
	* the list of tokens and list of token ids.
	*
	* This method is not supported by the Gemini Developer API.
	*
	* @param params - The parameters for computing tokens.
	* @return The response from the API.
	*
	* @example
	* ```ts
	* const response = await ai.models.computeTokens({
	*  model: 'gemini-2.0-flash',
	*  contents: 'What is your name?'
	* });
	* console.log(response);
	* ```
	*/
	async computeTokens(params) {
		var _a;
		let response;
		let path$1 = "";
		let queryParams = {};
		if (this.apiClient.isVertexAI()) {
			const body = computeTokensParametersToVertex(this.apiClient, params);
			path$1 = formatMap("{model}:computeTokens", body["_url"]);
			queryParams = body["_query"];
			delete body["config"];
			delete body["_url"];
			delete body["_query"];
			response = this.apiClient.request({
				path: path$1,
				queryParams,
				body: JSON.stringify(body),
				httpMethod: "POST",
				httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions
			}).then((httpResponse) => {
				return httpResponse.json();
			});
			return response.then((apiResponse) => {
				const resp = computeTokensResponseFromVertex(this.apiClient, apiResponse);
				const typedResp = new ComputeTokensResponse();
				Object.assign(typedResp, resp);
				return typedResp;
			});
		} else throw new Error("This method is only supported by the Vertex AI.");
	}
	/**
	*  Generates videos based on a text description and configuration.
	*
	* @param params - The parameters for generating videos.
	* @return A Promise<GenerateVideosOperation> which allows you to track the progress and eventually retrieve the generated videos using the operations.get method.
	*
	* @example
	* ```ts
	* const operation = await ai.models.generateVideos({
	*  model: 'veo-2.0-generate-001',
	*  prompt: 'A neon hologram of a cat driving at top speed',
	*  config: {
	*    numberOfVideos: 1
	* });
	*
	* while (!operation.done) {
	*   await new Promise(resolve => setTimeout(resolve, 10000));
	*   operation = await ai.operations.getVideosOperation({operation: operation});
	* }
	*
	* console.log(operation.response?.generatedVideos?.[0]?.video?.uri);
	* ```
	*/
	async generateVideos(params) {
		var _a, _b;
		let response;
		let path$1 = "";
		let queryParams = {};
		if (this.apiClient.isVertexAI()) {
			const body = generateVideosParametersToVertex(this.apiClient, params);
			path$1 = formatMap("{model}:predictLongRunning", body["_url"]);
			queryParams = body["_query"];
			delete body["config"];
			delete body["_url"];
			delete body["_query"];
			response = this.apiClient.request({
				path: path$1,
				queryParams,
				body: JSON.stringify(body),
				httpMethod: "POST",
				httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions
			}).then((httpResponse) => {
				return httpResponse.json();
			});
			return response.then((apiResponse) => {
				const resp = generateVideosOperationFromVertex$1(this.apiClient, apiResponse);
				return resp;
			});
		} else {
			const body = generateVideosParametersToMldev(this.apiClient, params);
			path$1 = formatMap("{model}:predictLongRunning", body["_url"]);
			queryParams = body["_query"];
			delete body["config"];
			delete body["_url"];
			delete body["_query"];
			response = this.apiClient.request({
				path: path$1,
				queryParams,
				body: JSON.stringify(body),
				httpMethod: "POST",
				httpOptions: (_b = params.config) === null || _b === void 0 ? void 0 : _b.httpOptions
			}).then((httpResponse) => {
				return httpResponse.json();
			});
			return response.then((apiResponse) => {
				const resp = generateVideosOperationFromMldev$1(this.apiClient, apiResponse);
				return resp;
			});
		}
	}
};
/**
* @license
* Copyright 2025 Google LLC
* SPDX-License-Identifier: Apache-2.0
*/
function getOperationParametersToMldev(apiClient, fromObject) {
	const toObject = {};
	const fromOperationName = getValueByPath(fromObject, ["operationName"]);
	if (fromOperationName != null) setValueByPath(toObject, ["_url", "operationName"], fromOperationName);
	const fromConfig = getValueByPath(fromObject, ["config"]);
	if (fromConfig != null) setValueByPath(toObject, ["config"], fromConfig);
	return toObject;
}
function getOperationParametersToVertex(apiClient, fromObject) {
	const toObject = {};
	const fromOperationName = getValueByPath(fromObject, ["operationName"]);
	if (fromOperationName != null) setValueByPath(toObject, ["_url", "operationName"], fromOperationName);
	const fromConfig = getValueByPath(fromObject, ["config"]);
	if (fromConfig != null) setValueByPath(toObject, ["config"], fromConfig);
	return toObject;
}
function fetchPredictOperationParametersToVertex(apiClient, fromObject) {
	const toObject = {};
	const fromOperationName = getValueByPath(fromObject, ["operationName"]);
	if (fromOperationName != null) setValueByPath(toObject, ["operationName"], fromOperationName);
	const fromResourceName = getValueByPath(fromObject, ["resourceName"]);
	if (fromResourceName != null) setValueByPath(toObject, ["_url", "resourceName"], fromResourceName);
	const fromConfig = getValueByPath(fromObject, ["config"]);
	if (fromConfig != null) setValueByPath(toObject, ["config"], fromConfig);
	return toObject;
}
function videoFromMldev(apiClient, fromObject) {
	const toObject = {};
	const fromUri = getValueByPath(fromObject, ["video", "uri"]);
	if (fromUri != null) setValueByPath(toObject, ["uri"], fromUri);
	const fromVideoBytes = getValueByPath(fromObject, ["video", "encodedVideo"]);
	if (fromVideoBytes != null) setValueByPath(toObject, ["videoBytes"], tBytes(apiClient, fromVideoBytes));
	const fromMimeType = getValueByPath(fromObject, ["encoding"]);
	if (fromMimeType != null) setValueByPath(toObject, ["mimeType"], fromMimeType);
	return toObject;
}
function generatedVideoFromMldev(apiClient, fromObject) {
	const toObject = {};
	const fromVideo = getValueByPath(fromObject, ["_self"]);
	if (fromVideo != null) setValueByPath(toObject, ["video"], videoFromMldev(apiClient, fromVideo));
	return toObject;
}
function generateVideosResponseFromMldev(apiClient, fromObject) {
	const toObject = {};
	const fromGeneratedVideos = getValueByPath(fromObject, ["generatedSamples"]);
	if (fromGeneratedVideos != null) if (Array.isArray(fromGeneratedVideos)) setValueByPath(toObject, ["generatedVideos"], fromGeneratedVideos.map((item) => {
		return generatedVideoFromMldev(apiClient, item);
	}));
	else setValueByPath(toObject, ["generatedVideos"], fromGeneratedVideos);
	const fromRaiMediaFilteredCount = getValueByPath(fromObject, ["raiMediaFilteredCount"]);
	if (fromRaiMediaFilteredCount != null) setValueByPath(toObject, ["raiMediaFilteredCount"], fromRaiMediaFilteredCount);
	const fromRaiMediaFilteredReasons = getValueByPath(fromObject, ["raiMediaFilteredReasons"]);
	if (fromRaiMediaFilteredReasons != null) setValueByPath(toObject, ["raiMediaFilteredReasons"], fromRaiMediaFilteredReasons);
	return toObject;
}
function generateVideosOperationFromMldev(apiClient, fromObject) {
	const toObject = {};
	const fromName = getValueByPath(fromObject, ["name"]);
	if (fromName != null) setValueByPath(toObject, ["name"], fromName);
	const fromMetadata = getValueByPath(fromObject, ["metadata"]);
	if (fromMetadata != null) setValueByPath(toObject, ["metadata"], fromMetadata);
	const fromDone = getValueByPath(fromObject, ["done"]);
	if (fromDone != null) setValueByPath(toObject, ["done"], fromDone);
	const fromError = getValueByPath(fromObject, ["error"]);
	if (fromError != null) setValueByPath(toObject, ["error"], fromError);
	const fromResponse = getValueByPath(fromObject, ["response", "generateVideoResponse"]);
	if (fromResponse != null) setValueByPath(toObject, ["response"], generateVideosResponseFromMldev(apiClient, fromResponse));
	return toObject;
}
function videoFromVertex(apiClient, fromObject) {
	const toObject = {};
	const fromUri = getValueByPath(fromObject, ["gcsUri"]);
	if (fromUri != null) setValueByPath(toObject, ["uri"], fromUri);
	const fromVideoBytes = getValueByPath(fromObject, ["bytesBase64Encoded"]);
	if (fromVideoBytes != null) setValueByPath(toObject, ["videoBytes"], tBytes(apiClient, fromVideoBytes));
	const fromMimeType = getValueByPath(fromObject, ["mimeType"]);
	if (fromMimeType != null) setValueByPath(toObject, ["mimeType"], fromMimeType);
	return toObject;
}
function generatedVideoFromVertex(apiClient, fromObject) {
	const toObject = {};
	const fromVideo = getValueByPath(fromObject, ["_self"]);
	if (fromVideo != null) setValueByPath(toObject, ["video"], videoFromVertex(apiClient, fromVideo));
	return toObject;
}
function generateVideosResponseFromVertex(apiClient, fromObject) {
	const toObject = {};
	const fromGeneratedVideos = getValueByPath(fromObject, ["videos"]);
	if (fromGeneratedVideos != null) if (Array.isArray(fromGeneratedVideos)) setValueByPath(toObject, ["generatedVideos"], fromGeneratedVideos.map((item) => {
		return generatedVideoFromVertex(apiClient, item);
	}));
	else setValueByPath(toObject, ["generatedVideos"], fromGeneratedVideos);
	const fromRaiMediaFilteredCount = getValueByPath(fromObject, ["raiMediaFilteredCount"]);
	if (fromRaiMediaFilteredCount != null) setValueByPath(toObject, ["raiMediaFilteredCount"], fromRaiMediaFilteredCount);
	const fromRaiMediaFilteredReasons = getValueByPath(fromObject, ["raiMediaFilteredReasons"]);
	if (fromRaiMediaFilteredReasons != null) setValueByPath(toObject, ["raiMediaFilteredReasons"], fromRaiMediaFilteredReasons);
	return toObject;
}
function generateVideosOperationFromVertex(apiClient, fromObject) {
	const toObject = {};
	const fromName = getValueByPath(fromObject, ["name"]);
	if (fromName != null) setValueByPath(toObject, ["name"], fromName);
	const fromMetadata = getValueByPath(fromObject, ["metadata"]);
	if (fromMetadata != null) setValueByPath(toObject, ["metadata"], fromMetadata);
	const fromDone = getValueByPath(fromObject, ["done"]);
	if (fromDone != null) setValueByPath(toObject, ["done"], fromDone);
	const fromError = getValueByPath(fromObject, ["error"]);
	if (fromError != null) setValueByPath(toObject, ["error"], fromError);
	const fromResponse = getValueByPath(fromObject, ["response"]);
	if (fromResponse != null) setValueByPath(toObject, ["response"], generateVideosResponseFromVertex(apiClient, fromResponse));
	return toObject;
}
/**
* @license
* Copyright 2025 Google LLC
* SPDX-License-Identifier: Apache-2.0
*/
var Operations = class extends BaseModule {
	constructor(apiClient) {
		super();
		this.apiClient = apiClient;
	}
	/**
	* Gets the status of a long-running operation.
	*
	* @param parameters The parameters for the get operation request.
	* @return The updated Operation object, with the latest status or result.
	*/
	async getVideosOperation(parameters) {
		const operation = parameters.operation;
		const config$1 = parameters.config;
		if (operation.name === void 0 || operation.name === "") throw new Error("Operation name is required.");
		if (this.apiClient.isVertexAI()) {
			const resourceName$1 = operation.name.split("/operations/")[0];
			let httpOptions = void 0;
			if (config$1 && "httpOptions" in config$1) httpOptions = config$1.httpOptions;
			return this.fetchPredictVideosOperationInternal({
				operationName: operation.name,
				resourceName: resourceName$1,
				config: { httpOptions }
			});
		} else return this.getVideosOperationInternal({
			operationName: operation.name,
			config: config$1
		});
	}
	async getVideosOperationInternal(params) {
		var _a, _b;
		let response;
		let path$1 = "";
		let queryParams = {};
		if (this.apiClient.isVertexAI()) {
			const body = getOperationParametersToVertex(this.apiClient, params);
			path$1 = formatMap("{operationName}", body["_url"]);
			queryParams = body["_query"];
			delete body["config"];
			delete body["_url"];
			delete body["_query"];
			response = this.apiClient.request({
				path: path$1,
				queryParams,
				body: JSON.stringify(body),
				httpMethod: "GET",
				httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions
			}).then((httpResponse) => {
				return httpResponse.json();
			});
			return response.then((apiResponse) => {
				const resp = generateVideosOperationFromVertex(this.apiClient, apiResponse);
				return resp;
			});
		} else {
			const body = getOperationParametersToMldev(this.apiClient, params);
			path$1 = formatMap("{operationName}", body["_url"]);
			queryParams = body["_query"];
			delete body["config"];
			delete body["_url"];
			delete body["_query"];
			response = this.apiClient.request({
				path: path$1,
				queryParams,
				body: JSON.stringify(body),
				httpMethod: "GET",
				httpOptions: (_b = params.config) === null || _b === void 0 ? void 0 : _b.httpOptions
			}).then((httpResponse) => {
				return httpResponse.json();
			});
			return response.then((apiResponse) => {
				const resp = generateVideosOperationFromMldev(this.apiClient, apiResponse);
				return resp;
			});
		}
	}
	async fetchPredictVideosOperationInternal(params) {
		var _a;
		let response;
		let path$1 = "";
		let queryParams = {};
		if (this.apiClient.isVertexAI()) {
			const body = fetchPredictOperationParametersToVertex(this.apiClient, params);
			path$1 = formatMap("{resourceName}:fetchPredictOperation", body["_url"]);
			queryParams = body["_query"];
			delete body["config"];
			delete body["_url"];
			delete body["_query"];
			response = this.apiClient.request({
				path: path$1,
				queryParams,
				body: JSON.stringify(body),
				httpMethod: "POST",
				httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions
			}).then((httpResponse) => {
				return httpResponse.json();
			});
			return response.then((apiResponse) => {
				const resp = generateVideosOperationFromVertex(this.apiClient, apiResponse);
				return resp;
			});
		} else throw new Error("This method is only supported by the Vertex AI.");
	}
};
/**
* @license
* Copyright 2025 Google LLC
* SPDX-License-Identifier: Apache-2.0
*/
const CONTENT_TYPE_HEADER = "Content-Type";
const SERVER_TIMEOUT_HEADER = "X-Server-Timeout";
const USER_AGENT_HEADER = "User-Agent";
const GOOGLE_API_CLIENT_HEADER = "x-goog-api-client";
const SDK_VERSION = "0.9.0";
const LIBRARY_LABEL = `google-genai-sdk/${SDK_VERSION}`;
const VERTEX_AI_API_DEFAULT_VERSION = "v1beta1";
const GOOGLE_AI_API_DEFAULT_VERSION = "v1beta";
const responseLineRE = /^data: (.*)(?:\n\n|\r\r|\r\n\r\n)/;
/**
* Client errors raised by the GenAI API.
*/
var ClientError = class extends Error {
	constructor(message, stackTrace) {
		if (stackTrace) super(message, { cause: stackTrace });
		else super(message, { cause: new Error().stack });
		this.message = message;
		this.name = "ClientError";
	}
};
/**
* Server errors raised by the GenAI API.
*/
var ServerError = class extends Error {
	constructor(message, stackTrace) {
		if (stackTrace) super(message, { cause: stackTrace });
		else super(message, { cause: new Error().stack });
		this.message = message;
		this.name = "ServerError";
	}
};
/**
* The ApiClient class is used to send requests to the Gemini API or Vertex AI
* endpoints.
*/
var ApiClient = class {
	constructor(opts) {
		var _a, _b;
		this.clientOptions = Object.assign(Object.assign({}, opts), {
			project: opts.project,
			location: opts.location,
			apiKey: opts.apiKey,
			vertexai: opts.vertexai
		});
		const initHttpOptions = {};
		if (this.clientOptions.vertexai) {
			initHttpOptions.apiVersion = (_a = this.clientOptions.apiVersion) !== null && _a !== void 0 ? _a : VERTEX_AI_API_DEFAULT_VERSION;
			if (this.getProject() || this.getLocation()) {
				initHttpOptions.baseUrl = `https://${this.clientOptions.location}-aiplatform.googleapis.com/`;
				this.clientOptions.apiKey = void 0;
			} else {
				initHttpOptions.baseUrl = `https://aiplatform.googleapis.com/`;
				this.clientOptions.project = void 0;
				this.clientOptions.location = void 0;
			}
		} else {
			initHttpOptions.apiVersion = (_b = this.clientOptions.apiVersion) !== null && _b !== void 0 ? _b : GOOGLE_AI_API_DEFAULT_VERSION;
			initHttpOptions.baseUrl = `https://generativelanguage.googleapis.com/`;
		}
		initHttpOptions.headers = this.getDefaultHeaders();
		this.clientOptions.httpOptions = initHttpOptions;
		if (opts.httpOptions) this.clientOptions.httpOptions = this.patchHttpOptions(initHttpOptions, opts.httpOptions);
	}
	isVertexAI() {
		var _a;
		return (_a = this.clientOptions.vertexai) !== null && _a !== void 0 ? _a : false;
	}
	getProject() {
		return this.clientOptions.project;
	}
	getLocation() {
		return this.clientOptions.location;
	}
	getApiVersion() {
		if (this.clientOptions.httpOptions && this.clientOptions.httpOptions.apiVersion !== void 0) return this.clientOptions.httpOptions.apiVersion;
		throw new Error("API version is not set.");
	}
	getBaseUrl() {
		if (this.clientOptions.httpOptions && this.clientOptions.httpOptions.baseUrl !== void 0) return this.clientOptions.httpOptions.baseUrl;
		throw new Error("Base URL is not set.");
	}
	getRequestUrl() {
		return this.getRequestUrlInternal(this.clientOptions.httpOptions);
	}
	getHeaders() {
		if (this.clientOptions.httpOptions && this.clientOptions.httpOptions.headers !== void 0) return this.clientOptions.httpOptions.headers;
		else throw new Error("Headers are not set.");
	}
	getRequestUrlInternal(httpOptions) {
		if (!httpOptions || httpOptions.baseUrl === void 0 || httpOptions.apiVersion === void 0) throw new Error("HTTP options are not correctly set.");
		const baseUrl = httpOptions.baseUrl.endsWith("/") ? httpOptions.baseUrl.slice(0, -1) : httpOptions.baseUrl;
		const urlElement = [baseUrl];
		if (httpOptions.apiVersion && httpOptions.apiVersion !== "") urlElement.push(httpOptions.apiVersion);
		return urlElement.join("/");
	}
	getBaseResourcePath() {
		return `projects/${this.clientOptions.project}/locations/${this.clientOptions.location}`;
	}
	getApiKey() {
		return this.clientOptions.apiKey;
	}
	getWebsocketBaseUrl() {
		const baseUrl = this.getBaseUrl();
		const urlParts = new URL(baseUrl);
		urlParts.protocol = "wss";
		return urlParts.toString();
	}
	setBaseUrl(url) {
		if (this.clientOptions.httpOptions) this.clientOptions.httpOptions.baseUrl = url;
		else throw new Error("HTTP options are not correctly set.");
	}
	constructUrl(path$1, httpOptions, prependProjectLocation) {
		const urlElement = [this.getRequestUrlInternal(httpOptions)];
		if (prependProjectLocation) urlElement.push(this.getBaseResourcePath());
		if (path$1 !== "") urlElement.push(path$1);
		const url = new URL(`${urlElement.join("/")}`);
		return url;
	}
	shouldPrependVertexProjectPath(request) {
		if (this.clientOptions.apiKey) return false;
		if (!this.clientOptions.vertexai) return false;
		if (request.path.startsWith("projects/")) return false;
		if (request.httpMethod === "GET" && request.path.startsWith("publishers/google/models")) return false;
		return true;
	}
	async request(request) {
		let patchedHttpOptions = this.clientOptions.httpOptions;
		if (request.httpOptions) patchedHttpOptions = this.patchHttpOptions(this.clientOptions.httpOptions, request.httpOptions);
		const prependProjectLocation = this.shouldPrependVertexProjectPath(request);
		const url = this.constructUrl(request.path, patchedHttpOptions, prependProjectLocation);
		if (request.queryParams) for (const [key, value] of Object.entries(request.queryParams)) url.searchParams.append(key, String(value));
		let requestInit = {};
		if (request.httpMethod === "GET") {
			if (request.body && request.body !== "{}") throw new Error("Request body should be empty for GET request, but got non empty request body");
		} else requestInit.body = request.body;
		requestInit = await this.includeExtraHttpOptionsToRequestInit(requestInit, patchedHttpOptions);
		return this.unaryApiCall(url, requestInit, request.httpMethod);
	}
	patchHttpOptions(baseHttpOptions, requestHttpOptions) {
		const patchedHttpOptions = JSON.parse(JSON.stringify(baseHttpOptions));
		for (const [key, value] of Object.entries(requestHttpOptions)) if (typeof value === "object") patchedHttpOptions[key] = Object.assign(Object.assign({}, patchedHttpOptions[key]), value);
		else if (value !== void 0) patchedHttpOptions[key] = value;
		return patchedHttpOptions;
	}
	async requestStream(request) {
		let patchedHttpOptions = this.clientOptions.httpOptions;
		if (request.httpOptions) patchedHttpOptions = this.patchHttpOptions(this.clientOptions.httpOptions, request.httpOptions);
		const prependProjectLocation = this.shouldPrependVertexProjectPath(request);
		const url = this.constructUrl(request.path, patchedHttpOptions, prependProjectLocation);
		if (!url.searchParams.has("alt") || url.searchParams.get("alt") !== "sse") url.searchParams.set("alt", "sse");
		let requestInit = {};
		requestInit.body = request.body;
		requestInit = await this.includeExtraHttpOptionsToRequestInit(requestInit, patchedHttpOptions);
		return this.streamApiCall(url, requestInit, request.httpMethod);
	}
	async includeExtraHttpOptionsToRequestInit(requestInit, httpOptions) {
		if (httpOptions && httpOptions.timeout && httpOptions.timeout > 0) {
			const abortController = new AbortController();
			const signal = abortController.signal;
			setTimeout(() => abortController.abort(), httpOptions.timeout);
			requestInit.signal = signal;
		}
		requestInit.headers = await this.getHeadersInternal(httpOptions);
		return requestInit;
	}
	async unaryApiCall(url, requestInit, httpMethod) {
		return this.apiCall(url.toString(), Object.assign(Object.assign({}, requestInit), { method: httpMethod })).then(async (response) => {
			await throwErrorIfNotOK(response);
			return new HttpResponse(response);
		}).catch((e) => {
			if (e instanceof Error) throw e;
			else throw new Error(JSON.stringify(e));
		});
	}
	async streamApiCall(url, requestInit, httpMethod) {
		return this.apiCall(url.toString(), Object.assign(Object.assign({}, requestInit), { method: httpMethod })).then(async (response) => {
			await throwErrorIfNotOK(response);
			return this.processStreamResponse(response);
		}).catch((e) => {
			if (e instanceof Error) throw e;
			else throw new Error(JSON.stringify(e));
		});
	}
	processStreamResponse(response) {
		var _a;
		return __asyncGenerator(this, arguments, function* processStreamResponse_1() {
			const reader = (_a = response === null || response === void 0 ? void 0 : response.body) === null || _a === void 0 ? void 0 : _a.getReader();
			const decoder = new TextDecoder("utf-8");
			if (!reader) throw new Error("Response body is empty");
			try {
				let buffer = "";
				while (true) {
					const { done, value } = yield __await(reader.read());
					if (done) {
						if (buffer.trim().length > 0) throw new Error("Incomplete JSON segment at the end");
						break;
					}
					const chunkString = decoder.decode(value);
					buffer += chunkString;
					let match = buffer.match(responseLineRE);
					while (match) {
						const processedChunkString = match[1];
						try {
							const partialResponse = new Response(processedChunkString, {
								headers: response === null || response === void 0 ? void 0 : response.headers,
								status: response === null || response === void 0 ? void 0 : response.status,
								statusText: response === null || response === void 0 ? void 0 : response.statusText
							});
							yield yield __await(new HttpResponse(partialResponse));
							buffer = buffer.slice(match[0].length);
							match = buffer.match(responseLineRE);
						} catch (e) {
							throw new Error(`exception parsing stream chunk ${processedChunkString}. ${e}`);
						}
					}
				}
			} finally {
				reader.releaseLock();
			}
		});
	}
	async apiCall(url, requestInit) {
		return fetch(url, requestInit).catch((e) => {
			throw new Error(`exception ${e} sending request`);
		});
	}
	getDefaultHeaders() {
		const headers = {};
		const versionHeaderValue = LIBRARY_LABEL + " " + this.clientOptions.userAgentExtra;
		headers[USER_AGENT_HEADER] = versionHeaderValue;
		headers[GOOGLE_API_CLIENT_HEADER] = versionHeaderValue;
		headers[CONTENT_TYPE_HEADER] = "application/json";
		return headers;
	}
	async getHeadersInternal(httpOptions) {
		const headers = new Headers();
		if (httpOptions && httpOptions.headers) {
			for (const [key, value] of Object.entries(httpOptions.headers)) headers.append(key, value);
			if (httpOptions.timeout && httpOptions.timeout > 0) headers.append(SERVER_TIMEOUT_HEADER, String(Math.ceil(httpOptions.timeout / 1e3)));
		}
		await this.clientOptions.auth.addAuthHeaders(headers);
		return headers;
	}
	/**
	* Uploads a file asynchronously using Gemini API only, this is not supported
	* in Vertex AI.
	*
	* @param file The string path to the file to be uploaded or a Blob object.
	* @param config Optional parameters specified in the `UploadFileConfig`
	*     interface. @see {@link UploadFileConfig}
	* @return A promise that resolves to a `File` object.
	* @throws An error if called on a Vertex AI client.
	* @throws An error if the `mimeType` is not provided and can not be inferred,
	*/
	async uploadFile(file, config$1) {
		var _a;
		const fileToUpload = {};
		if (config$1 != null) {
			fileToUpload.mimeType = config$1.mimeType;
			fileToUpload.name = config$1.name;
			fileToUpload.displayName = config$1.displayName;
		}
		if (fileToUpload.name && !fileToUpload.name.startsWith("files/")) fileToUpload.name = `files/${fileToUpload.name}`;
		const uploader = this.clientOptions.uploader;
		const fileStat = await uploader.stat(file);
		fileToUpload.sizeBytes = String(fileStat.size);
		const mimeType = (_a = config$1 === null || config$1 === void 0 ? void 0 : config$1.mimeType) !== null && _a !== void 0 ? _a : fileStat.type;
		if (mimeType === void 0 || mimeType === "") throw new Error("Can not determine mimeType. Please provide mimeType in the config.");
		fileToUpload.mimeType = mimeType;
		const uploadUrl = await this.fetchUploadUrl(fileToUpload, config$1);
		return uploader.upload(file, uploadUrl, this);
	}
	async fetchUploadUrl(file, config$1) {
		var _a;
		let httpOptions = {};
		if (config$1 === null || config$1 === void 0 ? void 0 : config$1.httpOptions) httpOptions = config$1.httpOptions;
		else httpOptions = {
			apiVersion: "",
			headers: {
				"Content-Type": "application/json",
				"X-Goog-Upload-Protocol": "resumable",
				"X-Goog-Upload-Command": "start",
				"X-Goog-Upload-Header-Content-Length": `${file.sizeBytes}`,
				"X-Goog-Upload-Header-Content-Type": `${file.mimeType}`
			}
		};
		const body = { "file": file };
		const httpResponse = await this.request({
			path: formatMap("upload/v1beta/files", body["_url"]),
			body: JSON.stringify(body),
			httpMethod: "POST",
			httpOptions
		});
		if (!httpResponse || !(httpResponse === null || httpResponse === void 0 ? void 0 : httpResponse.headers)) throw new Error("Server did not return an HttpResponse or the returned HttpResponse did not have headers.");
		const uploadUrl = (_a = httpResponse === null || httpResponse === void 0 ? void 0 : httpResponse.headers) === null || _a === void 0 ? void 0 : _a["x-goog-upload-url"];
		if (uploadUrl === void 0) throw new Error("Failed to get upload url. Server did not return the x-google-upload-url in the headers");
		return uploadUrl;
	}
};
async function throwErrorIfNotOK(response) {
	var _a;
	if (response === void 0) throw new ServerError("response is undefined");
	if (!response.ok) {
		const status = response.status;
		const statusText = response.statusText;
		let errorBody;
		if ((_a = response.headers.get("content-type")) === null || _a === void 0 ? void 0 : _a.includes("application/json")) errorBody = await response.json();
		else errorBody = { error: {
			message: "exception parsing response",
			code: response.status,
			status: response.statusText
		} };
		const errorMessage = `got status: ${status} ${statusText}. ${JSON.stringify(errorBody)}`;
		if (status >= 400 && status < 500) {
			const clientError = new ClientError(errorMessage);
			throw clientError;
		} else if (status >= 500 && status < 600) {
			const serverError = new ServerError(errorMessage);
			throw serverError;
		}
		throw new Error(errorMessage);
	}
}
const MAX_CHUNK_SIZE = 1024 * 1024 * 8;
async function uploadBlob(file, uploadUrl, apiClient) {
	var _a, _b;
	let fileSize = 0;
	let offset = 0;
	let response = new HttpResponse(new Response());
	let uploadCommand = "upload";
	fileSize = file.size;
	while (offset < fileSize) {
		const chunkSize = Math.min(MAX_CHUNK_SIZE, fileSize - offset);
		const chunk = file.slice(offset, offset + chunkSize);
		if (offset + chunkSize >= fileSize) uploadCommand += ", finalize";
		response = await apiClient.request({
			path: "",
			body: chunk,
			httpMethod: "POST",
			httpOptions: {
				apiVersion: "",
				baseUrl: uploadUrl,
				headers: {
					"X-Goog-Upload-Command": uploadCommand,
					"X-Goog-Upload-Offset": String(offset),
					"Content-Length": String(chunkSize)
				}
			}
		});
		offset += chunkSize;
		if (((_a = response === null || response === void 0 ? void 0 : response.headers) === null || _a === void 0 ? void 0 : _a["x-goog-upload-status"]) !== "active") break;
		if (fileSize <= offset) throw new Error("All content has been uploaded, but the upload status is not finalized.");
	}
	const responseJson = await (response === null || response === void 0 ? void 0 : response.json());
	if (((_b = response === null || response === void 0 ? void 0 : response.headers) === null || _b === void 0 ? void 0 : _b["x-goog-upload-status"]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
	return responseJson["file"];
}
async function getBlobStat(file) {
	const fileStat = {
		size: file.size,
		type: file.type
	};
	return fileStat;
}
var BrowserUploader = class {
	async upload(file, uploadUrl, apiClient) {
		if (typeof file === "string") throw new Error("File path is not supported in browser uploader.");
		return await uploadBlob(file, uploadUrl, apiClient);
	}
	async stat(file) {
		if (typeof file === "string") throw new Error("File path is not supported in browser uploader.");
		else return await getBlobStat(file);
	}
};
/**
* @license
* Copyright 2025 Google LLC
* SPDX-License-Identifier: Apache-2.0
*/
var BrowserWebSocketFactory = class {
	create(url, headers, callbacks) {
		return new BrowserWebSocket(url, headers, callbacks);
	}
};
var BrowserWebSocket = class {
	constructor(url, headers, callbacks) {
		this.url = url;
		this.headers = headers;
		this.callbacks = callbacks;
	}
	connect() {
		this.ws = new WebSocket(this.url);
		this.ws.onopen = this.callbacks.onopen;
		this.ws.onerror = this.callbacks.onerror;
		this.ws.onclose = this.callbacks.onclose;
		this.ws.onmessage = this.callbacks.onmessage;
	}
	send(message) {
		if (this.ws === void 0) throw new Error("WebSocket is not connected");
		this.ws.send(message);
	}
	close() {
		if (this.ws === void 0) throw new Error("WebSocket is not connected");
		this.ws.close();
	}
};
/**
* @license
* Copyright 2025 Google LLC
* SPDX-License-Identifier: Apache-2.0
*/
const GOOGLE_API_KEY_HEADER = "x-goog-api-key";
var WebAuth = class {
	constructor(apiKey) {
		this.apiKey = apiKey;
	}
	async addAuthHeaders(headers) {
		if (headers.get(GOOGLE_API_KEY_HEADER) !== null) return;
		headers.append(GOOGLE_API_KEY_HEADER, this.apiKey);
	}
};
/**
* @license
* Copyright 2025 Google LLC
* SPDX-License-Identifier: Apache-2.0
*/
const LANGUAGE_LABEL_PREFIX = "gl-node/";
/**
* The Google GenAI SDK.
*
* @remarks
* Provides access to the GenAI features through either the {@link
* https://cloud.google.com/vertex-ai/docs/reference/rest | Gemini API} or
* the {@link https://cloud.google.com/vertex-ai/docs/reference/rest | Vertex AI
* API}.
*
* The {@link GoogleGenAIOptions.vertexai} value determines which of the API
* services to use.
*
* When using the Gemini API, a {@link GoogleGenAIOptions.apiKey} must also be
* set. When using Vertex AI, currently only {@link GoogleGenAIOptions.apiKey}
* is supported via Express mode. {@link GoogleGenAIOptions.project} and {@link
* GoogleGenAIOptions.location} should not be set.
*
* @example
* Initializing the SDK for using the Gemini API:
* ```ts
* import {GoogleGenAI} from '@google/genai';
* const ai = new GoogleGenAI({apiKey: 'GEMINI_API_KEY'});
* ```
*
* @example
* Initializing the SDK for using the Vertex AI API:
* ```ts
* import {GoogleGenAI} from '@google/genai';
* const ai = new GoogleGenAI({
*   vertexai: true,
*   project: 'PROJECT_ID',
*   location: 'PROJECT_LOCATION'
* });
* ```
*
*/
var GoogleGenAI = class {
	constructor(options) {
		var _a;
		if (options.apiKey == null) throw new Error("An API Key must be set when running in a browser");
		if (options.project || options.location) throw new Error("Vertex AI project based authentication is not supported on browser runtimes. Please do not provide a project or location.");
		this.vertexai = (_a = options.vertexai) !== null && _a !== void 0 ? _a : false;
		this.apiKey = options.apiKey;
		this.apiVersion = options.apiVersion;
		const auth = new WebAuth(this.apiKey);
		this.apiClient = new ApiClient({
			auth,
			apiVersion: this.apiVersion,
			apiKey: this.apiKey,
			vertexai: this.vertexai,
			httpOptions: options.httpOptions,
			userAgentExtra: LANGUAGE_LABEL_PREFIX + "web",
			uploader: new BrowserUploader()
		});
		this.models = new Models(this.apiClient);
		this.live = new Live(this.apiClient, auth, new BrowserWebSocketFactory());
		this.chats = new Chats(this.models, this.apiClient);
		this.caches = new Caches(this.apiClient);
		this.files = new Files(this.apiClient);
		this.operations = new Operations(this.apiClient);
	}
};

//#endregion
//#region (ignored) node_modules/dotenv/lib
var require_lib = __commonJS({ "node_modules/dotenv/lib"() {} });

//#endregion
//#region node_modules/dotenv/package.json
var require_package = __commonJS({ "node_modules/dotenv/package.json"(exports, module) {
	module.exports = {
		"name": "dotenv",
		"version": "16.5.0",
		"description": "Loads environment variables from .env file",
		"main": "lib/main.js",
		"types": "lib/main.d.ts",
		"exports": {
			".": {
				"types": "./lib/main.d.ts",
				"require": "./lib/main.js",
				"default": "./lib/main.js"
			},
			"./config": "./config.js",
			"./config.js": "./config.js",
			"./lib/env-options": "./lib/env-options.js",
			"./lib/env-options.js": "./lib/env-options.js",
			"./lib/cli-options": "./lib/cli-options.js",
			"./lib/cli-options.js": "./lib/cli-options.js",
			"./package.json": "./package.json"
		},
		"scripts": {
			"dts-check": "tsc --project tests/types/tsconfig.json",
			"lint": "standard",
			"pretest": "npm run lint && npm run dts-check",
			"test": "tap run --allow-empty-coverage --disable-coverage --timeout=60000",
			"test:coverage": "tap run --show-full-coverage --timeout=60000 --coverage-report=lcov",
			"prerelease": "npm test",
			"release": "standard-version"
		},
		"repository": {
			"type": "git",
			"url": "git://github.com/motdotla/dotenv.git"
		},
		"homepage": "https://github.com/motdotla/dotenv#readme",
		"funding": "https://dotenvx.com",
		"keywords": [
			"dotenv",
			"env",
			".env",
			"environment",
			"variables",
			"config",
			"settings"
		],
		"readmeFilename": "README.md",
		"license": "BSD-2-Clause",
		"devDependencies": {
			"@types/node": "^18.11.3",
			"decache": "^4.6.2",
			"sinon": "^14.0.1",
			"standard": "^17.0.0",
			"standard-version": "^9.5.0",
			"tap": "^19.2.0",
			"typescript": "^4.8.4"
		},
		"engines": { "node": ">=12" },
		"browser": { "fs": false }
	};
} });

//#endregion
//#region node_modules/dotenv/lib/main.js
var require_main = __commonJS({ "node_modules/dotenv/lib/main.js"(exports, module) {
	const fs = require_lib();
	const path = __require("path");
	const os = __require("os");
	const crypto = __require("crypto");
	const packageJson = require_package();
	const version = packageJson.version;
	const LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/gm;
	function parse(src) {
		const obj = {};
		let lines = src.toString();
		lines = lines.replace(/\r\n?/gm, "\n");
		let match;
		while ((match = LINE.exec(lines)) != null) {
			const key = match[1];
			let value = match[2] || "";
			value = value.trim();
			const maybeQuote = value[0];
			value = value.replace(/^(['"`])([\s\S]*)\1$/gm, "$2");
			if (maybeQuote === "\"") {
				value = value.replace(/\\n/g, "\n");
				value = value.replace(/\\r/g, "\r");
			}
			obj[key] = value;
		}
		return obj;
	}
	function _parseVault(options) {
		const vaultPath = _vaultPath(options);
		const result = DotenvModule.configDotenv({ path: vaultPath });
		if (!result.parsed) {
			const err = new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`);
			err.code = "MISSING_DATA";
			throw err;
		}
		const keys = _dotenvKey(options).split(",");
		const length = keys.length;
		let decrypted;
		for (let i = 0; i < length; i++) try {
			const key = keys[i].trim();
			const attrs = _instructions(result, key);
			decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key);
			break;
		} catch (error) {
			if (i + 1 >= length) throw error;
		}
		return DotenvModule.parse(decrypted);
	}
	function _warn(message) {
		console.log(`[dotenv@${version}][WARN] ${message}`);
	}
	function _debug(message) {
		console.log(`[dotenv@${version}][DEBUG] ${message}`);
	}
	function _dotenvKey(options) {
		if (options && options.DOTENV_KEY && options.DOTENV_KEY.length > 0) return options.DOTENV_KEY;
		if (process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0) return process.env.DOTENV_KEY;
		return "";
	}
	function _instructions(result, dotenvKey) {
		let uri;
		try {
			uri = new URL(dotenvKey);
		} catch (error) {
			if (error.code === "ERR_INVALID_URL") {
				const err = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
				err.code = "INVALID_DOTENV_KEY";
				throw err;
			}
			throw error;
		}
		const key = uri.password;
		if (!key) {
			const err = new Error("INVALID_DOTENV_KEY: Missing key part");
			err.code = "INVALID_DOTENV_KEY";
			throw err;
		}
		const environment = uri.searchParams.get("environment");
		if (!environment) {
			const err = new Error("INVALID_DOTENV_KEY: Missing environment part");
			err.code = "INVALID_DOTENV_KEY";
			throw err;
		}
		const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`;
		const ciphertext = result.parsed[environmentKey];
		if (!ciphertext) {
			const err = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`);
			err.code = "NOT_FOUND_DOTENV_ENVIRONMENT";
			throw err;
		}
		return {
			ciphertext,
			key
		};
	}
	function _vaultPath(options) {
		let possibleVaultPath = null;
		if (options && options.path && options.path.length > 0) if (Array.isArray(options.path)) {
			for (const filepath of options.path) if (fs.existsSync(filepath)) possibleVaultPath = filepath.endsWith(".vault") ? filepath : `${filepath}.vault`;
		} else possibleVaultPath = options.path.endsWith(".vault") ? options.path : `${options.path}.vault`;
		else possibleVaultPath = path.resolve(process.cwd(), ".env.vault");
		if (fs.existsSync(possibleVaultPath)) return possibleVaultPath;
		return null;
	}
	function _resolveHome(envPath) {
		return envPath[0] === "~" ? path.join(os.homedir(), envPath.slice(1)) : envPath;
	}
	function _configVault(options) {
		const debug = Boolean(options && options.debug);
		if (debug) _debug("Loading env from encrypted .env.vault");
		const parsed = DotenvModule._parseVault(options);
		let processEnv = process.env;
		if (options && options.processEnv != null) processEnv = options.processEnv;
		DotenvModule.populate(processEnv, parsed, options);
		return { parsed };
	}
	function configDotenv(options) {
		const dotenvPath = path.resolve(process.cwd(), ".env");
		let encoding = "utf8";
		const debug = Boolean(options && options.debug);
		if (options && options.encoding) encoding = options.encoding;
		else if (debug) _debug("No encoding is specified. UTF-8 is used by default");
		let optionPaths = [dotenvPath];
		if (options && options.path) if (!Array.isArray(options.path)) optionPaths = [_resolveHome(options.path)];
		else {
			optionPaths = [];
			for (const filepath of options.path) optionPaths.push(_resolveHome(filepath));
		}
		let lastError;
		const parsedAll = {};
		for (const path$1 of optionPaths) try {
			const parsed = DotenvModule.parse(fs.readFileSync(path$1, { encoding }));
			DotenvModule.populate(parsedAll, parsed, options);
		} catch (e) {
			if (debug) _debug(`Failed to load ${path$1} ${e.message}`);
			lastError = e;
		}
		let processEnv = process.env;
		if (options && options.processEnv != null) processEnv = options.processEnv;
		DotenvModule.populate(processEnv, parsedAll, options);
		if (lastError) return {
			parsed: parsedAll,
			error: lastError
		};
		else return { parsed: parsedAll };
	}
	function config(options) {
		if (_dotenvKey(options).length === 0) return DotenvModule.configDotenv(options);
		const vaultPath = _vaultPath(options);
		if (!vaultPath) {
			_warn(`You set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}. Did you forget to build it?`);
			return DotenvModule.configDotenv(options);
		}
		return DotenvModule._configVault(options);
	}
	function decrypt(encrypted, keyStr) {
		const key = Buffer.from(keyStr.slice(-64), "hex");
		let ciphertext = Buffer.from(encrypted, "base64");
		const nonce = ciphertext.subarray(0, 12);
		const authTag = ciphertext.subarray(-16);
		ciphertext = ciphertext.subarray(12, -16);
		try {
			const aesgcm = crypto.createDecipheriv("aes-256-gcm", key, nonce);
			aesgcm.setAuthTag(authTag);
			return `${aesgcm.update(ciphertext)}${aesgcm.final()}`;
		} catch (error) {
			const isRange = error instanceof RangeError;
			const invalidKeyLength = error.message === "Invalid key length";
			const decryptionFailed = error.message === "Unsupported state or unable to authenticate data";
			if (isRange || invalidKeyLength) {
				const err = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
				err.code = "INVALID_DOTENV_KEY";
				throw err;
			} else if (decryptionFailed) {
				const err = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
				err.code = "DECRYPTION_FAILED";
				throw err;
			} else throw error;
		}
	}
	function populate(processEnv, parsed, options = {}) {
		const debug = Boolean(options && options.debug);
		const override = Boolean(options && options.override);
		if (typeof parsed !== "object") {
			const err = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
			err.code = "OBJECT_REQUIRED";
			throw err;
		}
		for (const key of Object.keys(parsed)) if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
			if (override === true) processEnv[key] = parsed[key];
			if (debug) if (override === true) _debug(`"${key}" is already defined and WAS overwritten`);
			else _debug(`"${key}" is already defined and was NOT overwritten`);
		} else processEnv[key] = parsed[key];
	}
	const DotenvModule = {
		configDotenv,
		_configVault,
		_parseVault,
		config,
		decrypt,
		parse,
		populate
	};
	module.exports.configDotenv = DotenvModule.configDotenv;
	module.exports._configVault = DotenvModule._configVault;
	module.exports._parseVault = DotenvModule._parseVault;
	module.exports.config = DotenvModule.config;
	module.exports.decrypt = DotenvModule.decrypt;
	module.exports.parse = DotenvModule.parse;
	module.exports.populate = DotenvModule.populate;
	module.exports = DotenvModule;
} });
var import_main = __toESM(require_main());

//#endregion
//#region src/use-ai.js
import_main.default.config();
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
async function main() {
	const response = await ai.models.generateContent({
		model: "gemini-2.5-flash-preview-04-17",
		contents: "Provide short example of a feedback to Pull Request - imagine that you are a reviewer."
	});
	console.log(response.text);
}
main();

//#endregion
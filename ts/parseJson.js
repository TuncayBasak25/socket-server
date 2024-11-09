"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJson = void 0;
function parseJson(data) {
    try {
        return JSON.parse(data);
    }
    catch (error) {
        return null;
    }
}
exports.parseJson = parseJson;

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var core = require("@actions/core");
var Octokit = require('@octokit/core').Octokit;
var octokit;
var retryCount = 0;
var maxAttempts = 3; // https://youtu.be/-IOMNUayJjI
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var githubToken, head, base, owner, repo, response, pull_number;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    githubToken = core.getInput('github-token', { required: true });
                    head = core.getInput('from-branch', { required: true });
                    base = core.getInput('to-branch', { required: true });
                    owner = core.getInput('repository-owner', { required: true });
                    repo = core.getInput('repository', { required: true });
                    octokit = new Octokit({ auth: githubToken });
                    return [4 /*yield*/, octokit.request('POST /repos/{owner}/{repo}/pulls', {
                            owner: owner,
                            repo: repo,
                            head: head,
                            base: base,
                            title: "Auto merge ".concat(head, " to ").concat(base)
                        })];
                case 1:
                    response = _a.sent();
                    pull_number = response.data.number;
                    core.info('PR created');
                    return [4 /*yield*/, returnPullRequestNumber({
                            repo: repo,
                            owner: owner,
                            pull_number: pull_number
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function returnPullRequestNumber(requestData) {
    return __awaiter(this, void 0, void 0, function () {
        var pull_request;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, octokit.request("GET /repos/{owner}/{repo}/pulls/{pull_number}", requestData)];
                case 1:
                    pull_request = _a.sent();
                    if (!(pull_request.data.mergeable_state == 'unknown')) return [3 /*break*/, 3];
                    if (retryCount >= maxAttempts) {
                        core.error("Get pr status max attempts limit exceeded, payload: ".concat(JSON.stringify(requestData)));
                        process.exit(1);
                    }
                    retryCount++;
                    return [4 /*yield*/, delay(1000)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, returnPullRequestNumber(requestData)];
                case 3:
                    if (pull_request.data.mergeable) {
                        core.setOutput('pull_number', requestData.pull_number);
                    }
                    else {
                        core.error("Pull request #".concat(requestData.pull_number, " is not mergeable"));
                        process.exit(1);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function delay(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
run().then();

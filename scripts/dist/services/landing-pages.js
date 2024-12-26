"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s)
                if (Object.prototype.hasOwnProperty.call(s, p))
                    t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try {
            step(generator.next(value));
        }
        catch (e) {
            reject(e);
        } }
        function rejected(value) { try {
            step(generator["throw"](value));
        }
        catch (e) {
            reject(e);
        } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function () { if (t[0] & 1)
            throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f)
            throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _)
            try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                    return t;
                if (y = 0, t)
                    op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0:
                    case 1:
                        t = op;
                        break;
                    case 4:
                        _.label++;
                        return { value: op[1], done: false };
                    case 5:
                        _.label++;
                        y = op[1];
                        op = [0];
                        continue;
                    case 7:
                        op = _.ops.pop();
                        _.trys.pop();
                        continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                            _ = 0;
                            continue;
                        }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                            _.label = op[1];
                            break;
                        }
                        if (op[0] === 6 && _.label < t[1]) {
                            _.label = t[1];
                            t = op;
                            break;
                        }
                        if (t && _.label < t[2]) {
                            _.label = t[2];
                            _.ops.push(op);
                            break;
                        }
                        if (t[2])
                            _.ops.pop();
                        _.trys.pop();
                        continue;
                }
                op = body.call(thisArg, _);
            }
            catch (e) {
                op = [6, e];
                y = 0;
            }
            finally {
                f = t = 0;
            }
        if (op[0] & 5)
            throw op[1];
        return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLandingPage = exports.updateLandingPage = exports.createLandingPage = exports.getLandingPageBySlug = exports.getLandingPages = void 0;
var firestore_1 = require("firebase/firestore");
var firestore_2 = require("firebase/firestore");
var app_1 = require("firebase/app");
var config = {
    apiKey: "AIzaSyDV_eiDfZn8hEdSUU-3_ooiGm5aFMGvxyc",
    authDomain: "stefanhiene-2ec0a.firebaseapp.com",
    projectId: "stefanhiene-2ec0a",
    storageBucket: "stefanhiene-2ec0a.firebasestorage.app",
    messagingSenderId: "80241216538",
    appId: "1:80241216538:web:c96211fe87de2738dad5a3"
};
// Initialize Firebase
var app = (0, app_1.initializeApp)(config);
var db = (0, firestore_2.getFirestore)(app);
var COLLECTION_NAME = 'landing-pages';
var getLandingPages = function () {
    return __awaiter(void 0, void 0, void 0, function () {
        var landingPagesRef, snapshot;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    landingPagesRef = (0, firestore_1.collection)(db, COLLECTION_NAME);
                    return [4 /*yield*/, (0, firestore_1.getDocs)(landingPagesRef)];
                case 1:
                    snapshot = _a.sent();
                    return [2 /*return*/, snapshot.docs.map(function (doc) {
                            var _a, _b;
                            return (__assign(__assign({ id: doc.id }, doc.data()), { createdAt: (_a = doc.data().createdAt) === null || _a === void 0 ? void 0 : _a.toDate(), updatedAt: (_b = doc.data().updatedAt) === null || _b === void 0 ? void 0 : _b.toDate() }));
                        })];
            }
        });
    });
};
exports.getLandingPages = getLandingPages;
var getLandingPageBySlug = function (slug) {
    return __awaiter(void 0, void 0, void 0, function () {
        var landingPagesRef, q, snapshot, doc;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    landingPagesRef = (0, firestore_1.collection)(db, COLLECTION_NAME);
                    q = (0, firestore_1.query)(landingPagesRef, (0, firestore_1.where)("slug", "==", slug));
                    return [4 /*yield*/, (0, firestore_1.getDocs)(q)];
                case 1:
                    snapshot = _c.sent();
                    if (snapshot.empty) {
                        return [2 /*return*/, null];
                    }
                    doc = snapshot.docs[0];
                    return [2 /*return*/, __assign(__assign({ id: doc.id }, doc.data()), { createdAt: (_a = doc.data().createdAt) === null || _a === void 0 ? void 0 : _a.toDate(), updatedAt: (_b = doc.data().updatedAt) === null || _b === void 0 ? void 0 : _b.toDate() })];
            }
        });
    });
};
exports.getLandingPageBySlug = getLandingPageBySlug;
var createLandingPage = function (landingPage) {
    return __awaiter(void 0, void 0, void 0, function () {
        var navigation, docRef;
        var _a, _b, _c, _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    navigation = __assign(__assign({}, landingPage.navigation), { settings: {
                            mobileBreakpoint: ((_b = (_a = landingPage.navigation) === null || _a === void 0 ? void 0 : _a.settings) === null || _b === void 0 ? void 0 : _b.mobileBreakpoint) || 768,
                            showSocialLinks: ((_d = (_c = landingPage.navigation) === null || _c === void 0 ? void 0 : _c.settings) === null || _d === void 0 ? void 0 : _d.showSocialLinks) || false,
                            enableSearch: ((_f = (_e = landingPage.navigation) === null || _e === void 0 ? void 0 : _e.settings) === null || _f === void 0 ? void 0 : _f.enableSearch) || false,
                        } });
                    return [4 /*yield*/, (0, firestore_1.addDoc)((0, firestore_1.collection)(db, COLLECTION_NAME), __assign(__assign({}, landingPage), { navigation: navigation, createdAt: new Date(), updatedAt: new Date() }))];
                case 1:
                    docRef = _g.sent();
                    return [2 /*return*/, docRef.id];
            }
        });
    });
};
exports.createLandingPage = createLandingPage;
var updateLandingPage = function (id, landingPage) {
    return __awaiter(void 0, void 0, void 0, function () {
        var docRef, navigation;
        var _a, _b, _c, _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    docRef = (0, firestore_1.doc)(db, COLLECTION_NAME, id);
                    navigation = landingPage.navigation ? __assign(__assign({}, landingPage.navigation), { settings: {
                            mobileBreakpoint: ((_b = (_a = landingPage.navigation) === null || _a === void 0 ? void 0 : _a.settings) === null || _b === void 0 ? void 0 : _b.mobileBreakpoint) || 768,
                            showSocialLinks: ((_d = (_c = landingPage.navigation) === null || _c === void 0 ? void 0 : _c.settings) === null || _d === void 0 ? void 0 : _d.showSocialLinks) || false,
                            enableSearch: ((_f = (_e = landingPage.navigation) === null || _e === void 0 ? void 0 : _e.settings) === null || _f === void 0 ? void 0 : _f.enableSearch) || false,
                        } }) : undefined;
                    return [4 /*yield*/, (0, firestore_1.updateDoc)(docRef, __assign(__assign(__assign({}, landingPage), (navigation && { navigation: navigation })), { updatedAt: new Date() }))];
                case 1:
                    _g.sent();
                    return [2 /*return*/];
            }
        });
    });
};
exports.updateLandingPage = updateLandingPage;
var deleteLandingPage = function (id) {
    return __awaiter(void 0, void 0, void 0, function () {
        var docRef;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    docRef = (0, firestore_1.doc)(db, COLLECTION_NAME, id);
                    return [4 /*yield*/, (0, firestore_1.deleteDoc)(docRef)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
};
exports.deleteLandingPage = deleteLandingPage;

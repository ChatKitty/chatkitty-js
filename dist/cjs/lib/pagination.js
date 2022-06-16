"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageOutOfBoundsError = exports.ChatKittyPaginator = void 0;
var error_1 = require("./error");
var ChatKittyPaginator = /** @class */ (function () {
    function ChatKittyPaginator(items, stompX, contentName, prevRelay, nextRelay, parameters, mapper, asyncMapper) {
        this.items = items;
        this.stompX = stompX;
        this.contentName = contentName;
        this.prevRelay = prevRelay;
        this.nextRelay = nextRelay;
        this.parameters = parameters;
        this.mapper = mapper;
        this.asyncMapper = asyncMapper;
    }
    ChatKittyPaginator.createInstance = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var page, items, mapper, asyncMapper, mappedItems, _i, items_1, item, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, new Promise(function (resolve, reject) {
                            request.stompX.relayResource({
                                destination: request.relay,
                                parameters: request.parameters,
                                onSuccess: function (resource) { return resolve(resource); },
                                onError: function (error) { return reject(error); },
                            });
                        })];
                    case 1:
                        page = _c.sent();
                        items = [];
                        if (page._embedded) {
                            items = page._embedded[request.contentName];
                        }
                        mapper = request.mapper;
                        asyncMapper = request.asyncMapper;
                        if (!mapper) return [3 /*break*/, 2];
                        items = items.map(function (item) { return mapper(item); });
                        return [3 /*break*/, 7];
                    case 2:
                        if (!asyncMapper) return [3 /*break*/, 7];
                        mappedItems = [];
                        _i = 0, items_1 = items;
                        _c.label = 3;
                    case 3:
                        if (!(_i < items_1.length)) return [3 /*break*/, 6];
                        item = items_1[_i];
                        _b = (_a = mappedItems).concat;
                        return [4 /*yield*/, asyncMapper(item)];
                    case 4:
                        _b.apply(_a, [_c.sent()]);
                        _c.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6:
                        items = mappedItems;
                        _c.label = 7;
                    case 7: return [2 /*return*/, new ChatKittyPaginator(items, request.stompX, request.contentName, page._relays.prev, page._relays.next, request.parameters, mapper, asyncMapper)];
                }
            });
        });
    };
    Object.defineProperty(ChatKittyPaginator.prototype, "hasPrevPage", {
        get: function () {
            return !!this.prevRelay;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ChatKittyPaginator.prototype, "hasNextPage", {
        get: function () {
            return !!this.nextRelay;
        },
        enumerable: false,
        configurable: true
    });
    ChatKittyPaginator.prototype.prevPage = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getPage(this.prevRelay)];
            });
        });
    };
    ChatKittyPaginator.prototype.nextPage = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getPage(this.nextRelay)];
            });
        });
    };
    ChatKittyPaginator.prototype.getPage = function (relay) {
        return __awaiter(this, void 0, void 0, function () {
            var page, items, mapper, asyncMapper, mappedItems, _i, items_2, item, _a, _b;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, new Promise(function (resolve, reject) {
                            if (relay) {
                                _this.stompX.relayResource({
                                    destination: relay,
                                    parameters: _this.parameters,
                                    onSuccess: function (resource) { return resolve(resource); },
                                    onError: function (error) { return reject(error); },
                                });
                            }
                            else {
                                reject(new PageOutOfBoundsError());
                            }
                        })];
                    case 1:
                        page = _c.sent();
                        items = [];
                        if (page._embedded) {
                            items = page._embedded[this.contentName];
                        }
                        mapper = this.mapper;
                        asyncMapper = this.asyncMapper;
                        if (!mapper) return [3 /*break*/, 2];
                        items = items.map(function (item) { return mapper(item); });
                        return [3 /*break*/, 7];
                    case 2:
                        if (!asyncMapper) return [3 /*break*/, 7];
                        mappedItems = [];
                        _i = 0, items_2 = items;
                        _c.label = 3;
                    case 3:
                        if (!(_i < items_2.length)) return [3 /*break*/, 6];
                        item = items_2[_i];
                        _b = (_a = mappedItems).concat;
                        return [4 /*yield*/, asyncMapper(item)];
                    case 4:
                        _b.apply(_a, [_c.sent()]);
                        _c.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6:
                        items = mappedItems;
                        _c.label = 7;
                    case 7: return [2 /*return*/, new ChatKittyPaginator(items, this.stompX, this.contentName, page._relays.prev, page._relays.next, this.parameters, this.mapper, this.asyncMapper)];
                }
            });
        });
    };
    return ChatKittyPaginator;
}());
exports.ChatKittyPaginator = ChatKittyPaginator;
var PageOutOfBoundsError = /** @class */ (function (_super) {
    __extends(PageOutOfBoundsError, _super);
    function PageOutOfBoundsError() {
        return _super.call(this, 'PageOutOfBoundsError', "You've requested a page that doesn't exists.") || this;
    }
    return PageOutOfBoundsError;
}(error_1.ChatKittyError));
exports.PageOutOfBoundsError = PageOutOfBoundsError;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnaW5hdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvcGFnaW5hdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxpQ0FBeUM7QUFFekM7SUErQ0UsNEJBQ1MsS0FBVSxFQUNULE1BQWMsRUFDZCxXQUFtQixFQUNuQixTQUFrQixFQUNsQixTQUFrQixFQUNsQixVQUFvQyxFQUNwQyxNQUF1QixFQUN2QixXQUFxQztRQVB0QyxVQUFLLEdBQUwsS0FBSyxDQUFLO1FBQ1QsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUNkLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1FBQ25CLGNBQVMsR0FBVCxTQUFTLENBQVM7UUFDbEIsY0FBUyxHQUFULFNBQVMsQ0FBUztRQUNsQixlQUFVLEdBQVYsVUFBVSxDQUEwQjtRQUNwQyxXQUFNLEdBQU4sTUFBTSxDQUFpQjtRQUN2QixnQkFBVyxHQUFYLFdBQVcsQ0FBMEI7SUFDNUMsQ0FBQztJQXZEUyxpQ0FBYyxHQUEzQixVQUNFLE9BQWtDOzs7Ozs0QkFFckIscUJBQU0sSUFBSSxPQUFPLENBQWEsVUFBQyxPQUFPLEVBQUUsTUFBTTs0QkFDekQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQWE7Z0NBQ3ZDLFdBQVcsRUFBRSxPQUFPLENBQUMsS0FBSztnQ0FDMUIsVUFBVSxFQUFFLE9BQU8sQ0FBQyxVQUFVO2dDQUM5QixTQUFTLEVBQUUsVUFBQyxRQUFRLElBQUssT0FBQSxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQWpCLENBQWlCO2dDQUMxQyxPQUFPLEVBQUUsVUFBQyxLQUFLLElBQUssT0FBQSxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQWIsQ0FBYTs2QkFDbEMsQ0FBQyxDQUFDO3dCQUNMLENBQUMsQ0FBQyxFQUFBOzt3QkFQSSxJQUFJLEdBQUcsU0FPWDt3QkFFRSxLQUFL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
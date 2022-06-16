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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadThreadSucceededResult = exports.GetThreadMessageSucceededResult = exports.GetThreadChannelSucceededResult = exports.GetThreadsSucceededResult = exports.CreatedThreadResult = void 0;
var result_1 = require("./result");
var CreatedThreadResult = /** @class */ (function (_super) {
    __extends(CreatedThreadResult, _super);
    function CreatedThreadResult(thread) {
        var _this = _super.call(this) || this;
        _this.thread = thread;
        return _this;
    }
    return CreatedThreadResult;
}(result_1.ChatKittySucceededResult));
exports.CreatedThreadResult = CreatedThreadResult;
var GetThreadsSucceededResult = /** @class */ (function (_super) {
    __extends(GetThreadsSucceededResult, _super);
    function GetThreadsSucceededResult(paginator) {
        var _this = _super.call(this) || this;
        _this.paginator = paginator;
        return _this;
    }
    return GetThreadsSucceededResult;
}(result_1.ChatKittySucceededResult));
exports.GetThreadsSucceededResult = GetThreadsSucceededResult;
var GetThreadChannelSucceededResult = /** @class */ (function (_super) {
    __extends(GetThreadChannelSucceededResult, _super);
    function GetThreadChannelSucceededResult(channel) {
        var _this = _super.call(this) || this;
        _this.channel = channel;
        return _this;
    }
    return GetThreadChannelSucceededResult;
}(result_1.ChatKittySucceededResult));
exports.GetThreadChannelSucceededResult = GetThreadChannelSucceededResult;
var GetThreadMessageSucceededResult = /** @class */ (function (_super) {
    __extends(GetThreadMessageSucceededResult, _super);
    function GetThreadMessageSucceededResult(message) {
        var _this = _super.call(this) || this;
        _this.message = message;
        return _this;
    }
    return GetThreadMessageSucceededResult;
}(result_1.ChatKittySucceededResult));
exports.GetThreadMessageSucceededResult = GetThreadMessageSucceededResult;
var ReadThreadSucceededResult = /** @class */ (function (_super) {
    __extends(ReadThreadSucceededResult, _super);
    function ReadThreadSucceededResult(thread) {
        var _this = _super.call(this) || this;
        _this.thread = thread;
        return _this;
    }
    return ReadThreadSucceededResult;
}(result_1.ChatKittySucceededResult));
exports.ReadThreadSucceededResult = ReadThreadSucceededResult;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhyZWFkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi90aHJlYWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBR0EsbUNBSWtCO0FBOENsQjtJQUF5Qyx1Q0FBd0I7SUFDL0QsNkJBQW1CLE1BQWM7UUFBakMsWUFDRSxpQkFBTyxTQUNSO1FBRmtCLFlBQU0sR0FBTixNQUFNLENBQVE7O0lBRWpDLENBQUM7SUFDSCwwQkFBQztBQUFELENBQUMsQUFKRCxDQUF5QyxpQ0FBd0IsR0FJaEU7QUFKWSxrREFBbUI7QUF1QmhDO0lBQStDLDZDQUF3QjtJQUNyRSxtQ0FBbUIsU0FBcUM7UUFBeEQsWUFDRSxpQkFBTyxTQUNSO1FBRmtCLGVBQVMsR0FBVCxTQUFTLENBQTRCOztJQUV4RCxDQUFDO0lBQ0gsZ0NBQUM7QUFBRCxDQUFDLEFBSkQsQ0FBK0MsaUNBQXdCLEdBSXRFO0FBSlksOERBQXlCO0FBY3RDO0lBQXFELG1EQUF3QjtJQUMzRSx5Q0FBbUIsT0FBZ0I7UUFBbkMsWUFDRSxpQkFBTyxTQUNSO1FBRmtCLGFBQU8sR0FBUCxPQUFPLENBQVM7O0lBRW5DLENBQUM7SUFDSCxzQ0FBQztBQUFELENBQUMsQUFKRCxDQUFxRCxpQ0FBd0IsR0FJNUU7QUFKWSwwRUFBK0I7QUFjNUM7SUFBcUQsbURBQXdCO0lBQzNFLHlDQUFtQixPQUFnQjtRQUFuQyxZQUNFLGlCQUFPLFNBQ1I7UUFGa0IsYUFBTyxHQUFQLE9BQU8sQ0FBUzs7SUFFbkMsQ0FBQztJQUNILHNDQUFDO0FBQUQsQ0FBQyxBQUpELENBQXFELGlDQUF3QixHQUk1RTtBQUpZLDBFQUErQjtBQWM1QztJQUErQyw2Q0FBd0I7SUFDckUsbUNBQW1CLE1BQWM7UUFBakMsWUFDRSxpQkFBTyxTQUNSO1FBRmtCLFlBQU0sR0FBTixNQUFNLENBQVE7O0lBRWpDLENBQUM7SUFDSCxnQ0FBQztBQUFELENBQUMsQUFKRCxDQUErQyxpQ0FBd0IsR0FJdEU7QUFKWSw4REFBeUIifQ==
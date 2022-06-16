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
exports.cancelled = exports.failed = exports.succeeded = exports.GetCountSucceedResult = exports.ChatKittyFailedResult = exports.ChatKittyCancelledResult = exports.ChatKittySucceededResult = void 0;
var ChatKittySucceededResult = /** @class */ (function () {
    function ChatKittySucceededResult() {
        this.succeeded = true;
        this.cancelled = false;
        this.failed = false;
    }
    return ChatKittySucceededResult;
}());
exports.ChatKittySucceededResult = ChatKittySucceededResult;
var ChatKittyCancelledResult = /** @class */ (function () {
    function ChatKittyCancelledResult() {
        this.succeeded = false;
        this.cancelled = true;
        this.failed = false;
    }
    return ChatKittyCancelledResult;
}());
exports.ChatKittyCancelledResult = ChatKittyCancelledResult;
var ChatKittyFailedResult = /** @class */ (function () {
    function ChatKittyFailedResult(error) {
        this.error = error;
        this.succeeded = false;
        this.cancelled = false;
        this.failed = true;
    }
    return ChatKittyFailedResult;
}());
exports.ChatKittyFailedResult = ChatKittyFailedResult;
var GetCountSucceedResult = /** @class */ (function (_super) {
    __extends(GetCountSucceedResult, _super);
    function GetCountSucceedResult(count) {
        var _this = _super.call(this) || this;
        _this.count = count;
        return _this;
    }
    return GetCountSucceedResult;
}(ChatKittySucceededResult));
exports.GetCountSucceedResult = GetCountSucceedResult;
function succeeded(result) {
    return result.succeeded;
}
exports.succeeded = succeeded;
function failed(result) {
    return result.failed;
}
exports.failed = failed;
function cancelled(result) {
    return result.cancelled;
}
exports.cancelled = cancelled;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzdWx0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9yZXN1bHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBU0E7SUFBQTtRQUNFLGNBQVMsR0FBUyxJQUFJLENBQUM7UUFDdkIsY0FBUyxHQUFVLEtBQUssQ0FBQztRQUN6QixXQUFNLEdBQVUsS0FBSyxDQUFDO0lBQ3hCLENBQUM7SUFBRCwrQkFBQztBQUFELENBQUMsQUFKRCxJQUlDO0FBSnFCLDREQUF3QjtBQU05QztJQUFBO1FBQ0UsY0FBUyxHQUFVLEtBQUssQ0FBQztRQUN6QixjQUFTLEdBQVMsSUFBSSxDQUFDO1FBQ3ZCLFdBQU0sR0FBVSxLQUFLLENBQUM7SUFDeEIsQ0FBQztJQUFELCtCQUFDO0FBQUQsQ0FBQyxBQUpELElBSUM7QUFKcUIsNERBQXdCO0FBTTlDO0lBS0UsK0JBQW1CLEtBQXFCO1FBQXJCLFVBQUssR0FBTCxLQUFLLENBQWdCO1FBSnhDLGNBQVMsR0FBVSxLQUFLLENBQUM7UUFDekIsY0FBUyxHQUFVLEtBQUssQ0FBQztRQUN6QixXQUFNLEdBQVMsSUFBSSxDQUFDO0lBRXVCLENBQUM7SUFDOUMsNEJBQUM7QUFBRCxDQUFDLEFBTkQsSUFNQztBQU5ZLHNEQUFxQjtBQVlsQztJQUEyQyx5Q0FBd0I7SUFDakUsK0JBQW1CLEtBQWE7UUFBaEMsWUFDRSxpQkFBTyxTQUNSO1FBRmtCLFdBQUssR0FBTCxLQUFLLENBQVE7O0lBRWhDLENBQUM7SUFDSCw0QkFBQztBQUFELENBQUMsQUFKRCxDQUEyQyx3QkFBd0IsR0FJbEU7QUFKWSxzREFBcUI7QUFNbEMsU0FBZ0IsU0FBUyxDQUN2QixNQUEwQjtJQUUxQixPQUFPLE1BQU0sQ0FBQyxTQUFTLENBQUM7QUFDMUIsQ0FBQztBQUpELDhCQUlDO0FBRUQsU0FBZ0IsTUFBTSxDQUNwQixNQUE4QjtJQUU5QixPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDdkIsQ0FBQztBQUpELHdCQUlDO0FBRUQsU0FBZ0IsU0FBUyxDQUN2QixNQUE4QjtJQUU5QixPQUFPLE1BQU0sQ0FBQyxTQUFTLENBQUM7QUFDMUIsQ0FBQztBQUpELDhCQUlDIn0=
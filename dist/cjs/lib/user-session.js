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
exports.NoActiveSessionError = exports.SessionActiveError = exports.StartedSessionResult = void 0;
var error_1 = require("./error");
var result_1 = require("./result");
var StartedSessionResult = /** @class */ (function (_super) {
    __extends(StartedSessionResult, _super);
    function StartedSessionResult(session) {
        var _this = _super.call(this) || this;
        _this.session = session;
        return _this;
    }
    return StartedSessionResult;
}(result_1.ChatKittySucceededResult));
exports.StartedSessionResult = StartedSessionResult;
var SessionActiveError = /** @class */ (function (_super) {
    __extends(SessionActiveError, _super);
    function SessionActiveError() {
        return _super.call(this, 'SessionActiveError', 'A user session is already active and must be ended before this instance can start a new session.') || this;
    }
    return SessionActiveError;
}(error_1.ChatKittyError));
exports.SessionActiveError = SessionActiveError;
var NoActiveSessionError = /** @class */ (function (_super) {
    __extends(NoActiveSessionError, _super);
    function NoActiveSessionError() {
        return _super.call(this, 'NoActiveSessionError', "You're not connected to ChatKitty.") || this;
    }
    return NoActiveSessionError;
}(error_1.ChatKittyError));
exports.NoActiveSessionError = NoActiveSessionError;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci1zZXNzaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi91c2VyLXNlc3Npb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsaUNBQXlDO0FBQ3pDLG1DQUlrQjtBQWVsQjtJQUEwQyx3Q0FBd0I7SUFDaEUsOEJBQW1CLE9BQW9CO1FBQXZDLFlBQ0UsaUJBQU8sU0FDUjtRQUZrQixhQUFPLEdBQVAsT0FBTyxDQUFhOztJQUV2QyxDQUFDO0lBQ0gsMkJBQUM7QUFBRCxDQUFDLEFBSkQsQ0FBMEMsaUNBQXdCLEdBSWpFO0FBSlksb0RBQW9CO0FBTWpDO0lBQXdDLHNDQUFjO0lBQ3BEO2VBQ0Usa0JBQ0Usb0JBQW9CLEVBQ3BCLGtHQUFrRyxDQUNuRztJQUNILENBQUM7SUFDSCx5QkFBQztBQUFELENBQUMsQUFQRCxDQUF3QyxzQkFBYyxHQU9yRDtBQVBZLGdEQUFrQjtBQVMvQjtJQUEwQyx3Q0FBYztJQUN0RDtlQUNFLGtCQUFNLHNCQUFzQixFQUFFLG9DQUFvQyxDQUFDO0lBQ3JFLENBQUM7SUFDSCwyQkFBQztBQUFELENBQUMsQUFKRCxDQUEwQyxzQkFBYyxHQUl2RDtBQUpZLG9EQUFvQiJ9
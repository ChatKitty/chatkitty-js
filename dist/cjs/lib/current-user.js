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
exports.UpdatedCurrentUserDisplayPictureResult = exports.UpdatedCurrentUserResult = exports.GetCurrentUserSuccessfulResult = void 0;
var result_1 = require("./result");
var GetCurrentUserSuccessfulResult = /** @class */ (function (_super) {
    __extends(GetCurrentUserSuccessfulResult, _super);
    function GetCurrentUserSuccessfulResult(user) {
        var _this = _super.call(this) || this;
        _this.user = user;
        return _this;
    }
    return GetCurrentUserSuccessfulResult;
}(result_1.ChatKittySucceededResult));
exports.GetCurrentUserSuccessfulResult = GetCurrentUserSuccessfulResult;
var UpdatedCurrentUserResult = /** @class */ (function (_super) {
    __extends(UpdatedCurrentUserResult, _super);
    function UpdatedCurrentUserResult(user) {
        var _this = _super.call(this) || this;
        _this.user = user;
        return _this;
    }
    return UpdatedCurrentUserResult;
}(result_1.ChatKittySucceededResult));
exports.UpdatedCurrentUserResult = UpdatedCurrentUserResult;
var UpdatedCurrentUserDisplayPictureResult = /** @class */ (function (_super) {
    __extends(UpdatedCurrentUserDisplayPictureResult, _super);
    function UpdatedCurrentUserDisplayPictureResult(user) {
        var _this = _super.call(this) || this;
        _this.user = user;
        return _this;
    }
    return UpdatedCurrentUserDisplayPictureResult;
}(result_1.ChatKittySucceededResult));
exports.UpdatedCurrentUserDisplayPictureResult = UpdatedCurrentUserDisplayPictureResult;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VycmVudC11c2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9jdXJyZW50LXVzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSUEsbUNBSWtCO0FBcURsQjtJQUFvRCxrREFBd0I7SUFDMUUsd0NBQW1CLElBQWlCO1FBQXBDLFlBQ0UsaUJBQU8sU0FDUjtRQUZrQixVQUFJLEdBQUosSUFBSSxDQUFhOztJQUVwQyxDQUFDO0lBQ0gscUNBQUM7QUFBRCxDQUFDLEFBSkQsQ0FBb0QsaUNBQXdCLEdBSTNFO0FBSlksd0VBQThCO0FBVzNDO0lBQThDLDRDQUF3QjtJQUNwRSxrQ0FBbUIsSUFBaUI7UUFBcEMsWUFDRSxpQkFBTyxTQUNSO1FBRmtCLFVBQUksR0FBSixJQUFJLENBQWE7O0lBRXBDLENBQUM7SUFDSCwrQkFBQztBQUFELENBQUMsQUFKRCxDQUE4QyxpQ0FBd0IsR0FJckU7QUFKWSw0REFBd0I7QUFnQnJDO0lBQTRELDBEQUF3QjtJQUNsRixnREFBbUIsSUFBaUI7UUFBcEMsWUFDRSxpQkFBTyxTQUNSO1FBRmtCLFVBQUksR0FBSixJQUFJLENBQWE7O0lBRXBDLENBQUM7SUFDSCw2Q0FBQztBQUFELENBQUMsQUFKRCxDQUE0RCxpQ0FBd0IsR0FJbkY7QUFKWSx3RkFBc0MifQ==
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
exports.BlockUserSucceededResult = exports.GetUserIsChannelMemberSucceededResult = exports.GetUserSucceededResult = exports.GetUsersSucceededResult = void 0;
var result_1 = require("./result");
var GetUsersSucceededResult = /** @class */ (function (_super) {
    __extends(GetUsersSucceededResult, _super);
    function GetUsersSucceededResult(paginator) {
        var _this = _super.call(this) || this;
        _this.paginator = paginator;
        return _this;
    }
    return GetUsersSucceededResult;
}(result_1.ChatKittySucceededResult));
exports.GetUsersSucceededResult = GetUsersSucceededResult;
var GetUserSucceededResult = /** @class */ (function (_super) {
    __extends(GetUserSucceededResult, _super);
    function GetUserSucceededResult(user) {
        var _this = _super.call(this) || this;
        _this.user = user;
        return _this;
    }
    return GetUserSucceededResult;
}(result_1.ChatKittySucceededResult));
exports.GetUserSucceededResult = GetUserSucceededResult;
var GetUserIsChannelMemberSucceededResult = /** @class */ (function (_super) {
    __extends(GetUserIsChannelMemberSucceededResult, _super);
    function GetUserIsChannelMemberSucceededResult(isMember) {
        var _this = _super.call(this) || this;
        _this.isMember = isMember;
        return _this;
    }
    return GetUserIsChannelMemberSucceededResult;
}(result_1.ChatKittySucceededResult));
exports.GetUserIsChannelMemberSucceededResult = GetUserIsChannelMemberSucceededResult;
var BlockUserSucceededResult = /** @class */ (function (_super) {
    __extends(BlockUserSucceededResult, _super);
    function BlockUserSucceededResult(user) {
        var _this = _super.call(this) || this;
        _this.user = user;
        return _this;
    }
    return BlockUserSucceededResult;
}(result_1.ChatKittySucceededResult));
exports.BlockUserSucceededResult = BlockUserSucceededResult;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvdXNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFHQSxtQ0FJa0I7QUErQ2xCO0lBQTZDLDJDQUF3QjtJQUNuRSxpQ0FBbUIsU0FBbUM7UUFBdEQsWUFDRSxpQkFBTyxTQUNSO1FBRmtCLGVBQVMsR0FBVCxTQUFTLENBQTBCOztJQUV0RCxDQUFDO0lBQ0gsOEJBQUM7QUFBRCxDQUFDLEFBSkQsQ0FBNkMsaUNBQXdCLEdBSXBFO0FBSlksMERBQXVCO0FBV3BDO0lBQTRDLDBDQUF3QjtJQUNsRSxnQ0FBbUIsSUFBVTtRQUE3QixZQUNFLGlCQUFPLFNBQ1I7UUFGa0IsVUFBSSxHQUFKLElBQUksQ0FBTTs7SUFFN0IsQ0FBQztJQUNILDZCQUFDO0FBQUQsQ0FBQyxBQUpELENBQTRDLGlDQUF3QixHQUluRTtBQUpZLHdEQUFzQjtBQWdCbkM7SUFBMkQseURBQXdCO0lBQ2pGLCtDQUFtQixRQUFpQjtRQUFwQyxZQUNFLGlCQUFPLFNBQ1I7UUFGa0IsY0FBUSxHQUFSLFFBQVEsQ0FBUzs7SUFFcEMsQ0FBQztJQUNILDRDQUFDO0FBQUQsQ0FBQyxBQUpELENBQTJELGlDQUF3QixHQUlsRjtBQUpZLHNGQUFxQztBQWVsRDtJQUE4Qyw0Q0FBd0I7SUFDcEUsa0NBQW1CLElBQVU7UUFBN0IsWUFDRSxpQkFBTyxTQUNSO1FBRmtCLFVBQUksR0FBSixJQUFJLENBQU07O0lBRTdCLENBQUM7SUFDSCwrQkFBQztBQUFELENBQUMsQUFKRCxDQUE4QyxpQ0FBd0IsR0FJckU7QUFKWSw0REFBd0IifQ==
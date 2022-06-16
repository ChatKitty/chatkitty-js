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
exports.RemovedReactionResult = exports.GetReactionsSucceededResult = exports.ReactedToMessageResult = void 0;
var result_1 = require("./result");
var ReactedToMessageResult = /** @class */ (function (_super) {
    __extends(ReactedToMessageResult, _super);
    function ReactedToMessageResult(reaction) {
        var _this = _super.call(this) || this;
        _this.reaction = reaction;
        return _this;
    }
    return ReactedToMessageResult;
}(result_1.ChatKittySucceededResult));
exports.ReactedToMessageResult = ReactedToMessageResult;
var GetReactionsSucceededResult = /** @class */ (function (_super) {
    __extends(GetReactionsSucceededResult, _super);
    function GetReactionsSucceededResult(paginator) {
        var _this = _super.call(this) || this;
        _this.paginator = paginator;
        return _this;
    }
    return GetReactionsSucceededResult;
}(result_1.ChatKittySucceededResult));
exports.GetReactionsSucceededResult = GetReactionsSucceededResult;
var RemovedReactionResult = /** @class */ (function (_super) {
    __extends(RemovedReactionResult, _super);
    function RemovedReactionResult(reaction) {
        var _this = _super.call(this) || this;
        _this.reaction = reaction;
        return _this;
    }
    return RemovedReactionResult;
}(result_1.ChatKittySucceededResult));
exports.RemovedReactionResult = RemovedReactionResult;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL3JlYWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUdBLG1DQUlrQjtBQTZCbEI7SUFBNEMsMENBQXdCO0lBQ2xFLGdDQUFtQixRQUFrQjtRQUFyQyxZQUNFLGlCQUFPLFNBQ1I7UUFGa0IsY0FBUSxHQUFSLFFBQVEsQ0FBVTs7SUFFckMsQ0FBQztJQUNILDZCQUFDO0FBQUQsQ0FBQyxBQUpELENBQTRDLGlDQUF3QixHQUluRTtBQUpZLHdEQUFzQjtBQWNuQztJQUFpRCwrQ0FBd0I7SUFDdkUscUNBQW1CLFNBQXVDO1FBQTFELFlBQ0UsaUJBQU8sU0FDUjtRQUZrQixlQUFTLEdBQVQsU0FBUyxDQUE4Qjs7SUFFMUQsQ0FBQztJQUNILGtDQUFDO0FBQUQsQ0FBQyxBQUpELENBQWlELGlDQUF3QixHQUl4RTtBQUpZLGtFQUEyQjtBQWV4QztJQUEyQyx5Q0FBd0I7SUFDakUsK0JBQW1CLFFBQWtCO1FBQXJDLFlBQ0UsaUJBQU8sU0FDUjtRQUZrQixjQUFRLEdBQVIsUUFBUSxDQUFVOztJQUVyQyxDQUFDO0lBQ0gsNEJBQUM7QUFBRCxDQUFDLEFBSkQsQ0FBMkMsaUNBQXdCLEdBSWxFO0FBSlksc0RBQXFCIn0=
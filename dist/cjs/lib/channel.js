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
exports.DeletedChannelResult = exports.UpdatedChannelResult = exports.ChannelNotInvitableError = exports.InvitedUserResult = exports.HideChannelSucceededResult = exports.ClearChannelHistorySucceededResult = exports.ReadChannelSucceededResult = exports.NotAChannelMemberError = exports.LeftChannelResult = exports.UnmutedChannelResult = exports.MutedChannelResult = exports.CannotAddModeratorToChannelError = exports.AddedChannelModeratorResult = exports.ChannelNotPubliclyJoinableError = exports.JoinedChannelResult = exports.GetChannelUnreadSucceededResult = exports.GetChannelSucceededResult = exports.GetChannelsSucceededResult = exports.CreatedChannelResult = exports.isPrivateChannel = exports.isPublicChannel = exports.isDirectChannel = void 0;
var error_1 = require("./error");
var result_1 = require("./result");
function isDirectChannel(channel) {
    return channel.type === 'DIRECT';
}
exports.isDirectChannel = isDirectChannel;
function isPublicChannel(channel) {
    return channel.type === 'PUBLIC';
}
exports.isPublicChannel = isPublicChannel;
function isPrivateChannel(channel) {
    return channel.type === 'PRIVATE';
}
exports.isPrivateChannel = isPrivateChannel;
var CreatedChannelResult = /** @class */ (function (_super) {
    __extends(CreatedChannelResult, _super);
    function CreatedChannelResult(channel) {
        var _this = _super.call(this) || this;
        _this.channel = channel;
        return _this;
    }
    return CreatedChannelResult;
}(result_1.ChatKittySucceededResult));
exports.CreatedChannelResult = CreatedChannelResult;
var GetChannelsSucceededResult = /** @class */ (function (_super) {
    __extends(GetChannelsSucceededResult, _super);
    function GetChannelsSucceededResult(paginator) {
        var _this = _super.call(this) || this;
        _this.paginator = paginator;
        return _this;
    }
    return GetChannelsSucceededResult;
}(result_1.ChatKittySucceededResult));
exports.GetChannelsSucceededResult = GetChannelsSucceededResult;
var GetChannelSucceededResult = /** @class */ (function (_super) {
    __extends(GetChannelSucceededResult, _super);
    function GetChannelSucceededResult(channel) {
        var _this = _super.call(this) || this;
        _this.channel = channel;
        return _this;
    }
    return GetChannelSucceededResult;
}(result_1.ChatKittySucceededResult));
exports.GetChannelSucceededResult = GetChannelSucceededResult;
var GetChannelUnreadSucceededResult = /** @class */ (function (_super) {
    __extends(GetChannelUnreadSucceededResult, _super);
    function GetChannelUnreadSucceededResult(unread) {
        var _this = _super.call(this) || this;
        _this.unread = unread;
        return _this;
    }
    return GetChannelUnreadSucceededResult;
}(result_1.ChatKittySucceededResult));
exports.GetChannelUnreadSucceededResult = GetChannelUnreadSucceededResult;
var JoinedChannelResult = /** @class */ (function (_super) {
    __extends(JoinedChannelResult, _super);
    function JoinedChannelResult(channel) {
        var _this = _super.call(this) || this;
        _this.channel = channel;
        return _this;
    }
    return JoinedChannelResult;
}(result_1.ChatKittySucceededResult));
exports.JoinedChannelResult = JoinedChannelResult;
var ChannelNotPubliclyJoinableError = /** @class */ (function (_super) {
    __extends(ChannelNotPubliclyJoinableError, _super);
    function ChannelNotPubliclyJoinableError(channel) {
        var _this = _super.call(this, 'ChannelNotPubliclyJoinableError', "The channel ".concat(channel.name, " can't be joined without an invite.")) || this;
        _this.channel = channel;
        return _this;
    }
    return ChannelNotPubliclyJoinableError;
}(error_1.ChatKittyError));
exports.ChannelNotPubliclyJoinableError = ChannelNotPubliclyJoinableError;
var AddedChannelModeratorResult = /** @class */ (function (_super) {
    __extends(AddedChannelModeratorResult, _super);
    function AddedChannelModeratorResult(channel) {
        var _this = _super.call(this) || this;
        _this.channel = channel;
        return _this;
    }
    return AddedChannelModeratorResult;
}(result_1.ChatKittySucceededResult));
exports.AddedChannelModeratorResult = AddedChannelModeratorResult;
var CannotAddModeratorToChannelError = /** @class */ (function (_super) {
    __extends(CannotAddModeratorToChannelError, _super);
    function CannotAddModeratorToChannelError(channel) {
        var _this = _super.call(this, 'CannotAddModeratorToChannel', "The channel ".concat(channel.name, " is not a group channel and cannot have moderators.")) || this;
        _this.channel = channel;
        return _this;
    }
    return CannotAddModeratorToChannelError;
}(error_1.ChatKittyError));
exports.CannotAddModeratorToChannelError = CannotAddModeratorToChannelError;
var MutedChannelResult = /** @class */ (function (_super) {
    __extends(MutedChannelResult, _super);
    function MutedChannelResult(channel) {
        var _this = _super.call(this) || this;
        _this.channel = channel;
        return _this;
    }
    return MutedChannelResult;
}(result_1.ChatKittySucceededResult));
exports.MutedChannelResult = MutedChannelResult;
var UnmutedChannelResult = /** @class */ (function (_super) {
    __extends(UnmutedChannelResult, _super);
    function UnmutedChannelResult(channel) {
        var _this = _super.call(this) || this;
        _this.channel = channel;
        return _this;
    }
    return UnmutedChannelResult;
}(result_1.ChatKittySucceededResult));
exports.UnmutedChannelResult = UnmutedChannelResult;
var LeftChannelResult = /** @class */ (function (_super) {
    __extends(LeftChannelResult, _super);
    function LeftChannelResult(channel) {
        var _this = _super.call(this) || this;
        _this.channel = channel;
        return _this;
    }
    return LeftChannelResult;
}(result_1.ChatKittySucceededResult));
exports.LeftChannelResult = LeftChannelResult;
var NotAChannelMemberError = /** @class */ (function (_super) {
    __extends(NotAChannelMemberError, _super);
    function NotAChannelMemberError(channel) {
        var _this = _super.call(this, 'NotAChannelMemberError', "You are not a member of channel ".concat(channel.name, ".")) || this;
        _this.channel = channel;
        return _this;
    }
    return NotAChannelMemberError;
}(error_1.ChatKittyError));
exports.NotAChannelMemberError = NotAChannelMemberError;
var ReadChannelSucceededResult = /** @class */ (function (_super) {
    __extends(ReadChannelSucceededResult, _super);
    function ReadChannelSucceededResult(channel) {
        var _this = _super.call(this) || this;
        _this.channel = channel;
        return _this;
    }
    return ReadChannelSucceededResult;
}(result_1.ChatKittySucceededResult));
exports.ReadChannelSucceededResult = ReadChannelSucceededResult;
var ClearChannelHistorySucceededResult = /** @class */ (function (_super) {
    __extends(ClearChannelHistorySucceededResult, _super);
    function ClearChannelHistorySucceededResult(channel) {
        var _this = _super.call(this) || this;
        _this.channel = channel;
        return _this;
    }
    return ClearChannelHistorySucceededResult;
}(result_1.ChatKittySucceededResult));
exports.ClearChannelHistorySucceededResult = ClearChannelHistorySucceededResult;
var HideChannelSucceededResult = /** @class */ (function (_super) {
    __extends(HideChannelSucceededResult, _super);
    function HideChannelSucceededResult(channel) {
        var _this = _super.call(this) || this;
        _this.channel = channel;
        return _this;
    }
    return HideChannelSucceededResult;
}(result_1.ChatKittySucceededResult));
exports.HideChannelSucceededResult = HideChannelSucceededResult;
var InvitedUserResult = /** @class */ (function (_super) {
    __extends(InvitedUserResult, _super);
    function InvitedUserResult(user) {
        var _this = _super.call(this) || this;
        _this.user = user;
        return _this;
    }
    return InvitedUserResult;
}(result_1.ChatKittySucceededResult));
exports.InvitedUserResult = InvitedUserResult;
var ChannelNotInvitableError = /** @class */ (function (_super) {
    __extends(ChannelNotInvitableError, _super);
    function ChannelNotInvitableError(channel) {
        var _this = _super.call(this, 'ChannelNotInvitableError', "The channel ".concat(channel.name, " does not accept invites.")) || this;
        _this.channel = channel;
        return _this;
    }
    return ChannelNotInvitableError;
}(error_1.ChatKittyError));
exports.ChannelNotInvitableError = ChannelNotInvitableError;
var UpdatedChannelResult = /** @class */ (function (_super) {
    __extends(UpdatedChannelResult, _super);
    function UpdatedChannelResult(channel) {
        var _this = _super.call(this) || this;
        _this.channel = channel;
        return _this;
    }
    return UpdatedChannelResult;
}(result_1.ChatKittySucceededResult));
exports.UpdatedChannelResult = UpdatedChannelResult;
var DeletedChannelResult = /** @class */ (function (_super) {
    __extends(DeletedChannelResult, _super);
    function DeletedChannelResult() {
        return _super.call(this) || this;
    }
    return DeletedChannelResult;
}(result_1.ChatKittySucceededResult));
exports.DeletedChannelResult = DeletedChannelResult;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbm5lbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvY2hhbm5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpQ0FBeUM7QUFHekMsbUNBSWtCO0FBdUVsQixTQUFnQixlQUFlLENBQUMsT0FBZ0I7SUFDOUMsT0FBTyxPQUFPLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQztBQUNuQyxDQUFDO0FBRkQsMENBRUM7QUFFRCxTQUFnQixlQUFlLENBQUMsT0FBZ0I7SUFDOUMsT0FBTyxPQUFPLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQztBQUNuQyxDQUFDO0FBRkQsMENBRUM7QUFFRCxTQUFnQixnQkFBZ0IsQ0FBQyxPQUFnQjtJQUMvQyxPQUFPLE9BQU8sQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFDO0FBQ3BDLENBQUM7QUFGRCw0Q0FFQztBQWFEO0lBQTBDLHdDQUF3QjtJQUNoRSw4QkFBbUIsT0FBZ0I7UUFBbkMsWUFDRSxpQkFBTyxTQUNSO1FBRmtCLGFBQU8sR0FBUCxPQUFPLENBQVM7O0lBRW5DLENBQUM7SUFDSCwyQkFBQztBQUFELENBQUMsQUFKRCxDQUEwQyxpQ0FBd0IsR0FJakU7QUFKWSxvREFBb0I7QUFnQ2pDO0lBQWdELDhDQUF3QjtJQUN0RSxvQ0FBbUIsU0FBc0M7UUFBekQsWUFDRSxpQkFBTyxTQUNSO1FBRmtCLGVBQVMsR0FBVCxTQUFTLENBQTZCOztJQUV6RCxDQUFDO0lBQ0gsaUNBQUM7QUFBRCxDQUFDLEFBSkQsQ0FBZ0QsaUNBQXdCLEdBSXZFO0FBSlksZ0VBQTBCO0FBVXZDO0lBQStDLDZDQUF3QjtJQUNyRSxtQ0FBbUIsT0FBZ0I7UUFBbkMsWUFDRSxpQkFBTyxTQUNSO1FBRmtCLGFBQU8sR0FBUCxPQUFPLENBQVM7O0lBRW5DLENBQUM7SUFDSCxnQ0FBQztBQUFELENBQUMsQUFKRCxDQUErQyxpQ0FBd0IsR0FJdEU7QUFKWSw4REFBeUI7QUFV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
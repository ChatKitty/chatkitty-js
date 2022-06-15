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
exports.MessageNotAReplyError = exports.GetMessageParentSucceededResult = exports.GetMessageChannelSucceededResult = exports.sentFileMessage = exports.sentTextMessage = exports.SentFileMessageResult = exports.SentTextMessageResult = exports.DeleteMessageSucceededResult = exports.DeleteMessageForMeSucceededResult = exports.EditedMessageSucceededResult = exports.ReadMessageSucceededResult = exports.GetLastReadMessageResult = exports.GetMessagesSucceededResult = exports.isSystemMessage = exports.isUserMessage = exports.isFileMessage = exports.isTextMessage = void 0;
var error_1 = require("./error");
var result_1 = require("./result");
function isTextMessage(message) {
    return message.body !== undefined;
}
exports.isTextMessage = isTextMessage;
function isFileMessage(message) {
    return message.file !== undefined;
}
exports.isFileMessage = isFileMessage;
function isUserMessage(message) {
    return message.user !== undefined;
}
exports.isUserMessage = isUserMessage;
function isSystemMessage(message) {
    return message.user === undefined;
}
exports.isSystemMessage = isSystemMessage;
var GetMessagesSucceededResult = /** @class */ (function (_super) {
    __extends(GetMessagesSucceededResult, _super);
    function GetMessagesSucceededResult(paginator) {
        var _this = _super.call(this) || this;
        _this.paginator = paginator;
        return _this;
    }
    return GetMessagesSucceededResult;
}(result_1.ChatKittySucceededResult));
exports.GetMessagesSucceededResult = GetMessagesSucceededResult;
var GetLastReadMessageResult = /** @class */ (function (_super) {
    __extends(GetLastReadMessageResult, _super);
    function GetLastReadMessageResult(message) {
        var _this = _super.call(this) || this;
        _this.message = message;
        return _this;
    }
    return GetLastReadMessageResult;
}(result_1.ChatKittySucceededResult));
exports.GetLastReadMessageResult = GetLastReadMessageResult;
var ReadMessageSucceededResult = /** @class */ (function (_super) {
    __extends(ReadMessageSucceededResult, _super);
    function ReadMessageSucceededResult(message) {
        var _this = _super.call(this) || this;
        _this.message = message;
        return _this;
    }
    return ReadMessageSucceededResult;
}(result_1.ChatKittySucceededResult));
exports.ReadMessageSucceededResult = ReadMessageSucceededResult;
var EditedMessageSucceededResult = /** @class */ (function (_super) {
    __extends(EditedMessageSucceededResult, _super);
    function EditedMessageSucceededResult(message) {
        var _this = _super.call(this) || this;
        _this.message = message;
        return _this;
    }
    return EditedMessageSucceededResult;
}(result_1.ChatKittySucceededResult));
exports.EditedMessageSucceededResult = EditedMessageSucceededResult;
var DeleteMessageForMeSucceededResult = /** @class */ (function (_super) {
    __extends(DeleteMessageForMeSucceededResult, _super);
    function DeleteMessageForMeSucceededResult(message) {
        var _this = _super.call(this) || this;
        _this.message = message;
        return _this;
    }
    return DeleteMessageForMeSucceededResult;
}(result_1.ChatKittySucceededResult));
exports.DeleteMessageForMeSucceededResult = DeleteMessageForMeSucceededResult;
var DeleteMessageSucceededResult = /** @class */ (function (_super) {
    __extends(DeleteMessageSucceededResult, _super);
    function DeleteMessageSucceededResult(message) {
        var _this = _super.call(this) || this;
        _this.message = message;
        return _this;
    }
    return DeleteMessageSucceededResult;
}(result_1.ChatKittySucceededResult));
exports.DeleteMessageSucceededResult = DeleteMessageSucceededResult;
var SentTextMessageResult = /** @class */ (function (_super) {
    __extends(SentTextMessageResult, _super);
    function SentTextMessageResult(message) {
        var _this = _super.call(this) || this;
        _this.message = message;
        return _this;
    }
    return SentTextMessageResult;
}(result_1.ChatKittySucceededResult));
exports.SentTextMessageResult = SentTextMessageResult;
var SentFileMessageResult = /** @class */ (function (_super) {
    __extends(SentFileMessageResult, _super);
    function SentFileMessageResult(message) {
        var _this = _super.call(this) || this;
        _this.message = message;
        return _this;
    }
    return SentFileMessageResult;
}(result_1.ChatKittySucceededResult));
exports.SentFileMessageResult = SentFileMessageResult;
function sentTextMessage(result) {
    var message = result.message;
    return message !== undefined && message.type === 'TEXT';
}
exports.sentTextMessage = sentTextMessage;
function sentFileMessage(result) {
    var message = result.message;
    return message !== undefined && message.type === 'FILE';
}
exports.sentFileMessage = sentFileMessage;
var GetMessageChannelSucceededResult = /** @class */ (function (_super) {
    __extends(GetMessageChannelSucceededResult, _super);
    function GetMessageChannelSucceededResult(channel) {
        var _this = _super.call(this) || this;
        _this.channel = channel;
        return _this;
    }
    return GetMessageChannelSucceededResult;
}(result_1.ChatKittySucceededResult));
exports.GetMessageChannelSucceededResult = GetMessageChannelSucceededResult;
var GetMessageParentSucceededResult = /** @class */ (function (_super) {
    __extends(GetMessageParentSucceededResult, _super);
    function GetMessageParentSucceededResult(message) {
        var _this = _super.call(this) || this;
        _this.message = message;
        return _this;
    }
    return GetMessageParentSucceededResult;
}(result_1.ChatKittySucceededResult));
exports.GetMessageParentSucceededResult = GetMessageParentSucceededResult;
var MessageNotAReplyError = /** @class */ (function (_super) {
    __extends(MessageNotAReplyError, _super);
    function MessageNotAReplyError(messageModel) {
        var _this = _super.call(this, 'MessageNotAReplyError', "Message ".concat(messageModel.id, " is not a reply.")) || this;
        _this.messageModel = messageModel;
        return _this;
    }
    return MessageNotAReplyError;
}(error_1.ChatKittyError));
exports.MessageNotAReplyError = MessageNotAReplyError;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvbWVzc2FnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSxpQ0FBeUM7QUFRekMsbUNBSWtCO0FBOEdsQixTQUFnQixhQUFhLENBQUMsT0FBZ0I7SUFDNUMsT0FBUSxPQUF1QixDQUFDLElBQUksS0FBSyxTQUFTLENBQUM7QUFDckQsQ0FBQztBQUZELHNDQUVDO0FBRUQsU0FBZ0IsYUFBYSxDQUFDLE9BQWdCO0lBQzVDLE9BQVEsT0FBdUIsQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFDO0FBQ3JELENBQUM7QUFGRCxzQ0FFQztBQUVELFNBQWdCLGFBQWEsQ0FBQyxPQUFnQjtJQUM1QyxPQUFRLE9BQXVCLENBQUMsSUFBSSxLQUFLLFNBQVMsQ0FBQztBQUNyRCxDQUFDO0FBRkQsc0NBRUM7QUFFRCxTQUFnQixlQUFlLENBQUMsT0FBZ0I7SUFDOUMsT0FBUSxPQUF1QixDQUFDLElBQUksS0FBSyxTQUFTLENBQUM7QUFDckQsQ0FBQztBQUZELDBDQUVDO0FBNkJEO0lBQWdELDhDQUF3QjtJQUN0RSxvQ0FBbUIsU0FBc0M7UUFBekQsWUFDRSxpQkFBTyxTQUNSO1FBRmtCLGVBQVMsR0FBVCxTQUFTLENBQTZCOztJQUV6RCxDQUFDO0lBQ0gsaUNBQUM7QUFBRCxDQUFDLEFBSkQsQ0FBZ0QsaUNBQXdCLEdBSXZFO0FBSlksZ0VBQTBCO0FBTXZDO0lBQThDLDRDQUF3QjtJQUNwRSxrQ0FBbUIsT0FBaUI7UUFBcEMsWUFDRSxpQkFBTyxTQUNSO1FBRmtCLGFBQU8sR0FBUCxPQUFPLENBQVU7O0lBRXBDLENBQUM7SUFDSCwrQkFBQztBQUFELENBQUMsQUFKRCxDQUE4QyxpQ0FBd0IsR0FJckU7QUFKWSw0REFBd0I7QUFlckM7SUFBZ0QsOENBQXdCO0lBQ3RFLG9DQUFtQixPQUFnQjtRQUFuQyxZQUNFLGlCQUFPLFNBQ1I7UUFGa0Is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
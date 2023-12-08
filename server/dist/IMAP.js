"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Worker = void 0;
const ImapClient = require("emailjs-imap-client");
const mailparser_1 = require("mailparser");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
class Worker {
    constructor(inServerInfo) {
        Worker.serverInfo = inServerInfo;
    }
    connectToServer() {
        return __awaiter(this, void 0, void 0, function* () {
            const client = new ImapClient.default(Worker.serverInfo.imap.host, Worker.serverInfo.imap.port, {
                auth: Worker.serverInfo.imap.auth
            });
            client.logLevel = client.LOG_LEVEL_NONE;
            client.onerror = (inError) => {
                console.log("IMAP.Worker.listMailboxes(): Connection Error", inError);
            };
            yield client.connect();
            return client;
        });
    }
    listMailboxes() {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.connectToServer();
            const mailboxes = yield client.listMailboxes();
            yield client.close();
            const finalMailboxes = [];
            const iterateChildren = (arr) => {
                arr.forEach((val) => {
                    finalMailboxes.push({
                        name: val.name,
                        path: val.path
                    });
                    iterateChildren(val.children);
                });
            };
            iterateChildren(mailboxes.children);
            return finalMailboxes;
        });
    }
    listMessages(callOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.connectToServer();
            const mailbox = yield client.selectMailbox(callOptions);
            if (mailbox.exists === 0) {
                yield client.close();
                return [];
            }
            const messages = yield client.listMessages(callOptions.mailbox, "1:*", ["uid", "envelope"]);
            yield client.close();
            const finalMessages = [];
            messages.forEach((val) => {
                finalMessages.push({
                    id: val.uid,
                    date: val.envelope.date,
                    from: val.envelope.from[0].address,
                    subject: val.envelope.subject
                });
            });
            return finalMessages;
        });
    }
    getMessageBody(callOptions) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.connectToServer();
            const messages = yield client.listMessages(callOptions.mailbox, callOptions.id, ["body[]"], {
                byUid: true
            });
            const parsed = yield (0, mailparser_1.simpleParser)(messages[0]["body[]"]);
            yield client.close();
            return (_a = parsed.text) !== null && _a !== void 0 ? _a : "Message Unavailable";
        });
    }
    deleteMessage(callOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.connectToServer();
            yield client.deleteMessage(callOptions.mailbox, callOptions.id, {
                byUid: true
            });
            yield client.close();
        });
    }
}
exports.Worker = Worker;
//# sourceMappingURL=IMAP.js.map
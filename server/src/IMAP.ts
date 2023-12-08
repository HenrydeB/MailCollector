const ImapClient = require("emailjs-imap-client");
import { ParsedMail } from "mailparser";
import { simpleParser } from "mailparser";
import { IServerInfo } from "./ServerInfo";

export interface ICallOption{
    mailbox:string,
    id?: number
}

export interface IMessage {
    id:string,
    date: string,
    from:string,
    subject:string,
    body?: string
}

export interface IMailBox { name: string, path:string }

process.env.NODE_TLS_REJECT_UNAUTHORIZED="0";

export class Worker{
    private static serverInfo: IServerInfo;
    constructor(inServerInfo: IServerInfo){
        Worker.serverInfo = inServerInfo;
    }

    private async connectToServer() : Promise<any>{
        const client: any = new ImapClient.default(
            Worker.serverInfo.imap.host,
            Worker.serverInfo.imap.port,
            {
                auth: Worker.serverInfo.imap.auth
            }
        );
        client.logLevel = client.LOG_LEVEL_NONE;
        client.onerror = (inError: Error) =>{
            console.log("IMAP.Worker.listMailboxes(): Connection Error", inError);
        };
        await client.connect();
        return client;
    }

    public async listMailboxes(): Promise<IMailBox[]>{
        const client: any = await this.connectToServer();
        const mailboxes: any = await client.listMailboxes();
        await client.close();
        const finalMailboxes: IMailBox[] = [];
        const iterateChildren: Function = (arr: any[]):void =>{
            arr.forEach((val:any) => {
                finalMailboxes.push({
                    name: val.name,
                    path: val.path
                });
                iterateChildren(val.children);
            });
        };
        iterateChildren(mailboxes.children);
        return finalMailboxes;
    }

    public async listMessages(callOptions: ICallOption):
        Promise<IMessage[]>{
            const client: any = await this.connectToServer();
            const mailbox: any = await client.selectMailbox(callOptions);
            if(mailbox.exists === 0){
                await client.close();
                return[];
            }
            const messages: any[] = await client.listMessages(
                callOptions.mailbox, "1:*", ["uid", "envelope"]
            );
            await client.close();
            const finalMessages: IMessage[] = [];
            messages.forEach((val: any) => {
              finalMessages.push({
                id: val.uid,
                date: val.envelope.date,
                from: val.envelope.from[0].address,
                subject: val.envelope.subject
              });
            });
            return finalMessages;
        }

        public async getMessageBody(callOptions: ICallOption): Promise<string>{
            const client: any = await this.connectToServer();
            const messages: any[] = await client.listMessages(
                callOptions.mailbox,
                callOptions.id,
                ["body[]"],
                {
                    byUid : true
                }
            );
            const parsed: ParsedMail = await simpleParser(messages[0]["body[]"]);
            await client.close();
            return parsed.text ?? "Message Unavailable";
        }

        public async deleteMessage(callOptions: ICallOption): Promise<any> {
            const client: any = await this.connectToServer();
            await client.deleteMessage(
                callOptions.mailbox,
                callOptions.id,
                {
                    byUid:true
                }
            );
            await client.close();
        }

        
    
}
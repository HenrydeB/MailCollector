import axios, { AxiosResponse } from 'axios'

import { config } from './config'

export interface IMailbox { name: string, path: string }

export interface IMessage {
    id: string,
    date: string,
    from: string,
    subject: string,
    body?: string
}

export class Worker{

    public async listMailboxes(): Promise<IMailbox[]> {
        const response: AxiosResponse = await axios.get(`${config.serverAddress}/mailboxes`);
        return response.data;
    }

    public async listMessages(mailbox: string): Promise<IMessage[]>{
        const response: AxiosResponse = await axios.get(`${config.serverAddress}/mailboxes/${mailbox}`);
        return response.data;
    }

    public async getMessageBody(id: string, mailbox: string): Promise<string> {
        const response: AxiosResponse = await axios.get(`${config.serverAddress}/messages/${mailbox}/${id}`);
        return response.data;
    }

    public async deleteMessage(inID: string, inMailbox: String): Promise<void>{
        await axios.delete(`${config.serverAddress}/messages/${inMailbox}/${inID}`);
    }
}

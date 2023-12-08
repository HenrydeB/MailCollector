import axios, { AxiosResponse } from "axios";

import { config } from "./config";

export interface IContact {
    _id?: number,
    name: string,
    email: string
}

export class Worker {

    public async listContacts(): Promise<IContact[]>{
        const response: AxiosResponse =
            await axios.get(`${config.serverAddress}/contacts`);
        return response.data;
    }

    public async addContact(contact: IContact): Promise<IContact>{
        const response: AxiosResponse = await axios.post(`${config.serverAddress}/contacts`, contact);
        return response.data;
    }

    public async deleteContact(id): Promise<void>{
        await axios.delete(`${config.serverAddress}/contacts/${id}`);
    }
}

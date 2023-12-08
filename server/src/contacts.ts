import * as path from "path"
const Datastore = require("nedb")

export interface IContact{
    _id?: number,
    name: string,
    email: string
}

export class Worker{
    private db: Nedb;
    constructor(){
        this.db = new Datastore({
            fileName: path.join(__dirname, "contacts.db"),
            autoload: true
        });
    }


    public listContacts(): Promise<IContact[]>{
        return new Promise((res, rej) => {
            this.db.find({}, 
                (err: Error, inDocs: IContact[]) => {
                    if(err){
                        rej(err);
                    } else {
                        res(inDocs);
                    }
                }
            );
        });
    }

    public addContact(contact: IContact): Promise<IContact>{
        return new Promise((res, rej) => {
            this.db.insert(contact, 
                (err: Error | null, newDoc: IContact) => {
                if(err){
                    rej(err);
                } else{
                    res(newDoc);
                }
              }
            );
        });
    }

    public deleteContact(id: string): Promise<string> {
        return new Promise((res, rej) => {
            this.db.remove({_id: id}, { }, (err: Error | null, numRemoved: number) => {
                if(err){
                    rej(err);
                } else {
                    res(numRemoved.toString()) //might throw an error
                }
            })
        })
    }
}
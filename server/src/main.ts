import path from 'path';
import express, {Express, NextFunction, Request, Response } from "express";
import { serverInfo } from "./ServerInfo";
import * as IMAP from "./IMAP";
import * as SMTP from "./SMTP";
import * as Contacts from "./contacts";
import {IContact} from "./contacts";

const app: Express = express(); //creates express app

app.use(express.json());

/* 
Middleware takes care of parsing incoming request bodies that contain JSON
acts as a basic webserver
*/

app.use("/", express.static(path.join(__dirname, "../../client/dist")));

app.use(function(inRequest:Request, inResponse:Response, inNext:NextFunction) {
    inResponse.header("Access-Control-Allow-Origin", "*");
    inResponse.header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
    inResponse.header("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept");
    inNext();
})

//#region mailboxes

app.get("/mailboxes",
    async(inRequest:Request, inResponse:Response) => {
        try{
            const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
            const mailboxes: IMAP.IMailBox[] = await imapWorker.listMailboxes();
            inResponse.json(mailboxes);
        } catch(inError){
            inResponse.send("error");
        }
    });
app.get("/mailboxes/:mailbox", 
    async(inRequest:Request, inResponse:Response) => {
        try{
            const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
            const messages: IMAP.IMessage[] = await imapWorker.listMessages({
                mailbox: inRequest.params.mailbox
            });
            inResponse.json(messages);
        } catch(inError){
            inResponse.send("error");
        }
    });
//get message
app.get("/mailboxes/:mailbox/:id", 
    async(inRequest:Request, inResponse:Response) => {
        try{
            const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
            const messageBody: string = await imapWorker.getMessageBody({
                mailbox : inRequest.params.mailbox,
                id: parseInt(inRequest.params.id, 10)
            });
            inResponse.send(messageBody);
        } catch(inError){
            inResponse.send("error");
        }
    });
    //delete action
app.delete("/messages/:mailbox/:id", 
    async(inRequest:Request, inResponse:Response) => {
        try{
            const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
            await imapWorker.deleteMessage({
                mailbox: inRequest.params.mailbox,
                id: parseInt(inRequest.params.id,10)
            });
            inResponse.send("ok")
        } catch(inError){
            inResponse.send("error");
        }
    });
//send action
app.post("/messages/",
    async(inRequest:Request, inResponse:Response) => {
        try{
            const smtpWorker: SMTP.Worker = new SMTP.Worker(serverInfo);
            await smtpWorker.sendMessage(inRequest.body);
            inResponse.send("ok")
        }catch(inError){
            inResponse.send("error");
        }
    });
//#endregion

//#region Contacts

//list contact
app.get("/contacts",
    async(inRequest:Request, inResponse:Response) => {
        try{
            const contactsWorker: Contacts.Worker = new Contacts.Worker();
            const contacts: IContact[] = await contactsWorker.listContacts();
            inResponse.json(contacts);
        }catch(inError){
            inResponse.send("error");
        }
    });

//post contact
app.post("/contacts",
    async(inRequest:Request, inResponse:Response) => {
        try{
            const contactsWorker : Contacts.Worker = new Contacts.Worker();
            const contact: IContact = await contactsWorker.addContact(inRequest.body);
            inResponse.json(contact);
        } catch(inError){
            inResponse.send("error");
        }
    });

//delete contact
app.delete("/contacts/:id", 
    async(inRequest:Request, inResponse:Response) => {
        try{
            const contactsWorker:Contacts.Worker = new Contacts.Worker();
            await contactsWorker.deleteContact(inRequest.params.id);
            inResponse.send("ok");
        } catch(inError){
            inResponse.send("error");
        }
    });



//#endregion

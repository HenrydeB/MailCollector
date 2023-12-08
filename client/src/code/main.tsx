import "normalize.css";
import "../css/main.css";

import React from "react";
import ReactDOM from "react-dom"

import BaseLayout from "./components/BaseLayout";
import * as IMAP from "./IMAP";
import * as Contacts from "./Contacts";

const baseComponent = ReactDOM.render(
    <BaseLayout/>, document.body
);

baseComponent.state.showHidePleaseWait(true);

async function getMailboxes(){
    const imapWorker : IMAP.worker = new IMAP.Worker();
    const mailboxes: IMAP.IMailbox[] = await imapWorker.listMailboxes();
    mailboxes.forEach((mailbox) => {
        baseComponent.state.addMailboxToList(mailbox);
    });
}

getMailboxes().then(function() {
    async function getContacts(){
        const contactsWorker: Contacts.Worker = new Contacts.Worker();
        const contacts: Contacts.IContact[] = await contactsWorker.listContacts();
        contacts.forEach((contact) => {
            baseComponent.state.addContactToList(contact);
        });
    }
    getContacts().then(() => 
        baseComponent.state.showHidePleaseWait(false)
    )
})
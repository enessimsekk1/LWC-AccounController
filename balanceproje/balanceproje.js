import { LightningElement, wire, api, track } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import NAME_FIELD from '@salesforce/schema/Account.Name';
import ID from '@salesforce/schema/Account.Id';
import BALANCE from '@salesforce/schema/Account.Balance__c';
import TAX_NUMBER from '@salesforce/schema/Account.TaxNumber__c';
import ACCOUNT_NUMBER from '@salesforce/schema/Account.AccountNumber';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import search1 from '@salesforce/apex/AccountController.search1';
import updateAccount from '@salesforce/apex/AccountController.updateAccount';
import getAccount from '@salesforce/apex/AccountController.getAccount';
const DELAY = 300;

export default class Balanceproje extends LightningElement {
    @api recordId;
    placeholder = 'Search';
    fields = ['Name'];
    @track error;
    searchTerm;
    delayTimeout;
    @track searchRecords;
    objectLabel = 'Account';
    isLoading = false;
    ICON_URL = '/apexpages/slds/latest/assets/icons/standard-sprite/svg/symbols.svg#contact';
    @track selectedAccount;
    selectedAccountName;
    selectedAccountNumber;
    selectedAccountBalance;
    selectedAccountFinalBalance;
    selectedAccountTaxNumber;

    @wire(getRecord, 
        { recordId: '$recordId', 
        fields: [ID, NAME_FIELD,ACCOUNT_NUMBER, BALANCE, TAX_NUMBER] })
    account;

    connectedCallback(){
        this.f = true;
     }

    get ID(){
        return getFieldValue(this.account.data, ID);
    }

    get name() {
        return getFieldValue(this.account.data, NAME_FIELD);
      }

    get balance() {
        return getFieldValue(this.account.data, BALANCE);
      }

    get taxNumber() {
    return getFieldValue(this.account.data, TAX_NUMBER);
    }

    get fbalance() {
        
        return parseInt (getFieldValue(this.account.data, BALANCE)) - this.transferAmount;
    }
    get anumber() {
        
        return parseInt (getFieldValue(this.account.data, ACCOUNT_NUMBER));
    }
         

    transferAmount = 0;
 
    changeTransferHandler(event) {
    this.transferAmount = event.target.value ? parseInt(event.target.value) : 0;
    }

    changeSearchAccountHandler(event){
        this.searchAccount = event.target.value ? event.target.value : "";
    }
    
    handleSearch(){

    }
    handleInputChange(event) {
        //console.log(this.fields);
        window.clearTimeout(this.delayTimeout);

        const searchKey = event.target.value;
        this.isLoading = true;
        this.delayTimeout = setTimeout(() => {
            if (searchKey.length >= 2) {
                search1({
                    objectName: this.objectLabel,
                    fields: this.fields,
                    searchTerm: searchKey,
                    recordId: this.ID,
                    taxNumber: this.taxNumber,
                })
                    .then(result => {
                        let stringResult = JSON.stringify(result);
                        let allResult = JSON.parse(stringResult);
                        allResult.forEach(record => {
                            record.FIELD1 = record['Name'];
                        });
                        this.searchRecords = allResult;

                    })
                    .catch(error => {
                        console.error('Error:', error);
                    })
                    .finally(() => {
                        this.isLoading = false;
                    });
            }
        }, DELAY);
    }

    async setSelectedAccount(event){
        console.log(event.target.value);
        
        console.log('sele1', this.selectedAccount);
        getAccount({recordId: event.target.value}).then(result =>{
            let stringResult = JSON.stringify(result);
            let allResult = JSON.parse(stringResult);
            console.log(allResult);
            this.selectedAccount = allResult[0]
            this.selectedAccountName = allResult[0]['Name'];
            this.selectedAccountBalance = allResult[0]['Balance__c'];
            this.selectedAccountNumber= allResult[0]['AccountNumber'];
            this.selectedAccountTaxNumber = allResult[0]['TaxNumber__c'];
            this.selectedAccountFinalBalance = parseInt(allResult[0]['Balance__c']) + this.transferAmount;
            this.searchRecords = null;

        });

        console.log('sele', this.selectedAccount);
        
    }

    saveTransfer() {
        try{
            updateAccount({
                sourceaccId: this.ID,
                destaccId: this.selectedAccount['Id'],
                balance: parseInt (this.transferAmount),
                
            })

//            updateAccount({
//                accId: this.selectedAccount['Id'],
//               balance: parseInt (this.transferAmount),
//                type: 'inc'
//            })
//            console.log('update');

        }catch(error){
            const evt = new ShowToastEvent({
                title: 'Error!',
                message: 'CHECK CODE',
                variant: 'error',
            });
            this.dispatchEvent(evt);
        }

        const evt = new ShowToastEvent({
            title: 'SUCCESS!!',
            message: 'TRANSFER COMPLATED !',
            variant: 'success',
        });
        this.dispatchEvent(evt);
    }
    
}
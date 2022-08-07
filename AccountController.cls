public with sharing class AccountController {

    @AuraEnabled
    public static List<sObject> search1(String objectName, List<String> fields, String searchTerm, String recordId, String taxNumber){

        String sTerm = '%'+searchTerm+'%';

        List<Account> Account_List = [SELECT Id,Name, Balance__c, TaxNumber__c FROM  Account WHERE Name LIKE :sTerm AND Id != :recordId AND TaxNumber__c = :taxNumber];
        System.debug('accc' + Account_List);
        return Account_List;
    }

    @AuraEnabled
    public static List<sObject> getAccount(String recordId){
        
        List<Account> Account_List = [SELECT Id,Name, Balance__c, TaxNumber__c,AccountNumber FROM  Account WHERE  Id = :recordId];

        System.debug('accc' + Account_List);
        return Account_List;
    }    

    @AuraEnabled
    public static List<Account> updateAccount( String sourceaccId, String destaccId,Integer balance){

            List<Account> toupdatelist = new List<Account>();
            

            Account sourceaccount = [SELECT Id, Balance__c FROM Account WHERE Id = :sourceaccId];
            Account destaccount = [SELECT Id, Balance__c FROM Account WHERE Id = :destaccId];

            sourceaccount.balance__c = sourceaccount.Balance__c - balance;

            toupdatelist.add(sourceaccount);
            destaccount.balance__c = destaccount.Balance__c + balance;

            toupdatelist.add(destaccount);

            
            update toupdatelist;
            return toupdatelist;
    }    
    

}


const Watermark = require('../api/v0/lib/Watermark.js')

const fakeRes = {
    writeHead: () => { },
    write: (d) => { console.log(d) },
    end: () => { },
    status: () => ({ json: () => { } }),
}

const data = {
    "sessionId": "00D6A000002kEjK!ARIAQL6YIHVuQffL8ncmRxmp3GU3tcVkl0tVwBHO1YAIT6YS3aNyaoH8xG1so7PXYyPAaqUfX6tDVTDhKF1fCQPXli8AJ9tA",
    "orgId": "00D6A000002kEjKUAU",
    "hostUrl": "na122.salesforce.com",
    "documents": [
        {
            "templateVersionId": "0686A000005oMvvQAE",
            "templateName": "Propel_Item_PDF.docx",
            "templateExtension": "docx",
            "stamps": {
                "rightText": null,
                "leftText": null,
                "footerRightText": null,
                "footerLeftText": null,
                "footerCenterText": "FFFFFFFFF",
                "watermarkText": "Released"
            },
            "pdfDocumentId": "0693s000007CZWWAA4",
            "itemRevisionId": "a0L3s000008sAWREA2",
            "itemId": "a0N3s00000MWHk1EAH"
        },
        {
            "templateVersionId": "0686A000002VMCIQA4",
            "templateName": "000-DAN-TestSetup.docx",
            "templateExtension": "docx",
            "stamps": {
                "rightText": null,
                "leftText": null,
                "footerRightText": null,
                "footerLeftText": null,
                "footerCenterText": "FFFFFFFFF",
                "watermarkText": "Released"
            },
            "pdfDocumentId": "0693s000007CZWbAAO",
            "itemRevisionId": "a0L3s000008sAWREA2",
            "itemId": "a0N3s00000MWHk1EAH"
        }
    ],
    "approvalData": {
        "ApprovalRow": [
            {
                "ResponseType": "Unanimous",
                "PhaseName": "Appr",
                "OriginalActorName": "Daniel Lwo",
                "GroupName": null,
                "ApprovalDate": null,
                "ActorName": "Daniel Lwo"
            }
        ],
        "Change__c": [
            {
                "attributes": {
                    "type": "Change__c",
                    "url": "/services/data/v46.0/sobjects/Change__c/a073s00000Eyv1xAAB"
                },
                "Id": "a073s00000Eyv1xAAB",
                "OwnerId": "0056A000001qtyjQAA",
                "IsDeleted": false,
                "Name": "ECO-0149",
                "CurrencyIsoCode": "USD",
                "CreatedDate": "2019-08-22T17:51:46",
                "CreatedById": "0056A000001qtyjQAA",
                "LastModifiedDate": "2019-08-22T18:23:46",
                "LastModifiedById": "0056A000001qtyjQAA",
                "SystemModstamp": "2019-08-22T18:23:46",
                "LastViewedDate": "2019-08-22T18:13:41",
                "LastReferencedDate": "2019-08-22T18:13:41",
                "Affected_Item_Counter__c": 1,
                "Approved__c": false,
                "Auto_Number__c": "001516",
                "Cancelled__c": false,
                "Category__c": "a056A00000GfNCYQA3",
                "Closed__c": false,
                "Expired__c": false,
                "Has_Affected_Items__c": true,
                "Has_Attachments__c": false,
                "Implemented__c": false,
                "In_Approval_Process__c": false,
                "Lifecycle__c": "a0O6A000000vj46UAA",
                "State__c": "Draft",
                "Status_lk__c": "a063s00000EyOJ2AAN",
                "Happen__c": false,
                "Water__c": true,
                "Owner": {
                    "attributes": {
                        "type": "Name",
                        "url": "/services/data/v46.0/sobjects/User/0056A000001qtyjQAA"
                    },
                    "Id": "0056A000001qtyjQAA",
                    "Name": "Daniel Lwo"
                },
                "CreatedBy": {
                    "attributes": {
                        "type": "User",
                        "url": "/services/data/v46.0/sobjects/User/0056A000001qtyjQAA"
                    },
                    "Id": "0056A000001qtyjQAA",
                    "Name": "Daniel Lwo"
                },
                "LastModifiedBy": {
                    "attributes": {
                        "type": "User",
                        "url": "/services/data/v46.0/sobjects/User/0056A000001qtyjQAA"
                    },
                    "Id": "0056A000001qtyjQAA",
                    "Name": "Daniel Lwo"
                },
                "Category__r": {
                    "attributes": {
                        "type": "Category__c",
                        "url": "/services/data/v46.0/sobjects/Category__c/a056A00000GfNCYQA3"
                    },
                    "Id": "a056A00000GfNCYQA3",
                    "Name": "A_ECO"
                },
                "Lifecycle__r": {
                    "attributes": {
                        "type": "Lifecycle__c",
                        "url": "/services/data/v46.0/sobjects/Lifecycle__c/a0O6A000000vj46UAA"
                    },
                    "Id": "a0O6A000000vj46UAA",
                    "Name": "ECO_rename"
                },
                "Status_lk__r": {
                    "attributes": {
                        "type": "Change_Phase__c",
                        "url": "/services/data/v46.0/sobjects/Change_Phase__c/a063s00000EyOJ2AAN"
                    },
                    "Id": "a063s00000EyOJ2AAN",
                    "Name": "Doc"
                }
            }
        ]
    }
}

new Watermark(data, fakeRes)

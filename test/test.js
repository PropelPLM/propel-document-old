const Watermark = require('../api/v2/lib/Watermark.js')
const Template = require('../api/v2/lib/Template.js')

const fakeRes = {
  writeHead: () => { },
  write: (d) => { console.log(d) },
  end: () => { },
  status: () => ({ json: () => { } }),
  send: (d) => { console.log(d) },
}

const data = {
  sessionId: '00D6A000002kEjK!ARIAQJvztEMG2ac5e1S_9WgI7w4FzPSeQ98YJFqYTqLx0iF6YXn2KGTYFzyxysJW9wtXcq6Tv9PTDlVtLBzmqXtBr6N7D47I',
  "orgId": "00D6A000002kEjKUAU",
  "hostUrl": "na122.salesforce.com",
  "namespace": "P5DAN",
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
      "pdfDocumentId": null,
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
      "pdfDocumentId": null,
      "itemRevisionId": "a0L3s000008sAWREA2",
      "itemId": "a0N3s00000MWHk1EAH"
    }
  ],
  "approvalData": {
    "a073s00000Eyv1xAAB": {
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
}

// new Watermark(data, fakeRes)

const data2 = {
  templateNameOnAspose: 'Quality Template - Product Complaint.docx',
  sessionId: '00D0U0000009hv5!ARoAQHU2WJ0h0nIj2o5gUnoRiBtg_XEQdxyYH0jOv4GSQT2yqAlAtZYSMWe3I3Yv.wrBIZrcVbhJPbfdgbzk2fIQrZrIEchx',
  recordId: 'a1c0U000001SqF4QAK',
  orgId: '00D0U0000009hv5UAA',
  newFileName: 'Quality_CMP-000006538.pdf',
  hostUrl: 'aspsolutions--propeldev.my.salesforce.com',
  dataToPopulate: '{"RelatedLists":[{"Note__c.Quality__c":[{"Quality__r":{"Id":"a1c0U000001SqF4QAK","Name":"CMP-000006538"},"CreatedBy":{"Id":"0055A00000B5jRXQAZ","Name":"Carlos Angulo"},"Id":"a2L0U000000x0uZUAQ","Quality__c":"a1c0U000001SqF4QAK","Note_Type__c":"Note","Name":"A-0007179","Note_Body_Short__c":"testnote1","Note_Body__c":"testnote1","CreatedById":"0055A00000B5jRXQAZ","CreatedBy_User__c":"Carlos Angulo"},{"Quality__r":{"Id":"a1c0U000001SqF4QAK","Name":"CMP-000006538"},"CreatedBy":{"Id":"0055A00000B5jRXQAZ","Name":"Carlos Angulo"},"Id":"a2L0U000000x0ueUAA","Quality__c":"a1c0U000001SqF4QAK","Note_Type__c":"Additional Event Information","Name":"A-0007180","Note_Body_Short__c":"testnote2","Note_Body__c":"testnote2","CreatedById":"0055A00000B5jRXQAZ","CreatedBy_User__c":"Carlos Angulo"},{"Quality__r":{"Id":"a1c0U000001SqF4QAK","Name":"CMP-000006538"},"CreatedBy":{"Id":"0055A00000B5jRXQAZ","Name":"Carlos Angulo"},"Id":"a2L0U000000x0ujUAA","Quality__c":"a1c0U000001SqF4QAK","Note_Type__c":"Note","Name":"A-0007181","Note_Body_Short__c":"more tests","Note_Body__c":"more tests","CreatedById":"0055A00000B5jRXQAZ","CreatedBy_User__c":"Carlos Angulo"},{"Quality__r":{"Id":"a1c0U000001SqF4QAK","Name":"CMP-000006538"},"CreatedBy":{"Id":"0055A00000B5jRXQAZ","Name":"Carlos Angulo"},"Id":"a2L0U000000x1APUAY","Quality__c":"a1c0U000001SqF4QAK","Note_Type__c":"Note","Name":"A-0007182","Note_Body_Short__c":"more notes","Note_Body__c":"more notes","CreatedById":"0055A00000B5jRXQAZ","CreatedBy_User__c":"Carlos Angulo"}],"RMA_Order__c.Quality__c":[],"Quality__c.Quality__c":[{"Status_lk__r":{"Id":"a100U000003y5vxQAA","Name":"Open"},"Record_Tasks_Project__r":{"Id":"a1a0U0000018NVMQA2","Name":"IP-00006620 Tasks"},"Product__r":{"Id":"01t5A000007iE33QAE","Name":"NOLEGGIO STERRAD NX"},"Physical_Manufacturer__r":{"Id":"a2J0U0000007i6pUAA","Name":"ASP Irvine MFG"},"Quality__r":{"Id":"a1c0U000001SqF4QAK","Name":"CMP-000006538"},"Owner":{"Id":"0055A00000B5jRXQAZ","Name":"Carlos Angulo"},"Legal_Manufacturer__r":{"Id":"a2J0U0000007i6lUAA","Name":"Advanced Sterilization Products"},"LastModifiedBy":{"Id":"0055A00000B5jRXQAZ","Name":"Carlos Angulo"},"CreatedBy":{"Id":"0055A00000B5jRXQAZ","Name":"Carlos Angulo"},"Category__r":{"Id":"a0y0U0000016QguQAE","Name":"Impacted Product"},"Was_the_Device_Reprocessed_and_Reused__c":false,"Void__c":false,"Update_Lot_DHR__c":false,"Update_Batch_DHR__c":false,"Update_Batch_Lot_DHR__c":false,"Unknown_Serial_Number__c":false,"Unknown_Lot__c":false,"Unknown_Batch_Lot__c":false,"Unknown_Batch__c":false,"Treatment__c":false,"SystemModstamp":"2020-08-11T00:58:22.000Z","SupplyChain_ID_N_A__c":false,"Status_Hidden_Field__c":"Open","Status_lk__c":"a100U000003y5vxQAA","Single_Use_Device__c":false,"Serviceable_Legacy__c":false,"Return_Required__c":false,"Require_Void_Reason__c":true,"Require_Reopen_Reason_IP__c":true,"Require_Reopen_Reason__c":true,"Related_to_Field_Action_or_Recall__c":false,"Record_Tasks_Project__c":"a1a0U0000018NVMQA2","Id":"a1c0U000001SqF5QAK","Name":"IP-00006620","Quality_URL__c":"https://aspsolutions--propeldev.my.salesforce.com/a1c0U000001SqF5","Product_Name__c":"NOLEGGIO STERRAD NX","Product_Code__c":"NLSTERRADNX","Product__c":"01t5A000007iE33QAE","Physical_Manufacturer__c":"a2J0U0000007i6pUAA","Related_Quality_Status__c":"Intake","Quality__c":"a1c0U000001SqF4QAK","OwnerId":"0055A00000B5jRXQAZ","Organization_ID__c":"Advanced Sterilization Products, Inc. : 00D0U0000009hv5UAA","Lot_Recalled__c":false,"Litigation__c":false,"Legal_Manufacturer__c":"a2J0U0000007i6lUAA","Legacy_Complaint__c":false,"LastViewedDate":"2020-08-11T20:25:20.000Z","LastReferencedDate":"2020-08-11T20:25:20.000Z","Last_Modified_Date__c":"2020-08-11T00:58:22.000Z","LastModifiedDate":"2020-08-11T00:58:22.000Z","Last_Modified_By__c":"Carlos Angulo","LastModifiedById":"0055A00000B5jRXQAZ","Is_Reopened__c":false,"Is_Periodic_Evaluation_Required__c":"No","In_Approval_Process__c":false,"Impacted_Product_Auto_Created_from_Case__c":true,"Has_Attachments__c":false,"Has_Affected_Items__c":false,"Diagnosis__c":false,"IsDeleted":false,"Days_Since_Last_Modified__c":7,"Days_Since_Creation__c":82,"Days_in_Current_Status__c":82,"Customer_Response_Required__c":false,"Customer_Requests_Investigation_Photos__c":false,"Customer_Refuses_to_be_Contacted__c":false,"CurrencyIsoCode":"USD","Created_Date__c":"2020-05-27T22:21:06.000Z","CreatedDate":"2020-05-27T22:21:06.000Z","CreatedById":"0055A00000B5jRXQAZ","Contained__c":false,"Closed__c":false,"Category__c":"a0y0U0000016QguQAE","Being_Used_for_Treatment_Diagnosis__c":"No","Batch_Recalled__c":false,"Batch_Lot_Recalled__c":false,"Approved__c":false,"Analysis_Site_Legacy__c":"ASP IRVINE","Age_Days__c":82,"Affected_Item_Counter__c":0,"of_RMA_Order__c":0,"of_Reportable_Authority__c":1,"of_Reportable_Authority_with_Decision__c":1,"of_RA_with_Pending_MedWatch_Forms__c":1,"of_PE_Codes_per_IP__c":0,"of_Patient_Codes_per_IP__c":1,"of_Malfunction_PE_Codes_per_IP__c":0,"of_ITH_without_Results__c":0,"of_IPs_per_PC__c":0,"of_Conclusion_Code__c":0,"of_Closed_RMA_Order__c":0,"of_Closed_IPs_per_PC__c":0,"of_Analysis_Code_with_Code_Mapping__c":0,"of_Analysis_Code__c":0,"RelatedLists":[{"Conclusion_Code__c.Quality__c":[],"Method_Code__c.Quality__c":[],"Result_Code__c.Quality__c":[],"Investigation_Plan__c.Quality__c":[],"Analysis_Code__c.Quality__c":[],"Product_Experience_Code__c.Quality__c":[],"Patient_Code__c.Quality__c":[{"Code_Name__r":{"Id":"a2F0U000000CTPYUA4","Name":"No Patient Consequence"},"Quality__r":{"Id":"a1c0U000001SqF5QAK","Name":"IP-00006620"},"Id":"a2M0U000001SBpvUAG","Severity_Level_in_ASP_Risk_files__c":"SL0","Product_Return_Required__c":false,"FDA_Code_Name__c":"No Consequences Or Impact To Patient","Possible_Risk__c":"S1","FDA_Code__c":"2199","Code_Name__c":"a2F0U000000CTPYUA4","Description_of_Code_Name__c":"No Consequences Or Impact To Patient","Quality__c":"a1c0U000001SqF5QAK","Impacted_Product_Name__c":"IP-00006620: NOLEGGIO STERRAD NX","Name":"PCC-0007674"}],"Foreign_Experience_Reporting__c.Quality__c":[{"Quality__r":{"Id":"a1c0U000001SqF5QAK","Name":"IP-00006620"},"Id":"a3D0U000000QjveUAC","Status_FER__c":"Pending Reportability Determination","Impacted_Product_Name_FER__c":"NOLEGGIO STERRAD NX","Impacted_Product_Code_FER__c":"NLSTERRADNX","Awareness_Date_FER__c":"2020-05-27","Country__c":"Japan","Quality__c":"a1c0U000001SqF5QAK","Name":"FER-000002367"},{"Quality__r":{"Id":"a1c0U000001SqF5QAK","Name":"IP-00006620"},"Id":"a3D0U000000QjvfUAC","Status_FER__c":"Pending Reportability Determination","Impacted_Product_Name_FER__c":"NOLEGGIO STERRAD NX","Impacted_Product_Code_FER__c":"NLSTERRADNX","Awareness_Date_FER__c":"2020-05-27","Country__c":"China","Quality__c":"a1c0U000001SqF5QAK","Name":"FER-000002368"},{"Quality__r":{"Id":"a1c0U000001SqF5QAK","Name":"IP-00006620"},"Id":"a3D0U000000QjvgUAC","Status_FER__c":"Pending Reportability Determination","Impacted_Product_Name_FER__c":"NOLEGGIO STERRAD NX","Impacted_Product_Code_FER__c":"NLSTERRADNX","Awareness_Date_FER__c":"2020-05-27","Country__c":"Brazil","Quality__c":"a1c0U000001SqF5QAK","Name":"FER-000002369"},{"Quality__r":{"Id":"a1c0U000001SqF5QAK","Name":"IP-00006620"},"Id":"a3D0U000000QjvhUAC","Status_FER__c":"Pending Reportability Determination","Impacted_Product_Name_FER__c":"NOLEGGIO STERRAD NX","Impacted_Product_Code_FER__c":"NLSTERRADNX","Awareness_Date_FER__c":"2020-05-27","Country__c":"South Korea","Quality__c":"a1c0U000001SqF5QAK","Name":"FER-000002370"}],"Reportable_Authority__c.Quality__c":[{"Quality__r":{"Id":"a1c0U000001SqF5QAK","Name":"IP-00006620"},"RecordType":{"Id":"0125A0000013S2pQAE","Name":"US Reportable Authority"},"Id":"a2Q0U00000158erUAA","Due_Date__c":"2020-06-26","Impacted_Product_Name__c":"NOLEGGIO STERRAD NX","Quality__c":"a1c0U000001SqF5QAK","Reportability_Decision__c":"Malfunction","Status__c":"Reportability Determined","Reporting_Period__c":"30","Decision_Tree__c":"US FDA - Device","Impacted_Product_Code__c":"NLSTERRADNX","Name":"RA-000006844","Record_Type__c":"MEDWATCH_FORM_FDA_3500A","Regulatory_Authority__c":"US FDA - Device","Awareness_Date__c":"2020-05-27","RecordTypeId":"0125A0000013S2pQAE"}]}]},{"Status_lk__r":{"Id":"a100U000003ydSPQAY","Name":"Open"},"Record_Tasks_Project__r":{"Id":"a1a0U000001K3UXQA0","Name":"IP-00006664 Tasks"},"Physical_Manufacturer__r":{"Id":"a2J0U0000007i6pUAA","Name":"ASP Irvine MFG"},"Quality__r":{"Id":"a1c0U000001SqF4QAK","Name":"CMP-000006538"},"Owner":{"Id":"0055A00000B5jRXQAZ","Name":"Carlos Angulo"},"Legal_Manufacturer__r":{"Id":"a2J0U0000007i6lUAA","Name":"Advanced Sterilization Products"},"LastModifiedBy":{"Id":"0055A00000B5jRXQAZ","Name":"Carlos Angulo"},"CreatedBy":{"Id":"0055A00000B5jRXQAZ","Name":"Carlos Angulo"},"Category__r":{"Id":"a0y0U0000016QguQAE","Name":"Impacted Product"},"Was_the_Device_Reprocessed_and_Reused__c":false,"Void__c":false,"Update_Lot_DHR__c":false,"Update_Batch_DHR__c":false,"Update_Batch_Lot_DHR__c":false,"Unknown_Serial_Number__c":false,"Unknown_Lot__c":false,"Unknown_Batch_Lot__c":false,"Unknown_Batch__c":false,"Treatment__c":false,"SystemModstamp":"2020-08-11T00:59:16.000Z","SupplyChain_ID_N_A__c":false,"Status_Hidden_Field__c":"Open","Status_lk__c":"a100U000003ydSPQAY","Single_Use_Device__c":false,"Serviceable_Legacy__c":false,"Return_Required__c":false,"Require_Void_Reason__c":true,"Require_Reopen_Reason_IP__c":true,"Require_Reopen_Reason__c":true,"Related_to_Field_Action_or_Recall__c":false,"Record_Tasks_Project__c":"a1a0U000001K3UXQA0","Id":"a1c0U000001ZiORQA0","Name":"IP-00006664","Quality_URL__c":"https://aspsolutions--propeldev.my.salesforce.com/a1c0U000001ZiOR","Physical_Manufacturer__c":"a2J0U0000007i6pUAA","Related_Quality_Status__c":"Intake","Quality__c":"a1c0U000001SqF4QAK","OwnerId":"0055A00000B5jRXQAZ","Organization_ID__c":"Advanced Sterilization Products, Inc. : 00D0U0000009hv5UAA","Lot_Recalled__c":false,"Litigation__c":false,"Legal_Manufacturer__c":"a2J0U0000007i6lUAA","Legacy_Complaint__c":false,"Last_Modified_Date__c":"2020-08-11T00:59:16.000Z","LastModifiedDate":"2020-08-11T00:59:16.000Z","Last_Modified_By__c":"Carlos Angulo","LastModifiedById":"0055A00000B5jRXQAZ","Is_Reopened__c":false,"Is_Periodic_Evaluation_Required__c":"No","In_Approval_Process__c":false,"Impacted_Product_Auto_Created_from_Case__c":false,"Has_Attachments__c":false,"Has_Affected_Items__c":false,"Diagnosis__c":false,"IsDeleted":false,"Days_Since_Last_Modified__c":7,"Days_Since_Creation__c":7,"Days_in_Current_Status__c":7,"Customer_Response_Required__c":false,"Customer_Requests_Investigation_Photos__c":false,"Customer_Refuses_to_be_Contacted__c":false,"CurrencyIsoCode":"USD","Created_Date__c":"2020-08-11T00:59:06.000Z","CreatedDate":"2020-08-11T00:59:06.000Z","CreatedById":"0055A00000B5jRXQAZ","Contained__c":false,"Closed__c":false,"Category__c":"a0y0U0000016QguQAE","Being_Used_for_Treatment_Diagnosis__c":"No","Batch_Recalled__c":false,"Batch_Lot_Recalled__c":false,"Approved__c":false,"Analysis_Site_Legacy__c":"ASP IRVINE","Age_Days__c":7,"Affected_Item_Counter__c":0,"of_RMA_Order__c":0,"of_Reportable_Authority__c":1,"of_Reportable_Authority_with_Decision__c":0,"of_RA_with_Pending_MedWatch_Forms__c":0,"of_PE_Codes_per_IP__c":0,"of_Patient_Codes_per_IP__c":0,"of_Malfunction_PE_Codes_per_IP__c":0,"of_ITH_without_Results__c":0,"of_IPs_per_PC__c":0,"of_Conclusion_Code__c":0,"of_Closed_RMA_Order__c":0,"of_Closed_IPs_per_PC__c":0,"of_Analysis_Code_with_Code_Mapping__c":0,"of_Analysis_Code__c":0,"RelatedLists":[{"Conclusion_Code__c.Quality__c":[],"Method_Code__c.Quality__c":[],"Result_Code__c.Quality__c":[],"Investigation_Plan__c.Quality__c":[],"Analysis_Code__c.Quality__c":[],"Product_Experience_Code__c.Quality__c":[],"Patient_Code__c.Quality__c":[],"Foreign_Experience_Reporting__c.Quality__c":[{"Quality__r":{"Id":"a1c0U000001ZiORQA0","Name":"IP-00006664"},"Id":"a3D0U000000RSKzUAO","Status_FER__c":"Pending Reportability Determination","Awareness_Date_FER__c":"2020-05-27","Country__c":"Japan","Quality__c":"a1c0U000001ZiORQA0","Name":"FER-000002550"},{"Quality__r":{"Id":"a1c0U000001ZiORQA0","Name":"IP-00006664"},"Id":"a3D0U000000RSL0UAO","Status_FER__c":"Pending Reportability Determination","Awareness_Date_FER__c":"2020-05-27","Country__c":"China","Quality__c":"a1c0U000001ZiORQA0","Name":"FER-000002551"},{"Quality__r":{"Id":"a1c0U000001ZiORQA0","Name":"IP-00006664"},"Id":"a3D0U000000RSL1UAO","Status_FER__c":"Pending Reportability Determination","Awareness_Date_FER__c":"2020-05-27","Country__c":"Brazil","Quality__c":"a1c0U000001ZiORQA0","Name":"FER-000002552"},{"Quality__r":{"Id":"a1c0U000001ZiORQA0","Name":"IP-00006664"},"Id":"a3D0U000000RSL2UAO","Status_FER__c":"Pending Reportability Determination","Awareness_Date_FER__c":"2020-05-27","Country__c":"South Korea","Quality__c":"a1c0U000001ZiORQA0","Name":"FER-000002553"},{"Quality__r":{"Id":"a1c0U000001ZiORQA0","Name":"IP-00006664"},"Id":"a3D0U000000RSL3UAO","Status_FER__c":"Pending Reportability Determination","Awareness_Date_FER__c":"2020-05-27","Country__c":"Malaysia","Quality__c":"a1c0U000001ZiORQA0","Name":"FER-000002554"}],"Reportable_Authority__c.Quality__c":[{"Quality__r":{"Id":"a1c0U000001ZiORQA0","Name":"IP-00006664"},"RecordType":{"Id":"0125A0000013S2pQAE","Name":"US Reportable Authority"},"Id":"a2Q0U0000016Qb4UAE","Quality__c":"a1c0U000001ZiORQA0","Decision_Tree__c":"US FDA - Device","Name":"RA-000006914","Record_Type__c":"MEDWATCH_FORM_FDA_3500A","Regulatory_Authority__c":"US FDA - Device","Awareness_Date__c":"2020-05-27","RecordTypeId":"0125A0000013S2pQAE"}]}]}],"Associated_Contact__c.Quality__c":[{"Quality__r":{"Id":"a1c0U000001SqF4QAK","Name":"CMP-000006538"},"Owner":{"Id":"0055A00000B5jRXQAZ","Name":"Carlos Angulo"},"Contact__r":{"Id":"0030U00000pBXI8QAO","Name":"Mario Nintendo"},"Id":"a2E0U0000003YSdUAM","Shipper_Kit_Contact__c":false,"Return_Kit__c":false,"Quality__c":"a1c0U000001SqF4QAK","Phone_Number__c":"(123)456-7890","OwnerId":"0055A00000B5jRXQAZ","Last_Name__c":"Nintendo","Initial_Reporter__c":true,"Health_Professional__c":false,"Follow_up_Contact__c":false,"First_Name__c":"Mario","Contact__c":"0030U00000pBXI8QAO","Country__c":"US","Name":"ASC-06979"},{"Quality__r":{"Id":"a1c0U000001SqF4QAK","Name":"CMP-000006538"},"Owner":{"Id":"0055A00000B5jRXQAZ","Name":"Carlos Angulo"},"Internal_User__r":{"Id":"0055A00000B5jRXQAZ","Name":"Carlos Angulo"},"Id":"a2E0U0000003odGUAQ","Shipper_Kit_Contact__c":false,"Return_Kit__c":false,"Quality__c":"a1c0U000001SqF4QAK","OwnerId":"0055A00000B5jRXQAZ","Last_Name__c":"Angulo","Internal_User__c":"0055A00000B5jRXQAZ","Initial_Reporter__c":false,"Health_Professional__c":false,"Follow_up_Contact__c":true,"First_Name__c":"Carlos","Email__c":"carlos.angulo@asp.com.invalid","Country__c":"US","Contact_Role__c":"Distributor","Name":"ASC-07022"}]}],"ContentDocument":[],"ApprovalData":[],"AffectedItems":[],"Quality__c":[{"DateTime":"2020-08-17 21:25:24","Date":"2020-08-17","UserFullName":"Rai Lyons","Username":"rachel.lyons@asp.com.propeldev","related_case__r":"CASE-030337","complaint_owner__r":"Carlos Angulo","status_lk__r":"Intake","record_tasks_project__r":"CMP-000006538","category__r":"Product Complaint","lastmodifiedby":"Rai Lyons","createdby":"Carlos Angulo","owner":"Carlos Angulo","of_patient_codes_imdrf_health_per_ip__c":"0","of_patient_codes_imdrf_clinic_per_ip__c":"0","of_fers_per_ip__c":"0","of_determined_fers_per_ip__c":"0","nc_risk_analysis_matrix__c":"<img src=\\"/sfc/servlet.shepherd/version/download/0682E000004nhBi\\" alt=\\"Need to reference company-specific risk analysis image in this field&#39;s formula\\" style=\\"height:250px; width:650px;\\" border=\\"0\\"/>","nc_licensed_biological_product__c":"false","nc_defect_code_count__c":"0","disposition_use_as_is__c":"false","disposition_scrap__c":"false","disposition_rework__c":"false","disposition_return_to_vendor__c":"false","disposition_return_to_service__c":"false","disposition_replace__c":"false","disposition_repair__c":"false","disposition_release_from_hold__c":"false","extension_request_date_edit_flag__c":"false","audit_request_count__c":"0","of_invps_per_parent_total__c":"0","of_invps_per_parent_closed__c":"0","of_extensions_per_parent_total__c":"0","of_extensions_per_parent_closed__c":"0","of_ems_per_parent_total__c":"0","of_ems_per_parent_closed__c":"0","of_disposition_plans_per_parent_total__c":"0","of_disposition_plans_per_parent_closed__c":"0","of_children_per_parent_total__c":"0","of_children_per_parent_closed__c":"0","of_actions_per_parent_total__c":"0","of_actions_per_parent_closed__c":"0","of_aps_per_parent_total__c":"0","of_aps_per_parent_closed__c":"0","quality_event_date__c":"2020-05-27 00:00:00","investigation_approval_late_flag__c":"false","extensions_requested_for_parent__c":"0","category_hidden_field__c":"Product Complaint","capa_plan_missed_due_date_flag__c":"false","capa_overall_risk__c":"NO DATA","audit_company__c":"ASP","age_status__c":"On-time","of_reportable_authority_with_decision__c":"0","of_reportable_authority__c":"0","of_rma_order__c":"0","of_ra_with_pending_medwatch_forms__c":"0","of_patient_codes_per_ip__c":"0","of_pe_codes_per_ip__c":"0","of_malfunction_pe_codes_per_ip__c":"0","of_ith_without_results__c":"0","of_conclusion_code__c":"0","of_closed_rma_order__c":"0","of_analysis_code_with_code_mapping__c":"0","of_analysis_code__c":"0","of_ips_per_pc__c":"2","of_closed_ips_per_pc__c":"0","was_the_device_reprocessed_and_reused__c":"false","void__c":"false","update_lot_dhr__c":"false","update_batch_lot_dhr__c":"false","update_batch_dhr__c":"false","unknown_serial_number__c":"false","unknown_lot__c":"false","unknown_batch__c":"false","unknown_batch_lot__c":"false","unique_product_code_sku__c":"NLSTERRADNX","treatment__c":"false","supplychain_id_n_a__c":"false","status_hidden_field__c":"Intake","single_use_device__c":"false","sex__c":"Female","serviceable_legacy__c":"false","return_required__c":"false","require_void_reason__c":"true","require_reopen_reason__c":"true","require_reopen_reason_ip__c":"true","report_source__c":"Healthcare Professional","relevant_test_lab_data__c":"n/a","related_to_field_action_or_recall__c":"false","related_case__c":"5000U00000AVouvQAD","race__c":"Black or African American","quality_url__c":"https://aspsolutions--propeldev.my.salesforce.com/a1c0U000001SqF4","product_on_case__c":"NOLEGGIO STERRAD NX","patient_identifier__c":"M. E.","patient_age_at_the_time_of_event__c":"20","organization_id__c":"Advanced Sterilization Products, Inc. : 00D0U0000009hv5UAA","modality__c":"Phone","lot_recalled__c":"false","load_status__c":"No Load involved","litigation__c":"false","legacy_complaint__c":"false","last_modified_date__c":"2020-08-17 21:18:49","last_modified_by__c":"Rai Lyons","is_reopened__c":"false","is_periodic_evaluation_required__c":"No","of_approved_extensions__c":"0","injury__c":"No","injury_status__c":"Minor","injuries_related_complaint__c":"No","impacted_product_auto_created_from_case__c":"false","human_reaction__c":"No Human Reaction","event_description_local_language__c":"test","event_description__c":"bla bh blahb","event_description_english__c":"test","event_date_formula__c":"2020-05-27 00:00:00","ethnicity__c":"Hispanic/Latino","diagnosis__c":"false","days_in_current_status__c":"82","days_since_last_modified__c":"0","days_since_creation__c":"82","customer_response_required__c":"false","customer_requests_investigation_photos__c":"false","customer_refuses_to_be_contacted__c":"false","created_date__c":"2020-05-27 22:21:02","imdrf_code_check_cleared__c":"true","country_of_event__c":"Puerto Rico","contained__c":"false","contact_phone__c":"(123)456-7890","contact_name__c":"Mario  Nintendo","complaint_owner__c":"0055A00000B5jRXQAZ","complaint_age__c":"82","case_age__c":"82","chu_received_date_formula__c":"2020-05-27 00:00:00","being_used_for_treatment_diagnosis__c":"No","batch_recalled__c":"false","batch_lot_recalled__c":"false","awareness_date__c":"2020-05-27 00:00:00","analysis_site_legacy__c":"ASP IRVINE","alert_date_formula__c":"2020-05-27 00:00:00","age_unit__c":"Years","age_days__c":"82","account_name_formula__c":"ST VINCENT SURG CTR ERIE","status_lk__c":"a100U000003y5vvQAA","record_tasks_project__c":"a1a0U0000018NVRQA2","in_approval_process__c":"false","has_attachments__c":"true","has_affected_items__c":"false","closed__c":"false","category__c":"a0y0U0000016Qf5QAE","approved__c":"false","affected_item_counter__c":"0","systemmodstamp":"2020-08-17 21:18:49","lastmodifiedbyid":"0055A00000B3UFlQAN","lastmodifieddate":"2020-08-17 21:18:49","createdbyid":"0055A00000B5jRXQAZ","createddate":"2020-05-27 22:21:02","currencyisocode":"USD","name":"CMP-000006538","isdeleted":"false","ownerid":"0055A00000B5jRXQAZ","id":"a1c0U000001SqF4QAK"}]}'
}

new Template(data2, fakeRes)

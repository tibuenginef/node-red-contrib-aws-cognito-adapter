# node-red-contrib-aws-cognito-adapter

This is a helper node that uses the amazon-cognito-identity-js to create and authenticate users inside AWS Cognito.

## Mandatory/Default Inputs - on all nodes

**Name**  
Display name of the Node.

**TargetAttribute**
Defines the Attribute of the `msg` Object that will store the valid Token.  
Defaults to `msg.payload`.

**Userpool Id**  
Id of the Cognito Userpool.  
Format starts with a region, followed by an ID (e.g.: eu-west-1_SoMeId).

**Client Id**  
Client ID or Webclient ID, as provided by Cognito.

## Inputs - User Login

**Username**  
The user name of the Cognito Account, typically a email address.  
This can also be provided as a parameter to the inbount message on attribute `msg.username`.  
If the `msg.username` is present on the input, it will be removed before the message is send foreward.

**Password**  
The Password of the Cognito Account.  
This can also be provided as a parameter to the inbount message on attribute `msg.password`.  
If the `msg.password` is present on the input, it will be removed before the message is send foreward.

## Inputs - Create User

**First Name**  
The first name of the Cognito Account.  
This can also be provided as a parameter to the inbount message on attribute `msg.firstName`.  
If the `msg.firstName` is present on the input, it will be removed before the message is send foreward.

**Email**  
The email address of the Cognito Account.  
This can also be provided as a parameter to the inbount message on attribute `msg.email`.  
If the `msg.email` is present on the input, it will be removed before the message is send foreward.

**Mobile Number**  
The mobile number of the Cognito Account.  
This can also be provided as a parameter to the inbount message on attribute `msg.mobileNumber`.  
If the `msg.mobileNumber` is present on the input, it will be removed before the message is send foreward.

**Password**  
The Password of the Cognito Account.  
This can also be provided as a parameter to the inbount message on attribute `msg.password`.  
If the `msg.password` is present on the input, it will be removed before the message is send foreward.

## Inputs - Verify Email

**Email**  
The email address of the Cognito Account.  
This can also be provided as a parameter to the inbount message on attribute `msg.email`.  
If the `msg.email` is present on the input, it will be removed before the message is send foreward.

**Code**  
The email verification received from Cognito.  
This can also be provided as a parameter to the inbount message on attribute `msg.code`.  
If the `msg.code` is present on the input, it will be removed before the message is send foreward.

## Output

`msg.payload`

## Dependencies

- amazon-cognito-identity-js

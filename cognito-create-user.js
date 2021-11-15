const AWSCognito = require("amazon-cognito-identity-js");

const session = ({
  Email,
  MobileNumber,
  Username,
  Password,
  UserPoolId,
  ClientId,
}) =>
  new Promise((resolve, reject) => {
    var poolData = {
      UserPoolId: UserPoolId,
      ClientId: ClientId,
    };
    var userPool = new AWSCognito.CognitoUserPool(poolData);
    const attributeList = [
      new AWSCognito.CognitoUserAttribute({
        Name: "email",
        Value: Email,
      }),
      new AWSCognito.CognitoUserAttribute({
        Name: "name",
        Value: Username,
      }),
      new AWSCognito.CognitoUserAttribute({
        Name: "phone_number",
        Value: MobileNumber,
      }),
      new AWSCognito.CognitoUserAttribute({
        Name: "custom:face_id_enabled",
        Value: "false",
      }),
    ];

    userPool.signUp(Email, Password, attributeList, [], function (err, res) {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });

module.exports = function (RED) {
  function createUser(config) {
    RED.nodes.createNode(this, config);

    var Username = this.credentials.firstName;
    var Password = this.credentials.password;
    var Email = this.credentials.email;
    var MobileNumber = this.credentials.mobileNumber;
    var node = this;

    node.on("input", function (msg) {
      if (
        msg.hasOwnProperty("firstName") ||
        msg.hasOwnProperty("password") ||
        msg.hasOwnProperty("email") ||
        msg.hasOwnProperty("mobileNumber")
      ) {
        Username = msg.firstName;
        delete msg.firstName;
        Password = msg.password;
        delete msg.password;
        Email = msg.email;
        delete msg.email;
        MobileNumber = msg.mobileNumber;
        delete msg.mobileNumber;
      }

      const UserPoolId = RED.util.evaluateNodeProperty(
        config.userpoolid,
        config.userpoolidType,
        node,
        msg
      );
      const ClientId = RED.util.evaluateNodeProperty(
        config.clientid,
        config.clientidType,
        node,
        msg
      );

      try {
        node.status({
          fill: "yellow",
          shape: "ring",
          text: "creating user...",
        });
        session({
          Email,
          MobileNumber,
          Username,
          Password,
          UserPoolId,
          ClientId,
        })
          .then((result) => {
            node.status({
              fill: "green",
              shape: "ring",
              text: "user created",
            });
            var payload = {
              user: {
                username: result.user.username,
                pool: {
                  userPoolId: result.user.pool.userPoolId,
                  clientId: result.user.pool.clientId,
                  client: {
                    endpoint: result.user.pool.client.endpoint,
                    fetchOptions: result.user.pool.client.fetchOptions,
                  },
                  advancedSecurityDataCollectionFlag:
                    result.user.pool.advancedSecurityDataCollectionFlag,
                },
                Session: result.user.Session,
                client: {
                  endpoint: result.user.client.endpoint,
                  fetchOptions: result.user.client.fetchOptions,
                },
                signInUserSession: result.user.signInUserSession,
                authenticationFlowType: result.user.authenticationFlowType,
                keyPrefix: result.user.keyPrefix,
                userDataKey: result.user.userDataKey,
              },
              userConfirmed: result.userConfirmed,
              userSub: result.userSub,
              codeDeliveryDetails: {
                AttributeName: result.codeDeliveryDetails.AttributeName,
                DeliveryMedium: result.codeDeliveryDetails.DeliveryMedium,
                Destination: result.codeDeliveryDetails.Destination,
              },
            };
            msg.payload = result;
            node.send(msg);
          })
          .catch((error) => {
            node.error(error);
            node.status({ fill: "red", shape: "ring", text: error.message });
          });
      } catch (error) {
        node.error(error.message);
        this.status({ fill: "red", shape: "ring", text: "error" });
      }
    });
  }
  RED.nodes.registerType("cognito-create-user", createUser, {
    credentials: {
      email: { type: "text" },
      mobileNumber: { type: "text" },
      firstName: { type: "text" },
      password: { type: "password" },
    },
  });
};

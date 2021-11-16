const AWSCognito = require("amazon-cognito-identity-js");

const session = ({ Email, Code, UserPoolId, ClientId }) =>
  new Promise((resolve, reject) => {
    var poolData = {
      UserPoolId: UserPoolId,
      ClientId: ClientId,
    };
    var userPool = new AWSCognito.CognitoUserPool(poolData);
    var userData = {
      Username: Email,
      Pool: userPool,
    };
    var cognitoUser = new AWSCognito.CognitoUser(userData);

    cognitoUser.confirmRegistration(Code, true, function (err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });

module.exports = function (RED) {
  function verifyUser(config) {
    RED.nodes.createNode(this, config);

    var Email = this.credentials.email;
    var Code = this.credentials.code;
    var node = this;

    node.on("input", function (msg) {
      if (msg.hasOwnProperty("email") || msg.hasOwnProperty("code")) {
        Email = msg.email;
        delete msg.email;
        Code = msg.code;
        delete msg.code;
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
          text: "verifying user...",
        });
        session({
          Email,
          Code,
          UserPoolId,
          ClientId,
        })
          .then((result) => {
            node.status({
              fill: "green",
              shape: "ring",
              text: "user verified",
            });

            msg.payload = JSON.stringify(result);
            node.send([msg, null]);
          })
          .catch((error) => {
            msg.payload = error;
            node.send([null, msg]);
            node.status({ fill: "red", shape: "ring", text: error.message });
          });
      } catch (error) {
        msg.payload = error;
        node.send([null, msg]);
        this.status({ fill: "red", shape: "ring", text: "error" });
      }
    });
  }
  RED.nodes.registerType("cognito-verify-user", verifyUser, {
    credentials: {
      email: { type: "text" },
      code: { type: "text" },
    },
  });
};

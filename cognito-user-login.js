const AWSCognito = require("amazon-cognito-identity-js");

const session = ({ Username, Password, UserPoolId, ClientId }) =>
  new Promise((resolve, reject) => {
    new AWSCognito.CognitoUser({
      Username,
      Pool: new AWSCognito.CognitoUserPool({
        UserPoolId,
        ClientId,
      }),
    }).authenticateUser(
      new AWSCognito.AuthenticationDetails({
        Username,
        Password,
      }),
      {
        onSuccess: (result) => {
          resolve(result);
        },
        onFailure: (error) => {
          console.log(error);
          reject(error);
        },
      }
    );
  });

module.exports = function (RED) {
  function authenticateUser(config) {
    RED.nodes.createNode(this, config);

    var Username = this.credentials.username;
    var Password = this.credentials.password;
    var node = this;
    this.status({ fill: "red", shape: "ring", text: "unauthenticated" });

    node.on("input", function (msg) {
      if (msg.hasOwnProperty("username") || msg.hasOwnProperty("password")) {
        Username = msg.username;
        delete msg.username;
        Password = msg.password;
        delete msg.password;
      }

      //   node.warn(config);
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
          text: "authenticating...",
        });
        session({ Username, Password, UserPoolId, ClientId })
          .then((response) => {
            node.status({
              fill: "green",
              shape: "ring",
              text: "authenticated",
            });
            var result = {
              idToken: {
                jwtToken: response.idToken.jwtToken,
                payload: {
                  "custom:face_id_enabled":
                    response.idToken.payload["custom:face_id_enabled"],
                  sub: response.idToken.payload.sub,
                  email_verified: response.idToken.payload.email_verified,
                  iss: response.idToken.payload.iss,
                  "cognito:username":
                    response.idToken.payload["cognito:username"],
                  origin_jti: response.idToken.payload.origin_jti,
                  aud: response.idToken.payload.aud,
                  event_id: response.idToken.payload.event_id,
                  token_use: response.idToken.payload.token_use,
                  auth_time: response.idToken.payload.auth_time,
                  name: response.idToken.payload.name,
                  phone_number: response.idToken.payload.phone_number,
                  exp: response.idToken.payload.exp,
                  iat: response.idToken.payload.iat,
                  jti: response.idToken.payload.jti,
                  email: response.idToken.payload.email,
                },
              },
              refreshToken: { token: response.refreshToken.token },
              accessToken: {
                jwtToken: response.accessToken.jwtToken,
                payload: {
                  origin_jti: response.accessToken.payload.origin_jti,
                  sub: response.accessToken.payload.sub,
                  event_id: response.accessToken.payload.event_id,
                  token_use: response.accessToken.payload.token_use,
                  scope: response.accessToken.payload.scope,
                  auth_time: response.accessToken.payload.auth_time,
                  iss: response.accessToken.payload.iss,
                  exp: response.accessToken.payload.exp,
                  iat: response.accessToken.payload.iat,
                  jti: response.accessToken.payload.jti,
                  client_id: response.accessToken.payload.client_id,
                  username: response.accessToken.payload.username,
                },
              },
              clockDrift: response.clockDrift,
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
  RED.nodes.registerType("cognito-user-login", authenticateUser, {
    credentials: {
      username: { type: "text" },
      password: { type: "password" },
    },
  });
};

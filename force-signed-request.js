/**
 * Copyright 2015 Atsushi Kojo.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function (RED) {
  'use strict';
  var decode = require('salesforce-signed-request');

  function ForceSignedRequestNode(n) {
    RED.nodes.createNode(this, n);
    this.force = n.force;
    this.forceConfig = RED.nodes.getNode(this.force);
    if (this.forceConfig) {
      var node = this;
      var credentials = RED.nodes.getCredentials(this.force);
      node.on('input', function (msg) {
        var payload = typeof msg.payload === 'string' ? JSON.parse(msg.payload) : msg.payload;
        var json = decode(payload.signed_request, credentials.clientsecret);
        msg.instanceUrl = json.client.instanceUrl;
        msg.accessToken = json.client.oauthToken;
        msg.payload = json;
        node.send(msg);
        credentials.accessToken = json.client.oauthToken;
        credentials.instanceUrl = json.client.instanceUrl;
        RED.nodes.addCredentials(this.force, credentials);
      });
    } else {
      this.error('missing force configuration');
    }
  }

  RED.nodes.registerType('force signed request', ForceSignedRequestNode);
}

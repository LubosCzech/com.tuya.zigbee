'use strict';

const { ZigBeeDevice } = require('homey-zigbeedriver');
const { CLUSTER } = require('zigbee-clusters');

class moes_knob extends ZigBeeDevice {

    async onNodeInit({zclNode}) {

      var debounce = 0;
      //this.printNode();
      
      const node = await this.homey.zigbee.getNode(this);
      node.handleFrame = (endpointId, clusterId, frame, meta) => {
        //this.log("endpointId:", endpointId,", clusterId:", clusterId);
        //this.log("endpointId:", endpointId,", clusterId:", clusterId,", frame:", frame, ", meta:", meta);
        //this.log("JSON:", frame.toJSON());
        if (clusterId === 6) {
          var button = frame[2];
          /// frame2 - 252, frame3 1 = rotate left
          /// frame2 - 252, frame3 0 = rotate right
          /// rotate debounce 2
          if (button === 252){
            debounce = debounce+1;
            if (debounce === 2){
              debounce = 0;
              this.buttonCommandParser(frame);
            }
          }
          /// frame2 - 253, frame3 0 = single click
          /// frame2 - 253, frame3 1 = double click
          /// frame2 - 253, frame3 3 = long press
          /// click debounce 3
          if (button === 253){
            debounce = debounce+1;
            if (debounce === 3){
              debounce = 0;
              this.buttonCommandParser(frame);
            }
         }
        }
        if (clusterId === 8){
          this.log("=== ROTATE REMOTE===");
        }
        if (clusterId === 768){
          this.log("=== CLICK and ROTATE REMOTE===");
        }
        if (clusterId === 10){
          this.log("NOT SCENE");
        }
      };

      this._buttonPressedTriggerDevice = this.homey.flow.getDeviceTriggerCard('moes_knob_buttons')
      .registerRunListener(async (args, state) => {
        return (null, args.action === state.action);
      });
    
    }

    buttonCommandParser(frame) {
      var button = frame[2] === 253 ? 'down' : 'rotate';
      if (button === 'down'){
        var action = frame[3] === 0 ? 'oneClick' : frame[3] === 1 ? 'twoClicks' : 'longClick';
      }
      if (button === 'rotate'){
        var action = frame[3] === 0 ? 'right' : 'left';
      }
      
      return this._buttonPressedTriggerDevice.trigger(this, {}, { action: `${button}-${action}` })
      .then(() => this.log(`Knob, action=${button}-${action}`))
      .catch(err => this.error('Error triggering Moes knob', err));
    }

    onDeleted(){
		this.log("Moes knob removed")
	}

}

module.exports = moes_knob;



/* "ids": {
    "modelId": "TS0044",
    "manufacturerName": "_TZ3000_vp6clf9d"
  },
  "endpoints": {
    "endpointDescriptors": [
      {
        "endpointId": 1,
        "applicationProfileId": 260,
        "applicationDeviceId": 0,
        "applicationDeviceVersion": 0,
        "_reserved1": 1,
        "inputClusters": [
          0,
          1,
          6
        ],
        "outputClusters": [
          25,
          10
        ]
      },
      {
        "endpointId": 2,
        "applicationProfileId": 260,
        "applicationDeviceId": 0,
        "applicationDeviceVersion": 0,
        "_reserved1": 1,
        "inputClusters": [
          1,
          6
        ],
        "outputClusters": []
      },
      {
        "endpointId": 3,
        "applicationProfileId": 260,
        "applicationDeviceId": 0,
        "applicationDeviceVersion": 0,
        "_reserved1": 1,
        "inputClusters": [
          1,
          6
        ],
        "outputClusters": []
      },
      {
        "endpointId": 4,
        "applicationProfileId": 260,
        "applicationDeviceId": 0,
        "applicationDeviceVersion": 0,
        "_reserved1": 1,
        "inputClusters": [
          1,
          6
        ],
        "outputClusters": []
      }
    ],
    "endpoints": {
      "1": {
        "clusters": {
          "basic": {
            "attributes": [
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 0,
                "name": "zclVersion",
                "value": 3
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 1,
                "name": "appVersion",
                "value": 67
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 2,
                "name": "stackVersion",
                "value": 0
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 3,
                "name": "hwVersion",
                "value": 1
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 4,
                "name": "manufacturerName",
                "value": "_TZ3000_vp6clf9d"
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 5,
                "name": "modelId",
                "value": "TS0044"
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 6,
                "name": "dateCode",
                "value": ""
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 7,
                "name": "powerSource",
                "value": "battery"
              },
              {
                "acl": [
                  "readable",
                  "writable",
                  "reportable"
                ],
                "id": 65502
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 65533,
                "name": "clusterRevision",
                "value": 2
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 65534,
                "name": "attributeReportingStatus",
                "value": "PENDING"
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 65504
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 65505
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 65506
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 65507
              }
            ],
            "commandsGenerated": "UNSUP_GENERAL_COMMAND",
            "commandsReceived": "UNSUP_GENERAL_COMMAND"
          },
          "powerConfiguration": {
            "attributes": [
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 0
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 32,
                "name": "batteryVoltage",
                "value": 30
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 33,
                "name": "batteryPercentageRemaining",
                "value": 200
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 65533,
                "name": "clusterRevision",
                "value": 1
              }
            ],
            "commandsGenerated": "UNSUP_GENERAL_COMMAND"
          },
          "onOff": {
            "commandsGenerated": "UNSUP_GENERAL_COMMAND",
            "commandsReceived": "UNSUP_GENERAL_COMMAND"
          }
        },
        "bindings": {
          "ota": {
            "attributes": [],
            "commandsGenerated": "UNSUP_GENERAL_COMMAND",
            "commandsReceived": "UNSUP_GENERAL_COMMAND"
          },
          "time": {
            "attributes": [],
            "commandsGenerated": "UNSUP_GENERAL_COMMAND",
            "commandsReceived": "UNSUP_GENERAL_COMMAND"
          }
        }
      },
      "2": {
        "clusters": {
          "powerConfiguration": {
            "commandsGenerated": "UNSUP_GENERAL_COMMAND",
            "commandsReceived": "UNSUP_GENERAL_COMMAND"
          },
          "onOff": {
            "attributes": [
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 0,
                "name": "onOff",
                "value": false
              }
            ],
            "commandsReceived": "UNSUP_GENERAL_COMMAND"
          }
        },
        "bindings": {}
      },
      "3": {
        "clusters": {
          "powerConfiguration": {
            "attributes": [
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 0
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 32,
                "name": "batteryVoltage",
                "value": 30
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 33,
                "name": "batteryPercentageRemaining",
                "value": 200
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 65533,
                "name": "clusterRevision",
                "value": 1
              }
            ]
          },
          "onOff": {
            "attributes": [
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 0,
                "name": "onOff",
                "value": false
              }
            ]
          }
        },
        "bindings": {}
      },
      "4": {
        "clusters": {
          "powerConfiguration": {},
          "onOff": {}
        },
        "bindings": {}
      }
    }
  } */


  
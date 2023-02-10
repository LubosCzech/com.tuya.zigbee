'use strict';

const Homey = require('homey');
const { ZigBeeDevice } = require('homey-zigbeedriver');
const { debug, CLUSTER } = require('zigbee-clusters');

class wall_switch_2_gang extends ZigBeeDevice {

    async onNodeInit({ zclNode }) {
        // enable debugging
         //this.enableDebug();

        // Enables debug logging in zigbee-clusters
        // debug(true);

        // print the node's info to the console
         //this.printNode();
        this.endpointIds = {
            leftSwitch: 1,
            rightSwitch: 2,
        };

        this.deviceLifetimeAttributes = {
            state: {
                capability: 'onoff',
                subDeviceId: 'leftSwitch',
            },
            state1: {
                capability: 'onoff',
                subDeviceId: 'rightSwitch',
            },
        };

        const subDeviceId = this.isSubDevice() ? this.getData().subDeviceId : 'leftSwitch';
        this.log('Initializing', subDeviceId, 'at endpoint', this.endpointIds[subDeviceId]);

        if (this.hasCapability('onoff')) {
            this.debug('Register OnOff capability:', subDeviceId, 'at endpoint', this.endpointIds[subDeviceId]);
            this.registerCapability('onoff', CLUSTER.ON_OFF, {
                getOpts: {
                    getOnStart: true,
                },
                endpoint: this.endpointIds[subDeviceId],
            });
        }
    }

    onDeleted() {
        this.log("2 Gang Bseed Switch, channel ", subDeviceId, " removed")
    }

}

module.exports = wall_switch_2_gang;
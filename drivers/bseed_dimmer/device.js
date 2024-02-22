'use strict';

const { Cluster } = require('zigbee-clusters');
const TuyaSpecificCluster = require('../../lib/TuyaSpecificCluster');
const TuyaSpecificClusterDevice = require("../../lib/TuyaSpecificClusterDevice");

Cluster.addCluster(TuyaSpecificCluster);

class bseed_dimmer extends TuyaSpecificClusterDevice {

    async onNodeInit({ zclNode }) {
        
        this.printNode();

        // Handler for on/off
        this.registerCapabilityListener('onoff', async (value) => {
            return this.writeBool(1, value);
        });

        // Handler for dim
        this.registerCapabilityListener('dim', async (dim) => {
            return this.setWhiteDim({dim});
        });

    }

    async setWhiteDim({dim}) {
        if (dim===undefined) dim = this.getCapabilityValue('dim');
        return this.writeData32(3,dim*1000);
    }

    // String Helper Functions
    make4String(v) {
        let s = Math.round(v).toString(16);
        if(s.length===4) return s;
        else if(s.length===3) return '0'+s;
        else if(s.length===2) return '00'+s;
        else if(s.length===1) return '000' + s;
        else return '0000';
    }

    onDeleted(){
		this.log("Christmas Lights removed")
	}

}

module.exports = bseed_dimmer;
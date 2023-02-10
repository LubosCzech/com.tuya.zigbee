'use strict';

const { ZigBeeLightDevice, ZigBeeDevice } = require('homey-zigbeedriver');
const TuyaZigBeeLightDevice = require('../../lib/TuyaZigBeeLightDevice');
const { debug, CLUSTER } = require('zigbee-clusters');

const {
    calculateLevelControlTransitionTime,
    wait
} = require('../../lib/util');

const MAX_DIM = 254;
const CURRENT_LEVEL = 'currentLevel';

const onoffCapabilityDefinition = {
    capabilityId: 'onoff',
    cluster: CLUSTER.ON_OFF,
    userOpts: {
        getOpts: {
            getOnStart: true,
            getOnOnline: true // When the light is powered off, and powered on again it often issues
            // an end device announce, this is a good moment to update the capability value in Homey
        }
    }
};

const dimCapabilityDefinition = {
    capabilityId: 'dim',
    cluster: CLUSTER.LEVEL_CONTROL,
    userOpts: {
        getOpts: {
            getOnStart: true,
            getOnOnline: true // When the light is powered off, and powered on again it often issues
            // an end device announce, this is a good moment to update the capability value in Homey
        }
    }
};

class DimmableTransformer extends ZigBeeDevice { //TuyaZigBeeLightDevice ZigBeeLightDevice

    /* async onNodeInit({ zclNode }) {
         // TODO: remove when stable
         //this.enableDebug();
 
         // Register `onoff` and `dim` capabilities if device has both
        if (this.hasCapability('onoff') && this.hasCapability('dim')) {
            this.registerOnOffAndDimCapabilities({ zclNode });
         }
 
 
       //  this.log('ZigbeeDimmer is initialized');
    }*/
    async onNodeInit({ zclNode }) {

        this.printNode();

        this.registerCapability('onoff', CLUSTER.ON_OFF);
        this.registerCapability('dim', CLUSTER.LEVEL_CONTROL);
        //this.registerOnOffAndDimCapabilities({ zclNode });

    }
    registerOnOffAndDimCapabilities({ zclNode }) {
        // Register multiple capabilities, they will be debounced when one of them is called
        this.registerMultipleCapabilities(
            [onoffCapabilityDefinition, dimCapabilityDefinition],
            // eslint-disable-next-line consistent-return
            (valueObj = {}, optsObj = {}) => {
                const onoffChanged = typeof valueObj.onoff === 'boolean';
                const dimChanged = typeof valueObj.dim === 'number';

                this.log('capabilities changed', { onoffChanged, dimChanged });

                if (onoffChanged && dimChanged) {
                    if (valueObj.onoff && valueObj.dim > 0) {
                        // Bulb is turned on and dimmed to a value, then just dim
                        return this.changeDimLevel(valueObj.dim, { ...optsObj.dim });
                    }
                    if (valueObj.onoff === false) {
                        // Bulb is turned off and dimmed to a value, then turn off
                        return this.changeOnOff(false); // Turn off
                    }
                    if (valueObj.onoff === true && valueObj.dim === 0) {
                        // Device is turned on and dimmed to zero, then just turn off
                        return this.changeDimLevel(0, { ...optsObj.dim });
                    }
                } else if (onoffChanged) {
                    // Device is only turned on/off, request new dim level afterwards
                    return this.changeOnOff(valueObj.onoff);
                } else if (dimChanged) {
                    // Bulb is only dimmed
                    this.log('dimming');
                    return this.changeDimLevel(valueObj.dim, { ...optsObj.dim });
                }
            },
        );
    }

    async changeOnOff(onoff) {
        this.log('changeOnOff() →', onoff);
        return this.onOffCluster[onoff ? 'setOn' : 'setOff']()
            .then(async result => {
                if (onoff === false) {
                    await this.setCapabilityValue('dim', 0).catch(this.error).catch(this.error); // Set dim to zero when turned off
                } else if (onoff) {
                    // Wait for a little while, some devices do not directly update their currentLevel
                    await wait(1000)
                        .then(async () => {
                            // Get current level attribute to update dim level
                            const { currentLevel } = await this.levelControlCluster.readAttributes(CURRENT_LEVEL);
                            this.debug('changeOnOff() →', onoff, { currentLevel });
                            // Always set dim to 0.01 or higher since bulb is turned on
                            await this.setCapabilityValue('dim', Math.max(0.01, currentLevel / MAX_DIM)).catch(this.error);
                        })
                        .catch(err => {
                            this.error('Error: could not update dim capability value after `onoff` change', err);
                        });
                }
                return result;
            });
    }

    async changeDimLevel(dim, opts = {}) {
        this.log('changeDimLevel() →', dim);


        const moveToLevelWithOnOff = {
            level: Math.round(dim * MAX_DIM),
            transitionTime: calculateLevelControlTransitionTime(opts)
        };

        const moveToLevel = {
            level: Math.round(dim * MAX_DIM),
            transitionTime: calculateLevelControlTransitionTime(opts)
        };
    }

}

module.exports = DimmableTransformer;

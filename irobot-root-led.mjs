// irobot-root-led.mjs

const EXTENSION_ID = 'rootLED';

const DEVICE_ID_LED = 0x03;
const COMMAND_SET_COLOR = 0x03;

const ROOT_SERVICE_UUID = '48c5d828-ac2a-442d-97a3-0c9822b04979';
const ROOT_CHARACTERISTIC_UUID = '48c5d828-ac2a-442d-97a3-0c9822b0497a';

class Scratch3RootLED {
    constructor(runtime) {
        this.runtime = runtime;
        this._device = null;
        this._characteristic = null;
    }

    getInfo() {
        return {
            id: EXTENSION_ID,
            name: 'Root LED',
            blocks: [
                {
                    opcode: 'setLEDColor',
                    blockType: 'command',
                    text: 'LEDを[COLOR]に点灯',
                    arguments: {
                        COLOR: {
                            type: 'string',
                            menu: 'colors'
                        }
                    }
                }
            ],
            menus: {
                colors: {
                    items: [
                        { text: '赤', value: '#FF0000' },
                        { text: '青', value: '#0000FF' },
                        { text: '緑', value: '#00FF00' }
                    ]
                }
            }
        };
    }

    async setLEDColor(args) {
        if (!this._characteristic) {
            await this._connectDevice();
        }

        const color = this._hexToRgb(args.COLOR);
        const packet = new Uint8Array([
            DEVICE_ID_LED,
            COMMAND_SET_COLOR,
            0x01,       // Packet ID
            color.r,    // Red
            color.g,    // Green
            color.b     // Blue
        ]);

        try {
            await this._characteristic.writeValue(packet);
        } catch (error) {
            console.error('LED制御エラー:', error);
        }
    }

    async _connectDevice() {
        try {
            this._device = await navigator.bluetooth.requestDevice({
                filters: [{ services: [ROOT_SERVICE_UUID] }]
            });
            
            const server = await this._device.gatt.connect();
            const service = await server.getPrimaryService(ROOT_SERVICE_UUID);
            this._characteristic = await service.getCharacteristic(ROOT_CHARACTERISTIC_UUID);
            
        } catch (error) {
            console.error('Bluetooth接続エラー:', error);
        }
    }

    _hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r:0, g:0, b:0 };
    }
}

export default Scratch3RootLED;

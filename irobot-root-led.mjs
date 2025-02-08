class Scratch3RootLED {
  constructor(runtime) {
    this.runtime = runtime;
    this._device = null;
    this._characteristic = null;
  }

  getInfo() {
    return {
      id: 'rootLED',
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
      0x03, // Device ID (LED)
      0x03, // Command (Set Color)
      0x01, // Packet ID
      color.r, // Red
      color.g, // Green
      color.b  // Blue
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
        filters: [{ services: ['48c5d828-ac2a-442d-97a3-0c9822b04979'] }]
      });
      
      const server = await this._device.gatt.connect();
      const service = await server.getPrimaryService('48c5d828-ac2a-442d-97a3-0c9822b04979');
      this._characteristic = await service.getCharacteristic('48c5d828-ac2a-442d-97a3-0c9822b0497a');
      
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

const entry = {
  name: 'Root LED',
  extensionId: 'rootLED',
  extensionURL: 'https://example.com/irobot-root-led.mjs',
  collaborator: 'Your Name',
  iconURL: 'https://example.com/irobot-root-led-icon.png',
  insetIconURL: 'https://example.com/irobot-root-led-inset-icon.svg',
  description: 'Control iRobot Root rt0 LED',
  featured: true,
  disabled: false,
  bluetoothRequired: true,
  internetConnectionRequired: false,
  launchPeripheralConnectionFlow: true,
  useAutoScan: false,
  helpLink: 'https://example.com/irobot-root-led-help'
};

export { Scratch3RootLED as blockClass, entry };

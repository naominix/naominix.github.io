import BlockType from '../../extension-support/block-type';
import ArgumentType from '../../extension-support/argument-type';
import Cast from '../../util/cast';
import log from '../../util/log';
import translations from './translations.json';
import blockIcon from './block-icon.png';

let formatMessage = messageData => messageData.default;

const setupTranslations = () => {
    const localeSetup = formatMessage.setup && formatMessage.setup();
    if (localeSetup && localeSetup.translations[localeSetup.locale]) {
        Object.assign(
            localeSetup.translations[localeSetup.locale],
            translations[localeSetup.locale]
        );
    }
};

const ROOT_ID_SERVICE = '48c5d828-ac2a-442d-97a3-0c9822b04979';
const UART_SERVICE = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const TX_CHARACTERISTIC = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
const RX_CHARACTERISTIC = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';

const EXTENSION_ID = 'iRobotExtension';

let extensionURL = 'https://naominix.github.io/iRobotExtension.mjs';

class ExtensionBlocks {
    static set formatMessage(formatter) {
        formatMessage = formatter;
        if (formatMessage) setupTranslations();
    }

    static get EXTENSION_NAME() {
        return formatMessage({
            id: 'iRobotExtension.name',
            default: 'iRobotExtension',
            description: 'name of the extension'
        });
    }

    static get EXTENSION_ID() {
        return EXTENSION_ID;
    }

    static get extensionURL() {
        return extensionURL;
    }

    static set extensionURL(url) {
        extensionURL = url;
    }

    constructor(runtime) {
        this.runtime = runtime;

        if (runtime.formatMessage) {
            formatMessage = runtime.formatMessage;
        }

        // Initialize BLE-related variables
        this._peripheral = null;
        this.receivedBuffer = "";
        
        // Setup Scratch Link session if available
        if (runtime.connectPeripheral) {
            this._peripheral = runtime.connectPeripheral(EXTENSION_ID);
        }
    }

    /**
     * Handle notifications from BLE device
     */
    handleMessage(data) {
        const bytes = new Uint8Array(data);
        const msg = Array.from(bytes).join(", ");
        this.receivedBuffer += msg + "\n";
        log.log("Received: " + msg);
    }

    /**
     * Connect to BLE UART device using Scratch Link
     */
    connectBLE(args, callback) {
        if (!this._peripheral) {
            this._peripheral = this.runtime.connectPeripheral(EXTENSION_ID);
        }

        if (!this._peripheral) {
            log.error("Failed to create peripheral connection");
            callback();
            return;
        }

        const options = {
            filters: [{
                services: [ROOT_ID_SERVICE]
            }],
            optionalServices: [UART_SERVICE]
        };

        this._peripheral.scan(options)
            .then(() => {
                this._peripheral.connect()
                    .then(() => {
                        this._peripheral.onMessage = this.handleMessage.bind(this);
                        log.log("Connected to BLE device and initialized UART service.");
                        callback();
                    })
                    .catch(error => {
                        log.error("Connection error: " + error);
                        callback();
                    });
            })
            .catch(error => {
                log.error("Scan error: " + error);
                callback();
            });
    }

    driveForward(args) {
        if (!this._peripheral || !this._peripheral.isConnected()) {
            log.error("Not connected to device");
            return;
        }

        const command = new Uint8Array([
            0x01, 0x04, 0x00, 0x00, 0x00, 0x00,
            0x64, 0x00, 0x00, 0x00, 0x64,
            0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0xD1
        ]);

        this._peripheral.sendMessage(UART_SERVICE, TX_CHARACTERISTIC, command.buffer)
            .then(() => {
                log.log("Sent forward command");
            })
            .catch(error => {
                log.error("Forward command error: " + error);
            });
    }

    driveBackward(args) {
        if (!this._peripheral || !this._peripheral.isConnected()) {
            log.error("Not connected to device");
            return;
        }

        const command = new Uint8Array([
            0x01, 0x04, 0x00, 0xFF, 0xFF, 0xFF, 0x9C,
            0xFF, 0xFF, 0xFF, 0x9C,
            0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x71
        ]);

        this._peripheral.sendMessage(UART_SERVICE, TX_CHARACTERISTIC, command.buffer)
            .then(() => {
                log.log("Sent backward command");
            })
            .catch(error => {
                log.error("Backward command error: " + error);
            });
    }

    turnLeft(args) {
        if (!this._peripheral || !this._peripheral.isConnected()) {
            log.error("Not connected to device");
            return;
        }

        const command = new Uint8Array([
            0x01, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x64,
            0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x8A
        ]);

        this._peripheral.sendMessage(UART_SERVICE, TX_CHARACTERISTIC, command.buffer)
            .then(() => {
                log.log("Sent left turn command");
            })
            .catch(error => {
                log.error("Left turn command error: " + error);
            });
    }

    turnRight(args) {
        if (!this._peripheral || !this._peripheral.isConnected()) {
            log.error("Not connected to device");
            return;
        }

        const command = new Uint8Array([
            0x01, 0x04, 0x00, 0x00, 0x00, 0x00, 0x64,
            0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x25
        ]);

        this._peripheral.sendMessage(UART_SERVICE, TX_CHARACTERISTIC, command.buffer)
            .then(() => {
                log.log("Sent right turn command");
            })
            .catch(error => {
                log.error("Right turn command error: " + error);
            });
    }

    stop(args) {
        if (!this._peripheral || !this._peripheral.isConnected()) {
            log.error("Not connected to device");
            return;
        }

        const command = new Uint8Array([
            0x01, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x7E
        ]);

        this._peripheral.sendMessage(UART_SERVICE, TX_CHARACTERISTIC, command.buffer)
            .then(() => {
                log.log("Sent stop command");
            })
            .catch(error => {
                log.error("Stop command error: " + error);
            });
    }

    getReceivedData(args) {
        const data = this.receivedBuffer;
        this.receivedBuffer = "";
        return data;
    }

    disconnectBLE(args) {
        if (this._peripheral && this._peripheral.isConnected()) {
            this._peripheral.disconnect();
            log.log("Disconnected from BLE device");
        }
    }

    doIt(args) {
        const statement = Cast.toString(args.SCRIPT);
        const func = new Function(`return (${statement})`);
        log.log(`doIt: ${statement}`);
        return func.call(this);
    }

    getInfo() {
        setupTranslations();
        return {
            id: ExtensionBlocks.EXTENSION_ID,
            name: ExtensionBlocks.EXTENSION_NAME,
            extensionURL: ExtensionBlocks.extensionURL,
            blockIconURI: blockIcon,
            showStatusButton: true,
            blocks: [
                {
                    opcode: 'doIt',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'iRobotExtension.doIt',
                        default: 'do it [SCRIPT]',
                        description: 'execute javascript for example'
                    }),
                    func: 'doIt',
                    arguments: {
                        SCRIPT: {
                            type: ArgumentType.STRING,
                            defaultValue: '5 + 5'
                        }
                    }
                },
                {
                    opcode: 'connectBLE',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'iRobotExtension.connectBLE',
                        default: 'BLE UARTデバイスに接続する',
                        description: 'Connect to BLE UART device'
                    }),
                    func: 'connectBLE',
                    arguments: {}
                },
                {
                    opcode: 'driveForward',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'iRobotExtension.driveForward',
                        default: '前進する',
                        description: 'Send drive forward command'
                    }),
                    func: 'driveForward',
                    arguments: {}
                },
                {
                    opcode: 'driveBackward',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'iRobotExtension.driveBackward',
                        default: '後退する',
                        description: 'Send drive backward command'
                    }),
                    func: 'driveBackward',
                    arguments: {}
                },
                {
                    opcode: 'turnLeft',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'iRobotExtension.turnLeft',
                        default: '左回転する',
                        description: 'Send turn left command'
                    }),
                    func: 'turnLeft',
                    arguments: {}
                },
                {
                    opcode: 'turnRight',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'iRobotExtension.turnRight',
                        default: '右回転する',
                        description: 'Send turn right command'
                    }),
                    func: 'turnRight',
                    arguments: {}
                },
                {
                    opcode: 'stop',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'iRobotExtension.stop',
                        default: '停止する',
                        description: 'Send stop command'
                    }),
                    func: 'stop',
                    arguments: {}
                },
                {
                    opcode: 'getReceivedData',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'iRobotExtension.getReceivedData',
                        default: '受信データ',
                        description: 'Get received data from BLE UART'
                    }),
                    func: 'getReceivedData',
                    arguments: {}
                },
                {
                    opcode: 'disconnectBLE',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'iRobotExtension.disconnectBLE',
                        default: '切断する',
                        description: 'Disconnect BLE device'
                    }),
                    func: 'disconnectBLE',
                    arguments: {}
                }
            ],
            menus: {}
        };
    }
}

export {ExtensionBlocks as default, ExtensionBlocks as blockClass};

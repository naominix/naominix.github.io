import BlockType from '../../extension-support/block-type';
import ArgumentType from '../../extension-support/argument-type';
import Cast from '../../util/cast';
import log from '../../util/log';
import translations from './translations.json';
import blockIcon from './block-icon.png';

/**
 * Formatter which is used for translation.
 * This will be replaced which is used in the runtime.
 * @param {object} messageData - format-message object
 * @returns {string} - message for the locale
 */
let formatMessage = messageData => messageData.default;

/**
 * Setup format-message for this extension.
 */
const setupTranslations = () => {
    const localeSetup = formatMessage.setup();
    if (localeSetup && localeSetup.translations[localeSetup.locale]) {
        Object.assign(
            localeSetup.translations[localeSetup.locale],
            translations[localeSetup.locale]
        );
    }
};

const EXTENSION_ID = 'iRobotExtension';

/**
 * URL to get this extension as a module.
 * When it was loaded as a module, 'extensionURL' will be replaced a URL which is retrieved from.
 * @type {string}
 */
let extensionURL = 'https://naominix.github.io/iRobotExtension.mjs';

/**
 * Scratch 3.0 blocks for example of Xcratch.
 */
class ExtensionBlocks {
    /**
     * A translation object which is used in this class.
     * @param {FormatObject} formatter - translation object
     */
    static set formatMessage(formatter) {
        formatMessage = formatter;
        if (formatMessage) setupTranslations();
    }

    /**
     * @return {string} - the name of this extension.
     */
    static get EXTENSION_NAME() {
        return formatMessage({
            id: 'iRobotExtension.name',
            default: 'iRobotExtension',
            description: 'name of the extension'
        });
    }

    /**
     * @return {string} - the ID of this extension.
     */
    static get EXTENSION_ID() {
        return EXTENSION_ID;
    }

    /**
     * URL to get this extension.
     * @type {string}
     */
    static get extensionURL() {
        return extensionURL;
    }

    /**
     * Set URL to get this extension.
     * The extensionURL will be changed to the URL of the loading server.
     * @param {string} url - URL
     */
    static set extensionURL(url) {
        extensionURL = url;
    }

    /**
     * Construct a set of blocks for iRobotExtension.
     * @param {Runtime} runtime - the Scratch 3.0 runtime.
     */
    constructor(runtime) {
        /**
         * The Scratch 3.0 runtime.
         * @type {Runtime}
         */
        this.runtime = runtime;
        // Bluetooth接続用のプロパティ
        this._device = null;
        this._characteristic = null;

        if (runtime.formatMessage) {
            // Replace 'formatMessage' to a formatter which is used in the runtime.
            formatMessage = runtime.formatMessage;
        }
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo() {
        setupTranslations();
        return {
            id: ExtensionBlocks.EXTENSION_ID,
            name: ExtensionBlocks.EXTENSION_NAME,
            extensionURL: ExtensionBlocks.extensionURL,
            blockIconURI: blockIcon,
            // 接続用ボタンを表示させるための設定
            showStatusButton: true,
            bluetoothRequired: true,
            launchPeripheralConnectionFlow: true,
            useAutoScan: false,
            blocks: [
                {
                    opcode: 'doIt',
                    blockType: BlockType.REPORTER,
                    blockAllThreads: false,
                    text: formatMessage({
                        id: 'iRobotExtension.doIt',
                        default: 'do it [SCRIPT]',
                        description: 'execute javascript for example'
                    }),
                    func: 'doIt',
                    arguments: {
                        SCRIPT: {
                            type: ArgumentType.STRING,
                            defaultValue: '3 + 4'
                        }
                    }
                },
                {
                    opcode: 'setLEDColor',
                    blockType: BlockType.COMMAND,
                    blockAllThreads: false,
                    text: formatMessage({
                        id: 'iRobotExtension.setLEDColor',
                        default: 'LEDを [COLOR] に点灯',
                        description: 'Set LED color'
                    }),
                    func: 'setLEDColor',
                    arguments: {
                        COLOR: {
                            type: ArgumentType.STRING,
                            defaultValue: '#FF0000',
                            menu: 'colors'
                        }
                    }
                }
            ],
            menus: {
                colors: {
                    items: [
                        {
                            text: formatMessage({
                                id: 'iRobotExtension.red',
                                default: '赤',
                                description: 'red'
                            }),
                            value: '#FF0000'
                        },
                        {
                            text: formatMessage({
                                id: 'iRobotExtension.blue',
                                default: '青',
                                description: 'blue'
                            }),
                            value: '#0000FF'
                        },
                        {
                            text: formatMessage({
                                id: 'iRobotExtension.green',
                                default: '緑',
                                description: 'green'
                            }),
                            value: '#00FF00'
                        }
                    ]
                }
            }
        };
    }

    doIt(args) {
        const statement = Cast.toString(args.SCRIPT);
        const func = new Function(`return (${statement})`);
        log.log(`doIt: ${statement}`);
        return func.call(this);
    }

    /**
     * LEDを指定色で点灯させるブロックの処理
     * @param {object} args - 引数。COLORは16進数文字列（例：#FF0000）
     * @returns {Promise<void>}
     */
    async setLEDColor(args) {
        const colorStr = Cast.toString(args.COLOR);
        // 接続されていない場合、Bluetooth接続を開始
        if (!this._characteristic) {
            await this._connectDevice();
        }
        // 16進数文字列をRGBに変換
        const color = this._hexToRgb(colorStr);
        // LED制御用パケットを作成（プロトコル仕様に合わせた内容）
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
            log.error('LED制御エラー:', error);
        }
    }

    /**
     * BLE接続用のパブリックメソッド
     * 接続ボタンが押されたとき、このメソッドが呼ばれてBLE接続処理を開始します。
     * @returns {Promise<void>}
     */
    async connect() {
        await this._connectDevice();
    }

    /**
     * 拡張機能の接続状況を返すメソッド
     * ※ステータスが2の場合は接続済み、1の場合は未接続として表示されます。
     * @returns {{status: number, msg: string}}
     */
    getStatus() {
        if (this._characteristic) {
            return {
                status: 2,
                msg: formatMessage({
                    id: 'iRobotExtension.connected',
                    default: 'Connected',
                    description: 'Device is connected'
                })
            };
        } else {
            return {
                status: 1,
                msg: formatMessage({
                    id: 'iRobotExtension.disconnected',
                    default: 'Disconnected',
                    description: 'Device is disconnected'
                })
            };
        }
    }

    /**
     * iRobot Root rt0 へのBluetooth接続処理
     * @returns {Promise<void>}
     */
    async _connectDevice() {
        try {
            this._device = await navigator.bluetooth.requestDevice({
                filters: [{ services: ['48c5d828-ac2a-442d-97a3-0c9822b04979'] }]
            });
            const server = await this._device.gatt.connect();
            const service = await server.getPrimaryService('48c5d828-ac2a-442d-97a3-0c9822b04979');
            this._characteristic = await service.getCharacteristic('48c5d828-ac2a-442d-97a3-0c9822b0497a');
        } catch (error) {
            log.error('Bluetooth接続エラー:', error);
        }
    }

    /**
     * 16進数カラーコードをRGBオブジェクトに変換するユーティリティ
     * @param {string} hex - 例：#FF0000
     * @returns {{r: number, g: number, b: number}} - 変換結果のRGB値
     */
    _hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? {
                  r: parseInt(result[1], 16),
                  g: parseInt(result[2], 16),
                  b: parseInt(result[3], 16)
              }
            : { r: 0, g: 0, b: 0 };
    }
}

export { ExtensionBlocks as default, ExtensionBlocks as blockClass };

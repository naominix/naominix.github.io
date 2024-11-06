// Xcratch Gyroscope Extension
class GyroscopeExtension {
    constructor (runtime) {
        this.runtime = runtime;
        this.roll = 0;
        this.pitch = 0;
        this.yaw = 0;
        
        // DeviceOrientationEventのリスナー設定
        window.addEventListener('deviceorientation', (event) => {
            this.roll = event.gamma;  // X軸周りの回転 (-90 to 90)
            this.pitch = event.beta;  // Y軸周りの回転 (-180 to 180)
            this.yaw = event.alpha;   // Z軸周りの回転 (0 to 360)
        });
    }

    getInfo () {
        return {
            id: 'gyroscope',
            name: 'Gyroscope',
            blocks: [
                {
                    opcode: 'getRoll',
                    blockType: 'reporter',
                    text: 'ロール角度',
                    disableMonitor: false
                },
                {
                    opcode: 'getPitch',
                    blockType: 'reporter',
                    text: 'ピッチ角度',
                    disableMonitor: false
                },
                {
                    opcode: 'getYaw',
                    blockType: 'reporter',
                    text: 'ヨー角度',
                    disableMonitor: false
                }
            ]
        };
    }

    getRoll () {
        return Math.round(this.roll);
    }

    getPitch () {
        return Math.round(this.pitch);
    }

    getYaw () {
        return Math.round(this.yaw);
    }
}

// Xcraftへの拡張機能登録
(function() {
    var extensionInstance = new GyroscopeExtension(window.vm.runtime);
    var serviceName = window.vm.extensionManager._registerInternalExtension(extensionInstance);
    window.vm.extensionManager._loadedExtensions.set(extensionInstance.getInfo().id, serviceName);
})();

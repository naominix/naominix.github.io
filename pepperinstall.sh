#!/bin/sh
cd /home/pi/
sudo echo "deb http://ppa.launchpad.net/canonical-chromium-builds/stage/ubuntu vivid main" > /etc/apt/sources.list.d/chromium.list
sudo apt-key adv –keyserver keyserver.ubuntu.com –recv-keys 5B393194
sudo apt-get update
sudo apt-get -y install chromium-browser chromium-browser-l10n
mkdir pepper
cd pepper
wget http://os.archlinuxarm.org/armv7h/alarm/chromium-pepper-flash-12.0.0.77-1-armv7h.pkg.tar.xz
tar Jxvf chromium-pepper-flash-12.0.0.77-1-armv7h.pkg.tar.xz
sudo cp * /usr/lib/chromium-browser/plugins
sudo echo "CHROMIUM_FLAGS=\"–ppapi-flash-path=/usr/lib/chromium/plugins/libpepflashplayer.so –ppapi-flash-version=12.0.0.77 -password-store=detect -user-data-dir\"" >> /etc/chromium-browser/default
cd /home/pi

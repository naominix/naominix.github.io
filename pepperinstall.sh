#!/bin/sh
echo "Installing Chromium & PepperFlash plugin for Scratch2.0..."
cd /home/pi/
echo "Add apt sources.list..."
echo "deb http://ppa.launchpad.net/canonical-chromium-builds/stage/ubuntu vivid main" > chromium.list
sudo mv chromium.list /etc/apt/sources.list.d/chromium.list
echo "Add Key..."
sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 5B393194
echo "Installing Chromium-Browser..."
sudo apt-get update
sudo apt-get -y install chromium-browser chromium-browser-l10n
echo "Installing PepperFlash plugin..."
mkdir pepper
cd pepper
wget http://os.archlinuxarm.org/armv7h/alarm/chromium-pepper-flash-12.0.0.77-1-armv7h.pkg.tar.xz
tar Jxvf chromium-pepper-flash-12.0.0.77-1-armv7h.pkg.tar.xz
sudo cp usr/lib/PepperFlash/* /usr/lib/chromium-browser/plugins
if [ ! -f "/etc/chromium-browser/default.org" ]; then
    sudo cp /etc/chromium-browser/default /etc/chromium-browser/default.org
fi
cp /etc/chromium-browser/default.org ./default
echo "CHROMIUM_FLAGS=\"--ppapi-flash-path=/usr/lib/chromium-browser/plugins/libpepflashplayer.so --ppapi-flash-version=12.0.0.77 -password-store=detect -user-data-dir\"" >> default
sudo mv default /etc/chromium-browser/default
cd /home/pi
echo "Cleaning temporary directory..."
rm -rf pepper
echo "Finished..."
echo "Let's enjoy Scratch2.0 Programming!"

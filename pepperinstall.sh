#!/bin/sh
# Chromium Web Browser and Pepper Flash Plugin Installer
#                               for Raspberry Pi 2B & 3B
# http://twitter.com/naominix
#
# See: http://scratch.mit.edu/discuss/topic/173780/?page=5 
#
echo "\n\033[36m\033[1mInstalling Chromium & PepperFlash plugin...\033[00m\n"
cd /home/pi/
echo "\n\033[36m\033[1mAdd apt sources.list file...\033[00m\n"
echo "deb http://ppa.launchpad.net/canonical-chromium-builds/stage/ubuntu vivid main" > chromium.list
sudo mv chromium.list /etc/apt/sources.list.d/chromium.list
echo "\n\033[36m\033[1mAdd public key from keyserver...\033[00m\n"
sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 5B393194
echo "\n\033[36m\033[1mInstalling Chromium Web Browser...\033[00m\n"
sudo apt-get update
sudo apt-get -y install chromium-browser chromium-browser-l10n
echo "\n\033[36m\033[1mInstalling Pepper Flash Plugin...\033[00m\n"
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
echo "\n\033[36m\033[1mCleaning temporary directory...\033[00m\n"
rm -rf pepper
echo "\n\033[32m\033[1mInstallation of Chromium Web Browser & Pepper Flash Plugin for Raspberry Pi is completed.\033[00m\n"

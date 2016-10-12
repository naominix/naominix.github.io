#!/bin/sh
# Chromium Web Browser and Pepper Flash Plugin Installer
#                               for Raspberry Pi 2B & 3B (NOOBS V.1.9.3-)
#                               Version.2.0
# http://twitter.com/naominix
#
# See: http://scratch.mit.edu/discuss/topic/173780/?page=5 
#
cd /home/pi/
echo "\n\033[36m\033[1mInstalling Pepper Flash Plugin...\033[00m\n"
mkdir pepper
cd pepper
wget https://www.dropbox.com/s/enjmq0cjusw91w2/flash21.tar.xz?dl=0
tar -xJf flash21.tar.xz?dl=0
cd pepper
sudo cp *.so /usr/lib/chromium-browser/
sudo cp *.json /usr/lib/chromium-browser/
if [ ! -f "/etc/chromium-browser/customizations/01-pepper" ]; then
     echo "CHROMIUM_FLAGS=\"${CHROMIUM_FLAGS} --ppapi-flash-path=/usr/lib/chromium-browser/libpepflashplayer.so --ppapi-flash-version=21.0.0.182-r1 -password-store=detect -user-data-dir\"" >> 01-pepper
     sudo mv 01-pepper /etc/chromium-browser/customizations/
fi
cd /home/pi
echo "\n\033[36m\033[1mCleaning temporary directory...\033[00m\n"
rm -rf pepper
echo "\n\033[32m\033[1mInstallation of Pepper Flash Plugin for Raspberry Pi[NOOBS V1.9.3-] is completed.\033[00m\n"

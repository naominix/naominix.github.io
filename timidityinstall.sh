#!/bin/sh
 
cd /home/pi
 
# Install Timidity
echo "\n\033[36m\033[1mInstalling Timidity & SoundFonts...\033[00m\n"
sudo apt-get -y install timidity timidity-daemon fluid-soundfont-gm fluid-soundfont-gs
 
 
# Change configuration files for Timidity & NSX-39 
echo "\n\033[36m\033[1m Change /etc/timidity/timidity.cfg configuration...\033[00m\n"
sudo mv /etc/timidity/timidity.cfg /tmp/timidity.cfg
sudo sh -c "sed -e \"s/#source/source/g\" -e \"s/^\(source.*freepats.*\)/#\1/\" /tmp/timidity.cfg > /etc/timidity/timidity.cfg"
sudo rm /tmp/timidity.cfg
echo "\n\033[36m\033[1m Change /etc/default/timidity configuration...\033[00m\n"
sudo mv /etc/default/timidity /tmp/timidity
sudo sh -c "sed -e 's/\(\-Os\)\"$/\1 --sequencer-ports=1\"/' /tmp/timidity > /etc/default/timidity"
sudo rm /tmp/timidity

if [ -f /etc/modprobe.d/alsa-base.conf.org ]; then
	echo "\n\033[33m\033[1m /etc/modprobe.d/alsa-base.conf.org exists. Skipped...\033[00m\n"
else
	echo "\n\033[36m\033[1m Change ALSA base configuration...\033[00m\n"
	sudo cp /etc/modprobe.d/alsa-base.conf /etc/modprobe.d/alsa-base.conf.org
	sudo sh -c "sed -e 's/^#options snd-usb-audio index=-2/options snd-usb-audio index=-2/' /etc/modprobe.d/alsa-base.conf.org > /etc/modprobe.d/alsa-base.conf"
fi

# Restart Timidity
sudo service timidity stop
sudo service timidity start

echo "\n\033[32m\033[1mInstallation of Timidity & SoundFonts for eVY1 Scratch is completed.\033[00m\n"
echo "\n\033[32m\033[1mYou need to reboot for changes to take effect.\033[00m\n"

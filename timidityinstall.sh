#!/bin/sh
 
cd /home/pi
 
# Install Timidity
echo "\n\033[36m\033[1mInstalling Timidity & SoundFonts...\033[00m\n"
sudo apt-get -y install timidity timidity-daemon fluid-soundfont-gm fluid-soundfont-gs
 
 
# Change configuration files for Timidity & NSX-39 
echo "\n\033[36m\033[1mChange configuration...\033[00m\n"
sudo mv /etc/timidity/timidity.cfg /tmp/timidity.cfg
sudo sh -c "sed -e \"s/#source/source/g\" -e \"s/^\(source.*freepats.*\)/#\1/\" /tmp/timidity.cfg > /etc/timidity/timidity.cfg"
sudo rm /tmp/timidity.cfg
sudo mv /etc/default/timidity /tmp/timidity
sudo sh -c "sed -e 's/\(\-Os\)\"$/\1 --sequencer-ports=1\"/' /tmp/timidity > /etc/default/timidity"
sudo rm /tmp/timidity

# Restart Timidity
sudo service timidity stop
sudo service timidity start

echo "\n\033[32m\033[1mInstallation of Timidity & SoundFonts for eVY1 Scratch is completed.\033[00m\n"

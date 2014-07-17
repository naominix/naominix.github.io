#!/bin/sh
 
SQUEAKDIR="/usr/lib/squeak/4.10.2-2793"
MIDIPLUGIN="so.MIDIPlugin.140712"
SCRATCHDIR="/usr/share/scratch/locale"
cd /home/pi
 
# Install eVY14RasPi
echo "\n\033[36m\033[1mInstalling eVY1 Scratch on RaspberryPi for NSX-39(PokeMiku)...\033[00m\n"
wget -P /tmp https://github.com/naominix/eVY14RasPi/archive/master.zip
unzip /tmp/master.zip
if [ -d /home/pi/eVY14RasPi ]; then
    cp -rf eVY14RasPi-master/* eVY14RasPi/
    rm -rf eVY14RasPi-master
else
    mv eVY14RasPi-master eVY14RasPi
fi
rm /tmp/master.zip
 
# Install MIDIPLUGIN File
echo "\n\033[36m\033[1mInstalling MIDI Plugin File(Overwrite)...\033[00m\n"
if [ -f $SQUEAKDIR/so.MIDIPlugin ]; then
    sudo cp eVY14RasPi/$MIDIPLUGIN $SQUEAKDIR/so.MIDIPlugin
else
    echo "\n\033[33m\033[1m $SQUEAKDIR/so.MIDIPlugin Not Found. Please check Scratch install. Skipped copying.\033[00m\n"
fi
 
# Install eVY1 locale file
echo "\n\033[36m\033[1mInstalling eVY1 Scratch locale file(Overwrite)...\033[00m\n"
if [ -d $SCRATCHDIR ]; then
    sudo cp eVY14RasPi/ja_eVY1.po $SCRATCHDIR/
else
    echo "\n\033[33m\033[1mScratch directory Not Found. Please check Scratch install. Skipped copying.\033[00m\n"
fi
 
# Copy eVY1 Scratch shortcut on Desktop
if [ -f /home/pi/Desktop/eVY1.desktop ]; then
    echo "\n\033[33m\033[1meVY1 Scratch shotcut on Desktop exists. Skippted copying.\033[00m\n"
else
    echo "\n\033[36m\033[1mCopying eVY1 Scratch shortcut on Desktop...\033[00m\n"
    cp eVY14RasPi/eVY1.desktop /home/pi/Desktop/
fi

echo "\n\033[32m\033[1mInstallation of eVY1 Scratch for Raspberry Pi is completed.\033[00m\n"

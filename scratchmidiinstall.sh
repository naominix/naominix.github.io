#!/bin/sh
# File:            scratchmidiinstall.sh
# Description:     Script to install the MIDIPlugin for Timidity & NSX-39 with the scratch image
# Author: 	   Hisashi Hoshino (@naominix)

GITHUBURL="https://naominix.github.io/scratchmidiinstall.sh" 
SQUEAKDIR="/usr/lib/squeak/4.10.2-2793"
MIDIPLUGIN="so.MIDIPlugin.140720"
SCRATCHDIR="/usr/share/scratch/locale"
cd /home/pi

# Install MIDIPLUGIN File
installPlugin() {
	echo "\n\033[36m\033[1mInstalling MIDI Plugin File(Overwrite)...\033[00m\n"
	if [ -f $SQUEAKDIR/so.MIDIPlugin ]; then
	    sudo cp eVY1RasPi-master/$MIDIPLUGIN $SQUEAKDIR/so.MIDIPlugin
	else
	    echo "\n\033[33m\033[1m $SQUEAKDIR/so.MIDIPlugin Not Found. Please check Scratch install. Skipped copying.\033[00m\n"
	fi
}

# Copy ScratchMIDI
copyScratchMidi() {
	    # Install MIDI Plugin
	    installPlugin
	    # Copy ScratchMIDI files
	    cp eVY1RasPi-master/LinuxMIDIPluginEnabler.1.cs ScratchMIDI/
	    cp eVY1RasPi-master/Scratch20131203MIDI.image ScratchMIDI/
	    cp eVY1RasPi-master/ScratchMIDI.sh ScratchMIDI/
	    cp eVY1RasPi-master/License.txt ScratchMIDI/
	    # Copy ScratchMIDI shortcut on Desktop
	    if [ -f /home/pi/Desktop/scratchmidi.desktop ]; then
	    	echo "\n\033[33m\033[1m ScratchMIDI shotcut on Desktop exists. Skipped copying.\033[00m\n"
	    else
	    	echo "\n\033[36m\033[1mCopying ScratchMIDI shortcut on Desktop...\033[00m\n"
	    	cp eVY1RasPi-master/scratchmidi.desktop /home/pi/Desktop/
	    fi
	    rm -rf eVY1RasPi-master
}

# Install ScratchMIDI
installScratchMidi() {
	echo "\n\033[36m\033[1mInstalling ScratchMIDI on RaspberryPi for Timidity...\033[00m\n"
	wget -P /tmp https://github.com/naominix/eVY1RasPi/archive/master.zip
	unzip /tmp/master.zip
	if [ -d /home/pi/ScratchMIDI ]; then
		copyScratchMidi
	else
	    	mkdir ScratchMIDI
		copyScratchMidi
	fi
	rm /tmp/master.zip

	echo "\n\033[32m\033[1mInstallation of ScratchMIDI for Raspberry Pi is completed.\033[00m\n"
}

# Install eVY1RasPi
installeVY1RasPi() {
	echo "\n\033[36m\033[1mInstalling eVY1 Scratch on RaspberryPi for NSX-39(PokeMiku)...\033[00m\n"
	wget -P /tmp https://github.com/naominix/eVY1RasPi/archive/master.zip
	unzip /tmp/master.zip
	# Install MIDI Plugin
	installPlugin
	if [ -d /home/pi/eVY1RasPi ]; then
	    cp -rf eVY1RasPi-master/* eVY1RasPi/
	    rm -rf eVY1RasPi-master
	else
	    mv eVY1RasPi-master eVY1RasPi
	fi
	rm /tmp/master.zip
 
	# Install eVY1 locale file
	echo "\n\033[36m\033[1mInstalling eVY1 Scratch locale file...\033[00m\n"
	if [ -d $SCRATCHDIR ]; then
	    sudo cp eVY1RasPi/locale/ja_eVY1.po $SCRATCHDIR/
	else
	    echo "\n\033[33m\033[1mScratch directory Not Found. Please check Scratch install. Skipped copying.\033[00m\n"
	fi
 
	# Copy eVY1 Scratch shortcut on Desktop
	if [ -f /home/pi/Desktop/eVY1.desktop ]; then
	    echo "\n\033[33m\033[1meVY1 Scratch shotcut on Desktop exists. Skippted copying.\033[00m\n"
	else
	    echo "\n\033[36m\033[1mCopying eVY1 Scratch shortcut on Desktop...\033[00m\n"
	    cp eVY1RasPi/eVY1.desktop /home/pi/Desktop/
	fi

	echo "\n\033[32m\033[1mInstallation of eVY1 Scratch for Raspberry Pi is completed.\033[00m\n"
}

installTimidity() {
	curl https://naominix.github.io/timidityinstall.sh | sh
}

# Main
CMDNAME=$0

if [ $# -eq 0 ]; then
	installScratchMidi
	installTimidity
elif [ "$1" = 'miku' ]; then
	installeVY1RasPi
elif [ "$1" = 'timidity' ]; then
	installTimidity
elif [ "$1" = 'midi' ]; then
	installScratchMidi
else
	echo 'Invalid option' 1>&2
	echo "Usage: curl $GITHUBURL | $CMDNAME " 1>&2
	echo "            -> Install ScratchMIDI and Timidity(1Port) with so.MIDIPlugin" 1>&2
	echo "       curl $GITHUBURL | $CMDNAME -s miku " 1>&2
	echo "            -> Install eVY1 Scratch for PokeMiku(NSX-39) with so.MIDIPlugin" 1>&2
	echo "       curl $GITHUBURL | $CMDNAME -s midi " 1>&2
	echo "            -> Install ScratchMIDI with so.MIDIPlugin" 1>&2
	echo "       curl $GITHUBURL | $CMDNAME -s timidity " 1>&2
	echo "            -> Install Timidity(1Port) only" 1>&2
	exit 1
fi

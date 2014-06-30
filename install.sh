#!/bin/sh
 
cd /home/pi
 
if [ ! -d /home/pi/mcpi ]; then
    # Install Minecraft Pi
    echo "\n\033[36m\033[1mInstalling Minecraft Pi...\033[00m\n"
    wget -P /tmp https://s3.amazonaws.com/assets.minecraft.net/pi/minecraft-pi-0.1.1.tar.gz
    tar zxvf /tmp/minecraft-pi-0.1.1.tar.gz
    rm /tmp/minecraft-pi-0.1.1.tar.gz
fi
 
# Install scratch2mcpi
echo "\n\033[36m\033[1mInstalling scratch2mcpi...\033[00m\n"
sudo apt-get -y install python-setuptools
sudo easy_install scratchpy
wget -P /tmp https://github.com/scratch2mcpi/scratch2mcpi/archive/master.zip
unzip /tmp/master.zip
if [ -d /home/pi/scratch2mcpi ]; then
    cp -rf scratch2mcpi-master/* scratch2mcpi/
    rm -rf scratch2mcpi-master
else
    mv scratch2mcpi-master scratch2mcpi
fi
rm /tmp/master.zip
cp -rf /home/pi/mcpi/api/python/mcpi scratch2mcpi/
 
# Install Minecraft Graphics Turtle
echo "\n\033[36m\033[1mInstalling MinecraftGraphicsTurtle...\033[00m\n"
wget -P /tmp https://github.com/martinohanlon/minecraft-turtle/archive/master.zip
unzip /tmp/master.zip
if [ -f /home/pi/scratch2mcpi/minecraftturtle.py ]; then
    echo "\n\033[33m\033[1minecraftturtle.py exists. Skipped copying.\033[00m\n"
else
    sed -e "s/import minecraft/import mcpi.minecraft as minecraft/" -e "s/import block/import mcpi.block as block/" minecraft-turtle-master/minecraftturtle.py > scratch2mcpi/minecraftturtle.py
    #cp  minecraft-turtle-master/minecraftturtle.py scratch2mcpi/
    rm -rf minecraft-turtle-master
fi
rm /tmp/master.zip
 
# Install Scratch2MCPI with Minecraft Graphics Turtle
echo "\n\033[36m\033[1mInstalling Scratch2MCPI with MinecraftGraphicsTurtle...\033[00m\n"
wget -P /tmp https://github.com/naominix/scratch2mcpi/archive/master.zip
unzip /tmp/master.zip
if [ -f /home/pi/scratch2mcpi/scratch2mcpiturtle.py ]; then
    echo "\n\033[33m\033[1mscratch2mcpiturtle.py exists. Skipped copying.\033[00m\n"
else
    cp  scratch2mcpi-master/scratch2mcpiturtle.py scratch2mcpi/
    rm -rf scratch2mcpi-master
fi
rm /tmp/master.zip
 
# Install Minecraft Stuff
echo "\n\033[36m\033[1mInstalling MinecraftStuff...\033[00m\n"
wget -P /tmp https://raw.github.com/martinohanlon/minecraft-stuff/master/minecraftstuff.py
if [ -f /home/pi/scratch2mcpi/minecraftstuff.py ]; then
    echo "\n\033[33m\033[1mminecraftstuff.py exists. Skipped copying.\033[00m\n"
else
    sed -e "s/^import minecraft/import mcpi.minecraft as minecraft/" -e "s/^import block/import mcpi.block as block/" /tmp/minecraftstuff.py > scratch2mcpi/minecraftstuff.py
fi
rm /tmp/minecraftstuff.py
 
# Download sample Scratch projects
echo "\n\033[36m\033[1mDownloading sample Scratch projects...\033[00m\n"
if [ -f "/home/pi/Documents/Scratch Projects/mcpi_template.sb" ]; then
    echo "\n\033[33m\033[1mmcpi_template.sb exists. Skipped downloading.\033[00m\n"
else
    wget -P "/home/pi/Documents/Scratch Projects" http://scratch2mcpi.github.io/scratch_projects/mcpi_template.sb
fi
 
if [ -f "/home/pi/Documents/Scratch Projects/mcpi_sphere.sb" ]; then
    echo "\n\033[33m\033[1mmcpi_sphere.sb exists. Skipped downloading.\033[00m\n"
else
    wget -P "/home/pi/Documents/Scratch Projects" http://scratch2mcpi.github.io/scratch_projects/mcpi_sphere.sb
fi
 
if [ -f "/home/pi/Documents/Scratch Projects/mcpi_stagescanner.sb" ]; then
    echo "\n\033[33m\033[1mmcpi_stagescanner.sb exists. Skipped downloading.\033[00m\n"
else
    wget -P "/home/pi/Documents/Scratch Projects" http://scratch2mcpi.github.io/scratch_projects/mcpi_stagescanner.sb
fi
 
# Download MinecraftGraphicsTurtle and Stuff sample Scratch projects
echo "\n\033[36m\033[1mDownloading MinecraftGraphicsTurtle and Sutff sample Scratch projects...\033[00m\n"
if [ -f "/home/pi/Documents/Scratch Projects/3dnautilus.sb" ]; then
    echo "\n\033[33m\033[1m3dnautilus.sb exists. Skipped downloading.\033[00m\n"
else
    wget -P "/home/pi/Documents/Scratch Projects" http://naominix.github.io/scratch_projects/3dnautilus.sb
fi

if [ -f "/home/pi/Documents/Scratch Projects/circle1.sb" ]; then
    echo "\n\033[33m\033[1mcircle1.sb exists. Skipped downloading.\033[00m\n"
else
    wget -P "/home/pi/Documents/Scratch Projects" http://naominix.github.io/scratch_projects/circle1.sb
fi

if [ -f "/home/pi/Documents/Scratch Projects/circle2.sb" ]; then
    echo "\n\033[33m\033[1mcircle2.sb exists. Skipped downloading.\033[00m\n"
else
    wget -P "/home/pi/Documents/Scratch Projects" http://naominix.github.io/scratch_projects/circle2.sb
fi

if [ -f "/home/pi/Documents/Scratch Projects/circle3.sb" ]; then
    echo "\n\033[33m\033[1mcircle3.sb exists. Skipped downloading.\033[00m\n"
else
    wget -P "/home/pi/Documents/Scratch Projects" http://naominix.github.io/scratch_projects/circle3.sb
fi

if [ -f "/home/pi/Documents/Scratch Projects/face1.sb" ]; then
    echo "\n\033[33m\033[1mface1.sb exists. Skipped downloading.\033[00m\n"
else
    wget -P "/home/pi/Documents/Scratch Projects" http://naominix.github.io/scratch_projects/face1.sb
fi

if [ -f "/home/pi/Documents/Scratch Projects/line1.sb" ]; then
    echo "\n\033[33m\033[1mline1.sb exists. Skipped downloading.\033[00m\n"
else
    wget -P "/home/pi/Documents/Scratch Projects" http://naominix.github.io/scratch_projects/line1.sb
fi

if [ -f "/home/pi/Documents/Scratch Projects/pattern.sb" ]; then
    echo "\n\033[33m\033[1mpattern.sb exists. Skipped downloading.\033[00m\n"
else
    wget -P "/home/pi/Documents/Scratch Projects" http://naominix.github.io/scratch_projects/pattern.sb
fi

if [ -f "/home/pi/Documents/Scratch Projects/pattern2.sb" ]; then
    echo "\n\033[33m\033[1mpattern2.sb exists. Skipped downloading.\033[00m\n"
else
    wget -P "/home/pi/Documents/Scratch Projects" http://naominix.github.io/scratch_projects/pattern2.sb
fi

if [ -f "/home/pi/Documents/Scratch Projects/pattern3.sb" ]; then
    echo "\n\033[33m\033[1mpattern3.sb exists. Skipped downloading.\033[00m\n"
else
    wget -P "/home/pi/Documents/Scratch Projects" http://naominix.github.io/scratch_projects/pattern3.sb
fi

if [ -f "/home/pi/Documents/Scratch Projects/spiral.sb" ]; then
    echo "\n\033[33m\033[1mspiral.sb exists. Skipped downloading.\033[00m\n"
else
    wget -P "/home/pi/Documents/Scratch Projects" http://naominix.github.io/scratch_projects/spiral.sb
fi

if [ -f "/home/pi/Documents/Scratch Projects/spiral2.sb" ]; then
    echo "\n\033[33m\033[1mspiral2.sb exists. Skipped downloading.\033[00m\n"
else
    wget -P "/home/pi/Documents/Scratch Projects" http://naominix.github.io/scratch_projects/spiral2.sb
fi

if [ -f "/home/pi/Documents/Scratch Projects/star1.sb" ]; then
    echo "\n\033[33m\033[1mstar1.sb exists. Skipped downloading.\033[00m\n"
else
    wget -P "/home/pi/Documents/Scratch Projects" http://naominix.github.io/scratch_projects/star1.sb
fi

if [ -f "/home/pi/Documents/Scratch Projects/star2.sb" ]; then
    echo "\n\033[33m\033[1mstar2.sb exists. Skipped downloading.\033[00m\n"
else
    wget -P "/home/pi/Documents/Scratch Projects" http://naominix.github.io/scratch_projects/star2.sb
fi

if [ -f "/home/pi/Documents/Scratch Projects/stuff1.sb" ]; then
    echo "\n\033[33m\033[1mstuff1.sb exists. Skipped downloading.\033[00m\n"
else
    wget -P "/home/pi/Documents/Scratch Projects" http://naominix.github.io/scratch_projects/stuff1.sb
fi

# Copy Scratch2MCPI shortcut on Desktop
if [ -f /home/pi/Desktop/scratch2mcpi.desktop ]; then
    echo "\n\033[33m\033[1mScratch2MCPI shortcut on Desktop exists. Skipped copying.\033[00m\n"
else
    echo "\n\033[36m\033[1mCopying Scratch2MCPI shortcut on Desktop...\033[00m\n"
    wget -P "/home/pi/Desktop" http://scratch2mcpi.github.io/scratch2mcpi.desktop
fi
 
# Copy Scratch2MCPI Terminal shortcut on Desktop
if [ -f /home/pi/Desktop/scratch2mcpi_terminal.desktop ]; then
    echo "\n\033[33m\033[1mScratch2MCPI Terminal shortcut on Desktop exists. Skipped copying.\033[00m\n"
else
    echo "\n\033[36m\033[1mCopying Scratch2MCPI Terminal shortcut on Desktop...\033[00m\n"
    wget -P "/home/pi/Desktop" http://scratch2mcpi.github.io/scratch2mcpi_terminal.desktop
fi
 
# Copy Scratch2MCPITurtle shortcut on Desktop
if [ -f /home/pi/Desktop/scratch2mcpiturtle.desktop ]; then
    echo "\n\033[33m\033[1mScratch2MCPITurtle shortcut on Desktop exists. Skipped copying.\033[00m\n"
else
    echo "\n\033[36m\033[1mCopying Scratch2MCPITurtle shortcut on Desktop...\033[00m\n"
    wget -P "/home/pi/Desktop" http://naominix.github.io/desktop/scratch2mcpiturtle.desktop
fi
 
# Copy Scratch2MCPITurtle Terminal shortcut on Desktop
if [ -f /home/pi/Desktop/scratch2mcpiturtle_terminal.desktop ]; then
    echo "\n\033[33m\033[1mScratch2MCPITurtle Terminal shortcut on Desktop exists. Skipped copying.\033[00m\n"
else
    echo "\n\033[36m\033[1mCopying Scratch2MCPITurtle Terminal shortcut on Desktop...\033[00m\n"
    wget -P "/home/pi/Desktop" http://naominix.github.io/scratch2mcpiturtle_terminal.desktop
fi
 
echo "\n\033[32m\033[1mInstallation of scratch2mcpi is completed.\033[00m\n"

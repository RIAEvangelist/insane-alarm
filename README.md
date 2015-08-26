# Insane Alarm!
This is a desktop port (nw.js) of my very first chrome app programmed one night when my wife was away. I had spent a night out with the boys and drank a bit too much but needed to be up in the morning. I realised that my phone was dead and I didn't have a charger, and my internet was unreliable at the time so none of the apps out there seemed like they would wake me up reliably.

So I naturally did what any programmer would do, I programmed my own, with the LOUDEST alarm based off of an emergency alarm from when I was in the military. I couldn't find a good sound to match it in my intoxicated state... so I made my own using the Web Audio Context and Oscillator nodes.

It supports Windows, Mac and Linux.

## Downloads
Download the program or binaries for your system from our [insane alarm releases](https://github.com/RIAEvangelist/insane-alarm/releases)

## Building from src
1. You will need nodejs installed.
2. run ` npm install ` from the insane-alarm directory (not the src directory). This should ` npm install nw-builder ` for the build script
3. run ` node build.js ` from the insane alarm directory.
4. run your build from the build folder created!

## Licensed un DBAD
See the [DBAD license](https://github.com/philsturgeon/dbad) in your language or our [licence.md](https://github.com/RIAEvangelist/insane-alarm/blob/master/license.md) file.

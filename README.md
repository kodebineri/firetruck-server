# FireTruck Firestore Manager
Firestore . Reconnect . Reimagined
## Overview
FireTruck is written in JavaScript and powered by ElectronJS to make it possible for cross-platform compatibility. Like any other Electron app, we adopted Main Process - Renderer Process Architecture. For better understanding, we called it Client-Server Architecture, therefore there are two repos for this project: [firetruck-server](https://github.com/kodebineri/firetruck-server) and [firetruck-client](https://github.com/kodebineri/firetruck-client). Firetruck-server has written entirely in JavaScript and makes use of NodeJS capability.

## Build from Source
### Prerequisites
Make sure your computer already met these prerequisites before building this project.
- NodeJS >= 14
- Git
- Yarn

### How to Build
1. Clone this repo
    ```sh
    $ git clone https://github.com/kodebineri/firetruck-server
    ```
2. Install dependencies and build
    ```sh
    $ cd firetruck-server
    $ yarn install
    $ yarn dist
    ```
3. Distribute your binary in ```dist``` folder, e.g. ```FireTruck-0.0.1.dmg```

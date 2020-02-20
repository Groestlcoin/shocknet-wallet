import { NativeModules } from 'react-native'

const { NativeSocket } = NativeModules
export default NativeSocket

/*
USAGE

import {NativeEventEmitter} from 'react-native'
import NativeSocket from './app/native/nativeSocket'

CONNECT

const params = {
    events:["EVENT"] //all events that the socket should listen to
}
NativeSocket.connect("http://192.168.0.20:3000/",JSON.stringify(params))

LISTEN

eventEmitter.addListener('EVENT', (event) => {
    NativeSocket.log("NotificationsDeb",JSON.stringify(event))
})

EMIT

NativeSocket.emit("EVENT","I'll go to sleep now")

*/

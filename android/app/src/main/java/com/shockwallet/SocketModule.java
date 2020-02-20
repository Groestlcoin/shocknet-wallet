package com.shockwallet;

import android.content.Intent;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import 	android.util.Log;
import android.os.Bundle;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;

import java.util.ArrayList;

import com.github.nkzawa.socketio.client.IO;
import com.github.nkzawa.socketio.client.Socket;
import com.github.nkzawa.emitter.Emitter;

import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableNativeArray;

import org.json.JSONObject;
import org.json.JSONArray;


public class SocketModule extends ReactContextBaseJavaModule {
    private static final String TAG = "NotificationsDeb";
    public static final String REACT_CLASS = "NativeSocket";
    private static ReactApplicationContext reactContext;
    private Socket mSocket;
    private EventManager[] managers;

    public SocketModule(@Nonnull ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Nonnull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @ReactMethod 
    public void log(String tag,String body) {
        Log.d(tag, body);
    }

    @ReactMethod 
    public void emit(String event,String body) {
        mSocket.emit(event, body);
    }
    

    
    @ReactMethod
    public void connect(String url,String eventsString) {
        Log.d(TAG,"doing conn");
        try{
            JSONObject eventsObj = new JSONObject(eventsString);
            JSONArray events = eventsObj.getJSONArray("events");
            managers = new EventManager[events.length()];
            mSocket = IO.socket(url);
            for(int i = 0 ; i< events.length() ; i++){
                managers[i] = new EventManager(events.getString(i));
                mSocket.on(events.getString(i),managers[i]);
                Log.d(TAG,events.getString(i));
            }
            mSocket.connect();
        } catch (Exception e) {
            Log.d(TAG,e.toString());
        }

        
    }
    /*
    @ReactMethod
    public void connect(String url,ReadableNativeArray eventsArr) {
        try{
            ArrayList<Object> events = eventsArr.toArrayList();
            managers = new EventManager[(int)events.size()];
            mSocket = IO.socket(url);
            for(int i = 0 ; i< (int)events.size() ; i++){
                managers[i] = new EventManager((String) events.get(i));
                mSocket.on((String) events.get(i),managers[i]);
            }
        } catch (Exception e) {
            Log.d(TAG,e.toString());
        }

        
    }
*/

    private void sendEvent(ReactApplicationContext reactContext, String eventName, @Nullable WritableMap params) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(eventName, params);
    }

    private class EventManager implements Emitter.Listener{
        private String EventName;
        public EventManager(String eventName){
            super();
            EventName = eventName;
        }
        @Override
        public void call(final Object... args) {
            Log.d(TAG,args[0].toString());
            try{
                WritableMap params = Arguments.createMap();
                params.putString(EventName, args[0].toString());
                sendEvent(reactContext, EventName, params);
            } catch (Exception e) {
                Log.d(TAG,e.toString());
            }
        }

    }

        /*
        Intent service = new Intent(this.reactContext, NotificationService.class);
        Bundle bundle = new Bundle();

        bundle.putString("ip", ip);
        bundle.putString("token", token);
        service.putExtras(bundle);
        this.reactContext.startService(service);
    }

    @ReactMethod
    public void stopService() {
        this.reactContext.stopService(new Intent(this.reactContext, NotificationService.class));
        Log.d(TAG,"stopping service");
    }*/
}

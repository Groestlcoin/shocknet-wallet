package com.shockwallet;

import android.content.Intent;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import 	android.util.Log;
import android.os.Bundle;

import java.util.HashMap;

import javax.annotation.Nonnull;
import com.shockwallet.NotificationService;

import javax.crypto.spec.SecretKeySpec;
import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import 	android.util.Base64;

import org.json.JSONObject;

import com.facebook.react.bridge.Callback;


public class NotificationModule extends ReactContextBaseJavaModule {
    private static final String TAG = "NotificationsDeb";
    public static final String REACT_CLASS = "notificationService";
    private static ReactApplicationContext reactContext;

    public NotificationModule(@Nonnull ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Nonnull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @ReactMethod
    public void startService(String ip,String token) {
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
    }

    @ReactMethod
    public void decrypt(
        String keyS, 
        String cipherText,
        String iv, 
        com.facebook.react.bridge.Promise promise){
        try{
            byte[] keyB = hexToBytes(keyS);
            SecretKeySpec secretKeySpec = new SecretKeySpec(keyB, "AES");

            byte[] ivB = hexToBytes(iv);
            final Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5PADDING");
            cipher.init(Cipher.DECRYPT_MODE, secretKeySpec, new IvParameterSpec(ivB));
            byte[] textDecoded = Base64.decode(cipherText.getBytes(),Base64.DEFAULT);
            byte[] plainText= cipher.doFinal(textDecoded);
            promise.resolve(new String(plainText));
        }catch(Exception e){
            promise.reject("ERROR",e.toString());
        }
    }

    @ReactMethod
    public void encrypt(
        String keyS,
        String message,
        String iv,
        com.facebook.react.bridge.Promise promise){
        
        try{
            byte[] plaintext = message.getBytes();
            byte[] keyB = hexToBytes(keyS);
            SecretKeySpec secretKeySpec = new SecretKeySpec(keyB, "AES");
            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5PADDING");
            byte[] ivB = hexToBytes(iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKeySpec, new IvParameterSpec(ivB));
            byte[] ciphertext = cipher.doFinal(plaintext);
            byte[] ivRes = cipher.getIV();
            HashMap<String,String> encoded = new HashMap<>();
            encoded.put("encryptedData",Base64.encodeToString(ciphertext,Base64.DEFAULT));
            encoded.put("iv",bytesToHex(ivRes));

            JSONObject encodedJSON = new JSONObject(encoded);
            //Log.d(TAG,encoded.toString());
            promise.resolve(encodedJSON.toString());
        } catch (Exception e){
            promise.reject("ERROR",e.toString());
        }
    }
    private static String bytesToHex(byte[] hashInBytes) {

        StringBuilder sb = new StringBuilder();
        for (byte b : hashInBytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();

    }

    

    private static byte[] hexToBytes(String str){
      byte[] val = new byte[str.length() / 2];
      for (int i = 0; i < val.length; i++) {
         int index = i * 2;
         int j = Integer.parseInt(str.substring(index, index + 2), 16);
         val[i] = (byte) j;
      }
      return val;
    }
}

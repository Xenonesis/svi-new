package com.svi.infrasolutions;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.webkit.GeolocationPermissions;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final int REQUEST_LOCATION_PERMISSION = 1001;

    // Hold pending geolocation callback until Android permission result returns
    private GeolocationPermissions.Callback pendingGeoCallback = null;
    private String pendingGeoOrigin = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Request Android OS location permission on first launch
        requestOsLocationPermission();
    }

    /**
     * Called by Capacitor after the Bridge and WebView are fully initialised.
     * This is the correct hook to customise the WebChromeClient.
     */
    @Override
    public void onStart() {
        super.onStart();
        applyGeolocationWebChromeClient();
    }

    /**
     * Installs a WebChromeClient that auto-grants WebView geolocation prompts
     * whenever the Android OS location permission is already held.
     *
     * Using bridge.getWebView().post() ensures we run after Capacitor's own
     * initialisation has finished setting its BridgeWebChromeClient.
     */
    private void applyGeolocationWebChromeClient() {
        if (bridge == null || bridge.getWebView() == null) return;

        final WebView webView = bridge.getWebView();
        // Post to the end of the WebView message queue so we override
        // Capacitor's default client, not the other way around.
        webView.post(() -> webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onGeolocationPermissionsShowPrompt(
                    String origin,
                    GeolocationPermissions.Callback callback) {
                if (ContextCompat.checkSelfPermission(
                        MainActivity.this,
                        Manifest.permission.ACCESS_FINE_LOCATION)
                        == PackageManager.PERMISSION_GRANTED) {
                    // OS permission already granted — silently allow WebView too
                    callback.invoke(origin, true, false);
                } else {
                    // OS permission not yet granted — store callback, ask OS
                    pendingGeoCallback = callback;
                    pendingGeoOrigin  = origin;
                    requestOsLocationPermission();
                }
            }
        }));
    }

    private void requestOsLocationPermission() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
                != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(
                this,
                new String[]{
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                },
                REQUEST_LOCATION_PERMISSION
            );
        }
    }

    @Override
    public void onRequestPermissionsResult(
            int requestCode,
            @NonNull String[] permissions,
            @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);

        if (requestCode == REQUEST_LOCATION_PERMISSION) {
            boolean granted = grantResults.length > 0
                    && grantResults[0] == PackageManager.PERMISSION_GRANTED;

            if (pendingGeoCallback != null && pendingGeoOrigin != null) {
                pendingGeoCallback.invoke(pendingGeoOrigin, granted, false);
                pendingGeoCallback = null;
                pendingGeoOrigin   = null;
            }
        }
    }
}

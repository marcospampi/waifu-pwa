/// <reference types="chromecast-caf-sender" />

import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, merge, Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { ChromecastDevice } from './devices/chromecast.device';
import { VideoDevice } from './devices/video-device.class';
import { VideoElementDevice } from './devices/video-element.device';
@Injectable({
  providedIn: 'root'
})
export class MediaBroadcasterService {
  private _chromecastEnabled: boolean = false;
  private _chromecastContext: cast.framework.CastContext;
  private _devices: {
    videoElementDevice?: VideoElementDevice,
    chromecastDevice?: VideoDevice
  } = {};
  
  private _device$: BehaviorSubject<VideoDevice> = new BehaviorSubject(null);
  public device$: Observable<VideoDevice>
  
  
  constructor() { 
    this.device$ = this._device$.asObservable().pipe(filter(e => !!e));

    // check if this browser is a chrome browser, if it is
    // import the chromecast stuff

    if ( navigator.userAgent.match(/chrome/i)) {
      window['__onGCastApiAvailable'] = ( isAvailable ) => {
        this._chromecastEnabled = isAvailable;
        if (isAvailable) {
          cast.framework.CastContext.getInstance().setOptions({
            receiverApplicationId:
              chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
            autoJoinPolicy: chrome.cast.AutoJoinPolicy.TAB_AND_ORIGIN_SCOPED
          });
          let instance = cast.framework.CastContext.getInstance();
          this._chromecastContext = instance;
          const event$ = (eventType: cast.framework.CastContextEventType) =>
            fromEvent(instance,eventType)
          merge(
            event$(cast.framework.CastContextEventType.SESSION_STATE_CHANGED)
          ).subscribe(
            this.onChromecastEvent.bind(this)
          );
          
        }
      }
      
      const importScript = document.createElement('script');
      importScript.src = "//www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1";
      document.body.appendChild(importScript);
    }

  }

  public registerVideoElementDevice(element: HTMLVideoElement ) {
    this._devices.videoElementDevice = new VideoElementDevice(element);
    if ( this._device$.value == null ) 
      this._device$.next(this._devices.videoElementDevice)
        
  }
  public disposeVideoElementDevice() {
    if ( this._device$.value == this._devices.videoElementDevice )
      this._device$.next(null);
    if ( this._devices.videoElementDevice )
      this._devices.videoElementDevice = null;
  }

  public get remoteDeviceEnabled(): boolean {
    return this._chromecastEnabled;
  }

  public get remoteDeviceConnected(): boolean {
    return !!this._devices.chromecastDevice;
  }

  private onChromecastEvent(event: cast.framework.SessionStateEventData ) {
    console.log(event)
    if (  event.sessionState == cast.framework.SessionState.SESSION_STARTED || 
          event.sessionState == cast.framework.SessionState.SESSION_RESUMED ) {
        
      this._devices.chromecastDevice = new ChromecastDevice(event.session);
      this._device$.next(this._devices.chromecastDevice)
    }
    if ( event.sessionState == cast.framework.SessionState.SESSION_ENDED ) {
      if (this._device$.value == this._devices.chromecastDevice) {
        this._device$.next( this._devices.videoElementDevice );
      }
      this._devices.chromecastDevice = null;
      
    }
  }



  



}

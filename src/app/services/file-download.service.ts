import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileDownloadService {

  constructor() { }

  downloadJsonFile(json: any, name: string) {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", name + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }
}

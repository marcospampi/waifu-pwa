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
  async shareJsonFile(json: any, name: string, title: string, description?: string ): Promise<boolean> {
    
    if ( !('canShare' in navigator)) {
      throw new Error("No share available");
    }
    
    let files: Array<File> = [
      new File([JSON.stringify(json)],name + ".json")
    ];
    Object.freeze(files);

    try {
      // ugly tricks
      await (navigator as any).share({
        title: title,
        text: description,
        files: files 
      } as any);
      return true;
    }
    catch(e) {
      throw e;
    }


  }
}

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileDownloadService {

  constructor() { }

  downloadJsonFile(json: any, name: string) {

    let blob = new Blob([JSON.stringify(json,null,2)]);
    let url = URL.createObjectURL(blob);
    //var dataStr = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     url);
    downloadAnchorNode.setAttribute("download", name + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    URL.revokeObjectURL(url);
  }
  async shareJsonFile(json: any, name: string, title: string, description?: string ): Promise<any> {
    const $canShare = (data): boolean => (navigator as any).canShare(data);
    const $share = (data): Promise<any> =>  (navigator as any).share(data);

    const file = new File([JSON.stringify(json,null,2)],name + ".json.txt",{type: 'text/plain'})

    if ($canShare({files: [file]})){
      return await $share({
        title: title,
        text: description,
        files: [file] 
      });
    }
    else {
      return null;
    }



  }
}

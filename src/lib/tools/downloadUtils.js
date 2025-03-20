class DownloadUtils {
    static #save(blob, fileName) {
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = fileName || 'data.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 0);
    }
  
    static saveString(text, fileName) {
      this.#save(new Blob([text], { type: 'text/plain' }), fileName);
    }
  
    static saveBuffer(buffer, fileName) {
      this.#save(new Blob([buffer], { type: 'application/octet-stream' }), fileName);
    }
  
    static saveDocument(content, fileName, option) {
      this.#save(new Blob([content], option), fileName);
    }
  
    static saveImage(buffer, fileName) {
      const arr = buffer.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      const u8arr = new Uint8Array(bstr.length);
      for (let i = 0; i < bstr.length; i++) {
        u8arr[i] = bstr.charCodeAt(i);
      }
      this.#save(new Blob([u8arr], { type: mime }), fileName);
    }
  }
  
  export { DownloadUtils };
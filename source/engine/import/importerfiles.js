import { RunTasks } from '../core/taskrunner.js';
import { FileSource, GetFileExtension, GetFileName, ReadFile, RequestUrl } from '../io/fileutils.js';

export class InputFile
{
    constructor (name, source, data, extension='')
    {
        alert('why is this?');
        this.name = name;
        this.source = source;
        this.data = data;
        this.extension = extension;
    }
}

// subclass inputfile
// class SuperInputFile extends InputFile {
//     // As above
//     constructor(extension='') {
//         alert('really in here');
//         super();
//         this.extension = extension;
//     }
// }


export function InputFilesFromUrls (urls)
{
    // might have to do it here by adding it as an argument to InputFile constructor
    let inputFiles = [];
    for (let url of urls) {
        alert('loop urls');
        alert(url);
        // get extension param ? before its clipped in GetFileName
        let firstParamIndex = url.indexOf ('?ext=');
        alert('this is how we do it');
        alert(url.substring(firstParamIndex + '?ext='.length));
        let exten = '';
        if (url.substring(firstParamIndex + '?ext='.length)){
            alert('ya??12');
            exten = url.substring(firstParamIndex + '?ext='.length);
            alert(url.substring(firstParamIndex + '?ext='.length));
            alert(exten);
        }

        alert('missed it');
        // alert(firstParamIndex);
        // check if // allows multiple files
        let fileName = GetFileName (url);

        if(exten !== '') {
            alert('yep');
            inputFiles.push (new InputFile (fileName, FileSource.Url, url, exten));
        } else {
            alert('not fair');
            inputFiles.push (new InputFile (fileName, FileSource.Url, url));
        }

    }
    return inputFiles;
}

export function InputFilesFromFileObjects (fileObjects)
{
    let inputFiles = [];
    for (let fileObject of fileObjects) {
        let fileName = GetFileName (fileObject.name);
        inputFiles.push (new InputFile (fileName, FileSource.File, fileObject));
    }
    return inputFiles;
}

export class ImporterFile
{
    constructor (name, source, data, extension)
    {
        this.name = GetFileName (name);
        if (extension) {
            alert('at it');
            alert(extension);
            this.extension = extension;
        } else {
            this.extension = GetFileExtension (name);
        }

        this.source = source;
        this.data = data;
        this.content = null;
    }

    SetContent (content)
    {
        this.content = content;
    }
}

export class ImporterFileList
{
    constructor ()
    {
        this.files = [];
    }

    FillFromInputFiles (inputFiles)
    {
        this.files = [];
        for (let inputFile of inputFiles) {
            alert('here too');
            alert(inputFile.name);
            alert(inputFile.source);
            alert('wnoa');
            alert(inputFile.extension);
            let file = new ImporterFile (inputFile.name, inputFile.source, inputFile.data, inputFile.extension);
            this.files.push (file);
        }
    }

    ExtendFromFileList (fileList)
    {
        let files = fileList.GetFiles ();
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            if (!this.ContainsFileByPath (file.name)) {
                this.files.push (file);
            }
        }
    }

    GetFiles ()
    {
        return this.files;
    }

    GetContent (callbacks)
    {
        RunTasks (this.files.length, {
            runTask : (index, onTaskComplete) => {
                callbacks.onFileListProgress (index, this.files.length);
                this.GetFileContent (this.files[index], {
                    onReady : onTaskComplete,
                    onProgress : callbacks.onFileLoadProgress
                });
            },
            onReady : callbacks.onReady
        });
    }

    ContainsFileByPath (filePath)
    {
        return this.FindFileByPath (filePath) !== null;
    }

    FindFileByPath (filePath)
    {
        let fileName = GetFileName (filePath).toLowerCase ();
        for (let fileIndex = 0; fileIndex < this.files.length; fileIndex++) {
            let file = this.files[fileIndex];
            if (file.name.toLowerCase () === fileName) {
                return file;
            }
        }
        return null;
    }

    IsOnlyUrlSource ()
    {
        if (this.files.length === 0) {
            return false;
        }
        for (let i = 0; i < this.files.length; i++) {
            let file = this.files[i];
            if (file.source !== FileSource.Url && file.source !== FileSource.Decompressed) {
                return false;
            }
        }
        return true;
    }

    AddFile (file)
    {
        this.files.push (file);
    }

    GetFileContent (file, callbacks)
    {
        if (file.content !== null) {
            callbacks.onReady ();
            return;
        }
        let loaderPromise = null;
        if (file.source === FileSource.Url) {
            loaderPromise = RequestUrl (file.data, callbacks.onProgress);
        } else if (file.source === FileSource.File) {
            loaderPromise = ReadFile (file.data, callbacks.onProgress);
        } else {
            callbacks.onReady ();
            return;
        }
        loaderPromise.then ((content) => {
            file.SetContent (content);
        }).catch (() => {
        }).finally (() => {
            callbacks.onReady ();
        });
    }
}

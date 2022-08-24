export const FileSource =
{
    Url : 1,
    File : 2,
	Decompressed : 3
};

export const FileFormat =
{
    Text : 1,
    Binary : 2
};

export function GetFileName (filePath)
{
	let firstSeparator = filePath.lastIndexOf ('/');
	if (firstSeparator === -1) {
		firstSeparator = filePath.lastIndexOf ('\\');
	}
	let fileName = filePath;
	if (firstSeparator !== -1) {
		fileName = filePath.substring (firstSeparator + 1);
	}
	let firstParamIndex = fileName.indexOf ('?');
	// already accounting for param and picking whats before as the filename...
	if (firstParamIndex !== -1) {
		fileName = fileName.substring (0, firstParamIndex);
	}
	return decodeURI (fileName);
}

export function GetFileExtension (filePath)
{
	let fileName = GetFileName (filePath);
	let firstPoint = fileName.lastIndexOf ('.');
	alert('tadaaaa1');
	if (firstPoint === -1) {
		// in filePath you can add indexOf ('?') to add a param
		// and grab it here (so no need for extension)
		//
		// nifty would be to add extension temporarily based on param
		// making firstPoint the index of the last character
		// and appending the file extension based on the param
		// but only do this if param and return that here
		// create a function
		alert('no first point in file path');
		let firstParamIndex = fileName.indexOf ('?');
		if (firstParamIndex !== -1) {
			fileName = fileName.substring (firstParamIndex, 3);
		}
		//
		// function could take filepath as object
		// or optional second parameter that just has the extension
		// alert('no extensions');
		return '';
	}
	let extension = fileName.substring (firstPoint + 1);
	// could do it here unless previous line throws and error
	// (for example) conditional check and then run returning extension
	return extension.toLowerCase ();
}

export function RequestUrl (url, onProgress)
{
	return new Promise ((resolve, reject) => {
		let request = new XMLHttpRequest ();
		request.open ('GET', url, true);

		request.onprogress = (event) => {
			onProgress (event.loaded, event.total);
		};

		request.onload = () => {
			if (request.status === 200) {
				resolve (request.response);
			} else {
				reject ();
			}
		};

		request.onerror = () => {
			reject ();
		};

		request.responseType = 'arraybuffer';
		request.send (null);
	});
}

export function ReadFile (file, onProgress)
{
	return new Promise ((resolve, reject) => {
		let reader = new FileReader ();

		reader.onprogress = (event) => {
			onProgress (event.loaded, event.total);
		};

		reader.onloadend = (event) => {
			if (event.target.readyState === FileReader.DONE) {
				resolve (event.target.result);
			}
		};

		reader.onerror = () => {
			reject ();
		};

		reader.readAsArrayBuffer (file);
	});
}

export function TransformFileHostUrls (urls)
{
    for (let i = 0; i < urls.length; i++) {
        let url = urls[i];
        if (url.search (/www\.dropbox\.com/u) !== -1) {
            url = url.replace ('www.dropbox.com', 'dl.dropbox.com');
            let separatorPos = url.indexOf ('?');
            if (separatorPos !== -1) {
                url = url.substring (0, separatorPos);
            }
            urls[i] = url;
        } else if (url.search (/github\.com/u) !== -1) {
            url = url.replace ('github.com', 'raw.githubusercontent.com');
            url = url.replace ('/blob', '');
            let separatorPos = url.indexOf ('?');
            if (separatorPos !== -1) {
                url = url.substring (0, separatorPos);
            }
            urls[i] = url;
        }
    }
}

export function IsUrl (str)
{
	const regex = /^https?:\/\/\S+$/g;
	const match = str.match (regex);
	return match !== null;
}

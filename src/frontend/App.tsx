import React, { FC, useEffect, useState } from 'react';

const useUploadFile = () => {
  const [result, setResult] = useState<any>()
  const [files, setFiles] = useState<any>();
  const data = new FormData();
  useEffect(() => {
    if (files) {
      data.append('file', files[0]);
      fetch('/api/files/', {
        method: 'POST',
        body: data
      }).then(r => r.json().then(a => setResult({success: a.success, slug: a.slug})));

    }
  }, [files]);
  return [result, setFiles];
};

export const App: FC = () => {
  const [file, setFile] = useState<any>();
  const [result, uploadFile] = useUploadFile();
  const location = window.location;

  return (
    <div>
      { result
        ? (
          <>
            <a href={`download/${result.slug}`}>{`${location}download/${result.slug}`}</a>
            <br/>
            <a href={`/`}>{'Zurück'}</a>
          </>
        )
        : (
          <form onSubmit={ e => {e.preventDefault(); uploadFile(file)} }>
            <input type="file" onChange={ (f) => setFile(f.target.files) } />
            <br/>
            <button>Upload</button>
          </form>
        )
      }
    </div>
  )
};

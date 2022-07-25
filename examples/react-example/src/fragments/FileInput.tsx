import { ChatAppContext } from '../providers/ChatAppProvider';
import React, { useContext, useState } from 'react';
import { Dropdown, FlexRow, Icons } from '@chatkitty/react-ui';

interface FileInputProps {
  file?: File;
}

const FileInput: React.FC<FileInputProps> = () => {
  const { sendFileMessage, setCurrentFile } = useContext(ChatAppContext);
  const [file, setFile] = useState<File | null>(null);

  const onChange = (file: React.ChangeEvent<HTMLInputElement>) => {
    const files = file.target.files;
    if (files) {
      setFile(files[0]);
    }
  };

  const sendFile = () => {
    if (file) {
      sendFileMessage(file);
    }
  };

  const addFile = () => {
    if (file) {
      setCurrentFile(file);
      setFile(null);
    }
  };

  return (
    <Dropdown
      icon={Icons.Add}
      title={''}
      render={() => {
        return (
          <div
            style={{
              position: 'absolute',
              border: '1px solid grey',
              width: '200px',
              height: '100px',
              bottom: '20px',
              left: '-150px',
              background: 'white',
              borderRadius: '5%',
            }}
          >
            <p
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '10px',
              }}
            >
              Press Button to Upload
            </p>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '10px',
                marginLeft: '10px',
                cursor: 'pointer',
              }}
            >
              <input type="file" onChange={(file) => onChange(file)} />
            </div>

            <FlexRow>
              <button
                style={{
                  marginLeft: '25%',
                  marginTop: '15px',
                }}
                onClick={sendFile}
              >
                Send
              </button>

              <button
                style={{
                  marginLeft: '2px',
                  marginTop: '15px',
                }}
                onClick={addFile}
              >
                Add
              </button>
            </FlexRow>
          </div>
        );
      }}
    />
  );
};

export default FileInput;

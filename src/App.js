import React, { useRef, useState, useCallback } from 'react';
import { Amplify, Storage } from 'aws-amplify';
import { useDropzone } from 'react-dropzone';
import awsconfig from './aws-exports';
import './App.css';
import ContainerInfoTable from './ContainerInfoTable';
import DataInfoConfidence from './DataInfoConfidence';
import detectText from "./rekognition";
import Webcam from 'react-webcam';

Amplify.configure(awsconfig);

function App() {
  const [previewUrl, setPreviewUrl] = useState('');
  const [detectedTexts, setDetectedTexts] = useState([]);
  const [containerData, setContainerData] = useState({
    owner: '', ownerConfidence: '',
    type: '', typeConfidence: '',
    id: '', idConfidence: '',
    verifier: '', verifierConfidence: '',
    isoType: '', isoTypeConfidence: ''
  });
  const [error, setError] = useState('');
  const webcamRef = useRef(null);
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);

  const processDetectedText = (result) => {
    const { extractedData, textResults } = result;

    if (!extractedData.containerOwner && textResults.length === 0) {
      setError("Error: No se detectó un código de contenedor válido.");
      return;
    }

    setContainerData({
      owner: extractedData.containerOwner || '',
      ownerConfidence: extractedData.containerOwnerConfidence || '',
      type: extractedData.containerType || '',
      typeConfidence: extractedData.containerTypeConfidence || '',
      id: extractedData.id || '',
      idConfidence: extractedData.idConfidence || '',
      verifier: extractedData.verifier || '',
      verifierConfidence: extractedData.verifierConfidence || '',
      isoType: extractedData.isoType || '',
      isoTypeConfidence: extractedData.isoTypeConfidence || ''
    });

    setDetectedTexts(textResults);
    setError('');
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];

    if (file) {
      const fileName = file.name;
      setPreviewUrl(URL.createObjectURL(file));

      try {
        await Storage.put(fileName, file, { contentType: file.type, level: 'public' });
        const detectedTextResults = await detectText(fileName);
        processDetectedText(detectedTextResults);
      } catch (err) {
        console.error('Error al subir el archivo:', err);
      }
    }
  }, []);

  const openWebcamModal = () => setIsWebcamOpen(true);

  const closeWebcamModal = () => {
    setIsWebcamOpen(false);
    if (webcamRef.current?.video?.srcObject) {
      webcamRef.current.video.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  const capturePhoto = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setPreviewUrl(imageSrc);
      const fileName = `photo-${Date.now()}.jpg`;

      try {
        const response = await fetch(imageSrc);
        const blob = await response.blob();
        await Storage.put(fileName, blob, { contentType: 'image/jpeg', level: 'public' });

        const detectedTextResults = await detectText(fileName);
        processDetectedText(detectedTextResults);
      } catch (err) {
        console.error('Error al subir la foto:', err);
      }

      closeWebcamModal();
    }
  };

  const videoConstraints = { facingMode: 'environment' };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: 'image/*' });

  return (
    <div className="App">
      <div className="upload-container">
        <div className="preview-section">
          <div className="preview-area">
            {previewUrl ? <img src={previewUrl} alt="Preview" className="preview-image" /> : <div className="placeholder-image">🖼️</div>}
          </div>
          <div className="center-container">
            <div className="upload-section">
              <div {...getRootProps({ className: 'dropzone' })}>
                <input {...getInputProps()} />
                {isDragActive ? <p>Arrastre la imagen aquí ...</p> : <button className="choose-file-btn">Seleccione una imagen</button>}
              </div>
            </div>
            <button className="open-webcam-btn" onClick={openWebcamModal}>Abrir Cámara</button>
          </div>
        </div>
        <div className="table-section">
          <h1>Información del Contenedor</h1>
          {error && <p className="error-message">{error}</p>}
          <ContainerInfoTable containerData={containerData} />
          <DataInfoConfidence containerData={detectedTexts} />
        </div>
      </div>
      <div className={`modal ${isWebcamOpen ? 'show' : ''}`}>
        <div className="modal-content">
          {isWebcamOpen && (
            <Webcam
              className="modal-content-inside"
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
            />
          )}
          <button className="open-webcam-btn" onClick={capturePhoto}>Tomar Foto</button>
          <button className="close-modal-btn" onClick={closeWebcamModal}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

export default App;

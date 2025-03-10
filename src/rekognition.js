import { Amplify, Auth } from 'aws-amplify';
import { RekognitionClient, DetectTextCommand } from '@aws-sdk/client-rekognition';
import awsconfig from './aws-exports';

Amplify.configure(awsconfig);

async function createRekognitionClient() {
    const credentials = await Auth.currentCredentials();
    return new RekognitionClient({
        region: 'us-east-2',
        credentials: {
            accessKeyId: credentials.accessKeyId,
            secretAccessKey: credentials.secretAccessKey,
            sessionToken: credentials.sessionToken,
        },
    });
}

async function detectText(photo) {
    try {
        const params = {
            Image: {
                S3Object: {
                    Bucket: 'examplebucket2s',
                    Name: `public/${photo}`,
                },
            },
        };

        const client = await createRekognitionClient();
        const command = new DetectTextCommand(params);
        const response = await client.send(command);
        console.log("response ", response)

        let extractedData = {
            containerOwner: [],
            containerType: [],
            id: [],
            verifier: [],
            isoType: []
        };

        let confidenceData = {
            containerOwner: {},
            containerType: {},
            id: {},
            verifier: {},
            isoType: {}
        };

        let textResults = [];
        let textCount = 0;
        console.log("response text", response.TextDetections)
        const filteredDetections = response.TextDetections.filter(text => text.Confidence >= 50);
        console.log("filteredDetections ", filteredDetections);

        filteredDetections.forEach(text => {
            const detectedText = text.DetectedText.replace(/\s+/g, '').toUpperCase();
            const confidence = text.Confidence.toFixed(2);

            if (/^[A-Z]{4}$/.test(detectedText) && detectedText.endsWith('U')) {
                const owner = detectedText.slice(0, 3);
                if (!extractedData.containerOwner.includes(owner)) {
                    extractedData.containerOwner.push(owner);
                    confidenceData.containerOwner[owner] = confidence;
                }
                if (!extractedData.containerType.includes('U')) {
                    extractedData.containerType.push('U');
                    confidenceData.containerType['U'] = confidence;
                }
            }

            else if (/^\d{2}[A-Z]{2}$|^\d{2}[A-Z]\d$|^\d{4}$/.test(detectedText)){
                if (!extractedData.isoType.includes(detectedText)) {
                    extractedData.isoType.push(detectedText);
                    confidenceData.isoType[detectedText] = confidence;
                }
            }

            else if (/^\d{6}$/.test(detectedText)) {
                if (!extractedData.id.includes(detectedText)) {
                    extractedData.id.push(detectedText);
                    confidenceData.id[detectedText] = confidence;
                }
            }
            else if (/^\d{1}$/.test(detectedText)) {
                if (!extractedData.verifier.includes(detectedText)) {
                    extractedData.verifier.push(detectedText);
                    confidenceData.verifier[detectedText] = confidence;
                }
            }

            if (text.Type === "WORD" && textCount < 5) {
                textResults.push({ text: detectedText, confidence });
                textCount++;
            }
        });

        filteredDetections.forEach(text => {
            if (text.Type === "LINE") {
                const detectedText = text.DetectedText.toUpperCase();
                const confidence = text.Confidence.toFixed(2);

                const idVerifierMatch = detectedText.match(/(\d{6})(\d{1})/);
                if (idVerifierMatch) {
                    const id = idVerifierMatch[1];
                    const verifier = idVerifierMatch[2];
                    
                    if (!extractedData.id.includes(id)) {
                        extractedData.id.push(id);
                        confidenceData.id[id] = confidence;
                    }
                    
                    if (!extractedData.verifier.includes(verifier)) {
                        extractedData.verifier.push(verifier);
                        confidenceData.verifier[verifier] = confidence;
                    }
                }

                const containerMatch = detectedText.match(/([A-Z]{3})U/);
                if (containerMatch) {
                    const owner = containerMatch[1];
                    
                    if (!extractedData.containerOwner.includes(owner)) {
                        extractedData.containerOwner.push(owner);
                        confidenceData.containerOwner[owner] = confidence;
                    }
                    
                    if (!extractedData.containerType.includes('U')) {
                        extractedData.containerType.push('U');
                        confidenceData.containerType['U'] = confidence;
                    }
                }

                const combinedPattern = /(\d{6})(\d{1})\s+([A-Z]{3})U/i;
                const combinedMatch = detectedText.match(combinedPattern);
                if (combinedMatch) {
                    const id = combinedMatch[1];
                    const verifier = combinedMatch[2];
                    const owner = combinedMatch[3];
                    
                    if (!extractedData.id.includes(id)) {
                        extractedData.id.push(id);
                        confidenceData.id[id] = confidence;
                    }
                    
                    if (!extractedData.verifier.includes(verifier)) {
                        extractedData.verifier.push(verifier);
                        confidenceData.verifier[verifier] = confidence;
                    }
                    
                    if (!extractedData.containerOwner.includes(owner)) {
                        extractedData.containerOwner.push(owner);
                        confidenceData.containerOwner[owner] = confidence;
                    }
                    
                    if (!extractedData.containerType.includes('U')) {
                        extractedData.containerType.push('U');
                        confidenceData.containerType['U'] = confidence;
                    }
                }
            }
        });

        return { 
            extractedData,
            confidenceData,
            textResults 
        };

    } catch (err) {
        console.error('Error detecting text:', err);
        return { 
            extractedData: {
                containerOwner: [],
                containerType: [],
                id: [],
                verifier: [],
                isoType: []
            }, 
            confidenceData: {
                containerOwner: {},
                containerType: {},
                id: {},
                verifier: {},
                isoType: {}
            },
            textResults: [] 
        };
    }
}

export default detectText;
import { create } from 'ipfs-http-client';
import { readFileSync, readdirSync } from 'fs';
import path from 'path';

// Initialize IPFS client (you can use Infura IPFS or local IPFS)
const client = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: `Basic ${Buffer.from('YOUR_INFURA_PROJECT_ID:YOUR_INFURA_PROJECT_SECRET').toString('base64')}`
  }
});

async function uploadMetadataToIPFS() {
  try {
    console.log('🚀 Starting IPFS metadata upload...\n');

    const metadataDir = './metadata';
    const files = readdirSync(metadataDir).filter(file => file.endsWith('.json'));
    
    const uploadedFiles = [];

    for (const file of files) {
      const filePath = path.join(metadataDir, file);
      const fileContent = readFileSync(filePath, 'utf8');
      
      console.log(`📤 Uploading ${file}...`);
      
      const result = await client.add(fileContent);
      const ipfsHash = result.cid.toString();
      
      console.log(`✅ ${file} uploaded: https://ipfs.io/ipfs/${ipfsHash}`);
      
      uploadedFiles.push({
        fileName: file,
        tokenId: file.replace('.json', ''),
        ipfsHash: ipfsHash,
        url: `https://ipfs.io/ipfs/${ipfsHash}`
      });
    }

    console.log('\n📋 Upload Summary:');
    console.log('='.repeat(50));
    
    uploadedFiles.forEach(({ fileName, tokenId, ipfsHash, url }) => {
      console.log(`Token ${tokenId}: ${fileName}`);
      console.log(`IPFS Hash: ${ipfsHash}`);
      console.log(`URL: ${url}`);
      console.log('');
    });

    // Generate the base URI for the contract
    const baseURI = `https://ipfs.io/ipfs/`; // You'll need to update this with your actual IPFS folder hash
    
    console.log('🔧 Contract Configuration:');
    console.log(`Base URI: ${baseURI}`);
    console.log('\n⚠️  IMPORTANT: Update your contract baseURI with:');
    console.log(`await contract.setBaseURI("${baseURI}");`);

    return uploadedFiles;

  } catch (error) {
    console.error('❌ Upload failed:', error);
    throw error;
  }
}

// Alternative using Pinata (recommended for production)
async function uploadToPinata() {
  const PINATA_API_KEY = process.env.PINATA_API_KEY;
  const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

  if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
    throw new Error('Pinata API keys not found in environment variables');
  }

  try {
    console.log('🚀 Starting Pinata upload...\n');

    const metadataDir = './metadata';
    const files = readdirSync(metadataDir).filter(file => file.endsWith('.json'));
    
    const uploadedFiles = [];

    for (const file of files) {
      const filePath = path.join(metadataDir, file);
      const fileContent = readFileSync(filePath, 'utf8');
      
      const formData = new FormData();
      const blob = new Blob([fileContent], { type: 'application/json' });
      formData.append('file', blob, file);

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_API_KEY,
        },
        body: formData,
      });

      const result = await response.json();
      
      if (result.IpfsHash) {
        console.log(`✅ ${file} uploaded: https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`);
        
        uploadedFiles.push({
          fileName: file,
          tokenId: file.replace('.json', ''),
          ipfsHash: result.IpfsHash,
          url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
        });
      } else {
        throw new Error(`Failed to upload ${file}: ${result.error}`);
      }
    }

    console.log('\n📋 Pinata Upload Summary:');
    console.log('='.repeat(50));
    
    uploadedFiles.forEach(({ fileName, tokenId, ipfsHash, url }) => {
      console.log(`Token ${tokenId}: ${fileName}`);
      console.log(`IPFS Hash: ${ipfsHash}`);
      console.log(`URL: ${url}`);
      console.log('');
    });

    return uploadedFiles;

  } catch (error) {
    console.error('❌ Pinata upload failed:', error);
    throw error;
  }
}

// Run the upload
if (require.main === module) {
  // Choose your upload method:
  // uploadMetadataToIPFS();  // Using Infura IPFS
  uploadToPinata();           // Using Pinata (recommended)
}

export { uploadMetadataToIPFS, uploadToPinata };

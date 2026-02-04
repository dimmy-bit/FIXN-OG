import { PinataSDK } from "pinata-web3";

// Initialize Pinata SDK with environment variables
const pinata = new PinataSDK({
    pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT!,
    pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY || "gateway.pinata.cloud",
});


export async function uploadNFTMetadata(
    name: string,
    description: string,
    imageFile: File,
    attributes: Array<{ trait_type: string; value: string | number }>
) {
    if (!process.env.NEXT_PUBLIC_PINATA_JWT) {
        throw new Error("Pinata JWT not found. Please add NEXT_PUBLIC_PINATA_JWT to your .env.local file");
    }

    try {
        console.log("Uploading image to Pinata...");
        // Upload image to IPFS
        const imageUpload = await pinata.upload.file(imageFile);
        const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageUpload.IpfsHash}`;
        console.log("Image uploaded:", imageUpload.IpfsHash);

        console.log("Uploading metadata to Pinata...");
        // Create metadata JSON
        const metadata = {
            name,
            description,
            image: imageUrl,
            attributes,
        };

        // Upload metadata JSON to IPFS
        const metadataBlob = new Blob([JSON.stringify(metadata)], {
            type: "application/json",
        });
        const metadataFile = new File([metadataBlob], "metadata.json");
        const metadataUpload = await pinata.upload.file(metadataFile);

        console.log("Metadata uploaded:", metadataUpload.IpfsHash);

        return {
            imageHash: imageUpload.IpfsHash,
            metadataHash: metadataUpload.IpfsHash,
            metadataUrl: `https://gateway.pinata.cloud/ipfs/${metadataUpload.IpfsHash}`,
        };
    } catch (error) {
        console.error("Error uploading to Pinata:", error);
        throw new Error(`Pinata upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function uploadJSONToIPFS(jsonData: object) {
    if (!process.env.NEXT_PUBLIC_PINATA_JWT) {
        throw new Error("Pinata JWT not found. Please add NEXT_PUBLIC_PINATA_JWT to your .env.local file");
    }

    try {
        const blob = new Blob([JSON.stringify(jsonData)], {
            type: "application/json",
        });
        const file = new File([blob], "data.json");
        const upload = await pinata.upload.file(file);

        return {
            hash: upload.IpfsHash,
            url: `https://gateway.pinata.cloud/ipfs/${upload.IpfsHash}`,
        };
    } catch (error) {
        console.error("Error uploading JSON to Pinata:", error);
        throw new Error(`Pinata upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function uploadImageToIPFS(imageFile: File) {
    if (!process.env.NEXT_PUBLIC_PINATA_JWT) {
        throw new Error("Pinata JWT not found. Please add NEXT_PUBLIC_PINATA_JWT to your .env.local file");
    }

    try {
        const upload = await pinata.upload.file(imageFile);
        return {
            hash: upload.IpfsHash,
            url: `https://gateway.pinata.cloud/ipfs/${upload.IpfsHash}`,
        };
    } catch (error) {
        console.error("Error uploading image to Pinata:", error);
        throw new Error(`Pinata upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const { ethers } = hre;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function updateFrontendEnv(address) {
    const repoRoot = path.resolve(__dirname, "..", "..");
    const envPath = path.join(repoRoot, "frontend", ".env.local");

    let env = "";
    if (fs.existsSync(envPath)) {
        env = fs.readFileSync(envPath, "utf8");
        env = env.replace(/^NEXT_PUBLIC_CONTRACT_ADDRESS=.*$/m, "").trim();
        if (env.length > 0 && !env.endsWith("\n")) {
            env += "\n";
        }
    }

    env += `NEXT_PUBLIC_CONTRACT_ADDRESS=${address}\n`;
    fs.writeFileSync(envPath, env, "utf8");
    console.log("? Updated frontend/.env.local with contract address");
}

async function exportAbi() {
    const artifact = await hre.artifacts.readArtifact("contracts/FhenixOGNFT.sol:FhenixOGNFT");
    const repoRoot = path.resolve(__dirname, "..", "..");
    const outDir = path.join(repoRoot, "frontend", "src", "lib", "abi");
    const outFile = path.join(outDir, "FhenixOGNFT.json");

    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(outFile, JSON.stringify(artifact.abi, null, 2));
    console.log(`? ABI exported to ${outFile}`);
}

async function main() {
    console.log("?? Deploying FhenixOGNFT to Sepolia...\n");

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH");

    // Contract parameters
    const name = "FIXN OG";
    const symbol = "FXOG";
    const baseURI = "";

    // Deploy contract
    const FhenixOGNFT = await ethers.getContractFactory("contracts/FhenixOGNFT.sol:FhenixOGNFT");
    const nft = await FhenixOGNFT.deploy(name, symbol, baseURI);

    await nft.waitForDeployment();

    const contractAddress = await nft.getAddress();
    console.log("\n? FhenixOGNFT deployed to:", contractAddress);
    console.log("?? Name:", name);
    console.log("?? Symbol:", symbol);
    console.log("?? Base URI:", baseURI || "(empty)");

    // Wait for block confirmations
    console.log("\n? Waiting for block confirmations...");
    const deployTx = nft.deploymentTransaction();
    if (deployTx) {
        await deployTx.wait(5);
    }

    // Export ABI and update frontend env
    await exportAbi();
    updateFrontendEnv(contractAddress);

    // Verify contract on Etherscan (if API key is available)
    console.log("\n?? To verify contract on Etherscan, run:");
    console.log(`npx hardhat verify --network eth-sepolia ${contractAddress} "${name}" "${symbol}" "${baseURI}"`);

    console.log("\n?? Deployment complete!");
    console.log("\nNext steps:");
    console.log("1. Upload NFT metadata to IPFS (Pinata)");
    console.log("2. Update the baseURI in the contract using setBaseURI()");
    console.log("3. Restart frontend dev server to pick up new env");
    console.log("4. Test the minting functionality");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

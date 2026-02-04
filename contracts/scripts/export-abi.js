import fs from "fs";
import path from "path";
import hre from "hardhat";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function exportAbi() {
    const artifact = await hre.artifacts.readArtifact("contracts/FhenixOGNFT.sol:FhenixOGNFT");
    const repoRoot = path.resolve(__dirname, "..", "..");
    const outDir = path.join(repoRoot, "frontend", "src", "lib", "abi");
    const outFile = path.join(outDir, "FhenixOGNFT.json");

    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(outFile, JSON.stringify(artifact.abi, null, 2));
    console.log(`? ABI exported to ${outFile}`);
}

exportAbi().catch((err) => {
    console.error(err);
    process.exit(1);
});

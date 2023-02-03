import { AssemblerConfig } from "../../types";
import { Metaplex, MetaplexFile } from "@metaplex-foundation/js";
export declare function setupAssembler(mx: Metaplex, config: AssemblerConfig, updateConfig: (cfg: AssemblerConfig) => void): Promise<AssemblerConfig>;
export declare function uploadFiles(mx: Metaplex, config: AssemblerConfig, updateConfig: (cfg: AssemblerConfig) => void, readFile: (path: string) => Promise<MetaplexFile>): Promise<AssemblerConfig>;

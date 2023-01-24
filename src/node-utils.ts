import path from "path";
import fs from "fs";

import { AssemblerConfig } from "./types";


export const readConfigFile = (configFile: string): AssemblerConfig => {
    const configPath = path.join(process.cwd(), configFile);
    return JSON.parse(fs.readFileSync(configPath).toString());
};

export const saveConfigFile = (
    configFile: AssemblerConfig,
    configFileName: string
): void => {
    const configPath = path.join(process.cwd(), configFileName);
    fs.writeFileSync(configPath, JSON.stringify(configFile, null, 2));
};

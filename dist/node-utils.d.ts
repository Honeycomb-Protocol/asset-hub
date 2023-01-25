import { AssemblerConfig } from "./types";
export declare const readConfigFile: (configFile: string) => AssemblerConfig | any;
export declare const saveConfigFile: (configFile: AssemblerConfig, configFileName: string) => void;

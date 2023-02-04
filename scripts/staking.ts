import * as web3 from "@solana/web3.js";
import { StakingProgramAction } from "./types";
import { getDependencies } from "./utils";
import {
  claimRewards,
  createStakingProject,
  fundRewards,
  stake,
  unstake,
} from "../src";

export default async function (
  action: StakingProgramAction,
  network: "mainnet" | "devnet" = "devnet",
  ...args: string[]
) {
  const { deployments, mx, setDeployments } = getDependencies(
    network,
    "staking"
  );
  console.log(deployments);
  switch (action) {
    case "create-project":
      const createProjectCtx = await createStakingProject(
        mx,
        new web3.PublicKey(args[0]),
        {
          name: "Test",
          rewardsPerSecond: 100000000,
          startTime: 0,
        },
        [new web3.PublicKey(args[1])]
      );
      console.log("Tx:", createProjectCtx.response.signature);
      console.log("Project: ", createProjectCtx.project.toString());
      setDeployments({
        ...deployments,
        project: createProjectCtx.project,
      });
      break;

    case "stake":
      const stakeCtx = await stake(
        mx,
        new web3.PublicKey(deployments.project),
        new web3.PublicKey(args[0])
      );
      console.log("Tx:", stakeCtx.response.signature);
      break;

    case "unstake":
      const unstakeCtx = await unstake(
        mx,
        new web3.PublicKey(deployments.project),
        new web3.PublicKey(args[0])
      );
      console.log("Tx:", unstakeCtx.response.signature);
      break;

    case "fund-rewards":
      const fundRewardsCtx = await fundRewards(
        mx,
        new web3.PublicKey(deployments.project),
        parseInt(args[0]) * 1000000000
      );
      console.log("Tx:", fundRewardsCtx.response.signature);
      break;

    case "claim-rewards":
      const claimRewardsCtx = await claimRewards(
        mx,
        new web3.PublicKey(deployments.project),
        new web3.PublicKey(args[0])
      );
      console.log("Tx:", claimRewardsCtx.response.signature);
      break;

    default:
      throw new Error("Invalid Asset manager program action");
  }
}

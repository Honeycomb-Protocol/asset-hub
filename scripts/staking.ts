import * as web3 from "@solana/web3.js";
import { StakingProgramAction } from "./types";
import { getDependencies } from "./utils";
import {
  claimRewards,
  createStakingProject,
  fundRewards,
  LockType,
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
          rewardsPerDuration: 1000000000,
          rewardsDuration: 1,
          maxRewardsDuration: 20,
          minStakeDuration: 60 * 1,
          cooldownDuration: 60 * 2,
          resetStakeDuration: false,
          startTime: Date.now() * 1000,
          endTime: Date.now() * 1000 + 3600 * 24,
          lockType: LockType.Custoday,
        },
        undefined,
        [new web3.PublicKey(args[1])],
        [
          {
            multiplierType: {
              __kind: "StakeDuration",
              minDuration: 60 * 2,
            },
            value: 10000,
          },
          {
            multiplierType: {
              __kind: "NFTCount",
              minCount: 1,
            },
            value: 100000,
          },
        ],
        3
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
      throw new Error("Invalid Staking program action");
  }
}

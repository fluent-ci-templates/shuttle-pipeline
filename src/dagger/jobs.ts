/**
 * @module shuttle
 * @description Deploy Rust applications to Shuttle
 */

import { Directory, Secret, dag, env, exit } from "../../deps.ts";
import { getDirectory, getApiKey } from "./lib.ts";

export enum Job {
  deploy = "deploy",
}

export const exclude = ["target", ".git", ".fluentci"];

/**
 * Deploy to Shuttle
 *
 * @function
 * @description Deploy to Shuttle
 * @param {string | Directory | undefined} src
 * @param {string | Secret} apiKey
 * @returns {string}
 */
export async function deploy(
  src: string | Directory | undefined = ".",
  apiKey?: string | Secret,
  shuttleVersion = "v0.39.0"
): Promise<string> {
  const context = await getDirectory(src);
  const secret = await getApiKey(apiKey);

  if (!secret) {
    console.error("Missing SHUTTLE_API_KEY");
    exit(1);
    return "";
  }

  const VERSION = shuttleVersion || env.get("SHUTTLE_VERSION");

  const ctr = dag
    .pipeline(Job.deploy)
    .container()
    .from("rust:1.76-bookworm")
    .withExec(["apt", "update"])
    .withExec(["apt", "install", "-y", "build-essential"])
    .withMountedCache(
      "/usr/local/cargo/registry",
      dag.cacheVolume("cargo-registry")
    )
    .withExec([
      "wget",
      `https://github.com/shuttle-hq/shuttle/releases/download/${VERSION}/cargo-shuttle-${VERSION}-x86_64-unknown-linux-gnu.tar.gz`,
    ])
    .withExec([
      "tar",
      "xvf",
      `cargo-shuttle-${VERSION}-x86_64-unknown-linux-gnu.tar.gz`,
    ])
    .withExec([
      "mv",
      `cargo-shuttle-x86_64-unknown-linux-gnu-${VERSION}/cargo-shuttle`,
      "/usr/local/cargo/bin",
    ])
    .withSecretVariable("SHUTTLE_API_KEY", secret)
    .withMountedCache("/app/target", dag.cacheVolume("cargo-target"))
    .withDirectory("/app", context, { exclude })
    .withWorkdir("/app")
    .withExec(["sh", "-c", "cargo shuttle login --api-key $SHUTTLE_API_KEY"])
    .withExec(["cargo", "shuttle", "deploy"]);

  return ctr.stdout();
}

export type JobExec = (
  src?: string,
  apiKey?: string,
  shuttleVersion?: string
) => Promise<string>;

export const runnableJobs: Record<Job, JobExec> = {
  [Job.deploy]: deploy,
};

export const jobDescriptions: Record<Job, string> = {
  [Job.deploy]: "Deploy the application to Shuttle",
};

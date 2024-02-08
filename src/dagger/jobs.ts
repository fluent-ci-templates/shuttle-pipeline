import { Directory, Secret, dag } from "../../deps.ts";
import { getDirectory, getApiKey } from "./lib.ts";

export enum Job {
  deploy = "deploy",
}

export const exclude = ["target", ".git", ".fluentci"];

/**
 * @function
 * @description Deploy the application to Shuttle
 * @param {string | Directory | undefined} src
 * @param {string | Secret} apiKey
 * @returns {string}
 */
export async function deploy(
  src: string | Directory | undefined = ".",
  apiKey?: string | Secret,
  shuttleVersion = "v0.37.0"
): Promise<string> {
  const context = await getDirectory(dag, src);
  const secret = await getApiKey(dag, apiKey);

  if (!secret) {
    console.error("Missing SHUTTLE_API_KEY");
    Deno.exit(1);
  }

  const VERSION = shuttleVersion || Deno.env.get("SHUTTLE_VERSION");

  const ctr = dag
    .pipeline(Job.deploy)
    .container()
    .from("rust:1.75-bookworm")
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

  const result = await ctr.stdout();

  return result;
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

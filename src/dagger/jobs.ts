import Client from "@dagger.io/dagger";

export enum Job {
  deploy = "deploy",
}

export const deploy = async (client: Client, src = ".") => {
  if (!Deno.env.get("SHUTTLE_API_KEY")) {
    console.log("SHUTTLE_API_KEY is not set");
    Deno.exit(1);
  }

  const context = client.host().directory(src);
  const ctr = client
    .pipeline(Job.deploy)
    .container()
    .from("rust:1.71-bookworm")
    .withExec(["apt", "update"])
    .withExec(["apt", "install", "-y", "build-essential"])
    .withExec(["cargo", "install", "cargo-shuttle"])
    .withMountedCache(
      "/usr/local/cargo/registry",
      client.cacheVolume("cargo-registry")
    )
    .withEnvVariable("SHUTTLE_API_KEY", Deno.env.get("SHUTTLE_API_KEY")!)
    .withMountedCache("/app/target", client.cacheVolume("cargo-target"))
    .withDirectory("/app", context, {
      exclude: ["target", ".git", ".fluentci"],
    })
    .withWorkdir("/app")
    .withExec(["sh", "-c", "cargo shuttle login --api-key $SHUTTLE_API_KEY"])
    .withExec(["cargo", "shuttle", "deploy"]);

  const result = await ctr.stdout();

  console.log(result);
};

export type JobExec = (
  client: Client,
  src?: string
) =>
  | Promise<void>
  | ((
      client: Client,
      src?: string,
      options?: {
        ignore: string[];
      }
    ) => Promise<void>);

export const runnableJobs: Record<Job, JobExec> = {
  [Job.deploy]: deploy,
};

export const jobDescriptions: Record<Job, string> = {
  [Job.deploy]: "Deploy the application to Shuttle",
};

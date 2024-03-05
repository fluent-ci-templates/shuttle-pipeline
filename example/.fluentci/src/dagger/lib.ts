import {
  dag,
  env,
  Directory,
  DirectoryID,
  Secret,
  SecretID,
} from "../../deps.ts";

export const getDirectory = async (
  src: string | Directory | undefined = "."
) => {
  if (src instanceof Directory) {
    return src;
  }
  if (typeof src === "string") {
    try {
      const directory = dag.loadDirectoryFromID(src as DirectoryID);
      await directory.id();
      return directory;
    } catch (_) {
      return dag.host
        ? dag.host().directory(src)
        : dag.currentModule().source().directory(src);
    }
  }
  return dag.host
    ? dag.host().directory(src)
    : dag.currentModule().source().directory(src);
};

export const getApiKey = async (apiKey?: string | Secret) => {
  if (env.get("SHUTTLE_API_KEY")) {
    return dag.setSecret("SHUTTLE_API_KEY", env.get("SHUTTLE_API_KEY")!);
  }
  if (apiKey && typeof apiKey === "string") {
    try {
      const secret = dag.loadSecretFromID(apiKey as SecretID);
      await secret.id();
      return secret;
    } catch (_) {
      return dag.setSecret("SHUTTLE_API_KEY", apiKey);
    }
  }
  if (apiKey && apiKey instanceof Secret) {
    return apiKey;
  }
  return undefined;
};

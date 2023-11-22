import {
  queryType,
  makeSchema,
  dirname,
  join,
  resolve,
  stringArg,
  nonNull,
} from "../../deps.ts";

import { deploy } from "./jobs.ts";

const Query = queryType({
  definition(t) {
    t.string("deploy", {
      args: {
        src: nonNull(stringArg()),
        apiKey: nonNull(stringArg()),
      },
      resolve: async (_root, args, _ctx) => await deploy(args.src, args.apiKey),
    });
  },
});

const schema = makeSchema({
  types: [Query],
  outputs: {
    schema: resolve(join(dirname(".."), dirname(".."), "schema.graphql")),
    typegen: resolve(join(dirname(".."), dirname(".."), "gen", "nexus.ts")),
  },
});

schema.description = JSON.stringify({
  "deploy.src": "directory",
  "deploy.apiKey": "secret",
});

export { schema };

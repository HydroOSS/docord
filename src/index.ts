import { PathLike, writeFile, WriteFileOptions, exists, mkdir } from "fs";
import * as path from "path";

/** A command's permission requirement. */
enum Permission {
  Public,
  Staff,
  Maintainer,
  Disabled,
}

/** A generic command entry that the docs will be based on. */
interface Command {
  description: string;
  usage: string;
  aliases: string[];
  perm: Permission;
  disableable: boolean;
}

/** A documentation generator instance. */
export class Docord {
  /**
   * @param commands  The map of command names to [[Command]]s to generate docs for.
   * @param outDir  The path to the directory to write the docs to.
   */
  constructor(private commands: Map<string, Command>, private outDir: PathLike) {}

  /** Generates the documentation and writes the output to [[outDir]]. */
  public async generate() {
    const promises: Promise<PathLike>[] = [];

    // Make sure to create the directory if it exists.
    if (!(await Docord.existsAsync(this.outDir))) await Docord.mkdirAsync(this.outDir);

    this.commands.forEach((c, name) => {
      promises.push(
        new Promise((resolve, reject) => {
          const content = `# ${name}

${c.description}
          
| Usage                  | Aliases                                      | Permission                      |
|------------------------|----------------------------------------------|---------------------------------|
| \`${c.usage || name}\` | ${c.aliases ? c.aliases.join(", ") : "None"} | ${Permission[c.perm] || "None"} |`;

          // Write to the out file. Resolve if this is a success; reject if writing threw an error.
          Docord.writeFileAsync(path.join(this.outDir as string, name + ".md"), content)
            .then(resolve)
            .catch(reject);
        })
      );
    });

    return Promise.all(promises);
  }

  /**
   * @internal An asynchronous wrapper over fs.writeFile.
   * @param path  The path of the file to write to.
   * @param data  The content to write to the file.
   * @param options  The optional mode and flags to use when writing the file.
   */
  private static async writeFileAsync(
    path: PathLike,
    data: NodeJS.ArrayBufferView | string,
    options?: WriteFileOptions
  ): Promise<PathLike> {
    return new Promise((resolve, reject) => {
      writeFile(path, data, options, (err) => {
        if (err) return reject(err);
        resolve(path);
      });
    });
  }

  /**
   * @internal An asynchronous wrapper over fs.exists.
   * @param path  The path of the file/dir to check exists.
   */
  private static async existsAsync(path: PathLike): Promise<boolean> {
    return new Promise((resolve) => {
      exists(path, resolve);
    });
  }

  /**
   * @internal An asynchronous wrapper over fs.mkdir.
   * @param path  The path of the dir to create.
   */
  private static async mkdirAsync(path: PathLike): Promise<PathLike> {
    return new Promise((resolve, reject) => {
      mkdir(path, (err) => {
        if (err) return reject(err);
        resolve(path);
      });
    });
  }
}

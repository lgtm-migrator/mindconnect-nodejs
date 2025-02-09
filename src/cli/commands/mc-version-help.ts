import { Command } from "commander";
import { log } from "console";
import { MC_VERSION } from "../../version";
import { checkForUpdates, getColor } from "./command-utils";

const magenta = getColor("magenta");
const cyan = getColor("cyan");
const green = getColor("green");
const red = getColor("red");
const blue = getColor("blue");
const yellow = getColor("yellow");

export default (program: Command) => {
    program.version(`MindSphere CLI (mc, mdsp) - Version: ${MC_VERSION}`);

    program.on("--help", () => {
        log(`\n  Documentation:\n`);
        log(
            `    the ${magenta(
                "magenta colored commands *"
            )} use app or service credentials or borrowed mindsphere cookies`
        );
        log(`    the ${cyan("cyan colored commands ")}require mindconnectlib (agent) credentials`);
        log(`    the ${blue("blue colored commands @")} use analytical functions of MindSphere`);
        log(`    the ${green("green colored commands #")} are used as setup and utility commands`);
        log(`    the ${yellow("yellow colored commands &")} use borrowed mindsphere application cookies`);
        log(`    the credentials and cookies should only be used in secure environments`);
        log(`    Full documentation: ${cyan("https://opensource.mindsphere.io")}\n`);

        checkForUpdates();
    });

    program.on("command:*", function () {
        console.error(red(`Invalid command: ${program.args.join(" ")}`));
        console.error("Use mdsp --help for a list of available commands");
        process.exit(1);
    });
};

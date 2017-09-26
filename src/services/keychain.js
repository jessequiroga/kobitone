import { prompt } from "inquirer";

import { execAsync } from "./process";

async function getJiraToken() {
  let token;
  const defaultKeychain = await getDefaultKeychain();

  try {
    const [stdout, stderr] = await execAsync(
      `security find-generic-password -s JIRA -g ${defaultKeychain}`
    );

    const username = /"acct"<blob>="(.*)"/g.exec(stdout.trim())[1];
    const password = /password: "(.*)"/g.exec(stderr.trim())[1];

    token = Buffer.from(`${username}:${password}`).toString("base64");
  } catch (err) {
    console.log(
      "JIRA account does not exist, please input your account (This will be stored in your machine keychain)"
    );

    const { username } = await prompt({
      type: "input",
      name: "username",
      message: "Username"
    });
    const { password } = await prompt({
      type: "password",
      name: "password",
      message: "Password"
    });

    await execAsync(
      `security add-generic-password -s JIRA -a ${username} -w ${password} ${defaultKeychain}`
    );

    console.log("Your JIRA account added successfully");

    token = Buffer.from(`${username}:${password}`).toString("base64");
  }

  return token;
}

async function getDefaultKeychain() {
  const [stdout] = await execAsync("security default-keychain");
  const defaultKeychain = stdout.replace(/['"]+/g, "").trim();

  console.log("Default keychain", defaultKeychain);

  return defaultKeychain;
}

export { getJiraToken };

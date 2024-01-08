#!/usr/bin/env node

const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const { program } = require("commander");

const sites = [];
const delayInSeconds = 3;

(async () => {
  program
    .option('-n, --name <string>', 'your user in GitHub');

  program.parse(process.argv);

  const options = program.opts();

  const browser = await puppeteer.launch({ headless: "new" });

  const fetchprojects = async (sites) => {
    try {
      const response = await fetch(`https://api.github.com/users/${options.name}/repos`);

      const repos = await response.json();

      repos
        .filter(
          (repo) =>
            repo.homepage &&
            repo.homepage !== "" &&
            repo.homepage !== `https://github.com/${options.name}`
        )
        .map((repo) => {
          sites.push(repo.homepage);
        });

      console.log(sites);
    } catch (err) {
      console.log("an error ocurred: " + err);
    }
  };

  await fetchprojects(sites);

  for (const url of sites) {
    const siteName = new URL(url).hostname;

    const directoryPath = path.join(__dirname, "screenshots", siteName);
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath);
    }

    const desktopPage = await browser.newPage();
    await desktopPage.setViewport({ width: 1280, height: 720 });

    const mobilePage = await browser.newPage();
    await mobilePage.emulate(puppeteer.KnownDevices["iPhone X"]);

    const pages = [
      { name: "desktop", page: desktopPage },
      { name: "mobile", page: mobilePage },
    ];

    for (const { name, page } of pages) {
      await page.goto(url, { waitUntil: "networkidle2" });

      await page.evaluate((modalSelector) => {
        const modal = document.querySelector(modalSelector);
        if (modal) {
          modal.style.display = "none";
        }
      }, "#modal");

      await new Promise((resolve) =>
        setTimeout(resolve, delayInSeconds * 1000)
      );

      await page.screenshot({
        path: path.join(directoryPath, `${siteName}_${name}.jpeg`),
        quality: 100,
        type: "jpeg",
      });
    }
    await desktopPage.close();
    await mobilePage.close();
  }
  await browser.close();

  console.log("screenshots are ready!");
})(sites, delayInSeconds);

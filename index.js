const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

const sites = [];
const delayInSeconds = 3;

async function captureScreenshot(urls, delayInSeconds) {
  const browser = await puppeteer.launch({ headless: "new" });

  const fetchprojects = async (urls) => {
    try {
      const response = await fetch("https://api.github.com/users/lucwx/repos");

      const repos = await response.json();

      repos
        .filter(
          (repo) =>
            repo.homepage !== null &&
            repo.homepage !== undefined &&
            repo.homepage !== "" &&
            repo.homepage !== 'https://github.com/lucwx'
        )
        .map((repo) => {
          urls.push(repo.homepage);
        });

      console.log(urls);
    } catch (err) {
      console.log("houve um erro: " + err);
    }
  };

  await fetchprojects(urls);

  for (const url of urls) {
    const siteName = new URL(url).hostname;

    const directoryPath = path.join(__dirname, siteName);
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath);
    }

    const desktopPage = await browser.newPage();
    await desktopPage.setViewport({ width: 1920, height: 1080 });

    const mobilePage = await browser.newPage();
    await mobilePage.emulate(puppeteer.devices["iPhone X"]);

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
}

captureScreenshot(sites, delayInSeconds)
  .then(() => console.log("Screenshot capturada com sucesso!"))
  .catch((err) => console.error("Erro ao capturar screenshot:", err));

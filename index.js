const puppeteer = require("puppeteer");

async function captureScreenshot(url, outputPath, delayInSeconds) {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  // Vá para a URL desejada
  await page.goto(url, { waitUntil: "networkidle2" });

  await page.setViewport({ width: 1920, height: 1080 });

  await new Promise((resolve) => setTimeout(resolve, delayInSeconds * 1000));

  // Tire uma captura de tela
  await page.screenshot({
    path: outputPath,
    fullPage: true,
    quality: 100,
    type: "jpeg",
  });

  // Feche o navegador
  await browser.close();
}

// Exemplo de uso
const siteURL = "https://github-card.vercel.app/card/lucwx";
const outputImagePath = "./images/screenshot.jpeg";
const outputMobile = "./images/mobileScreenshot.png";

const delayInSeconds = 3;

captureScreenshot(siteURL, outputImagePath, delayInSeconds)
  .then(() => console.log("Captura de tela concluída."))
  .catch((err) => console.error("Erro ao capturar a tela:", err));

async function captureMobileScreenshot(url, outputPath, delayInSeconds) {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  // Emular um dispositivo móvel (por exemplo, um iPhone X)
  await page.emulate(puppeteer.devices["iPhone X"]);

  // Vá para a URL desejada
  await page.goto(url, { waitUntil: "networkidle2" });

  // Aguarde o tempo especificado antes de tirar a captura de tela
  await new Promise((resolve) => setTimeout(resolve, delayInSeconds * 1000));

  // Tire uma captura de tela
  await page.screenshot({ path: outputPath, quality: 100, type: "jpeg" });

  // Feche o navegador
  await browser.close();
}

captureMobileScreenshot(siteURL, outputMobile, delayInSeconds)
  .then(() => console.log("Captura de tela móvel concluída após o atraso."))
  .catch((err) => console.error("Erro ao capturar a tela móvel:", err));

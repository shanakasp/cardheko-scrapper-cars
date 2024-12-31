const puppeteer = require("puppeteer");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const fs = require("fs");
const readline = require("readline");

const csvWriter = createCsvWriter({
  path: "all_car_prices.csv",
  header: [
    { id: "brand", title: "Brand" },
    { id: "model", title: "Model" },
    { id: "variant", title: "Variant" },
    { id: "fuelType", title: "Fuel Type" },
    { id: "city", title: "City" },
    { id: "exShowroom", title: "Ex-Showroom Price" },
    { id: "rto", title: "RTO" },
    { id: "insurance", title: "Insurance" },
  ],
});

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processVariantPage(page) {
  await page.waitForSelector(".tabdata");
  await delay(1000);

  return page.evaluate(() => {
    const data = [];
    const variantSections = document.querySelectorAll(".clearfix.borderBottom");

    variantSections.forEach((section) => {
      const variantInfo = section.querySelector(".gsc_row span:first-child");
      const fuelTypeElement = section.querySelector(".varfueltype");
      const priceTable = section.querySelector("table.allIncluds");

      if (!variantInfo) return;

      let prices = {
        exShowroom: "N/A",
        rto: "N/A",
        insurance: "N/A",
      };

      if (priceTable) {
        const rows = priceTable.querySelectorAll("tbody tr");
        rows.forEach((row) => {
          const label =
            row.querySelector("td:first-child")?.textContent?.toLowerCase() ||
            "";
          const value =
            row
              .querySelector("td:last-child")
              ?.textContent?.trim()
              .replace("Rs.", "")
              .trim() || "";

          if (label.includes("ex-showroom")) prices.exShowroom = value;
          else if (label.includes("rto")) prices.rto = value;
          else if (label.includes("insurance")) prices.insurance = value;
        });

        const onRoadElement = priceTable.querySelector(
          "tfoot .onRoadprice td:last-child"
        );
        if (onRoadElement) {
          prices.onRoad = onRoadElement.textContent.replace("Rs.", "").trim();
        }
      }

      data.push({
        variantName: variantInfo.textContent.trim().split("(")[0].trim(),
        fuelType:
          fuelTypeElement?.textContent?.replace(/[()]/g, "").trim() || "N/A",
        ...prices,
      });
    });

    return data;
  });
}

async function scrapeCarPrices() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ["--start-maximized"],
  });

  try {
    const mainPage = await browser.newPage();
    await mainPage.goto("https://www.cardekho.com/newcars#brands", {
      waitUntil: "networkidle0",
      timeout: 60000,
    });

    const brandLinks = await mainPage.$$eval(
      ".listing .BrIconNewCar",
      (elements) =>
        elements.map((el) => ({
          url: el.href,
          brand: el.querySelector("span")?.textContent?.trim(),
        }))
    );

    // Prompt the user for the order of brands to scrape
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      "Enter the brand numbers in the order you want to scrape (e.g., 1,2,3): ",
      async (answer) => {
        const order = answer
          .split(",")
          .map((num) => parseInt(num.trim(), 10) - 1);
        const orderedBrandLinks = order
          .map((index) => brandLinks[index])
          .filter(Boolean);

        for (const brandLink of orderedBrandLinks) {
          console.log(`Processing brand: ${brandLink.brand}...`);
          const brandPage = await browser.newPage();
          await brandPage.goto(brandLink.url);
          await brandPage.waitForSelector(".modelList");

          const carLinks = await brandPage.$$eval(".modelList li", (elements) =>
            elements
              .map((el) => ({
                url: el.querySelector("a")?.href,
                model: el.querySelector("h3")?.textContent?.trim(),
              }))
              .filter((item) => item.url && item.model)
          );

          for (const carLink of carLinks) {
            console.log(`Processing ${carLink.model}...`);

            const carPage = await browser.newPage();
            await carPage.goto(carLink.url);

            const priceUrl = await carPage.$eval(
              'a[title*="On Road Price"]',
              (el) => el.href
            );

            const pricePage = await browser.newPage();
            await pricePage.goto(priceUrl);

            const cityTabs = ["Nearby", "Popular"];

            for (const tab of cityTabs) {
              await pricePage.waitForSelector(
                `div[data-track-section="${tab}"]`
              );
              if (tab === "Popular") {
                const popularTab = await pricePage.$('li[title="Popular"]');
                await popularTab.click();
                await delay(1000);
              }

              const cityLinks = await pricePage.$$eval(
                `div[data-track-section="${tab}"] tbody tr a`,
                (elements) =>
                  elements.map((el) => ({
                    url: el.href,
                    city: el.textContent.trim(),
                  }))
              );

              for (const cityLink of cityLinks) {
                console.log(`Processing ${tab} city: ${cityLink.city}`);
                const cityPage = await browser.newPage();
                await cityPage.goto(cityLink.url);

                await cityPage.evaluate(() => {
                  document
                    .querySelectorAll(".variantDtlhead")
                    .forEach((header) => header.click());
                });
                await delay(1000);

                const variants = await processVariantPage(cityPage);

                const modelData = variants.map((variant) => ({
                  brand: brandLink.brand,
                  model: carLink.model,
                  variant: variant.variantName,
                  fuelType: variant.fuelType,
                  city: cityLink.city,
                  exShowroom: variant.exShowroom,
                  rto: variant.rto,
                  insurance: variant.insurance,
                  onRoadPrice: variant.onRoad,
                }));

                await csvWriter.writeRecords(modelData);
                console.log(`Data for ${carLink.model} saved.`);
                await cityPage.close();
              }
            }

            await pricePage.close();
            await carPage.close();
          }

          await brandPage.close();
        }

        console.log("All car prices have been scraped and saved.");
        await browser.close();
        rl.close();
      }
    );
  } catch (error) {
    console.error("Error:", error);
    await browser.close();
  }
}

scrapeCarPrices();

const puppeteer = require("puppeteer");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

// Set up CSV writer for brands and models
const brandsCsvWriter = createCsvWriter({
  path: "car_brands.csv",
  header: [
    { id: "brand", title: "Brand" },
    { id: "brandLink", title: "Brand Link" },
    { id: "brandImage", title: "Brand Image" },
    { id: "modelName", title: "Model Name" },
    { id: "modelPrice", title: "Model Price" },
    { id: "modelImage", title: "Model Image" },
    { id: "fuelType", title: "Fuel Type" },
    { id: "mileage", title: "Mileage" },
    { id: "transmission", title: "Transmission" },
    { id: "engine", title: "Engine" },
    { id: "power", title: "Power" },
    { id: "safety", title: "Safety Rating" },
  ],
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function scrapeCarBrandsAndModels() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--window-size=1920,1080",
    ],
  });

  try {
    const page = await browser.newPage();
    await page.goto("https://www.cardekho.com/newcars#brands", {
      waitUntil: "networkidle0",
      timeout: 60000,
    });

    // Wait for the brands to load
    await page.waitForSelector(".BrIconNewCar");

    // Get all brand links
    const brands = await page.evaluate(() => {
      const brandElements = document.querySelectorAll(".BrIconNewCar");
      return Array.from(brandElements).map((element) => ({
        brand: element.querySelector("span").textContent.trim(),
        brandLink: element.href,
        brandImage: element.querySelector("img").src,
      }));
    });

    for (const brand of brands) {
      console.log(`Processing brand: ${brand.brand}`);

      // Open brand page in new tab
      const brandPage = await browser.newPage();
      await brandPage.goto(brand.brandLink, {
        waitUntil: "networkidle0",
        timeout: 60000,
      });

      // Wait for car models to load
      await brandPage
        .waitForSelector(".modelList", {
          timeout: 30000,
        })
        .catch(() => console.log("No models found for", brand.brand));

      // Extract model details
      const modelDetails = await brandPage.evaluate(() => {
        const models = document.querySelectorAll(".card.shadowWPadding");
        return Array.from(models).map((model) => {
          // Helper function to safely extract text content
          const getText = (selector) => {
            const element = model.querySelector(selector);
            return element ? element.textContent.trim() : "";
          };

          // Get all specs from dotlist
          const specs = Array.from(model.querySelectorAll(".dotlist span")).map(
            (span) => span.textContent.trim()
          );

          return {
            modelName: getText("h3"),
            modelPrice: getText(".price")
              ?.replace("Rs.", "")
              .split("*")[0]
              .trim(),
            modelImage: model.querySelector("img")?.src || "",
            fuelType: specs[0] || "",
            mileage: specs[1] || "",
            transmission: specs[2] || "",
            engine: specs[3] || "",
            power: specs[4] || "",
            safety: specs[5] || "",
          };
        });
      });

      // Combine brand and model information and write to CSV
      const brandModelsData = modelDetails.map((model) => ({
        ...brand,
        ...model,
      }));

      await brandsCsvWriter.writeRecords(brandModelsData);
      console.log(`Saved ${modelDetails.length} models for ${brand.brand}`);

      // Close brand page and add delay before next brand
      await brandPage.close();
      await delay(2000);
    }
  } catch (error) {
    console.error("Error during scraping:", error);
  } finally {
    await browser.close();
  }
}

// Run the scraper
scrapeCarBrandsAndModels()
  .then(() => {
    console.log("Scraping completed!");
  })
  .catch((err) => {
    console.error("Error running scraper:", err);
  });

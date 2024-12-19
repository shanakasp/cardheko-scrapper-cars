// Import required modules
const puppeteer = require("puppeteer");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

// Set up CSV writer
const csvWriter = createCsvWriter({
  path: "car_details.csv",
  header: [
    { id: "brand", title: "Brand" },
    { id: "model", title: "Model" },
    { id: "price", title: "Price" },
    { id: "mileage", title: "ARAI Mileage" },
    { id: "engineDisplacement", title: "Engine Displacement" },
    { id: "cylinders", title: "Cylinders" },
    { id: "maxPower", title: "Max Power" },
    { id: "maxTorque", title: "Max Torque" },
    { id: "seatingCapacity", title: "Seating Capacity" },
    { id: "transmission", title: "Transmission Type" },
    { id: "bootSpace", title: "Boot Space" },
    { id: "fuelTankCapacity", title: "Fuel Tank Capacity" },
    { id: "bodyType", title: "Body Type" },
    { id: "groundClearance", title: "Ground Clearance" },
    { id: "keyFeatures", title: "Key Features" },
  ],
  append: true, // Append data to existing file
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function scrapeCarDetails() {
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
    const baseUrl = "https://www.cardekho.com/newcars#brands";

    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    const brandLinks = await page.$$eval(".BrIconNewCar", (links) =>
      links.map((link) => link.href)
    );

    for (const brandLink of brandLinks.slice(0, 2)) {
      console.log(`Processing brand: ${brandLink}`);
      await page.goto(brandLink, { waitUntil: "domcontentloaded" });

      const modelLinks = await page.$$eval(
        ".gsc_col-sm-12.gsc_col-xs-12.gsc_col-md-8.listView.holder.posS a",
        (links) => links.map((link) => link.href)
      );

      for (const modelLink of modelLinks.slice(0, 2)) {
        console.log(`Processing model: ${modelLink}`);
        try {
          await page.goto(`${modelLink}/specs`, {
            waitUntil: "domcontentloaded",
          });

          const carDetails = await page.evaluate(() => {
            const getTextContent = (selector) =>
              document.querySelector(selector)?.textContent.trim() || "";

            return {
              brand: getTextContent(".breadcrumb li:nth-child(2)"),
              model: getTextContent("h1"),
              price: getTextContent(".price"),
              mileage: getTextContent("tr:contains('ARAI Mileage') td"),
              engineDisplacement: getTextContent(
                "tr:contains('Engine Displacement (cc)') td"
              ),
              cylinders: getTextContent("tr:contains('No. of cylinder') td"),
              maxPower: getTextContent("tr:contains('Max Power (bhp)') td"),
              maxTorque: getTextContent("tr:contains('Max Torque (Nm)') td"),
              seatingCapacity: getTextContent(
                "tr:contains('Seating Capacity') td"
              ),
              transmission: getTextContent(
                "tr:contains('Transmission Type') td"
              ),
              bootSpace: getTextContent(
                "tr:contains('Boot Space (Litres)') td"
              ),
              fuelTankCapacity: getTextContent(
                "tr:contains('Fuel Tank Capacity') td"
              ),
              bodyType: getTextContent("tr:contains('Body Type') td"),
              groundClearance: getTextContent(
                "tr:contains('Ground Clearance Unladen (mm)') td"
              ),
              keyFeatures: Array.from(
                document.querySelectorAll(".keyFeature span") || []
              )
                .map((el) => el.textContent.trim())
                .join(", "),
            };
          });

          // Append to CSV immediately
          await csvWriter.writeRecords([carDetails]);
          console.log(
            `Successfully written: ${carDetails.brand} ${carDetails.model}`
          );
        } catch (error) {
          console.error(`Error processing model ${modelLink}:`, error);
          continue; // Skip to next model on error
        }
      }
    }
  } catch (error) {
    console.error("Error during scraping:", error);
  } finally {
    await browser.close();
  }
}

scrapeCarDetails();

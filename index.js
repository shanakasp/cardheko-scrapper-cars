const puppeteer = require("puppeteer");
const fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const csvWriter = createCsvWriter({
  path: "cardekho_data.csv",
  header: [
    { id: "brand", title: "Brand" },
    { id: "model", title: "Model" },
    { id: "variant", title: "Variant" },
    { id: "exShowroomPrice", title: "Ex-Showroom Price" },
    { id: "engineType", title: "Engine Type" },
    { id: "displacement", title: "Displacement" },
    { id: "maxPower", title: "Max Power" },
    { id: "maxTorque", title: "Max Torque" },
    { id: "noOfCylinders", title: "No. of Cylinders" },
    { id: "valvesPerCylinder", title: "Valves Per Cylinder" },
    { id: "transmission", title: "Transmission" },
    { id: "gearbox", title: "Gearbox" },
    { id: "driveType", title: "Drive Type" },
    { id: "fuelType", title: "Fuel Type" },
    { id: "petrolMileage", title: "Petrol Mileage ARAI" },
    { id: "fuelTankCapacity", title: "Petrol Fuel Tank Capacity" },
    { id: "emissionNorm", title: "Emission Norm Compliance" },
    { id: "frontSuspension", title: "Front Suspension" },
    { id: "rearSuspension", title: "Rear Suspension" },
    { id: "steeringType", title: "Steering Type" },
    { id: "steeringColumn", title: "Steering Column" },
    { id: "turningRadius", title: "Turning Radius" },
    { id: "frontBrakeType", title: "Front Brake Type" },
    { id: "rearBrakeType", title: "Rear Brake Type" },
    { id: "length", title: "Length" },
    { id: "width", title: "Width" },
    { id: "height", title: "Height" },
    { id: "bootSpace", title: "Boot Space" },
    { id: "seatingCapacity", title: "Seating Capacity" },
    { id: "groundClearance", title: "Ground Clearance Unladen" },
    { id: "wheelBase", title: "Wheel Base" },
    { id: "kerbWeight", title: "Kerb Weight" },
    { id: "grossWeight", title: "Gross Weight" },
    { id: "noOfDoors", title: "No. of Doors" },
    { id: "cityPrices", title: "City-wise Prices" },
  ],
});

async function scrapeCarData() {
  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: null,
    args: ["--start-maximized"],
  });
  const page = await browser.newPage();

  try {
    await page.goto("https://www.cardekho.com/newcars#brands", {
      waitUntil: "networkidle0",
      timeout: 60000,
    });

    const brandLinks = await page.$$eval(".BrIconNewCar", (links) =>
      links.map((link) => ({
        url: link.href,
        name: link.querySelector("span")?.textContent || "Unknown Brand",
      }))
    );

    for (const brand of brandLinks) {
      console.log(`Processing brand: ${brand.name}`);

      try {
        const brandPage = await browser.newPage();
        await brandPage.goto(brand.url, {
          waitUntil: "networkidle0",
          timeout: 60000,
        });

        await brandPage.waitForSelector(".modelList", { timeout: 10000 });

        const modelLinks = await brandPage.$$eval(".modelList li", (elements) =>
          elements
            .map((element) => {
              const link = element.querySelector("a");
              const nameElement = element.querySelector(".holder h3");
              return {
                url: link?.href || "",
                name: nameElement?.textContent || "Unknown Model",
              };
            })
            .filter((item) => item.url !== "")
        );

        for (const model of modelLinks) {
          console.log(`Processing model: ${model.name}`);

          try {
            const modelPage = await browser.newPage();
            await modelPage.goto(model.url, {
              waitUntil: "networkidle0",
              timeout: 60000,
            });

            await modelPage.waitForSelector(".modelNavUl", { timeout: 10000 });
            await modelPage.evaluate(() => {
              const variantsTab = Array.from(
                document.querySelectorAll(".modelNavUl li span")
              ).find((el) => el.textContent.includes("Variants"));
              if (variantsTab) variantsTab.click();
            });

            await modelPage.waitForSelector(".allvariant", { timeout: 10000 });

            const variants = await modelPage.$$eval(
              ".allvariant tbody tr",
              (rows) =>
                rows
                  .map((row) => ({
                    name:
                      row.querySelector("a")?.textContent || "Unknown Variant",
                    url: row.querySelector("a")?.href || "",
                    exShowroomPrice:
                      row.querySelector(".pricevalue")?.textContent.trim() ||
                      "N/A",
                  }))
                  .filter((item) => item.url !== "")
            );

            for (const variant of variants) {
              console.log(`Processing variant: ${variant.name}`);

              try {
                const variantPage = await browser.newPage();
                await variantPage.goto(variant.url, {
                  waitUntil: "networkidle0",
                  timeout: 60000,
                });

                const specs = await variantPage.evaluate(() => {
                  const specRows = document.querySelectorAll("table tbody tr");
                  const specs = {};
                  specRows.forEach((row) => {
                    const label = row.querySelector(
                      "td:first-child span"
                    )?.textContent;
                    const value =
                      row.querySelector("td:last-child span")?.textContent;
                    if (label && value) specs[label] = value;
                  });
                  return specs;
                });

                const cityPrices = await variantPage.evaluate(() => {
                  const priceRows = document.querySelectorAll(
                    ".tabTitle table tbody tr"
                  );
                  return Array.from(priceRows)
                    .map((row) => {
                      const city =
                        row.querySelector("td:first-child a")?.textContent ||
                        "";
                      const price =
                        row.querySelector("td:last-child")?.textContent || "";
                      return city && price ? `${city}: ${price}` : "";
                    })
                    .filter((item) => item !== "")
                    .join("; ");
                });

                const carData = {
                  brand: brand.name,
                  model: model.name,
                  variant: variant.name,
                  exShowroomPrice: variant.exShowroomPrice,
                  engineType: specs["Engine Type"] || "N/A",
                  displacement: specs["Displacement"] || "N/A",
                  maxPower: specs["Max Power"] || "N/A",
                  maxTorque: specs["Max Torque"] || "N/A",
                  noOfCylinders: specs["No. of Cylinders"] || "N/A",
                  valvesPerCylinder: specs["Valves Per Cylinder"] || "N/A",
                  transmission: specs["Transmission Type"] || "N/A",
                  gearbox: specs["Gearbox"] || "N/A",
                  driveType: specs["Drive Type"] || "N/A",
                  fuelType: specs["Fuel Type"] || "N/A",
                  petrolMileage: specs["Petrol Mileage ARAI"] || "N/A",
                  fuelTankCapacity: specs["Petrol Fuel Tank Capacity"] || "N/A",
                  emissionNorm: specs["Emission Norm Compliance"] || "N/A",
                  frontSuspension: specs["Front Suspension"] || "N/A",
                  rearSuspension: specs["Rear Suspension"] || "N/A",
                  steeringType: specs["Steering Type"] || "N/A",
                  steeringColumn: specs["Steering Column"] || "N/A",
                  turningRadius: specs["Turning Radius"] || "N/A",
                  frontBrakeType: specs["Front Brake Type"] || "N/A",
                  rearBrakeType: specs["Rear Brake Type"] || "N/A",
                  length: specs["Length"] || "N/A",
                  width: specs["Width"] || "N/A",
                  height: specs["Height"] || "N/A",
                  bootSpace: specs["Boot Space"] || "N/A",
                  seatingCapacity: specs["Seating Capacity"] || "N/A",
                  groundClearance: specs["Ground Clearance Unladen"] || "N/A",
                  wheelBase: specs["Wheel Base"] || "N/A",
                  kerbWeight: specs["Kerb Weight"] || "N/A",
                  grossWeight: specs["Gross Weight"] || "N/A",
                  noOfDoors: specs["No. of Doors"] || "N/A",
                  cityPrices: cityPrices || "N/A",
                };

                await csvWriter.writeRecords([carData]);
                console.log(
                  `Data for variant ${variant.name} of model ${model.name} saved successfully.`
                );

                await variantPage.close();
              } catch (variantError) {
                console.error(
                  `Error processing variant ${variant.name}:`,
                  variantError
                );
              }
            }
            await modelPage.close();
          } catch (modelError) {
            console.error(`Error processing model ${model.name}:`, modelError);
          }
        }
        await brandPage.close();
      } catch (brandError) {
        console.error(`Error processing brand ${brand.name}:`, brandError);
      }
    }
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    await browser.close();
  }
}

scrapeCarData();

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
    { id: "powerSteering", title: "Power Steering" },
    { id: "airConditioner", title: "Air Conditioner" },
    { id: "heater", title: "Heater" },
    { id: "adjustableSteering", title: "Adjustable Steering" },
    {
      id: "heightAdjustableDriverSeat",
      title: "Height Adjustable Driver Seat",
    },
    { id: "automaticClimateControl", title: "Automatic Climate Control" },
    { id: "accessoryPowerOutlet", title: "Accessory Power Outlet" },
    { id: "trunkLight", title: "Trunk Light" },
    { id: "vanityMirror", title: "Vanity Mirror" },
    { id: "rearReadingLamp", title: "Rear Reading Lamp" },
    { id: "rearSeatHeadrest", title: "Rear Seat Headrest" },
    { id: "adjustableHeadrest", title: "Adjustable Headrest" },
    { id: "rearSeatCentreArmRest", title: "Rear Seat Centre Arm Rest" },
    { id: "rearACVents", title: "Rear AC Vents" },
    { id: "cruiseControl", title: "Cruise Control" },
    { id: "parkingSensors", title: "Parking Sensors" },
    { id: "realTimeVehicleTracking", title: "Real-Time Vehicle Tracking" },
    { id: "keyLessEntry", title: "KeyLess Entry" },
    { id: "engineStartStopButton", title: "Engine Start/Stop Button" },
    { id: "voiceCommands", title: "Voice Commands" },
    { id: "usbCharger", title: "USB Charger" },
    { id: "handsFreeTailgate", title: "Hands-Free Tailgate" },
    { id: "gearShiftIndicator", title: "Gear Shift Indicator" },
    { id: "luggageHookAndNet", title: "Luggage Hook & Net" },
    { id: "idleStartStopSystem", title: "Idle Start-Stop System" },
    { id: "followMeHomeHeadlamps", title: "Follow Me Home Headlamps" },
    {
      id: "additionalFeaturesComfort",
      title: "Additional Features (Comfort & Convenience)",
    },
    { id: "powerWindows", title: "Power Windows" },
    { id: "cupHolders", title: "Cup Holders" },
    { id: "tachometer", title: "Tachometer" },
    {
      id: "leatherWrappedSteeringWheel",
      title: "Leather Wrapped Steering Wheel",
    },
    { id: "gloveBox", title: "Glove Box" },
    {
      id: "additionalFeaturesInterior",
      title: "Additional Features (Interior)",
    },
    { id: "adjustableHeadlamps", title: "Adjustable Headlamps" },
    { id: "rearWindowDefogger", title: "Rear Window Defogger" },
    { id: "wheelCovers", title: "Wheel Covers" },
    { id: "alloyWheels", title: "Alloy Wheels" },
    {
      id: "orvmTurnIndicators",
      title: "Outside Rear View Mirror Turn Indicators",
    },
    { id: "integratedAntenna", title: "Integrated Antenna" },
    { id: "projectorHeadlamps", title: "Projector Headlamps" },
    { id: "automaticHeadlamps", title: "Automatic Headlamps" },
    { id: "fogLights", title: "Fog Lights" },
    { id: "antenna", title: "Antenna" },
    { id: "sunroof", title: "Sunroof" },
    { id: "bootOpening", title: "Boot Opening" },
    { id: "orvm", title: "Outside Rear View Mirror (ORVM)" },
    { id: "tyreSize", title: "Tyre Size" },
    { id: "tyreType", title: "Tyre Type" },
    { id: "wheelSize", title: "Wheel Size" },
    { id: "ledDRLs", title: "LED DRLs" },
    { id: "ledHeadlamps", title: "LED Headlamps" },
    { id: "ledFogLamps", title: "LED Fog Lamps" },
    {
      id: "additionalFeaturesExterior",
      title: "Additional Features (Exterior)",
    },
    { id: "abs", title: "Anti-lock Braking System (ABS)" },
    { id: "centralLocking", title: "Central Locking" },
    { id: "noOfAirbags", title: "No. of Airbags" },
    { id: "driverAirbag", title: "Driver Airbag" },
    { id: "passengerAirbag", title: "Passenger Airbag" },
    { id: "sideAirbag", title: "Side Airbag" },
    { id: "sideAirbagRear", title: "Side Airbag-Rear" },
    { id: "dayNightRearViewMirror", title: "Day & Night Rear View Mirror" },
    { id: "curtainAirbag", title: "Curtain Airbag" },
    { id: "ebd", title: "Electronic Brakeforce Distribution (EBD)" },
    { id: "seatBeltWarning", title: "Seat Belt Warning" },
    { id: "tpms", title: "Tyre Pressure Monitoring System (TPMS)" },
    { id: "engineImmobilizer", title: "Engine Immobilizer" },
    { id: "esc", title: "Electronic Stability Control (ESC)" },
    { id: "rearCamera", title: "Rear Camera" },
    { id: "antiTheftDevice", title: "Anti-Theft Device" },
    { id: "antiPinchPowerWindows", title: "Anti-Pinch Power Windows" },
    { id: "speedAlert", title: "Speed Alert" },
    { id: "speedSensingAutoDoorLock", title: "Speed Sensing Auto Door Lock" },
    { id: "isofixChildSeatMounts", title: "ISOFIX Child Seat Mounts" },
    {
      id: "pretensionersAndForceLimiters",
      title: "Pretensioners & Force Limiter Seatbelts",
    },
    { id: "hillAssist", title: "Hill Assist" },
    {
      id: "impactSensingAutoDoorUnlock",
      title: "Impact Sensing Auto Door Unlock",
    },
    { id: "view360Camera", title: "360 View Camera" },
    { id: "globalNCAPSafetyRating", title: "Global NCAP Safety Rating" },
    {
      id: "globalNCAPChildSafetyRating",
      title: "Global NCAP Child Safety Rating",
    },
    { id: "radio", title: "Radio" },
    { id: "wirelessPhoneCharging", title: "Wireless Phone Charging" },
    { id: "bluetoothConnectivity", title: "Bluetooth Connectivity" },
    { id: "touchscreen", title: "Touchscreen" },
    { id: "touchscreenSize", title: "Touchscreen Size" },
    { id: "androidAuto", title: "Android Auto" },
    { id: "appleCarPlay", title: "Apple CarPlay" },
    { id: "usbPorts", title: "USB Ports" },
    { id: "speakers", title: "Speakers" },
    { id: "driverAttentionWarning", title: "Driver Attention Warning" },
    { id: "cityPrices", title: "City-wise Prices" },
    { id: "liveLocation", title: "Live Location" },
    { id: "otaUpdates", title: "Over the Air (OTA) Updates" },
    { id: "googleAlexaConnectivity", title: "Google / Alexa Connectivity" },
    { id: "overSpeedingAlert", title: "Over Speeding Alert" },
    { id: "towAwayAlert", title: "Tow Away Alert" },
    { id: "smartwatchApp", title: "Smartwatch App" },
    { id: "valetMode", title: "Valet Mode" },
    { id: "remoteDoorLockUnlock", title: "Remote Door Lock/Unlock" },
    { id: "geoFenceAlert", title: "Geo-fence Alert" },
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
                  powerSteering: specs["Power Steering"] || "N/A",
                  airConditioner: specs["Air Conditioner"] || "N/A",
                  heater: specs["Heater"] || "N/A",
                  adjustableSteering: specs["Adjustable Steering"] || "N/A",
                  heightAdjustableDriverSeat:
                    specs["Height Adjustable Driver Seat"] || "N/A",
                  automaticClimateControl:
                    specs["Automatic Climate Control"] || "N/A",
                  accessoryPowerOutlet:
                    specs["Accessory Power Outlet"] || "N/A",
                  trunkLight: specs["Trunk Light"] || "N/A",
                  vanityMirror: specs["Vanity Mirror"] || "N/A",
                  rearReadingLamp: specs["Rear Reading Lamp"] || "N/A",
                  rearSeatHeadrest: specs["Rear Seat Headrest"] || "N/A",
                  adjustableHeadrest: specs["Adjustable Headrest"] || "N/A",
                  rearSeatCentreArmRest:
                    specs["Rear Seat Centre Arm Rest"] || "N/A",
                  rearACVents: specs["Rear AC Vents"] || "N/A",
                  cruiseControl: specs["Cruise Control"] || "N/A",
                  parkingSensors: specs["Parking Sensors"] || "N/A",
                  realTimeVehicleTracking:
                    specs["Real-Time Vehicle Tracking"] || "N/A",
                  keyLessEntry: specs["KeyLess Entry"] || "N/A",
                  engineStartStopButton:
                    specs["Engine Start/Stop Button"] || "N/A",
                  voiceCommands: specs["Voice Commands"] || "N/A",
                  usbCharger: specs["USB Charger"] || "N/A",
                  handsFreeTailgate: specs["Hands-Free Tailgate"] || "N/A",
                  gearShiftIndicator: specs["Gear Shift Indicator"] || "N/A",
                  luggageHookAndNet: specs["Luggage Hook & Net"] || "N/A",
                  idleStartStopSystem: specs["Idle Start-Stop System"] || "N/A",
                  followMeHomeHeadlamps:
                    specs["Follow Me Home Headlamps"] || "N/A",
                  additionalFeaturesComfort:
                    specs["Additional Features (Comfort & Convenience)"] ||
                    "N/A",
                  powerWindows: specs["Power Windows"] || "N/A",
                  cupHolders: specs["Cup Holders"] || "N/A",
                  tachometer: specs["Tachometer"] || "N/A",
                  leatherWrappedSteeringWheel:
                    specs["Leather Wrapped Steering Wheel"] || "N/A",
                  gloveBox: specs["Glove Box"] || "N/A",
                  additionalFeaturesInterior:
                    specs["Additional Features (Interior)"] || "N/A",
                  adjustableHeadlamps: specs["Adjustable Headlamps"] || "N/A",
                  rearWindowDefogger: specs["Rear Window Defogger"] || "N/A",
                  wheelCovers: specs["Wheel Covers"] || "N/A",
                  alloyWheels: specs["Alloy Wheels"] || "N/A",
                  orvmTurnIndicators:
                    specs["Outside Rear View Mirror Turn Indicators"] || "N/A",
                  integratedAntenna: specs["Integrated Antenna"] || "N/A",
                  projectorHeadlamps: specs["Projector Headlamps"] || "N/A",
                  automaticHeadlamps: specs["Automatic Headlamps"] || "N/A",
                  fogLights: specs["Fog Lights"] || "N/A",
                  antenna: specs["Antenna"] || "N/A",
                  sunroof: specs["Sunroof"] || "N/A",
                  bootOpening: specs["Boot Opening"] || "N/A",
                  orvm: specs["Outside Rear View Mirror (ORVM)"] || "N/A",
                  tyreSize: specs["Tyre Size"] || "N/A",
                  tyreType: specs["Tyre Type"] || "N/A",
                  wheelSize: specs["Wheel Size"] || "N/A",
                  ledDRLs: specs["LED DRLs"] || "N/A",
                  ledHeadlamps: specs["LED Headlamps"] || "N/A",
                  ledFogLamps: specs["LED Fog Lamps"] || "N/A",
                  additionalFeaturesExterior:
                    specs["Additional Features (Exterior)"] || "N/A",
                  abs: specs["Anti-lock Braking System (ABS)"] || "N/A",
                  centralLocking: specs["Central Locking"] || "N/A",
                  noOfAirbags: specs["No. of Airbags"] || "N/A",
                  driverAirbag: specs["Driver Airbag"] || "N/A",
                  passengerAirbag: specs["Passenger Airbag"] || "N/A",
                  sideAirbag: specs["Side Airbag"] || "N/A",
                  sideAirbagRear: specs["Side Airbag-Rear"] || "N/A",
                  dayNightRearViewMirror:
                    specs["Day & Night Rear View Mirror"] || "N/A",
                  curtainAirbag: specs["Curtain Airbag"] || "N/A",
                  ebd:
                    specs["Electronic Brakeforce Distribution (EBD)"] || "N/A",
                  seatBeltWarning: specs["Seat Belt Warning"] || "N/A",
                  tpms:
                    specs["Tyre Pressure Monitoring System (TPMS)"] || "N/A",
                  engineImmobilizer: specs["Engine Immobilizer"] || "N/A",
                  esc: specs["Electronic Stability Control (ESC)"] || "N/A",
                  rearCamera: specs["Rear Camera"] || "N/A",
                  antiTheftDevice: specs["Anti-Theft Device"] || "N/A",
                  antiPinchPowerWindows:
                    specs["Anti-Pinch Power Windows"] || "N/A",
                  speedAlert: specs["Speed Alert"] || "N/A",
                  speedSensingAutoDoorLock:
                    specs["Speed Sensing Auto Door Lock"] || "N/A",
                  isofixChildSeatMounts:
                    specs["ISOFIX Child Seat Mounts"] || "N/A",
                  pretensionersAndForceLimiters:
                    specs["Pretensioners & Force Limiter Seatbelts"] || "N/A",
                  hillAssist: specs["Hill Assist"] || "N/A",
                  impactSensingAutoDoorUnlock:
                    specs["Impact Sensing Auto Door Unlock"] || "N/A",
                  view360Camera: specs["360 View Camera"] || "N/A",
                  globalNCAPSafetyRating:
                    specs["Global NCAP Safety Rating"] || "N/A",
                  globalNCAPChildSafetyRating:
                    specs["Global NCAP Child Safety Rating"] || "N/A",
                  radio: specs["Radio"] || "N/A",
                  wirelessPhoneCharging:
                    specs["Wireless Phone Charging"] || "N/A",
                  bluetoothConnectivity:
                    specs["Bluetooth Connectivity"] || "N/A",
                  touchscreen: specs["Touchscreen"] || "N/A",
                  touchscreenSize: specs["Touchscreen Size"] || "N/A",
                  androidAuto: specs["Android Auto"] || "N/A",
                  appleCarPlay: specs["Apple CarPlay"] || "N/A",
                  usbPorts: specs["Usb Ports"] || "N/A",
                  speakers: specs["Speakers"] || "N/A",
                  driverAttentionWarning:
                    specs["Driver Attention Warning"] || "N/A",
                  liveLocation: specs["Live Location"] || "N/A",
                  otaUpdates: specs["Over the Air (OTA) Updates"] || "N/A",
                  googleAlexaConnectivity:
                    specs["Google / Alexa Connectivity"] || "N/A",
                  overSpeedingAlert: specs["Over Speeding Alert"] || "N/A",
                  towAwayAlert: specs["Tow Away Alert"] || "N/A",
                  smartwatchApp: specs["Smartwatch App"] || "N/A",
                  valetMode: specs["Valet Mode"] || "N/A",
                  remoteDoorLockUnlock:
                    specs["Remote Door Lock/Unlock"] || "N/A",
                  geoFenceAlert: specs["Geo-fence Alert"] || "N/A",
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

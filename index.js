const puppeteer = require("puppeteer");
const fs = require("fs");
const { parse } = require("json2csv");

async function scrapeCarSpecs() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ["--start-maximized"],
  });
  const mainPage = await browser.newPage();

  // Create CSV file with headers
  const headers =
    [
      "brand",
      "model",
      // Engine & Transmission
      "Engine_Type",
      "Displacement",
      "Max_Power",
      "Max_Torque",
      "No_of_Cylinders",
      "Valves_Per_Cylinder",
      "Transmission_Type",
      "Gearbox",
      "Drive_Type",
      // Fuel & Performance
      "Fuel_Type",
      "Petrol_Mileage_ARAI",
      "Petrol_Fuel_Tank_Capacity",
      "Emission_Norm_Compliance",
      // Suspension, Steering & Brakes
      "Front_Suspension",
      "Rear_Suspension",
      "Steering_Type",
      "Steering_Column",
      "Turning_Radius",
      "Front_Brake_Type",
      "Rear_Brake_Type",
      "Alloy_Wheel_Size_Front",
      "Alloy_Wheel_Size_Rear",
      // Dimensions & Capacity
      "Length",
      "Width",
      "Height",
      "Boot_Space",
      "Seating_Capacity",
      "Ground_Clearance_Unladen",
      "Wheel_Base",
      "Kerb_Weight",
      "Gross_Weight",
      "No_of_Doors",
      // Comfort & Convenience
      "Power_Steering",
      "Air_Conditioner",
      "Heater",
      "Adjustable_Steering",
      "Height_Adjustable_Driver_Seat",
      "Automatic_Climate_Control",
      "Accessory_Power_Outlet",
      "Trunk_Light",
      "Vanity_Mirror",
      "Rear_Reading_Lamp",
      "Rear_Seat_Headrest",
      "Adjustable_Headrest",
      "Rear_Seat_Centre_Arm_Rest",
      "Rear_AC_Vents",
      "Cruise_Control",
      "Parking_Sensors",
      "Real_Time_Vehicle_Tracking",
      "KeyLess_Entry",
      "Engine_Start_Stop_Button",
      "Voice_Commands",
      "USB_Charger",
      "Hands_Free_Tailgate",
      "Gear_Shift_Indicator",
      "Luggage_Hook_Net",
      "Idle_Start_Stop_System",
      "Follow_Me_Home_Headlamps",
      "Power_Windows",
      "Cup_Holders",
      "Additional_Features_Comfort",
      // Exterior
      "Adjustable_Headlamps",
      "Rear_Window_Defogger",
      "Wheel_Covers",
      "Alloy_Wheels",
      "Outside_Rear_View_Mirror_Turn_Indicators",
      "Integrated_Antenna",
      "Projector_Headlamps",
      "Automatic_Headlamps",
      "Fog_Lights",
      "Antenna",
      "Sunroof",
      "Boot_Opening",
      "Outside_Rear_View_Mirror",
      "Tyre_Size",
      "Tyre_Type",
      "LED_DRLs",
      "LED_Headlamps",
      "LED_Fog_Lamps",
      "Additional_Features_Exterior",
      // Interior
      "Tachometer",
      "Leather_Wrapped_Steering_Wheel",
      "Glove_Box",
      "Additional_Features_Interior",
      // Safety
      "Anti_Lock_Braking_System",
      "Central_Locking",
      "No_of_Airbags",
      "Driver_Airbag",
      "Passenger_Airbag",
      "Side_Airbag",
      "Side_Airbag_Rear",
      "Day_Night_Rear_View_Mirror",
      "Curtain_Airbag",
      "Electronic_Brakeforce_Distribution",
      "Seat_Belt_Warning",
      "Tyre_Pressure_Monitoring_System",
      "Engine_Immobilizer",
      "Electronic_Stability_Control",
      "Rear_Camera",
      "Anti_Theft_Device",
      "Anti_Pinch_Power_Windows",
      "Speed_Alert",
      "Speed_Sensing_Auto_Door_Lock",
      "ISOFIX_Child_Seat_Mounts",
      "Pretensioners_Force_Limiter_Seatbelts",
      "Hill_Assist",
      "Impact_Sensing_Auto_Door_Unlock",
      "360_View_Camera",
      "Global_NCAP_Safety_Rating",
      "Global_NCAP_Child_Safety_Rating",
      // Entertainment & Communication
      "Radio",
      "Wireless_Phone_Charging",
      "Bluetooth_Connectivity",
      "Touchscreen",
      "Touchscreen_Size",
      "Android_Auto",
      "Apple_CarPlay",
      "No_of_Speakers",
      "USB_Ports",
      "Tweeters",
      "Entertainment_Additional_Features",
      "Speakers_Location",
    ].join(",") + "\n";

  fs.writeFileSync("car_specifications.csv", headers);

  try {
    console.log("Navigating to main page...");
    await mainPage.goto("https://www.cardekho.com/newcars#brands", {
      waitUntil: "networkidle0",
      timeout: 60000,
    });

    // Get all brand links
    const brandLinks = await mainPage.$$eval(
      ".listing.clearfix.gsc_row li a",
      (links) =>
        links
          .map((link) => ({
            href: link.href,
            brand: link.querySelector("span")?.textContent.trim() || "",
          }))
          .filter((link) => link.href && link.brand)
    );

    console.log(`Found ${brandLinks.length} brands to process`);

    // Process each brand
    for (let brandIndex = 0; brandIndex < brandLinks.length; brandIndex++) {
      const { href: brandLink, brand } = brandLinks[brandIndex];
      console.log(
        `Processing brand ${brandIndex + 1}/${brandLinks.length}: ${brand}`
      );

      const brandPage = await browser.newPage();
      await brandPage.goto(brandLink, {
        waitUntil: "networkidle0",
        timeout: 60000,
      });

      // Get all car model links
      const carLinks = await brandPage.$$eval(".modelList li .card", (cards) =>
        cards
          .map((card) => {
            const link = card.querySelector("a");
            const modelName = card.querySelector("h3")?.textContent.trim();
            return link ? { href: link.href, model: modelName } : null;
          })
          .filter((link) => link?.href && link?.model)
      );

      console.log(`Found ${carLinks.length} models for ${brand}`);

      // Process each car model
      for (let carIndex = 0; carIndex < carLinks.length; carIndex++) {
        const { href: carLink, model } = carLinks[carIndex];
        console.log(
          `Processing model ${carIndex + 1}/${carLinks.length}: ${model}`
        );

        try {
          const carPage = await browser.newPage();
          await carPage.goto(carLink, {
            waitUntil: "networkidle0",
            timeout: 60000,
          });

          // Find specs link
          const specsLink = await carPage
            .$eval('.BottomLinkViewAll a[title*="Specs"]', (link) => link.href)
            .catch(() => null);

          if (!specsLink) {
            console.log(
              `No specs link found for ${brand} ${model}, skipping...`
            );
            await carPage.close();
            continue;
          }

          const specsPage = await browser.newPage();
          await specsPage.goto(specsLink, {
            waitUntil: "networkidle0",
            timeout: 60000,
          });

          // Extract specifications
          const carData = await specsPage.evaluate(() => {
            const data = {
              "Engine & Transmission": {},
              "Fuel & Performance": {},
              "Suspension, Steering & Brakes": {},
              "Dimensions & Capacity": {},
              "Comfort & Convenience": {},
              Exterior: {},
              Interior: {},
              Safety: {},
              "Entertainment & Communication": {},
            };

            const tables = document.querySelectorAll("table");
            tables.forEach((table) => {
              const section = table.getAttribute("data-track-section");
              if (!data.hasOwnProperty(section)) return;

              const rows = table.querySelectorAll("tbody tr");
              rows.forEach((row) => {
                let label = row
                  .querySelector("td:first-child")
                  .textContent.trim();
                label = label
                  .replace(/\s+/g, "_")
                  .replace(/[^a-zA-Z0-9_]/g, "");

                const iconCheck = row.querySelector(
                  "td:last-child i.icon-check"
                );
                const iconDelete = row.querySelector(
                  "td:last-child i.icon-deletearrow"
                );
                const spanValue = row.querySelector("td:last-child span");

                let value = "";
                if (iconCheck) {
                  value = "Yes";
                } else if (iconDelete) {
                  value = "No";
                } else if (spanValue) {
                  value = spanValue.textContent.trim();
                }

                data[section][label] = value;
              });
            });

            return data;
          });

          // Prepare row data
          const rowData = {
            brand,
            model,
            // Engine & Transmission
            Engine_Type: carData["Engine & Transmission"]["Engine_Type"] || "",
            Displacement:
              carData["Engine & Transmission"]["Displacement"] || "",
            Max_Power: carData["Engine & Transmission"]["Max_Power"] || "",
            Max_Torque: carData["Engine & Transmission"]["Max_Torque"] || "",
            No_of_Cylinders:
              carData["Engine & Transmission"]["No_of_Cylinders"] || "",
            Valves_Per_Cylinder:
              carData["Engine & Transmission"]["Valves_Per_Cylinder"] || "",
            Transmission_Type:
              carData["Engine & Transmission"]["Transmission_Type"] || "",
            Gearbox: carData["Engine & Transmission"]["Gearbox"] || "",
            Drive_Type: carData["Engine & Transmission"]["Drive_Type"] || "",
            // Fuel & Performance
            Fuel_Type: carData["Fuel & Performance"]["Fuel_Type"] || "",
            Petrol_Mileage_ARAI:
              carData["Fuel & Performance"]["Petrol_Mileage_ARAI"] || "",
            Petrol_Fuel_Tank_Capacity:
              carData["Fuel & Performance"]["Petrol_Fuel_Tank_Capacity"] || "",
            Emission_Norm_Compliance:
              carData["Fuel & Performance"]["Emission_Norm_Compliance"] || "",
            // Suspension, Steering & Brakes
            Front_Suspension:
              carData["Suspension, Steering & Brakes"]["Front_Suspension"] ||
              "",
            Rear_Suspension:
              carData["Suspension, Steering & Brakes"]["Rear_Suspension"] || "",
            Steering_Type:
              carData["Suspension, Steering & Brakes"]["Steering_Type"] || "",
            Steering_Column:
              carData["Suspension, Steering & Brakes"]["Steering_Column"] || "",
            Turning_Radius:
              carData["Suspension, Steering & Brakes"]["Turning_Radius"] || "",
            Front_Brake_Type:
              carData["Suspension, Steering & Brakes"]["Front_Brake_Type"] ||
              "",
            Rear_Brake_Type:
              carData["Suspension, Steering & Brakes"]["Rear_Brake_Type"] || "",
            Alloy_Wheel_Size_Front:
              carData["Suspension, Steering & Brakes"][
                "Alloy_Wheel_Size_Front"
              ] || "",
            Alloy_Wheel_Size_Rear:
              carData["Suspension, Steering & Brakes"][
                "Alloy_Wheel_Size_Rear"
              ] || "",
            // Dimensions & Capacity
            Length: carData["Dimensions & Capacity"]["Length"] || "",
            Width: carData["Dimensions & Capacity"]["Width"] || "",
            Height: carData["Dimensions & Capacity"]["Height"] || "",
            Boot_Space: carData["Dimensions & Capacity"]["Boot_Space"] || "",
            Seating_Capacity:
              carData["Dimensions & Capacity"]["Seating_Capacity"] || "",
            Ground_Clearance_Unladen:
              carData["Dimensions & Capacity"]["Ground_Clearance_Unladen"] ||
              "",
            Wheel_Base: carData["Dimensions & Capacity"]["Wheel_Base"] || "",
            Kerb_Weight: carData["Dimensions & Capacity"]["Kerb_Weight"] || "",
            Gross_Weight:
              carData["Dimensions & Capacity"]["Gross_Weight"] || "",
            No_of_Doors: carData["Dimensions & Capacity"]["No_of_Doors"] || "",
            // Comfort & Convenience
            Power_Steering:
              carData["Comfort & Convenience"]["Power_Steering"] || "",
            Air_Conditioner:
              carData["Comfort & Convenience"]["Air_Conditioner"] || "",
            Heater: carData["Comfort & Convenience"]["Heater"] || "",
            Adjustable_Steering:
              carData["Comfort & Convenience"]["Adjustable_Steering"] || "",
            Height_Adjustable_Driver_Seat:
              carData["Comfort & Convenience"][
                "Height_Adjustable_Driver_Seat"
              ] || "",
            Automatic_Climate_Control:
              carData["Comfort & Convenience"]["Automatic_Climate_Control"] ||
              "",
            Accessory_Power_Outlet:
              carData["Comfort & Convenience"]["Accessory_Power_Outlet"] || "",
            Trunk_Light: carData["Comfort & Convenience"]["Trunk_Light"] || "",
            Vanity_Mirror:
              carData["Comfort & Convenience"]["Vanity_Mirror"] || "",
            Rear_Reading_Lamp:
              carData["Comfort & Convenience"]["Rear_Reading_Lamp"] || "",
            Rear_Seat_Headrest:
              carData["Comfort & Convenience"]["Rear_Seat_Headrest"] || "",
            Adjustable_Headrest:
              carData["Comfort & Convenience"]["Adjustable_Headrest"] || "",
            Rear_Seat_Centre_Arm_Rest:
              carData["Comfort & Convenience"]["Rear_Seat_Centre_Arm_Rest"] ||
              "",
            Rear_AC_Vents:
              carData["Comfort & Convenience"]["Rear_AC_Vents"] || "",
            Cruise_Control:
              carData["Comfort & Convenience"]["Cruise_Control"] || "",
            Parking_Sensors:
              carData["Comfort & Convenience"]["Parking_Sensors"] || "",
            Real_Time_Vehicle_Tracking:
              carData["Comfort & Convenience"]["Real_Time_Vehicle_Tracking"] ||
              "",
            KeyLess_Entry:
              carData["Comfort & Convenience"]["KeyLess_Entry"] || "",
            Engine_Start_Stop_Button:
              carData["Comfort & Convenience"]["Engine_Start_Stop_Button"] ||
              "",
            Voice_Commands:
              carData["Comfort & Convenience"]["Voice_Commands"] || "",
            USB_Charger: carData["Comfort & Convenience"]["USB_Charger"] || "",
            Hands_Free_Tailgate:
              carData["Comfort & Convenience"]["Hands_Free_Tailgate"] || "",
            Gear_Shift_Indicator:
              carData["Comfort & Convenience"]["Gear_Shift_Indicator"] || "",
            Luggage_Hook_Net:
              carData["Comfort & Convenience"]["Luggage_Hook_Net"] || "",
            Idle_Start_Stop_System:
              carData["Comfort & Convenience"]["Idle_Start_Stop_System"] || "",
            Follow_Me_Home_Headlamps:
              carData["Comfort & Convenience"]["Follow_Me_Home_Headlamps"] ||
              "",
            Power_Windows:
              carData["Comfort & Convenience"]["Power_Windows"] || "",
            Cup_Holders: carData["Comfort & Convenience"]["Cup_Holders"] || "",
            Additional_Features_Comfort:
              carData["Comfort & Convenience"]["Additional_Features"] || "",
            // Exterior
            Adjustable_Headlamps:
              carData["Exterior"]["Adjustable_Headlamps"] || "",
            Rear_Window_Defogger:
              carData["Exterior"]["Rear_Window_Defogger"] || "",
            Wheel_Covers: carData["Exterior"]["Wheel_Covers"] || "",
            Alloy_Wheels: carData["Exterior"]["Alloy_Wheels"] || "",
            Outside_Rear_View_Mirror_Turn_Indicators:
              carData["Exterior"]["Outside_Rear_View_Mirror_Turn_Indicators"] ||
              "",
            Integrated_Antenna: carData["Exterior"]["Integrated_Antenna"] || "",
            Projector_Headlamps:
              carData["Exterior"]["Projector_Headlamps"] || "",
            Automatic_Headlamps:
              carData["Exterior"]["Automatic_Headlamps"] || "",
            Fog_Lights: carData["Exterior"]["Fog_Lights"] || "",
            Antenna: carData["Exterior"]["Antenna"] || "",
            Sunroof: carData["Exterior"]["Sunroof"] || "",
            Boot_Opening: carData["Exterior"]["Boot_Opening"] || "",
            Outside_Rear_View_Mirror:
              carData["Exterior"]["Outside_Rear_View_Mirror"] || "",
            Tyre_Size: carData["Exterior"]["Tyre_Size"] || "",
            Tyre_Type: carData["Exterior"]["Tyre_Type"] || "",
            LED_DRLs: carData["Exterior"]["LED_DRLs"] || "",
            LED_Headlamps: carData["Exterior"]["LED_Headlamps"] || "",
            LED_Fog_Lamps: carData["Exterior"]["LED_Fog_Lamps"] || "",
            Additional_Features_Exterior:
              carData["Exterior"]["Additional_Features"] || "",
            // Interior
            Tachometer: carData["Interior"]["Tachometer"] || "",
            Leather_Wrapped_Steering_Wheel:
              carData["Interior"]["Leather_Wrapped_Steering_Wheel"] || "",
            Glove_Box: carData["Interior"]["Glove_Box"] || "",
            Additional_Features_Interior:
              carData["Interior"]["Additional_Features"] || "",
            // Safety
            Anti_Lock_Braking_System:
              carData["Safety"]["Anti_Lock_Braking_System"] || "",
            Central_Locking: carData["Safety"]["Central_Locking"] || "",
            No_of_Airbags: carData["Safety"]["No_of_Airbags"] || "",
            Driver_Airbag: carData["Safety"]["Driver_Airbag"] || "",
            Passenger_Airbag: carData["Safety"]["Passenger_Airbag"] || "",
            Side_Airbag: carData["Safety"]["Side_Airbag"] || "",
            Side_Airbag_Rear: carData["Safety"]["Side_Airbag_Rear"] || "",
            Day_Night_Rear_View_Mirror:
              carData["Safety"]["Day_Night_Rear_View_Mirror"] || "",
            Curtain_Airbag: carData["Safety"]["Curtain_Airbag"] || "",
            Electronic_Brakeforce_Distribution:
              carData["Safety"]["Electronic_Brakeforce_Distribution"] || "",
            Seat_Belt_Warning: carData["Safety"]["Seat_Belt_Warning"] || "",
            Tyre_Pressure_Monitoring_System:
              carData["Safety"]["Tyre_Pressure_Monitoring_System"] || "",
            Engine_Immobilizer: carData["Safety"]["Engine_Immobilizer"] || "",
            Electronic_Stability_Control:
              carData["Safety"]["Electronic_Stability_Control"] || "",
            Rear_Camera: carData["Safety"]["Rear_Camera"] || "",
            Anti_Theft_Device: carData["Safety"]["Anti_Theft_Device"] || "",
            Anti_Pinch_Power_Windows:
              carData["Safety"]["Anti_Pinch_Power_Windows"] || "",
            Speed_Alert: carData["Safety"]["Speed_Alert"] || "",
            Speed_Sensing_Auto_Door_Lock:
              carData["Safety"]["Speed_Sensing_Auto_Door_Lock"] || "",
            ISOFIX_Child_Seat_Mounts:
              carData["Safety"]["ISOFIX_Child_Seat_Mounts"] || "",
            Pretensioners_Force_Limiter_Seatbelts:
              carData["Safety"]["Pretensioners_Force_Limiter_Seatbelts"] || "",
            Hill_Assist: carData["Safety"]["Hill_Assist"] || "",
            Impact_Sensing_Auto_Door_Unlock:
              carData["Safety"]["Impact_Sensing_Auto_Door_Unlock"] || "",
            "360_View_Camera": carData["Safety"]["360_View_Camera"] || "",
            Global_NCAP_Safety_Rating:
              carData["Safety"]["Global_NCAP_Safety_Rating"] || "",
            Global_NCAP_Child_Safety_Rating:
              carData["Safety"]["Global_NCAP_Child_Safety_Rating"] || "",

            // Entertainment & Communication
            Radio: carData["Entertainment & Communication"]["Radio"] || "",
            Wireless_Phone_Charging:
              carData["Entertainment & Communication"][
                "Wireless_Phone_Charging"
              ] || "",
            Bluetooth_Connectivity:
              carData["Entertainment & Communication"][
                "Bluetooth_Connectivity"
              ] || "",
            Touchscreen:
              carData["Entertainment & Communication"]["Touchscreen"] || "",
            Touchscreen_Size:
              carData["Entertainment & Communication"]["Touchscreen_Size"] ||
              "",
            Android_Auto:
              carData["Entertainment & Communication"]["Android_Auto"] || "",
            Apple_CarPlay:
              carData["Entertainment & Communication"]["Apple_CarPlay"] || "",
            No_of_Speakers:
              carData["Entertainment & Communication"]["No_of_Speakers"] || "",
            USB_Ports:
              carData["Entertainment & Communication"]["USB_Ports"] || "",
            Tweeters:
              carData["Entertainment & Communication"]["Tweeters"] || "",
            Entertainment_Additional_Features:
              carData["Entertainment & Communication"]["Additional_Features"] ||
              "",
            Speakers_Location:
              carData["Entertainment & Communication"]["Speakers"] || "",
          };

          // Convert row data to CSV string
          const csvRow =
            Object.values(rowData)
              .map((value) =>
                typeof value === "string"
                  ? `"${value.replace(/"/g, '""')}"`
                  : value
              )
              .join(",") + "\n";

          // Append to CSV file
          fs.appendFileSync("car_specifications.csv", csvRow);

          // Close the specs page
          await specsPage.close();
          await carPage.close();
        } catch (error) {
          console.error(`Error processing ${brand} ${model}:`, error);
          continue;
        }
      }

      // Close the brand page
      await brandPage.close();
    }

    console.log("Scraping completed successfully!");
  } catch (error) {
    console.error("An error occurred during scraping:", error);
  } finally {
    // Clean up: close the browser
    await browser.close();
  }
}

// Error handling wrapper
(async () => {
  try {
    await scrapeCarSpecs();
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
})();

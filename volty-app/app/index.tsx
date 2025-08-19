import React, { useEffect } from "react";
import { Text, View } from "react-native";
import * as Notifications from "expo-notifications";

const PRICE_API_URL = "https://hourlypricing.comed.com/api?type=5minutefeed";
const PRICE_THRESHOLD = 8.0; // cents

async function checkPriceAndNotify() {
  try {
    const response = await fetch(PRICE_API_URL);
    const data = await response.json();
    // Assuming the latest price is the first item
    const latestPrice = parseFloat(data[0].price);
    console.log(`Latest price: ${latestPrice}¢/kWh`);
    if (latestPrice < PRICE_THRESHOLD) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Price Alert!",
          body: `Price dropped to ${latestPrice}¢/kWh`,
        },
        trigger: null, // Send immediately
      });
    }
  } catch (error) {
    console.error("Error fetching price:", error);
  }
}

export default function Index() {
  useEffect(() => {
    // Request notification permissions
    Notifications.requestPermissionsAsync();

    // Check price immediately, then every 5 minutes
    checkPriceAndNotify();
    const interval = setInterval(checkPriceAndNotify, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>You'll get a notification if price drops below 8.0¢/kWh.</Text>
    </View>
  );
}

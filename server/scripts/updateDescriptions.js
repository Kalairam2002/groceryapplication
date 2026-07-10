import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import Product from "../models/Product.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../../.env") });

console.log("MONGODB_URI:", process.env.MONGODB_URI);

const descriptions = {
  "tomato": ["Tomato is a red nutritious vegetable rich in vitamin C and antioxidants", "Good for heart health and skin care", "Rich in lycopene which helps prevent cancer", "Low in calories and great for weight loss", "Commonly used in curries salads and soups"],
  "Fish": ["Fish is a high protein seafood rich in omega 3 fatty acids", "Good for brain health heart health and eye health", "Rich in vitamin D calcium and selenium", "Helps reduce inflammation and bad cholesterol", "Great source of lean protein for muscle building"],
  "Potato": ["Potato is a starchy vegetable rich in carbohydrates and potassium", "Good source of energy and vitamin B6", "Helps in digestion and muscle function", "Rich in fiber and antioxidants", "Used in curries fries soups and many dishes"],
  "Dessert": ["Dessert is a sweet food item perfect for satisfying sweet cravings", "Available in various flavors and varieties", "Great for special occasions and celebrations", "Rich in sugar and carbohydrates for quick energy"],
  "Cashew Nuts": ["Cashew nuts are rich in healthy fats protein and essential minerals", "Good for heart health bone strength and immunity", "Rich in magnesium zinc iron and copper", "Helps boost energy levels and brain function", "Great healthy snack for weight management"],
  "Chilli Powder": ["Chilli powder is a spice rich in capsaicin and vitamin C", "Boosts metabolism and helps in weight loss", "Has powerful anti inflammatory and antioxidant properties", "Good for digestion and improving blood circulation", "Used in curries marinades and various seasonings"],
  "Blue Color Leather": ["Blue color leather is a premium quality leather product", "Durable and long lasting material", "Great for making bags shoes and accessories", "Soft texture with excellent finish", "Available in attractive blue color"],
  "LG Top Load washing machine": ["LG Top Load washing machine with advanced washing technology", "Energy efficient with multiple wash programs", "Large capacity suitable for family use", "Quiet operation with powerful cleaning performance", "Easy to use with digital controls"],
  "strawberry": ["Strawberry is a sweet and juicy fruit rich in vitamin C and antioxidants", "Good for heart health immunity and skin care", "Low in calories and high in fiber content", "Helps in anti aging and improving skin health", "Great for weight loss and managing diabetes"],
  "Chicken Masala": ["Chicken masala is an aromatic spice blend for cooking chicken dishes", "Contains rich spices like coriander cumin and turmeric", "Adds authentic flavor and aroma to chicken curry", "Contains anti inflammatory spices beneficial for health", "Perfect for making restaurant style chicken dishes at home"],
  "Red Leather seat": ["Red leather seat cover made from premium quality leather", "Durable and easy to clean material", "Adds stylish look to your vehicle", "Comfortable and long lasting", "Available in attractive red color"],
  "Green Lemon": ["Green lemon is a citrus fruit rich in vitamin C and citric acid", "Good for boosting immunity digestion and skin health", "Helps in weight loss and body detoxification", "Rich in antioxidants with anti inflammatory properties", "Commonly used in drinks marinades and cooking"],
  "cherry": ["Cherry is a sweet fruit rich in antioxidants and essential vitamins", "Good for heart health and reducing body inflammation", "Helps in better sleep due to natural melatonin content", "Rich in fiber and vitamin C for immunity", "Great for skin health and overall wellbeing"],
  "Refrigerator-2D-100 L": ["100 liter 2 door refrigerator perfect for small families", "Energy efficient with optimal cooling technology", "Spacious interior with adjustable shelves", "Quiet compressor for silent operation", "Ideal for storing fruits vegetables and daily essentials"],
  "Refrigerator-Nano": ["Nano refrigerator compact and energy efficient design", "Perfect for small spaces offices and dorm rooms", "Adequate cooling capacity for daily needs", "Low power consumption saves electricity", "Easy to maintain and clean"],
  "2 Door refrigerator Pink": ["2 door pink refrigerator with attractive design", "Energy efficient cooling technology", "Spacious storage with multiple compartments", "Perfect for modern kitchens", "Available in attractive pink color"],
  "Brown Leather seat cover": ["Brown leather seat cover made from premium quality material", "Durable comfortable and easy to clean", "Protects original seat from wear and tear", "Adds elegant look to vehicle interior", "Available in classic brown color"],
  "Lime": ["Lime is a citrus fruit rich in vitamin C and natural antioxidants", "Good for boosting immunity digestion and skin health", "Helps in weight loss and body detoxification", "Rich in calcium potassium and magnesium minerals", "Commonly used in drinks cooking and marinades"],
  "Samsung Top Load": ["Samsung top load washing machine with advanced technology", "Energy efficient with multiple wash modes", "Large capacity suitable for family laundry needs", "Powerful cleaning with gentle fabric care", "Easy to operate with digital display"],
  "Turmeric Powder": ["Turmeric powder is a golden spice rich in curcumin compound", "Has powerful anti inflammatory and antioxidant properties", "Good for joint health brain health and immunity boost", "Helps in improving digestion and reducing inflammation", "Used in curries milk and traditional herbal remedies"],
  "Straw Berry": ["Strawberry is a delicious fruit rich in vitamin C and antioxidants", "Good for heart health immunity and glowing skin", "Low in calories and high in dietary fiber", "Helps in improving skin health and anti aging", "Great for weight management and blood sugar control"],
  "Boneless Mutton": ["Boneless mutton is a premium quality meat rich in protein and iron", "Good for muscle building and maintaining energy levels", "Rich in zinc vitamin B12 and selenium minerals", "Helps in red blood cell production and immunity", "Perfect for making curries biryanis and kebabs"],
  "GrapeFruit": ["Grapefruit is a citrus fruit rich in vitamin C and dietary fiber", "Good for weight loss heart health and immunity", "Helps in reducing bad cholesterol and blood pressure", "Rich in antioxidants with immune boosting properties", "Low in calories and excellent for diabetics"],
  "LG Front load Washing Machine": ["LG front load washing machine with superior wash quality", "Energy and water efficient technology", "Multiple wash programs for different fabric types", "Quiet operation with vibration reduction technology", "Large capacity with fast wash option"],
  "orange": ["Orange is a citrus fruit rich in vitamin C and dietary fiber", "Good for boosting immunity skin health and digestion", "Helps in reducing inflammation and bad cholesterol", "Rich in natural antioxidants and natural sugars", "Great for hydration and maintaining energy levels"],
  "Red Amaranth (Sivappu keerai)": ["Red amaranth also known as Sivappu keerai is a leafy vegetable", "Rich in iron calcium and essential vitamins", "Good for preventing anemia and strengthening bones", "High in dietary fiber protein and antioxidants", "Excellent source of vitamins A C and K"],
  "Samsung - 80L - 1 Door": ["Samsung 80 liter single door refrigerator compact design", "Energy efficient with optimal cooling performance", "Perfect for small families and limited spaces", "Easy to maintain with removable shelves", "Reliable cooling technology from Samsung"],
  "White Formal Louis-Philippe": ["White formal shirt from Louis Philippe premium brand", "Made from high quality cotton fabric", "Perfect for office and formal occasions", "Comfortable fit with elegant design", "Easy to wash and maintain"],
  "grapes": ["Grapes are sweet juicy fruits rich in antioxidants and vitamins", "Good for heart health and cancer prevention", "Rich in resveratrol which boosts brain health", "Helps in improving digestion and immune function", "Great for skin health and anti aging benefits"],
  "Apple": ["Apple is a nutritious fruit rich in fiber and vitamin C", "Good for heart health digestion and immunity boost", "Helps in weight loss and blood sugar management", "Rich in antioxidants and natural sugars", "Great for brain health and reducing bad cholesterol"],
  "Samsung Front-load Washing Machine": ["Samsung front load washing machine with advanced wash technology", "Highly energy and water efficient design", "Superior cleaning with bubble wash technology", "Large capacity with multiple wash programs", "Smart diagnosis feature for easy troubleshooting"],
  "Blue Jean": ["Blue jean made from premium quality denim fabric", "Comfortable fit suitable for casual wear", "Durable and long lasting material", "Available in classic blue color", "Perfect for everyday casual outings"],
  "Chilli Masala": ["Chilli masala is a flavorful spice blend for cooking", "Rich in aromatic spices that add depth to dishes", "Good for boosting metabolism and digestion", "Contains anti inflammatory properties", "Perfect for making spicy Indian dishes and curries"],
  "2D Refridgerator gray": ["2 door gray refrigerator with modern design", "Energy efficient cooling technology", "Spacious storage with multiple compartments", "Quiet operation suitable for home use", "Available in stylish gray color"],
  "Soft Sandal Foot wear": ["Soft sandal footwear made with comfortable materials", "Lightweight and easy to wear design", "Suitable for casual and daily use", "Provides good grip and comfort", "Available in various sizes"],
  "Orange": ["Orange is a citrus fruit packed with vitamin C and fiber", "Excellent for boosting immunity and skin health", "Helps in reducing inflammation and cholesterol levels", "Rich in natural antioxidants and essential minerals", "Great for hydration energy and overall health"],
  "apple": ["Apple is a highly nutritious fruit rich in fiber and vitamin C", "Excellent for heart health digestion and immunity", "Helps in weight management and blood sugar control", "Rich in powerful antioxidants and natural sugars", "Great for brain health and reducing cholesterol"],
  "mango": ["Mango is a tropical fruit rich in vitamin C and vitamin A", "Good for boosting immunity skin health and digestion", "Rich in dietary fiber antioxidants and natural sugars", "Helps in improving eye health and cancer prevention", "Great natural source of energy and essential nutrients"],
  "Blue Formal Peter England": ["Blue formal shirt from Peter England premium brand", "Made from high quality breathable fabric", "Perfect for office meetings and formal occasions", "Comfortable fit with professional look", "Easy to maintain and long lasting"],
  "White Premium Short": ["White premium shorts made from high quality comfortable fabric", "Perfect for casual wear and outdoor activities", "Lightweight and breathable material", "Available in various sizes for perfect fit", "Easy to wash and maintain"],
  "Samsung LED Tv": ["Samsung LED TV with brilliant picture quality", "Energy efficient with multiple connectivity options", "Smart TV features with internet connectivity", "Crystal clear display with vibrant colors", "Perfect for home entertainment"],
  "red banana": ["Red banana is a sweet fruit rich in potassium and vitamin B6", "Good for heart health energy boost and digestion", "Rich in dietary antioxidants and fiber", "Helps in muscle function and blood pressure control", "Great for weight gain and workout recovery"],
  "Choco Cookie": ["Choco cookie is a delicious snack made with rich chocolate", "Great for satisfying sweet cravings anytime", "Rich in carbohydrates for quick energy boost", "Perfect snack for kids and adults alike", "Best enjoyed with tea coffee or milk"],
  "Raw Full Cream Milk": ["Raw full cream milk is rich in calcium protein and vitamin D", "Good for bone health muscle building and immunity", "Rich in healthy fats and essential vitamins", "Helps in growth and overall development", "Great natural source of energy and nutrition"],
  "Banana": ["Banana is a fruit rich in potassium fiber and vitamin B6", "Good for heart health digestion and sustained energy", "Helps in muscle recovery and blood pressure regulation", "Rich in natural sugars for quick energy boost", "Great for weight gain and post workout recovery"],
  "Red Amaranth (Sivappu keerai)": ["Red amaranth also known as Sivappu keerai is a nutritious leafy vegetable", "Rich in iron calcium and essential vitamins", "Good for preventing anemia and strengthening bones", "High in dietary fiber protein and antioxidants", "Excellent source of vitamins A C and K"],
"Raw Full Cream Milk ": ["Raw full cream milk is rich in calcium protein and vitamin D", "Good for bone health muscle building and immunity", "Rich in healthy fats and essential vitamins", "Helps in growth and overall development", "Great natural source of energy and nutrition"],
};

const updateDescriptions = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected ✅");

    let updated = 0;
    let skipped = 0;

    for (const [name, description] of Object.entries(descriptions)) {
      const result = await Product.updateMany(
        { name: { $regex: `^${name}$`, $options: "i" } },
        { $set: { description } }
      );
      if (result.modifiedCount > 0) {
        console.log(`✅ Updated: ${name}`);
        updated++;
      } else {
        console.log(`⚠️ Not found: ${name}`);
        skipped++;
      }
    }

    console.log(`\n✅ Done! Updated: ${updated}, Skipped: ${skipped}`);
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

updateDescriptions();
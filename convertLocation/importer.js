const mongoose = require("mongoose");
const axios = require("axios");

const MONGO_URI = "mongodb://localhost:27017/castify"; // ← sửa lại cho đúng DB

// City schema
const citySchema = new mongoose.Schema({
  name: String,
  type: Number,
  typeText: String,
  slug: String,
});
const City = mongoose.model("city", citySchema, "city");

// District schema
const districtSchema = new mongoose.Schema({
  id: String,
  name: String,
  provinceId: String,
  type: Number,
  typeText: String,
  city: mongoose.Schema.Types.Mixed, // DBRef
});
const District = mongoose.model("district", districtSchema, "district");

// Ward schema
const wardSchema = new mongoose.Schema({
  id: String,
  name: String,
  type: Number,
  typeText: String,
  district: mongoose.Schema.Types.Mixed, // DBRef
});
const Ward = mongoose.model("ward", wardSchema, "ward");

async function importLocations() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  const provincesRes = await axios.get("https://open.oapi.vn/location/provinces?page=0&size=100");
  const provinces = provincesRes.data.data;

  for (const province of provinces) {
    const cityObjectId = new mongoose.Types.ObjectId();

    const city = new City({
      _id: cityObjectId,
      name: province.name,
      type: province.type,
      typeText: province.typeText,
      slug: province.slug,
    });
    await city.save();

    const districtsRes = await axios.get(`https://open.oapi.vn/location/districts/${province.id}?page=0&size=100`);
    const districts = districtsRes.data.data;

    for (const district of districts) {
      const districtObjectId = new mongoose.Types.ObjectId();

      const d = new District({
        _id: districtObjectId,
        id: district.id,
        name: district.name,
        provinceId: province.id,
        type: district.type,
        typeText: district.typeText,
        city: new mongoose.mongo.DBRef("city", cityObjectId),
      });
      await d.save();

      const wardsRes = await axios.get(`https://open.oapi.vn/location/wards/${district.id}?page=0&size=100`);
      const wards = wardsRes.data.data;

      for (const ward of wards) {
        const wardObjectId = new mongoose.Types.ObjectId();

        const w = new Ward({
          _id: wardObjectId,
          id: ward.id,
          name: ward.name,
          type: Number(ward.type),
          typeText: ward.typeText,
          district: new mongoose.mongo.DBRef("district", districtObjectId),
        });
        await w.save();
      }
    }
  }

  console.log("🎉 Import complete!");
  process.exit(0);
}

importLocations().catch((err) => {
  console.error("❌ Import failed:", err);
  process.exit(1);
});

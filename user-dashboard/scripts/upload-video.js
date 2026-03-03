/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Helper to look for .env file
function getEnv() {
  const envPath = path.resolve(__dirname, "../.env");
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, "utf8");
  const env = {};
  content.split("\n").forEach((line) => {
    const [key, value] = line.split("=");
    if (key && value) {
      env[key.trim()] = value.trim();
    }
  });
  return env;
}

async function uploadVideo() {
  const env = getEnv();
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  // USER PROVIDED KEY - SERVICE ROLE
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
  }

  console.log("Initializing Supabase client with Service Role Key...");
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  const bucketName = "video";
  const filePath = path.resolve(
    __dirname,
    "../public/video/mission_video_new.mp4",
  );
  const fileName = "mission.mp4";

  if (!fs.existsSync(filePath)) {
    console.error("Video file not found at:", filePath);
    process.exit(1);
  }

  const fileDetail = fs.readFileSync(filePath);

  console.log(`Checking bucket '${bucketName}'...`);
  const { data: buckets, error: listError } =
    await supabase.storage.listBuckets();

  if (listError) {
    console.error("Error listing buckets:", listError.message);
  }

  const bucketExists = buckets
    ? buckets.find((b) => b.name === bucketName)
    : false;

  if (!bucketExists) {
    console.log(
      `Bucket '${bucketName}' does not exist. Attempting to create...`,
    );
    const { data, error: createError } = await supabase.storage.createBucket(
      bucketName,
      {
        public: true,
        allowedMimeTypes: ["video/mp4"],
        fileSizeLimit: 52428800, // 50MB
      },
    );

    if (createError) {
      console.error("Failed to create bucket:", createError.message);
      process.exit(1);
    }
    console.log("Bucket created successfully.");
  } else {
    console.log(`Bucket '${bucketName}' exists.`);
  }

  console.log(`Uploading '${fileName}'...`);
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(fileName, fileDetail, {
      contentType: "video/mp4",
      upsert: true,
    });

  if (uploadError) {
    console.error("Upload failed:", uploadError.message);
    process.exit(1);
  }

  console.log("Upload successful!");

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucketName).getPublicUrl(fileName);
  console.log("Public URL:", publicUrl);
}

uploadVideo();

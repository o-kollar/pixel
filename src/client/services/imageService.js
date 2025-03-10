import fetch from "node-fetch";
import PocketBase from "pocketbase";
import { Buffer } from "buffer";


export async function generateImage(req, res) {
  console.log("Received request:", req.body);
  const { prompt, aspect_ratio, num_outputs } = req.body;
  
  // Validate num_outputs
  if (!Number.isInteger(num_outputs) || num_outputs < 1) {
    return res.status(400).json({ error: "num_outputs must be a positive integer" });
  }
  
  try {
    // Initialize PocketBase client
    const pb = new PocketBase("http://127.0.0.1:8090");
    await pb.admins.authWithPassword("test@test.sk", "andibandi1994A.");
    
    const generatedImages = [];
    
    // Process each image sequentially
    for (let i = 0; i < num_outputs; i++) {
      const seed = Math.floor(Math.random() * 4294967296); // Unique seed per image
      const input = {
        seed,
        prompt,
        go_fast: false,
        num_outputs: 1, // One image per request
        aspect_ratio,
        output_format: "png",
        output_quality: 80,
      };
      
      // Call Flask API to generate the image
      const flaskResponse = await fetch("http://127.0.0.1:5000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      
      if (!flaskResponse.ok) {
        throw new Error(`Flask API error: ${flaskResponse.statusText}`);
      }
      
      const buffer = await flaskResponse.arrayBuffer();
      const imageFile = new File([buffer], `image_${i}.png`, { type: "image/png" });
      
      // Save to PocketBase
      const record = await pb.collection("generated_image").create({
        user: req.user.id,
        seed: seed.toString(),
        prompt: prompt,
        aspect_ratio: aspect_ratio,
        image: imageFile,
      });
      
      // Add the image URL to the response
      generatedImages.push({
        id: record.id,
        seed: seed.toString(),
        imageUrl: pb.files.getURL(record, record.image),
        created: record.created
      });
    }
    
    // Send success response with the generated images
    res.json({ 
      success: true,
      images: generatedImages 
    });
    
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
}

export async function getUserGeneratedImages(req, res) {
  try {
    // Initialize PocketBase
    const pb = new PocketBase("http://127.0.0.1:8090");
    
    // Authenticate as admin
    await pb.admins.authWithPassword("test@test.sk", "andibandi1994A.");
    
    // Fetch all generated images for the specific user
    const images = await pb.collection('generated_image').getList(1, 50, {
      filter: `user = "${req.user.id}"`,
      expand: 'user', // Optional: if you want to expand user details
      sort: '-created' // Sort by most recently created first
    });
    
    // Transform the images to include full image URL
    const formattedImages = images.items.map(image => ({
      id: image.id,
      seed: image.seed,
      imageUrl: pb.files.getUrl(image, image.image),
      created: image.created
    }));
    
    console.log(formattedImages)
    // Send the images back to the client
    res.json({
      total: images.totalItems,
      images: formattedImages
    });
  } catch (error) {
    console.error("Error retrieving user images:", error);
    res.status(500).json({ error: error.message });
  }
}